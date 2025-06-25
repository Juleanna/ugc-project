#!/usr/bin/env node
/**
 * Скрипт для синхронізації перекладів між frontend і backend
 * Використання:
 * node sync-translations.js --direction=fe-to-be  # Frontend -> Backend
 * node sync-translations.js --direction=be-to-fe  # Backend -> Frontend
 * node sync-translations.js --merge               # Об'єднати переклади
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Шляхи до файлів
const paths = {
  frontend: {
    uk: './public/locales/uk/common.json',
    en: './public/locales/en/common.json'
  },
  backend: {
    uk: '../backend/translations/uk.json',
    en: '../backend/translations/en.json'
  }
};

// Кольори для консольного виводу
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Функція для читання JSON файлу
async function readJsonFile(filePath) {
  try {
    const content = await fs.readJson(filePath);
    return content || {};
  } catch (error) {
    log(`⚠️  Файл не знайдено: ${filePath}`, colors.yellow);
    return {};
  }
}

// Функція для запису JSON файлу
async function writeJsonFile(filePath, data) {
  await fs.ensureFile(filePath);
  await fs.writeJson(filePath, data, { spaces: 2 });
}

// Функція для вирівнювання вкладених об'єктів
function flattenObject(obj, prefix = '') {
  const flattened = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, fullKey));
    } else {
      flattened[fullKey] = value;
    }
  }

  return flattened;
}

// Функція для відновлення вкладеної структури
function unflattenObject(obj) {
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

// Синхронізація Frontend -> Backend
async function syncFrontendToBackend() {
  log('\n📥 Синхронізація Frontend -> Backend', colors.blue);

  for (const locale of ['uk', 'en']) {
    log(`\n🌍 Обробка локалі: ${locale}`, colors.bright);

    // Читаємо файли
    const frontendData = await readJsonFile(paths.frontend[locale]);
    const backendData = await readJsonFile(paths.backend[locale]);

    // Вирівнюємо frontend дані
    const flattenedFrontend = flattenObject(frontendData);

    // Об'єднуємо з пріоритетом frontend
    const merged = { ...backendData, ...flattenedFrontend };

    // Підраховуємо статистику
    const newKeys = Object.keys(flattenedFrontend).filter(
      key => !backendData[key]
    );

    // Зберігаємо результат
    await writeJsonFile(paths.backend[locale], merged);

    log(`✅ Оновлено ${paths.backend[locale]}`, colors.green);
    log(`   Всього ключів: ${Object.keys(merged).length}`);
    log(`   Нових ключів: ${newKeys.length}`);

    if (newKeys.length > 0 && newKeys.length <= 10) {
      log(`   Нові ключі: ${newKeys.join(', ')}`, colors.yellow);
    }
  }
}

// Синхронізація Backend -> Frontend
async function syncBackendToFrontend() {
  log('\n📤 Синхронізація Backend -> Frontend', colors.blue);

  for (const locale of ['uk', 'en']) {
    log(`\n🌍 Обробка локалі: ${locale}`, colors.bright);

    // Читаємо файли
    const frontendData = await readJsonFile(paths.frontend[locale]);
    const backendData = await readJsonFile(paths.backend[locale]);

    // Групуємо backend переклади за категоріями
    const flattenedBackend = flattenObject(backendData);
    const merged = { ...flattenObject(frontendData), ...flattenedBackend };

    const unflattenedMerged = unflattenObject(merged);

    // Зберігаємо результат
    await writeJsonFile(paths.frontend[locale], unflattenedMerged);

    log(`✅ Оновлено ${paths.frontend[locale]}`, colors.green);
    log(`   Всього ключів: ${Object.keys(merged).length}`);
  }
}

// Об'єднання перекладів
async function mergeTranslations() {
  log('\n🔗 Об\'єднання перекладів', colors.blue);

  for (const locale of ['uk', 'en']) {
    log(`\n🌍 Обробка локалі: ${locale}`, colors.bright);

    // Читаємо файли
    const frontendData = await readJsonFile(paths.frontend[locale]);
    const backendData = await readJsonFile(paths.backend[locale]);

    // Вирівнюємо структуру
    const flattenedFrontend = flattenObject(frontendData);
    const flattenedBackend = flattenObject(backendData);

    // Об\'єднуємо дані
    const merged = { ...flattenedFrontend, ...flattenedBackend };

    // Відновлюємо структуру
    const unflattenedMerged = unflattenObject(merged);

    // Зберігаємо у frontend і backend
    await writeJsonFile(paths.frontend[locale], unflattenedMerged);
    await writeJsonFile(paths.backend[locale], unflattenedMerged);

    log(`✅ Об\'єднано для локалі: ${locale}`, colors.green);
    log(`   Всього ключів: ${Object.keys(merged).length}`);
  }
}

// Головна функція
async function main() {
  const args = process.argv.slice(2);
  const direction = args.find(arg => arg.startsWith('--direction='));
  const merge = args.includes('--merge');

  if (direction) {
    const dirValue = direction.split('=')[1];

    if (dirValue === 'fe-to-be') {
      await syncFrontendToBackend();
    } else if (dirValue === 'be-to-fe') {
      await syncBackendToFrontend();
    } else {
      log('❌ Невідомий напрямок. Використовуйте fe-to-be або be-to-fe.', colors.red);
    }
  } else if (merge) {
    await mergeTranslations();
  } else {
    log('❌ Будь ласка, вкажіть аргумент --direction або --merge.', colors.red);
  }
}

main().catch(error => {
  log(`❌ Помилка: ${error.message}`, colors.red);
});
