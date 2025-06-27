// create-translations.js - Скрипт для створення базових файлів перекладів

const fs = require('fs')
const path = require('path')

// Конфігурація
const CONFIG = {
  locales: ['uk', 'en'], // Додайте інші мови за потреби: 'ru', 'pl', 'de'
  baseDir: 'frontend/public/locales',
  namespaces: ['common', 'navigation', 'auth', 'forms', 'errors', 'pages', 'products']
}

// Базові шаблони перекладів
const TEMPLATES = {
  uk: {
    common: {
      app: {
        name: "Назва додатку",
        tagline: "Ваш слоган тут",
        description: "Опис вашого додатку"
      },
      general: {
        yes: "Так",
        no: "Ні",
        ok: "ОК",
        cancel: "Скасувати",
        save: "Зберегти",
        delete: "Видалити",
        edit: "Редагувати",
        view: "Переглянути",
        back: "Назад",
        next: "Далі",
        previous: "Попередній",
        loading: "Завантаження...",
        search: "Пошук",
        filter: "Фільтр",
        close: "Закрити",
        open: "Відкрити"
      },
      time: {
        today: "Сьогодні",
        yesterday: "Вчора",
        tomorrow: "Завтра",
        now: "Зараз",
        minutes_ago: "{{count}} хвилин тому",
        hours_ago: "{{count}} годин тому",
        days_ago: "{{count}} днів тому"
      }
    },
    navigation: {
      menu: {
        home: "Головна",
        about: "Про нас",
        services: "Послуги",
        products: "Товари",
        contact: "Контакти",
        blog: "Блог"
      },
      footer: {
        company: "Компанія",
        support: "Підтримка",
        legal: "Правова інформація",
        social: "Соціальні мережі",
        copyright: "© {{year}} {{company}}. Всі права захищені."
      }
    },
    auth: {
      login: {
        title: "Увійти",
        email: "Email",
        password: "Пароль",
        submit: "Увійти",
        forgot_password: "Забули пароль?"
      },
      register: {
        title: "Реєстрація",
        first_name: "Ім'я",
        last_name: "Прізвище",
        email: "Email",
        password: "Пароль",
        submit: "Зареєструватися"
      }
    },
    forms: {
      validation: {
        required: "Це поле обов'язкове",
        email: "Введіть коректний email",
        min_length: "Мінімум {{count}} символів",
        password_mismatch: "Паролі не співпадають"
      },
      buttons: {
        submit: "Відправити",
        save: "Зберегти",
        cancel: "Скасувати",
        reset: "Скинути"
      }
    },
    errors: {
      http: {
        404: "Сторінка не знайдена",
        500: "Помилка сервера",
        403: "Доступ заборонено"
      },
      network: {
        offline: "Немає з'єднання з інтернетом",
        timeout: "Час очікування вичерпано"
      },
      generic: {
        something_went_wrong: "Щось пішло не так",
        try_again: "Спробуйте ще раз"
      }
    },
    pages: {
      homepage: {
        hero: {
          title: "Ласкаво просимо до {{company}}",
          subtitle: "Ми надаємо найкращі послуги",
          cta_button: "Почати"
        }
      }
    },
    products: {
      catalog: {
        title: "Каталог",
        no_results: "Товарів не знайдено"
      },
      product: {
        price: "Ціна",
        add_to_cart: "Додати в кошик",
        in_stock: "В наявності",
        out_of_stock: "Немає в наявності"
      }
    }
  },
  
  en: {
    common: {
      app: {
        name: "App Name",
        tagline: "Your tagline here",
        description: "Your app description"
      },
      general: {
        yes: "Yes",
        no: "No",
        ok: "OK",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        back: "Back",
        next: "Next",
        previous: "Previous",
        loading: "Loading...",
        search: "Search",
        filter: "Filter",
        close: "Close",
        open: "Open"
      },
      time: {
        today: "Today",
        yesterday: "Yesterday",
        tomorrow: "Tomorrow",
        now: "Now",
        minutes_ago: "{{count}} minutes ago",
        hours_ago: "{{count}} hours ago",
        days_ago: "{{count}} days ago"
      }
    },
    navigation: {
      menu: {
        home: "Home",
        about: "About",
        services: "Services",
        products: "Products",
        contact: "Contact",
        blog: "Blog"
      },
      footer: {
        company: "Company",
        support: "Support",
        legal: "Legal",
        social: "Social Media",
        copyright: "© {{year}} {{company}}. All rights reserved."
      }
    },
    auth: {
      login: {
        title: "Sign In",
        email: "Email",
        password: "Password",
        submit: "Sign In",
        forgot_password: "Forgot password?"
      },
      register: {
        title: "Sign Up",
        first_name: "First Name",
        last_name: "Last Name",
        email: "Email",
        password: "Password",
        submit: "Sign Up"
      }
    },
    forms: {
      validation: {
        required: "This field is required",
        email: "Enter valid email",
        min_length: "Minimum {{count}} characters",
        password_mismatch: "Passwords don't match"
      },
      buttons: {
        submit: "Submit",
        save: "Save",
        cancel: "Cancel",
        reset: "Reset"
      }
    },
    errors: {
      http: {
        404: "Page not found",
        500: "Server error",
        403: "Access denied"
      },
      network: {
        offline: "No internet connection",
        timeout: "Request timeout"
      },
      generic: {
        something_went_wrong: "Something went wrong",
        try_again: "Try again"
      }
    },
    pages: {
      homepage: {
        hero: {
          title: "Welcome to {{company}}",
          subtitle: "We provide the best services",
          cta_button: "Get Started"
        }
      }
    },
    products: {
      catalog: {
        title: "Catalog",
        no_results: "No products found"
      },
      product: {
        price: "Price",
        add_to_cart: "Add to Cart",
        in_stock: "In Stock",
        out_of_stock: "Out of Stock"
      }
    }
  }
}

