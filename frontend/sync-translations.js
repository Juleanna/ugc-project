// sync-translations.js - Скрипт для синхронізації перекладів між мовами

const fs = require('fs')
const path = require('path')

// Конфігурація
const CONFIG = {
  localesDir: 'frontend/public/locales',
  baseLocale: 'uk',  // Основна мова (еталон)
  targetLocales: ['en', 'ru'], // Мови для синхронізації
  backupDir: 'translation-backups',
  
  // Налаштування синхронізації
  options: {
    createMissingFiles: true,      // Створювати відсутні файли
    addMissingKeys: true,          // Додавати відсутні ключі
    removeExtraKeys: false,        // Видаляти зайві ключі (обережно!)
    preserveExisting: true,        // Зберігати існуючі переклади
    useAutoTranslate: false,       // Використовувати автопереклад
    createBackup: true,            // Створювати backup перед змінами
    sortKeys: true,                // Сортувати ключі в алфавітному порядку
  }
}

// Утилітарні функції
class TranslationUtils {
  static createBackup() {
    if (!CONFIG.options.createBackup) return
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(CONFIG.backupDir, timestamp)
    
    if (fs.existsSync(CONFIG.localesDir)) {
      fs.mkdirSync(backupPath, { recursive: true })
      this.copyDirectory(CONFIG.localesDir, backupPath)
      console.log(`💾 Backup створено: ${backupPath}`)
    }
  }
  
  static copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true })
    const entries = fs.readdirSync(src, { withFileTypes: true })
    
    entries.forEach(entry => {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)
      
      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    })
  }
  
  static getAllKeys(obj, prefix = '') {
    let keys = []
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...this.getAllKeys(obj[key], fullKey))
      } else {
        keys.push(fullKey)
      }
    }
    
    return keys
  }
  
  static setNestedValue(obj, keyPath, value) {
    const keys = keyPath.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
  }
  
  static getNestedValue(obj, keyPath) {
    const keys = keyPath.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }
    
    return current
  }
  
  static sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return obj
    }
    
    const sorted = {}
    const keys = Object.keys(obj).sort()
    
    keys.forEach(key => {
      sorted[key] = this.sortObjectKeys(obj[key])
    })
    
    return sorted
  }
  
  static generatePlaceholderTranslation(key, baseValue, targetLocale) {
    // Генерує placeholder переклад для відсутніх ключів
    
    if (CONFIG.options.useAutoTranslate) {
      // Тут можна інтегрувати Google Translate API або інший сервіс
      return this.autoTranslate(baseValue, CONFIG.baseLocale, targetLocale)
    }
    
    // Простий placeholder
    if (typeof baseValue === 'string') {
      return `[${targetLocale.toUpperCase()}] ${baseValue}`
    }
    
    return baseValue
  }
  
  static async autoTranslate(text, fromLang, toLang) {
    // Заглушка для автоперекладу
    // В реальному проекті тут може бути інтеграція з Google Translate API
    
    const translations = {
      'uk-en': {
        'Зберегти': 'Save',
        'Скасувати': 'Cancel',
        'Видалити': 'Delete',
        'Редагувати': 'Edit',
        'Головна': 'Home',
        'Про нас': 'About',
        'Контакти': 'Contact',
        'Увійти': 'Sign In',
        'Реєстрація': 'Sign Up'
      },
      'uk-ru': {
        'Зберегти': 'Сохранить',
        'Скасувати': 'Отменить',
        'Видалити': 'Удалить',
        'Редагувати': 'Редактировать',
        'Головна': 'Главная',
        'Про нас': 'О нас',
        'Контакти': 'Контакты',
        'Увійти': 'Войти',
        'Реєстрація': 'Регистрация'
      }
    }
    
    const translationKey = `${fromLang}-${toLang}`
    return translations[translationKey]?.[text] || `[${toLang.toUpperCase()}] ${text}`
  }
}

// Основний клас синхронізації
class TranslationSynchronizer {
  constructor() {
    this.baseTranslations = {}
    this.targetTranslations = {}
    this.changes = {
      filesCreated: [],
      keysAdded: [],
      keysRemoved: [],
      keysUpdated: []
    }
  }
  
  async synchronize() {
    console.log('🔄 Початок синхронізації перекладів...\n')
    
    // Створюємо backup
    TranslationUtils.createBackup()
    
    // Завантажуємо базові переклади
    this.loadBaseTranslations()
    
    // Синхронізуємо кожну цільову мову
    for (const targetLocale of CONFIG.targetLocales) {
      console.log(`🌐 Синхронізація: ${CONFIG.baseLocale} → ${targetLocale}`)
      await this.synchronizeLocale(targetLocale)
      console.log('')
    }
    
    // Виводимо підсумок
    this.printSummary()
  }
  
