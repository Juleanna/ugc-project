// translation-sync.config.js - Конфігурація для синхронізації перекладів

module.exports = {
  // Основні налаштування
  localesDir: 'frontend/public/locales',
  baseLocale: 'uk',                    // Основна мова (еталон)
  targetLocales: ['en', 'ru', 'pl'],   // Мови для синхронізації
  backupDir: 'translation-backups',
  
  // Налаштування синхронізації
  options: {
    createMissingFiles: true,      // Створювати відсутні файли
    addMissingKeys: true,          // Додавати відсутні ключі
    removeExtraKeys: false,        // Видаляти зайві ключі (ОБЕРЕЖНО!)
    preserveExisting: true,        // Зберігати існуючі переклади
    useAutoTranslate: false,       // Використовувати автопереклад
    createBackup: true,            // Створювати backup перед змінами
    sortKeys: true,                // Сортувати ключі в алфавітному порядку
    validateJSON: true,            // Перевіряти коректність JSON
    prettifyOutput: true,          // Форматувати вихідний JSON
    indentSize: 2,                // Розмір відступу в JSON
  },
  
  // Налаштування автоперекладу
  autoTranslate: {
    enabled: false,                // Увімкнути автопереклад
    service: 'google',             // 'google', 'deepl', 'microsoft'
    apiKey: process.env.TRANSLATE_API_KEY || '',
    
    // Налаштування для різних сервісів
    google: {
      projectId: process.env.GOOGLE_PROJECT_ID || '',
      keyFile: process.env.GOOGLE_KEY_FILE || '',
    },
    
    deepl: {
      apiUrl: 'https://api-free.deepl.com/v2/translate',
      authKey: process.env.DEEPL_AUTH_KEY || '',
    },
    
    microsoft: {
      endpoint: process.env.TRANSLATOR_TEXT_ENDPOINT || '',
      subscriptionKey: process.env.TRANSLATOR_TEXT_SUBSCRIPTION_KEY || '',
      region: process.env.TRANSLATOR_TEXT_REGION || 'global',
    }
  },
  
  // Фільтри для обробки
  filters: {
    // Namespaces для обробки (пусто = всі)
    includeNamespaces: [],
    
    // Namespaces для пропуску
    excludeNamespaces: ['temp', 'debug'],
    
    // Ключі для пропуску (regex)
    excludeKeys: [
      /^temp\./,                   // Тимчасові ключі
      /^debug\./,                  // Дебаг ключі
      /\.(id|uuid)$/,             // ID та UUID
    ],
    
    // Ключі які не потребують перекладу
    skipTranslationKeys: [
      /\.(url|link|href)$/,       // URL посилання
      /\.(email|phone)$/,         // Контактна інформація
      /\.(code|sku|id)$/,         // Коди та ідентифікатори
      /\.(date|time)$/,           // Формати дати/часу
    ]
  },
  
  // Правила валідації
  validation: {
    // Обов'язкові ключі (мають бути у всіх мовах)
    requiredKeys: [
      'common.general.save',
      'common.general.cancel',
      'navigation.menu.home',
      'auth.login.title',
    ],
    
    // Максимальна довжина значень
    maxLength: {
      default: 1000,
      'button': 50,
      'title': 100,
      'description': 500,
    },
    
    // Перевірка на порожні значення
    allowEmpty: false,
    
    // Перевірка на HTML теги
    allowHTML: false,
    
    // Перевірка інтерполяції
    validateInterpolation: true,
  },
  
  // Налаштування логування
  logging: {
    level: 'info',                 // 'debug', 'info', 'warn', 'error'
    logFile: 'translation-sync.log',
    colorOutput: true,
    showProgress: true,
    showStatistics: true,
  },
  
  // Хуки для кастомної обробки
  hooks: {
    // Викликається перед синхронізацією
    beforeSync: null,
    
    // Викликається після синхронізації
    afterSync: null,
    
    // Викликається для кожного ключа
    beforeKeySync: null,
    
    // Викликається після обробки ключа
    afterKeySync: null,
    
    // Кастомний переклад
    customTranslate: null,
  },
  
  // Мппінг мов для автоперекладу
  languageMapping: {
    'uk': 'uk',
    'en': 'en',
    'ru': 'ru',
    'pl': 'pl',
    'de': 'de',
    'fr': 'fr',
    'es': 'es',
    'it': 'it',
  },
  
  // Placeholder шаблони для відсутніх перекладів
  placeholders: {
    // Шаблон за замовчуванням
    default: '[{{locale}}] {{value}}',
    
    // Спеціальні шаблони для різних типів
    button: '{{value}}',           // Кнопки без префіксу
    title: '{{value}}',           // Заголовки без префіксу
    error: 'Error: {{value}}',    // Помилки з префіксом
    
    // Емодзі префікси
    useEmoji: false,
    emojiMap: {
      'en': '🇺🇸',
      'uk': '🇺🇦',
      'ru': '🇷🇺',
      'pl': '🇵🇱',
      'de': '🇩🇪',
      'fr': '🇫🇷',
    }
  },
  
  // Інтеграція з Git
  git: {
    autoCommit: false,            // Автоматично комітити зміни
    commitMessage: 'chore: sync translations [{{locale}}]',
    createPR: false,              // Створювати Pull Request
    branchPrefix: 'translations/', // Префікс для бранчів
  },
  
  // Статистика та звіти
  reports: {
    generateReport: true,         // Генерувати звіт
    reportFormat: 'json',         // 'json', 'csv', 'html'
    reportPath: 'translation-reports',
    includeStatistics: true,
    includeChanges: true,
    includeValidation: true,
  }
}

// Приклад кастомних хуків
const customHooks = {
  // Кастомний переклад для специфічних випадків
  customTranslate: async (key, value, fromLocale, toLocale) => {
    // Приклад: спеціальна обробка для валют
    if (key.includes('currency')) {
      const currencyMap = {
        'uk-en': { 'грн': 'UAH', 'долар': 'USD' },
        'uk-ru': { 'грн': 'грн', 'долар': 'доллар' }
      }
      
      const mapping = currencyMap[`${fromLocale}-${toLocale}`]
      if (mapping) {
        let translated = value
        Object.entries(mapping).forEach(([from, to]) => {
          translated = translated.replace(new RegExp(from, 'gi'), to)
        })
        return translated
      }
    }
    
    // Повертаємо null якщо не обробляємо
    return null
  },
  
  // Валідація перед збереженням
  beforeSync: (config) => {
    console.log(`🚀 Початок синхронізації з ${config.baseLocale} на ${config.targetLocales.join(', ')}`)
  },
  
  // Пост-обробка після синхронізації
  afterSync: (results) => {
    console.log(`✅ Синхронізація завершена. Оброблено ${results.totalKeys} ключів`)
    
    // Можна додати інтеграцію з Slack, Discord тощо
    if (results.changes > 0) {
      // sendNotification(`Оновлено ${results.changes} перекладів`)
    }
  }
}

// Експорт конфігурації з хуками
module.exports.hooks = customHooks