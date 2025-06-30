// frontend/src/components/T.jsx - КОМПОНЕНТ ДЛЯ ПЕРЕКЛАДІВ
'use client'

import { usePageTranslations } from '@/hooks/useTranslations'

/**
 * Компонент для простого використання перекладів в JSX
 * 
 * @param {string} k - ключ перекладу
 * @param {string} ns - namespace (опціонально)
 * @param {string} fallback - fallback текст
 * @param {object} values - значення для інтерполяції
 * @param {string} as - HTML тег (за замовчуванням span)
 * @param {object} props - додаткові HTML атрибути
 */
export function T({ 
  k, 
  ns = null, 
  fallback = null, 
  values = {}, 
  as: Component = 'span',
  ...props 
}) {
  const { t } = usePageTranslations(ns)
  
  const translatedText = t(k, fallback || k, values)
  
  return <Component {...props}>{translatedText}</Component>
}

/**
 * Спеціалізований компонент для заголовків
 */
export function TH1({ k, ns, fallback, values, ...props }) {
  return <T k={k} ns={ns} fallback={fallback} values={values} as="h1" {...props} />
}

export function TH2({ k, ns, fallback, values, ...props }) {
  return <T k={k} ns={ns} fallback={fallback} values={values} as="h2" {...props} />
}

export function TH3({ k, ns, fallback, values, ...props }) {
  return <T k={k} ns={ns} fallback={fallback} values={values} as="h3" {...props} />
}

/**
 * Компонент для параграфів
 */
export function TP({ k, ns, fallback, values, ...props }) {
  return <T k={k} ns={ns} fallback={fallback} values={values} as="p" {...props} />
}

/**
 * Компонент для кнопок
 */
export function TButton({ k, ns, fallback, values, children, ...props }) {
  const { t } = usePageTranslations(ns)
  const translatedText = t(k, fallback || k, values)
  
  return (
    <button {...props}>
      {children || translatedText}
    </button>
  )
}

/**
 * Приклад використання:
 * 
 * <T k="hero.title" ns="homepage" fallback="Заголовок" />
 * <TH1 k="hero.title" ns="homepage" fallback="Заголовок" className="text-4xl" />
 * <TP k="hero.description" ns="homepage" />
 * <T k="common.welcome" values={{ name: "Іван" }} /> // Привіт, {{name}}!
 */