  loadBaseTranslations() {
    console.log(`📖 Завантаження базових перекладів (${CONFIG.baseLocale})...`)
    
    const baseDir = path.join(CONFIG.localesDir, CONFIG.baseLocale)
    
    if (!fs.existsSync(baseDir)) {
      throw new Error(`Базова директорія не знайдена: ${baseDir}`)
    }
    
    const files = fs.readdirSync(baseDir).filter(file => file.endsWith('.json'))
    
    files.forEach(file => {
      const filePath = path.join(baseDir, file)
      const namespace = file.replace('.json', '')
      
      try {
        this.baseTranslations[namespace] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        console.log(`   ✅ ${namespace}: ${TranslationUtils.getAllKeys(this.baseTranslations[namespace]).length} ключів`)
      } catch (error) {
        console.log(`   ❌ Помилка читання ${file}: ${error.message}`)
      }
    })
  }
  
  async synchronizeLocale(targetLocale) {
    const targetDir = path.join(CONFIG.localesDir, targetLocale)
    
    // Створюємо директорію якщо не існує
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
      console.log(`   📁 Створено директорію: ${targetDir}`)
    }
    
    // Синхронізуємо кожен namespace
    for (const namespace of Object.keys(this.baseTranslations)) {
      await this.synchronizeNamespace(namespace, targetLocale, targetDir)
    }
  }
  
  async synchronizeNamespace(namespace, targetLocale, targetDir) {
    const targetFile = path.join(targetDir, `${namespace}.json`)
    const baseData = this.baseTranslations[namespace]
    let targetData = {}
    
    // Завантажуємо існуючі переклади
    if (fs.existsSync(targetFile)) {
      try {
        targetData = JSON.parse(fs.readFileSync(targetFile, 'utf8'))
      } catch (error) {
        console.log(`   ⚠️  Помилка читання ${namespace}.json: ${error.message}`)
        targetData = {}
      }
    } else if (CONFIG.options.createMissingFiles) {
      console.log(`   📄 Створюємо новий файл: ${namespace}.json`)
      this.changes.filesCreated.push(`${targetLocale}/${namespace}.json`)
    }
    
    // Отримуємо всі ключі
    const baseKeys = TranslationUtils.getAllKeys(baseData)
    const targetKeys = TranslationUtils.getAllKeys(targetData)
    
    // Знаходимо відсутні ключі
    const missingKeys = baseKeys.filter(key => !targetKeys.includes(key))
    const extraKeys = targetKeys.filter(key => !baseKeys.includes(key))
    
    console.log(`   📋 ${namespace}: база=${baseKeys.length}, ціль=${targetKeys.length}, відсутні=${missingKeys.length}, зайві=${extraKeys.length}`)
    
    // Додаємо відсутні ключі
    if (CONFIG.options.addMissingKeys && missingKeys.length > 0) {
      for (const key of missingKeys) {
        const baseValue = TranslationUtils.getNestedValue(baseData, key.replace(`${namespace}.`, ''))
        const translatedValue = await TranslationUtils.generatePlaceholderTranslation(key, baseValue, targetLocale)
        
        TranslationUtils.setNestedValue(targetData, key.replace(`${namespace}.`, ''), translatedValue)
        this.changes.keysAdded.push(`${targetLocale}/${key}`)
      }
      
      console.log(`   ➕ Додано ${missingKeys.length} ключів`)
    }
    
    // Видаляємо зайві ключі
    if (CONFIG.options.removeExtraKeys && extraKeys.length > 0) {
      // Реалізація видалення зайвих ключів (складніше через вкладені об'єкти)
      console.log(`   ⚠️  Знайдено ${extraKeys.length} зайвих ключів (видалення вимкнено)`)
    }
    
    // Сортуємо ключі
    if (CONFIG.options.sortKeys) {
      targetData = TranslationUtils.sortObjectKeys(targetData)
    }
    
    // Зберігаємо файл
    try {
      fs.writeFileSync(targetFile, JSON.stringify(targetData, null, 2), 'utf8')
      console.log(`   💾 Збережено: ${namespace}.json`)
    } catch (error) {
      console.log(`   ❌ Помилка збереження: ${error.message}`)
    }
  }
  
  printSummary() {
    console.log('📊 ПІДСУМОК СИНХРОНІЗАЦІЇ')
    console.log('═'.repeat(50))
    
    console.log(`📁 Файлів створено: ${this.changes.filesCreated.length}`)
    this.changes.filesCreated.forEach(file => console.log(`   + ${file}`))
    
    console.log(`\n➕ Ключів додано: ${this.changes.keysAdded.length}`)
    if (this.changes.keysAdded.length <= 20) {
      this.changes.keysAdded.forEach(key => console.log(`   + ${key}`))
    } else {
      this.changes.keysAdded.slice(0, 10).forEach(key => console.log(`   + ${key}`))
      console.log(`   ... та ще ${this.changes.keysAdded.length - 10} ключів`)
    }
    
    if (this.changes.keysRemoved.length > 0) {
      console.log(`\n🗑️  Ключів видалено: ${this.changes.keysRemoved.length}`)
      this.changes.keysRemoved.forEach(key => console.log(`   - ${key}`))
    }
    
    console.log(`\n✅ Синхронізація завершена!`)
    
    if (CONFIG.options.createBackup) {
      console.log(`💾 Backup збережено в: ${CONFIG.backupDir}/`)
    }
  }
}

