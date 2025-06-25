#!/usr/bin/env node
/**
 * Скрипт для валідації та перевірки перекладів
 * Використання:
 * node validate-translations.js                    # Перевірити всі переклади
 * node validate-translations.js --fix              # Автоматично виправити проблеми
 * node validate-translations.js --locale=uk        # Перевірити конкретну локаль
 */

const fs = require('fs-extra');
const path = require('path');

// Шляхи до файлів перекладів
const TRANSLATION_PATHS = {
  frontend: {
    uk: './public/locales/uk/common.json',
    en: './public/locales/en/common.json'
  },
  backend: {
    uk: '../backend/translations/uk.json',
    en: '../backend/translations/en.json'
  }
};

// Кольори для консолі
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

class TranslationValidator {
  constructor(options = {}) {
    this.options = {
      fix: options.fix || false,
      locale: options.locale || null,
      verbose: options.verbose || false
    };
    this.issues = [];
    this.stats = {
      filesChecked: 0,
      totalKeys: 0,
      issues: 0,
      fixed: 0
    };
  }

  // Головний метод валідації
  async validate() {
    log('\n🔍 Валідація перекладів UGC\n', colors.bright);

    // Визначаємо які локалі перевіряти
    const locales = this.options.locale ? [this.options.locale] : ['uk', 'en'];
    
    for (const locale of locales) {
      await this.validateLocale(locale);
    }

    this.printReport();
    
    if (this.options.fix && this.stats.fixed > 0) {
      log(`\n✅ Виправлено ${this.stats.fixed} проблем`, colors.green);
    }
    
    return this.issues.length === 0;
  }

  // Валідація конкретної локалі
  async validateLocale(locale) {
    log(`\n🌍 Перевірка локалі: ${locale.toUpperCase()}`, colors.blue);
    
    // Перевіряємо frontend переклади
    await this.validateFile(TRANSLATION_PATHS.frontend[locale], 'frontend', locale);
    
    // Перевіряємо backend переклади
    await this.validateFile(TRANSLATION_PATHS.backend[locale], 'backend', locale);
    
    // Перевіряємо консистентність між frontend і backend
    await this.checkConsistency(locale);
    
    // Для англійської локалі перевіряємо повноту перекладів
    if (locale === 'en') {
      await this.checkCompleteness();
    }
  }

  // Валідація окремого файлу
  async validateFile(filePath, source, locale) {
    this.stats.filesChecked++;
    
    if (!await fs.exists(filePath)) {
      this.addIssue('error', `Файл не знайдено: ${filePath}`, { filePath, source, locale });
      return;
    }

    let data;
    try {
      data = await fs.readJson(filePath);
    } catch (error) {
      this.addIssue('error', `Помилка парсингу JSON: ${filePath}`, { filePath, error: error.message });
      return;
    }

    // Перевіряємо структуру та вміст
    if (source === 'frontend') {
      await this.validateFrontendStructure(data, filePath, locale);
    } else {
      await this.validateBackendStructure(data, filePath, locale);
    }

    // Загальні перевірки
    await this.validateTranslationContent(data, filePath, locale, source);
  }

  // Валідація структури frontend перекладів
  async validateFrontendStructure(data, filePath, locale) {
    const requiredSections = ['common', 'navigation', 'header', 'footer', 'hero'];
    
    for (const section of requiredSections) {
      if (!data[section]) {
        this.addIssue('warning', `Відсутня обов'язкова секція: ${section}`, { filePath, locale, section });
        
        if (this.options.fix) {
          data[section] = {};
          await this.saveFile(filePath, data);
          this.stats.fixed++;
        }
      }
    }
  }

  // Валідація структури backend перекладів
  async validateBackendStructure(data, filePath, locale) {
    // Backend має плоску структуру, перевіряємо на дублікати ключів з різним регістром
    const normalizedKeys = new Map();
    
    for (const key of Object.keys(data)) {
      const normalized = key.toLowerCase();
      if (normalizedKeys.has(normalized)) {
        this.addIssue('error', `Дублікат ключа з різним регістром: "${key}" та "${normalizedKeys.get(normalized)}"`, {
          filePath,
          locale,
          keys: [key, normalizedKeys.get(normalized)]
        });
      } else {
        normalizedKeys.set(normalized, key);
      }
    }
  }

