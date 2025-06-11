'use client'

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useCallback,
} from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { motion, MotionConfig, useReducedMotion } from 'framer-motion'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { GridPattern } from '@/components/GridPattern'
import { Logo, Logomark } from '@/components/Logo'
import { Offices } from '@/components/Offices'
import { SocialMedia } from '@/components/SocialMedia'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslations } from '@/hooks/useTranslations'

// Контекст для общего состояния layout
const RootLayoutContext = createContext(null)

// Константы для анимации
const ANIMATION_CONFIG = {
  duration: 0.3,
  ease: [0.4, 0.0, 0.2, 1],
}

const FOCUS_DELAY = 150

// SVG иконки вынесены отдельно для лучшей читаемости
const XIcon = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
    <path d="m5.636 4.223 14.142 14.142-1.414 1.414L4.222 5.637z" />
    <path d="M4.222 18.363 18.364 4.22l1.414 1.414L5.636 19.777z" />
  </svg>
)

const MenuIcon = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
    <path d="M2 6h20v2H2zM2 16h20v2H2z" />
  </svg>
)

// Кастомный хук для управления навигацией
const useNavigationState = () => {
  const [expanded, setExpanded] = useState(false)
  const openRef = useRef(null)
  const closeRef = useRef(null)

  const toggleNavigation = useCallback(() => {
    setExpanded(prev => {
      const newState = !prev
      // Управление фокусом с задержкой для анимации
      setTimeout(() => {
        if (newState) {
          closeRef.current?.focus({ preventScroll: true })
        } else {
          openRef.current?.focus({ preventScroll: true })
        }
      }, FOCUS_DELAY)
      return newState
    })
  }, [])

  const closeNavigation = useCallback(() => {
    setExpanded(false)
  }, [])

  return {
    expanded,
    openRef,
    closeRef,
    toggleNavigation,
    closeNavigation,
  }
}

// Улучшенный Header с мемоизацией
const Header = ({
  panelId,
  icon: Icon,
  expanded,
  onToggle,
  toggleRef,
  invert = false,
}) => {
  const { logoHovered, setLogoHovered } = useContext(RootLayoutContext)
  const { t, currentLocale } = useTranslations()

  const handleLogoHover = useCallback(() => setLogoHovered(true), [setLogoHovered])
  const handleLogoLeave = useCallback(() => setLogoHovered(false), [setLogoHovered])

  return (
    <Container>
      <div className="flex items-center justify-between">
        <Link
          href={`/${currentLocale}`}
          aria-label={t('header.homeLink') || 'На головну'}
          onMouseEnter={handleLogoHover}
          onMouseLeave={handleLogoLeave}
          className="transition-opacity hover:opacity-80"
        >
          <Logomark
            className="h-8 sm:hidden"
            invert={invert}
            filled={logoHovered}
          />
          <Logo
            className="hidden h-8 sm:block"
            invert={invert}
            filled={logoHovered}
          />
        </Link>
        
        <div className="flex items-center gap-x-4">
          <LanguageSwitcher invert={invert} />
          <Button 
            href={`/${currentLocale}/contact`} 
            invert={invert}
            aria-label={t('navigation.contactUs') || 'Зв\'язатися з нами'}
          >
            {t('header.contact') || 'Контакти'}
          </Button>
          <button
            ref={toggleRef}
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={
              expanded 
                ? (t('header.closeNavigation') || 'Закрити навігацію')
                : (t('header.openNavigation') || 'Відкрити навігацію')
            }
            className={clsx(
              'group -m-2.5 rounded-full p-2.5 transition-colors duration-200',
              invert ? 'hover:bg-white/10' : 'hover:bg-neutral-950/10',
            )}
          >
            <Icon
              className={clsx(
                'h-6 w-6 transition-colors duration-200',
                invert
                  ? 'fill-white group-hover:fill-neutral-200'
                  : 'fill-neutral-950 group-hover:fill-neutral-700',
              )}
            />
          </button>
        </div>
      </div>
    </Container>
  )
}

// Компонент строки навигации
const NavigationRow = ({ children }) => (
  <div className="even:mt-px sm:bg-neutral-950">
    <Container>
      <div className="grid grid-cols-1 sm:grid-cols-2">{children}</div>
    </Container>
  </div>
)

