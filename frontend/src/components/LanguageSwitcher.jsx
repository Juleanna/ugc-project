'use client'

import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { useState } from 'react'
import { useTranslations } from '@/hooks/useTranslations'

const languages = [
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export function LanguageSwitcher({ invert = false, className }) {
  const router = useRouter()
  const { currentLocale } = useTranslations()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]
  const otherLanguages = languages.filter(lang => lang.code !== currentLocale)

  const handleLanguageChange = (langCode) => {
    const currentPath = window.location.pathname
    const currentSearch = window.location.search
    
    // Remove current locale from path (like /uk/about -> /about)
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}(\/|$)/, '/')
    
    // Create new path with selected locale
    const newPath = `/${langCode}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
    
    router.push(newPath + currentSearch)
    setIsOpen(false)
  }

  return (
    <div className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
          invert
            ? 'text-white hover:bg-white/10'
            : 'text-neutral-950 hover:bg-neutral-100'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:block">{currentLanguage.name}</span>
        <svg
          className={clsx(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={clsx(
            'absolute right-0 top-full z-20 mt-2 min-w-[150px] rounded-lg border shadow-lg',
            invert
              ? 'border-white/20 bg-neutral-900'
              : 'border-neutral-200 bg-white'
          )}>
            {otherLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={clsx(
                  'flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition first:rounded-t-lg last:rounded-b-lg',
                  invert
                    ? 'text-white hover:bg-white/10'
                    : 'text-neutral-950 hover:bg-neutral-50'
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 