  // Валідація вмісту перекладів
  async validateTranslationContent(data, filePath, locale, source) {
    const flatData = this.flattenObject(data);
    this.stats.totalKeys += Object.keys(flatData).length;
    
    for (const [key, value] of Object.entries(flatData)) {
      // Перевірка на порожні значення
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        this.addIssue('error', `Порожнє значення для ключа: ${key}`, { filePath, locale, key });
        continue;
      }
      
      // Перевірка на невідповідні символи
      if (typeof value === 'string') {
        // Перевірка на незакриті дужки
        if (this.hasUnmatchedBrackets(value)) {
          this.addIssue('warning', `Незбалансовані дужки в: ${key}`, { filePath, locale, key, value });
        }
        
        // Перевірка на HTML теги
        if (this.containsHtml(value) && !this.isValidHtml(value)) {
          this.addIssue('warning', `Некоректний HTML в: ${key}`, { filePath, locale, key, value });
        }
        
        // Перевірка на подвійні пробіли
        if (value.includes('  ')) {
          this.addIssue('info', `Подвійні пробіли в: ${key}`, { filePath, locale, key, value });
          
          if (this.options.fix) {
            flatData[key] = value.replace(/\s+/g, ' ');
            this.stats.fixed++;
          }
        }
        
        // Перевірка на trailing/leading пробіли
        if (value !== value.trim()) {
          this.addIssue('info', `Зайві пробіли на початку/кінці в: ${key}`, { filePath, locale, key });
          
          if (this.options.fix) {
            flatData[key] = value.trim();
            this.stats.fixed++;
          }
        }
        
        // Для української локалі - перевірка на російські літери
        if (locale === 'uk' && /[ыэъё]/i.test(value)) {
          this.addIssue('error', `Російські літери в українському тексті: ${key}`, { filePath, locale, key, value });
        }
        
        // Перевірка на змішування мов
        if (locale === 'uk' && /[a-zA-Z]/.test(value) && !/^[^а-яА-ЯіїєґІЇЄҐ]+$/.test(value)) {
          // Дозволяємо англійські слова в українському тексті, але попереджаємо про повністю англійські фрази
          if (value.split(' ').filter(word => /^[a-zA-Z]+$/.test(word)).length > value.split(' ').length / 2) {
            this.addIssue('warning', `Занадто багато англійських слів в українському тексті: ${key}`, { filePath, locale, key });
          }
        }
      }
    }
    
