const fallbackTranslations = {
  uk: {
    'common.loading': 'Завантаження...',
    'common.error': 'Помилка',
    'common.retry': 'Спробувати знову',
    'nav.home': 'Головна',
    'nav.about': 'Про нас',
    'nav.services': 'Послуги',
    'nav.projects': 'Проекти',
    'nav.contact': 'Контакти'
  },
  en: {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Try again',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact'
  }
}

export function getFallbackTranslation(key, locale = 'uk') {
  return fallbackTranslations[locale]?.[key] || key
}