// Функції утиліти
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`📁 Created directory: ${dirPath}`)
  }
}

function writeJSONFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  console.log(`📄 Created file: ${filePath}`)
}

function fileExists(filePath) {
  return fs.existsSync(filePath)
}

// Основна функція створення перекладів
function createTranslations() {
  console.log('🌍 Створення файлів перекладів...\n')
  
  // Створюємо базову директорію
  createDirectory(CONFIG.baseDir)
  
  let createdFiles = 0
  let skippedFiles = 0
  
  CONFIG.locales.forEach(locale => {
    console.log(`🌐 Обробка мови: ${locale}`)
    
    const localeDir = path.join(CONFIG.baseDir, locale)
    createDirectory(localeDir)
    
    CONFIG.namespaces.forEach(namespace => {
      const filePath = path.join(localeDir, `${namespace}.json`)
      
      if (fileExists(filePath)) {
        console.log(`   ⚠️  Файл існує, пропущено: ${namespace}.json`)
        skippedFiles++
        return
      }
      
      // Отримуємо шаблон для мови та namespace
      const template = TEMPLATES[locale]?.[namespace] || {}
      
      // Якщо шаблону немає для цієї мови, використовуємо український як базу
      const fallbackTemplate = TEMPLATES['uk']?.[namespace] || {}
      
      // Об'єднуємо або використовуємо fallback
      const content = Object.keys(template).length > 0 ? template : fallbackTemplate
      
      writeJSONFile(filePath, content)
      createdFiles++
    })
    
    console.log('')
  })
  
  console.log('✅ Створення перекладів завершено!')
  console.log(`📊 Статистика:`)
  console.log(`   - Створено файлів: ${createdFiles}`)
  console.log(`   - Пропущено файлів: ${skippedFiles}`)
  console.log(`   - Мови: ${CONFIG.locales.join(', ')}`)
  console.log(`   - Namespaces: ${CONFIG.namespaces.join(', ')}`)
}