    // Зберігаємо виправлені дані якщо потрібно
    if (this.options.fix && this.stats.fixed > 0) {
      const unflattenedData = this.unflattenObject(flatData);
      await this.saveFile(filePath, source === 'frontend' ? unflattenedData : flatData);
    }
  }

  // Перевірка консистентності між frontend і backend
  async checkConsistency(locale) {
    log('\n📊 Перевірка консистентності...', colors.gray);
    
    const frontendData = await this.loadTranslations(TRANSLATION_PATHS.frontend[locale]);
    const backendData = await this.loadTranslations(TRANSLATION_PATHS.backend[locale]);
    
    if (!frontendData || !backendData) return;
    
    const frontendFlat = this.flattenObject(frontendData);
    const backendFlat = backendData;
    
    // Знаходимо спільні ключі з різними значеннями
    const commonKeys = Object.keys(frontendFlat).filter(key => backendFlat[key]);
    
    for (const key of commonKeys) {
      if (frontendFlat[key] !== backendFlat[key]) {
        this.addIssue('info', `Різні значення для ключа "${key}"`, {
          locale,
          key,
          frontend: frontendFlat[key],
          backend: backendFlat[key]
        });
      }
    }
  }

  // Перевірка повноти англійських перекладів
  async checkCompleteness() {
    log('\n📋 Перевірка повноти англійських перекладів...', colors.gray);
    
    const ukFrontend = await this.loadTranslations(TRANSLATION_PATHS.frontend.uk);
    const enFrontend = await this.loadTranslations(TRANSLATION_PATHS.frontend.en);
    
    if (!ukFrontend || !enFrontend) return;
    
    const ukFlat = this.flattenObject(ukFrontend);
    const enFlat = this.flattenObject(enFrontend);
    
    // Знаходимо відсутні переклади
    const missingKeys = Object.keys(ukFlat).filter(key => !enFlat[key]);
    
    if (missingKeys.length > 0) {
      this.addIssue('error', `Відсутні ${missingKeys.length} англійських перекладів`, {
        locale: 'en',
        missingKeys: missingKeys.slice(0, 10),
        total: missingKeys.length
      });
      
      if (this.options.fix) {
        // Додаємо відсутні ключі з префіксом [UK]
        for (const key of missingKeys) {
          enFlat[key] = `[UK: ${ukFlat[key]}]`;
          this.stats.fixed++;
        }
        
        const unflattenedData = this.unflattenObject(enFlat);
        await this.saveFile(TRANSLATION_PATHS.frontend.en, unflattenedData);
      }
    }
    
    // Перевіряємо на неперекладені значення
    const untranslated = Object.entries(enFlat)
      .filter(([key, value]) => value.startsWith('[UK:'))
      .map(([key]) => key);
      
    if (untranslated.length > 0) {
      this.addIssue('warning', `${untranslated.length} неперекладених значень`, {
        locale: 'en',
        untranslatedKeys: untranslated.slice(0, 10),
        total: untranslated.length
      });
    }
  }

  // Допоміжні методи
  flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, fullKey));
      } else {
        flattened[fullKey] = value;
      }
    }
    
    return flattened;
  }
  
  unflattenObject(obj) {
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const parts = key.split('.');
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      current[parts[parts.length - 1]] = value;
    }
    
    return result;
  }
  
  hasUnmatchedBrackets(str) {
    const pairs = { '(': ')', '[': ']', '{': '}' };
    const stack = [];
    
    for (const char of str) {
      if (pairs[char]) {
        stack.push(char);
      } else if (Object.values(pairs).includes(char)) {
        const last = stack.pop();
        if (!last || pairs[last] !== char) {
          return true;
        }
      }
    }
    
    return stack.length > 0;
  }
  
  containsHtml(str) {
    return /<[^>]+>/.test(str);
  }
  
  isValidHtml(str) {
    const tagRegex = /<(\w+)([^>]*)>(.*?)<\/\1>|<(\w+)([^>]*)\/>/g;
    return tagRegex.test(str);
  }
  
  async loadTranslations(filePath) {
    try {
      return await fs.readJson(filePath);
    } catch (error) {
      return null;
    }
  }
  
  async saveFile(filePath, data) {
    await fs.writeJson(filePath, data, { spaces: 2 });
  }
  
  addIssue(severity, message, details) {
    this.issues.push({ severity, message, details });
    this.stats.issues++;
    
    if (this.options.verbose || severity === 'error') {
      const icon = {
        error: '❌',
        warning: '⚠️ ',
        info: 'ℹ️ '
      }[severity];
      
      const color = {
        error: colors.red,
        warning: colors.yellow,
        info: colors.blue
      }[severity];
      
      log(`${icon} ${message}`, color);
      
      if (this.options.verbose && details) {
        console.log(colors.gray + '   ', JSON.stringify(details, null, 2) + colors.reset);
      }
    }
  }
  
  printReport() {
    log('\n📊 Звіт валідації', colors.bright);
    log('=================\n', colors.bright);
    
    const errorCount = this.issues.filter(i => i.severity === 'error').length;
    const warningCount = this.issues.filter(i => i.severity === 'warning').length;
    const infoCount = this.issues.filter(i => i.severity === 'info').length;
    
    log(`Перевірено файлів: ${this.stats.filesChecked}`);
    log(`Всього ключів: ${this.stats.totalKeys}`);
    log(`Знайдено проблем: ${this.stats.issues}`);
    
    if (errorCount > 0) {
      log(`  - Помилок: ${errorCount}`, colors.red);
    }
    if (warningCount > 0) {
      log(`  - Попереджень: ${warningCount}`, colors.yellow);
    }
    if (infoCount > 0) {
      log(`  - Інформаційних: ${infoCount}`, colors.blue);
    }
    
    if (this.stats.fixed > 0) {
      log(`\nВиправлено проблем: ${this.stats.fixed}`, colors.green);
    }
    
    // Групуємо проблеми за типом
    const groupedIssues = {};
    for (const issue of this.issues) {
      if (!groupedIssues[issue.message]) {
        groupedIssues[issue.message] = [];
      }
      groupedIssues[issue.message].push(issue);
    }
    
    // Виводимо топ проблем
    const topIssues = Object.entries(groupedIssues)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
      
    if (topIssues.length > 0) {
      log('\n🔝 Найпоширеніші проблеми:', colors.bright);
      for (const [message, issues] of topIssues) {
        log(`   ${issues.length}x - ${message}`, colors.gray);
      }
    }
  }
}

// Головна функція
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    locale: args.find(arg => arg.startsWith('--locale='))?.split('=')[1]
  };
  
  const validator = new TranslationValidator(options);
  const isValid = await validator.validate();
  
  if (!isValid && !options.fix) {
    log('\n💡 Підказка: використайте --fix для автоматичного виправлення деяких проблем', colors.gray);
  }
  
  process.exit(isValid ? 0 : 1);
}

// Запускаємо валідацію
main().catch(error => {
  log(`\n❌ Критична помилка: ${error.message}`, colors.red);
  process.exit(1);
});