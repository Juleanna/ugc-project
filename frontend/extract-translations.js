const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const sourceDir = './src';
const localesDir = './public/locales';
const defaultLocale = 'uk';
const targetLocales = ['uk', 'en'];

// Регулярний вираз для пошуку текстових рядків
const textRegex = /['"`]([^'"`]+)['"`]/g;

function generateKey(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .substring(0, 30);
}

function extractTextsFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const texts = new Set();
    let match;
    while ((match = textRegex.exec(content)) !== null) {
        const text = match[1];
        if (text.trim() && !/^[0-9\s]+$/.test(text)) {
            texts.add(text.trim());
        }
    }
    return Array.from(texts);
}

async function extractTranslations() {
    const files = await fg([
        `${sourceDir}/app/**/*.{js,jsx,ts,tsx}`,
        `${sourceDir}/components/**/*.{js,jsx,ts,tsx}`,
        `${sourceDir}/pages/**/*.{js,jsx,ts,tsx}`,
        `${sourceDir}/*.{js,jsx,ts,tsx}`
    ]);
    console.log(`Знайдено файлів: ${files.length}`);

    const translations = {};

    for (const file of files) {
        console.log(`Обробка файлу: ${file}`);
        const texts = extractTextsFromFile(file);
        console.log(`Знайдено текстів у файлі: ${texts.length}`);
        texts.forEach(text => {
            const key = generateKey(text);
            translations[key] = text;
        });
    }

    console.log(`Загальна кількість унікальних текстів: ${Object.keys(translations).length}`);

    for (const locale of targetLocales) {
        const localeFile = path.join(localesDir, locale, 'common.json');
        await fs.ensureFile(localeFile);
        const existingTranslations = await fs.readJson(localeFile, { throws: false }) || {};

        const newTranslations = {};
        for (const [key, value] of Object.entries(translations)) {
            newTranslations[key] = locale === defaultLocale ? value : (existingTranslations[key] || value);
        }

        await fs.writeJson(localeFile, newTranslations, { spaces: 2 });
        console.log(`Переклади для ${locale} збережено у ${localeFile}`);
    }
}

extractTranslations().catch(error => {
    console.error('Помилка під час виконання скрипта:', error);
});

// Додаткова функція для перевірки вмісту файлів
async function checkFileContents() {
    const files = await fg([
        `${sourceDir}/app/**/*.{js,jsx,ts,tsx}`,
        `${sourceDir}/components/**/*.{js,jsx,ts,tsx}`,
        `${sourceDir}/pages/**/*.{js,jsx,ts,tsx}`,
        `${sourceDir}/*.{js,jsx,ts,tsx}`
    ]);

    for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        console.log(`Файл: ${file}`);
        console.log(`Перші 200 символів:\n${content.slice(0, 200)}`);
        console.log('---');
    }
}

// Розкоментуйте наступний рядок, якщо хочете перевірити вміст файлів
// checkFileContents().catch(console.error);