// Функція для валідації структури
function validateStructure() {
  console.log('🔍 Валідація структури перекладів...\n')
  
  const issues = []
  const locales = fs.readdirSync(CONFIG.localesDir)
  
  // Перевіряємо наявність базової мови
  if (!locales.includes(CONFIG.baseLocale)) {
    issues.push(`❌ Базова мова ${CONFIG.baseLocale} не знайдена`)
  }
  
  // Перевіряємо структуру кожної мови
  const namespaces = new Set()
  
  locales.forEach(locale => {
    const localeDir = path.join(CONFIG.localesDir, locale)
    if (fs.statSync(localeDir).isDirectory()) {
      const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'))
      files.forEach(file => namespaces.add(file.replace('.json', '')))
    }
  })
  
  // Перевіряємо чи всі мови мають всі namespaces
  locales.forEach(locale => {
    const localeDir = path.join(CONFIG.localesDir, locale)
    if (fs.statSync(localeDir).isDirectory()) {
      const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'))
      const localeNamespaces = files.map(f => f.replace('.json', ''))
      
      namespaces.forEach(namespace => {
        if (!localeNamespaces.includes(namespace)) {
          issues.push(`⚠️  ${locale} відсутній namespace: ${namespace}`)
        }
      })
    }
  })
  
  // Виводимо результати
  if (issues.length === 0) {
    console.log('✅ Структура коректна!')
  } else {
    console.log('❌ Знайдено проблеми:')
    issues.forEach(issue => console.log(`   ${issue}`))
  }
  
  console.log(`\n📊 Статистика:`)
  console.log(`   Мови: ${locales.length} (${locales.join(', ')})`)
  console.log(`   Namespaces: ${namespaces.size} (${Array.from(namespaces).join(', ')})`)
}

// Функція для очищення дублікатів
function removeDuplicates() {
  console.log('🧹 Видалення дублікатів...\n')
  
  const duplicates = []
  const locales = fs.readdirSync(CONFIG.localesDir)
  
  locales.forEach(locale => {
    const localeDir = path.join(CONFIG.localesDir, locale)
    if (!fs.statSync(localeDir).isDirectory()) return
    
    const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'))
    
    files.forEach(file => {
      const filePath = path.join(localeDir, file)
      
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        const keys = TranslationUtils.getAllKeys(data)
        const uniqueKeys = [...new Set(keys)]
        
        if (keys.length !== uniqueKeys.length) {
          duplicates.push(`${locale}/${file}: ${keys.length - uniqueKeys.length} дублікатів`)
        }
      } catch (error) {
        console.log(`❌ Помилка читання ${locale}/${file}: ${error.message}`)
      }
    })
  })
  
  if (duplicates.length === 0) {
    console.log('✅ Дублікатів не знайдено!')
  } else {
    console.log('❌ Знайдено дублікати:')
    duplicates.forEach(dup => console.log(`   ${dup}`))
  }
}

// CLI інтерфейс
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'sync'
  
  try {
    switch (command) {
      case 'sync':
        const synchronizer = new TranslationSynchronizer()
        await synchronizer.synchronize()
        break
        
      case 'validate':
        validateStructure()
        break
        
      case 'clean':
        removeDuplicates()
        break
        
      case 'config':
        console.log('⚙️  Поточна конфігурація:')
        console.log(JSON.stringify(CONFIG, null, 2))
        break
        
      case 'help':
      default:
        console.log('🔄 Синхронізатор перекладів')
        console.log('')
        console.log('📋 Доступні команди:')
        console.log('   sync      - Синхронізувати переклади (за замовчуванням)')
        console.log('   validate  - Перевірити структуру перекладів')
        console.log('   clean     - Видалити дублікати')
        console.log('   config    - Показати поточну конфігурацію')
        console.log('   help      - Показати цю довідку')
        console.log('')
        console.log('📖 Приклади:')
        console.log('   node sync-translations.js sync')
        console.log('   node sync-translations.js validate')
        console.log('   node sync-translations.js clean')
        break
    }
  } catch (error) {
    console.error(`❌ Помилка: ${error.message}`)
    process.exit(1)
  }
}

// Експорт для використання як модуль
module.exports = {
  TranslationSynchronizer,
  TranslationUtils,
  CONFIG,
  validateStructure,
  removeDuplicates
}

// Запуск якщо викликано напряму
if (require.main === module) {
  main()
}