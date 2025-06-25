const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const sourceDir = './src';
const localesDir = './public/locales';
const defaultLocale = 'uk';
const targetLocales = ['uk', 'en'];

// Покращені регулярні вирази для пошуку текстів
const translationPatterns = {
  // t('key', 'fallback')
  tFunction: /t\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g,
  // {t('key', 'fallback')}
  jsxTFunction: /\{t\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\)\}/g,
  // Прямий текст в JSX
  jsxText: />([^<>{}`]+)</g,
  // title="text", placeholder="text" тощо
  attributes: /(?:title|placeholder|alt|aria-label)=["']([^"']+)["']/g
};

function normalizeKey(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\u0400-\u04FFa-z0-9]+/g, '_') // Зберігаємо кирилицю
    .replace(/^_+|_+$/g, '')
    .substring(0, 50); // Збільшуємо максимальну довжину
}

function isValidText(text) {
  if (!text || typeof text !== 'string') return false;
  
  const trimmed = text.trim();
  
  // Пропускаємо:
  if (!trimmed) return false;
  if (/^[0-9\s\-+.,]+$/.test(trimmed)) return false; // Тільки числа
  if (/^[{}\[\]()]+$/.test(trimmed)) return false; // Тільки дужки
  if (trimmed.length < 2) return false; // Занадто короткі
  if (trimmed.length > 200) return false; // Занадто довгі
  if (/^(true|false|null|undefined)$/.test(trimmed)) return false; // JS значення
  if (/^[A-Z_]+$/.test(trimmed)) return false; // Константи
  if (/\.(js|jsx|ts|tsx|css|scss)$/.test(trimmed)) return false; // Імена файлів
  
  return true;
}

function extractTranslationsFromContent(content, filePath) {
  const translations = new Map();
  
  // 1. Витягуємо з t() функцій
  let match;
  while ((match = translationPatterns.tFunction.exec(content)) !== null) {
    const [_, key, fallback] = match;
    if (isValidText(fallback)) {
      translations.set(key, fallback);
    }
  }
  
  // 2. Витягуємо з JSX t() функцій
  content.replace(translationPatterns.jsxTFunction, (full, key, fallback) => {
    if (isValidText(fallback)) {
      translations.set(key, fallback);
    }
    return full;
  });
  
  // 3. Витягуємо текст з JSX (опціонально, можна вимкнути)
  if (filePath.includes('/components/') || filePath.includes('/app/')) {
    content.replace(translationPatterns.jsxText, (full, text) => {
      if (isValidText(text)) {
        const key = normalizeKey(text);
        translations.set(key, text);
      }
      return full;
    });
  }
  
  // 4. Витягуємо з атрибутів
  content.replace(translationPatterns.attributes, (full, text) => {
    if (isValidText(text)) {
      const key = normalizeKey(text);
      translations.set(key, text);
    }
    return full;
  });
  
  return translations;
}

async function mergeWithExisting(locale, newTranslations) {
  const localeFile = path.join(localesDir, locale, 'common.json');
  let existingTranslations = {};
  
  try {
    await fs.ensureFile(localeFile);
    existingTranslations = await fs.readJson(localeFile, { throws: false }) || {};
  } catch (error) {
    console.warn(`Не вдалося прочитати існуючі переклади для ${locale}:`, error.message);
  }
  
  // Об'єднуємо з пріоритетом існуючих перекладів
  const merged = { ...existingTranslations };
  
  for (const [key, value] of newTranslations.entries()) {
    if (!merged[key]) {
      // Для англійської мови зберігаємо українське значення як заглушку
      merged[key] = locale === 'en' ? `[UK: ${value}]` : value;
    }
  }
  
  return merged;
}

async function extractTranslations() {
  console.log('🚀 Початок витягування перекладів...\n');
  
  const files = await fg([
    `${sourceDir}/app/**/*.{js,jsx,ts,tsx}`,
    `${sourceDir}/components/**/*.{js,jsx,ts,tsx}`,
    `!${sourceDir}/**/*.test.{js,jsx,ts,tsx}`,
    `!${sourceDir}/**/*.spec.{js,jsx,ts,tsx}`
  ]);
  
  console.log(`📁 Знайдено ${files.length} файлів для обробки\n`);
  
  const allTranslations = new Map();
  const fileStats = [];
  
  // Обробляємо файли
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const translations = extractTranslationsFromContent(content, file);
      
      if (translations.size > 0) {
        fileStats.push({
          file: file.replace(sourceDir, '.'),
          count: translations.size
        });
        
        // Додаємо до загальної мапи
        for (const [key, value] of translations) {
          allTranslations.set(key, value);
        }
      }
    } catch (error) {
      console.error(`❌ Помилка обробки ${file}:`, error.message);
    }
  }
  
  // Виводимо статистику
  console.log('📊 Статистика по файлах:');
  fileStats
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .forEach(({ file, count }) => {
      console.log(`   ${file}: ${count} текстів`);
    });
  
  console.log(`\n📝 Всього унікальних перекладів: ${allTranslations.size}\n`);
  
  // Зберігаємо для кожної локалі
  for (const locale of targetLocales) {
    const merged = await mergeWithExisting(locale, allTranslations);
    const localeFile = path.join(localesDir, locale, 'common.json');
    
    // Сортуємо ключі для кращої читабельності
    const sorted = Object.keys(merged)
      .sort()
      .reduce((acc, key) => {
        acc[key] = merged[key];
        return acc;
      }, {});
    
    await fs.writeJson(localeFile, sorted, { spaces: 2 });
    console.log(`✅ Збережено ${Object.keys(sorted).length} перекладів для ${locale} → ${localeFile}`);
  }
  
  console.log('\n🎉 Витягування перекладів завершено!');
}

// Додаткова функція для синхронізації з backend
async function syncWithBackend() {
  const backendTranslationsPath = path.join(__dirname, '../../backend/translations/uk.json');
  
  try {
    const backendTranslations = await fs.readJson(backendTranslationsPath);
    const frontendTranslations = await fs.readJson(path.join(localesDir, 'uk', 'common.json'));
    
    // Об'єднуємо переклади
    const combined = { ...frontendTranslations, ...backendTranslations };
    
    // Зберігаємо оновлені переклади
    await fs.writeJson(
      path.join(localesDir, 'uk', 'common.json'), 
      combined, 
      { spaces: 2 }
    );
    
    console.log(`\n🔄 Синхронізовано ${Object.keys(backendTranslations).length} перекладів з backend`);
  } catch (error) {
    console.warn('⚠️  Не вдалося синхронізувати з backend:', error.message);
  }
}

// Головна функція
async function main() {
  try {
    await extractTranslations();
    
    // Опціонально: синхронізація з backend
    if (process.argv.includes('--sync-backend')) {
      await syncWithBackend();
    }
  } catch (error) {
    console.error('❌ Критична помилка:', error);
    process.exit(1);
  }
}

// Запускаємо скрипт
main();