// Улучшенный элемент навигации
const NavigationItem = ({ href, children, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className="group relative isolate -mx-6 bg-neutral-950 px-6 py-10 transition-all duration-300 even:mt-px hover:bg-neutral-900 sm:mx-0 sm:px-0 sm:py-16 sm:odd:pr-16 sm:even:mt-0 sm:even:border-l sm:even:border-neutral-800 sm:even:pl-16"
  >
    <span className="relative z-10 font-display text-5xl font-medium tracking-tight text-white transition-colors duration-300 group-hover:text-neutral-200">
      {children}
    </span>
    <span className="absolute inset-y-0 -z-10 w-screen bg-neutral-900 opacity-0 transition-opacity duration-300 group-odd:right-0 group-even:left-0 group-hover:opacity-100" />
  </Link>
)

// Главная навигация
const Navigation = ({ onItemClick }) => {
  const { t, currentLocale } = useTranslations()
  
  // Структура навигации для лучшей масштабируемости
  const navigationItems = [
    [
      { href: `/${currentLocale}/work`, key: 'work', label: t('navigation.work') || 'Наші вироби' },
      { href: `/${currentLocale}/about`, key: 'about', label: t('navigation.about') || 'Про компанію' },
    ],
    [
      { href: `/${currentLocale}/process`, key: 'process', label: t('navigation.process') || 'Процес виробництва' },
      { href: `/${currentLocale}/job`, key: 'job', label: t('navigation.job') || 'Робота з нами' },
    ],
  ]
  
  return (
    <nav 
      className="font-display text-5xl font-medium tracking-tight text-white"
      aria-label={t('header.mainNavigation') || 'Головна навігація'}
    >
      {navigationItems.map((row, rowIndex) => (
        <NavigationRow key={rowIndex}>
          {row.map((item) => (
            <NavigationItem 
              key={item.key} 
              href={item.href}
              onClick={onItemClick}
            >
              {item.label}
            </NavigationItem>
          ))}
        </NavigationRow>
      ))}
    </nav>
  )
}

// Основной внутренний компонент layout
const RootLayoutInner = ({ children }) => {
  const panelId = useId()
  const navRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const [logoHovered, setLogoHovered] = useState(false)
  
  const {
    expanded,
    openRef,
    closeRef,
    toggleNavigation,
    closeNavigation,
  } = useNavigationState()
  
  const { t } = useTranslations()

  // Обработка клика для закрытия навигации при переходе
  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target
      if (target instanceof HTMLElement) {
        const link = target.closest('a')
        if (link?.href === window.location.href) {
          closeNavigation()
        }
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [closeNavigation])

  // Закрытие навигации по Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && expanded) {
        closeNavigation()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [expanded, closeNavigation])

  const contextValue = {
    logoHovered,
    setLogoHovered,
  }

  return (
    <RootLayoutContext.Provider value={contextValue}>
      <MotionConfig 
        transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_CONFIG}
      >
        <header>
          {/* Основной header */}
          <div
            className="absolute left-0 right-0 top-2 z-40 pt-14"
            aria-hidden={expanded || undefined}
            {...(expanded && { inert: '' })}
          >
            <Header
              panelId={panelId}
              icon={MenuIcon}
              toggleRef={openRef}
              expanded={expanded}
              onToggle={toggleNavigation}
            />
          </div>

          {/* Мобильная навигация */}
          <motion.div
            layout
            id={panelId}
            style={{ height: expanded ? 'auto' : '0.5rem' }}
            className="relative z-50 overflow-hidden bg-neutral-950 pt-2"
            aria-hidden={!expanded || undefined}
            {...(!expanded && { inert: '' })}
          >
            <motion.div layout className="bg-neutral-800">
              <div ref={navRef} className="bg-neutral-950 pb-16 pt-14">
                <Header
                  invert
                  panelId={panelId}
                  icon={XIcon}
                  toggleRef={closeRef}
                  expanded={expanded}
                  onToggle={toggleNavigation}
                />
              </div>
              
              <Navigation onItemClick={closeNavigation} />
              
              {/* Дополнительная информация в навигации */}
              <div className="relative bg-neutral-950 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-neutral-800">
                <Container>
                  <div className="grid grid-cols-1 gap-y-10 pb-16 pt-10 sm:grid-cols-2 sm:pt-16">
                    <div>
                      <h2 className="font-display text-base font-semibold text-white">
                        {t('header.ourAddress') || 'Наша адреса'}
                      </h2>
                      <Offices
                        invert
                        className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2"
                      />
                    </div>
                    <div className="sm:border-l sm:border-neutral-800 sm:pl-16">
                      <h2 className="font-display text-base font-semibold text-white">
                        {t('header.followUs') || 'Слідкуйте за нами'}
                      </h2>
                      <SocialMedia className="mt-6" invert />
                    </div>
                  </div>
                </Container>
              </div>
            </motion.div>
          </motion.div>
        </header>

        {/* Основной контент */}
        <motion.div
          layout
          style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
          className="relative flex flex-auto overflow-hidden bg-white pt-14"
        >
          <motion.div
            layout
            className="relative isolate flex w-full flex-col pt-9"
          >
            <GridPattern
              className="absolute inset-x-0 -top-14 -z-10 h-[1000px] w-full fill-neutral-50 stroke-neutral-950/5 [mask-image:linear-gradient(to_bottom_left,white_40%,transparent_50%)]"
              yOffset={-96}
              interactive
            />

            <main className="w-full flex-auto" role="main">
              {children}
            </main>

            <Footer />
          </motion.div>
        </motion.div>
      </MotionConfig>
    </RootLayoutContext.Provider>
  )
}

// Главный экспорт
export function RootLayout({ children }) {
  const pathname = usePathname()

  return (
    <RootLayoutInner key={pathname}>
      {children}
    </RootLayoutInner>
  )
}