// Функція для валідації існуючих перекладів
function validateTranslations() {
  console.log('🔍 Валідація перекладів...\n')
  
  const baseLocale = CONFIG.locales[0] // Перша мова як базова
  const missing = {}
  const extra = {}
  
  function getKeys(obj, prefix = '') {
    let keys = []
    for (const key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...getKeys(obj[key], newKey))
      } else {
        keys.push(newKey)
      }
    }
    return keys
  }
  
  // Отримуємо базові ключі
  const baseKeys = {}
  CONFIG.namespaces.forEach(namespace => {
    const filePath = path.join(CONFIG.baseDir, baseLocale, `${namespace}.json`)
    if (fileExists(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      baseKeys[namespace] = getKeys(content)
    }
  })
  
  // Перевіряємо інші мови
  CONFIG.locales.slice(1).forEach(locale => {
    missing[locale] = []
    extra[locale] = []
    
    CONFIG.namespaces.forEach(namespace => {
      const filePath = path.join(CONFIG.baseDir, locale, `${namespace}.json`)
      
      if (!fileExists(filePath)) {
        missing[locale].push(`Missing file: ${namespace}.json`)
        return
      }
      
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      const localeKeys = getKeys(content)
      const baseNamespaceKeys = baseKeys[namespace] || []
      
      // Відсутні ключі
      baseNamespaceKeys.forEach(key => {
        if (!localeKeys.includes(key)) {
          missing[locale].push(`${namespace}: ${key}`)
        }
      })
      
      // Зайві ключі
      localeKeys.forEach(key => {
        if (!baseNamespaceKeys.includes(key)) {
          extra[locale].push(`${namespace}: ${key}`)
        }
      })
    })
  })
  
  // Виводимо результати
  let hasIssues = false
  
  Object.keys(missing).forEach(locale => {
    if (missing[locale].length > 0) {
      console.log(`❌ Відсутні в ${locale}:`)
      missing[locale].forEach(key => console.log(`   - ${key}`))
      console.log('')
      hasIssues = true
    }
    
    if (extra[locale].length > 0) {
      console.log(`⚠️  Зайві в ${locale}:`)
      extra[locale].forEach(key => console.log(`   - ${key}`))
      console.log('')
      hasIssues = true
    }
  })
  
  if (!hasIssues) {
    console.log('✅ Всі переклади синхронізовані!')
  }
}

// Функція для додавання нових ключів
function addTranslationKey(namespace, keyPath, translations) {
  console.log(`➕ Додавання ключа: ${namespace}.${keyPath}`)
  
  CONFIG.locales.forEach(locale => {
    const filePath = path.join(CONFIG.baseDir, locale, `${namespace}.json`)
    
    if (!fileExists(filePath)) {
      console.log(`❌ Файл не існує: ${filePath}`)
      return
    }
    
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const keys = keyPath.split('.')
    let current = content
    
    // Створюємо вкладену структуру
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    // Додаємо переклад
    const finalKey = keys[keys.length - 1]
    current[finalKey] = translations[locale] || translations['uk'] || `[${keyPath}]`
    
    writeJSONFile(filePath, content)
  })
  
  console.log('✅ Ключ додано до всіх мов')
}

// CLI інтерфейс
function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'create':
      createTranslations()
      break
      
    case 'validate':
      validateTranslations()
      break
      
    case 'add':
      if (args.length < 4) {
        console.log('❌ Використання: node create-translations.js add <namespace> <key> <uk_text> [en_text]')
        console.log('📋 Приклад: node create-translations.js add common "button.submit" "Відправити" "Submit"')
        return
      }
      
      const namespace = args[1]
      const keyPath = args[2]
      const ukText = args[3]
      const enText = args[4] || ukText
      
      addTranslationKey(namespace, keyPath, { uk: ukText, en: enText })
      break
      
    case 'help':
    default:
      console.log('🌍 Менеджер перекладів')
      console.log('')
      console.log('📋 Доступні команди:')
      console.log('   create    - Створити базові файли перекладів')
      console.log('   validate  - Перевірити синхронізацію перекладів')
      console.log('   add       - Додати новий ключ перекладу')
      console.log('   help      - Показати цю довідку')
      console.log('')
      console.log('📖 Приклади:')
      console.log('   node create-translations.js create')
      console.log('   node create-translations.js validate')
      console.log('   node create-translations.js add common "new.key" "Новий текст" "New text"')
      break
  }
}

// Запуск
if (require.main === module) {
  main()
}

module.exports = {
  createTranslations,
  validateTranslations,
  addTranslationKey,
  CONFIG,
  TEMPLATES
}