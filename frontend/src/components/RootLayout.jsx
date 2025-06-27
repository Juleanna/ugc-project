// frontend/src/components/RootLayout.jsx - ВИПРАВЛЕНА ВЕРСІЯ
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

// ============================= ВИПРАВЛЕННЯ ГІДРАТАЦІЇ =============================

// Хук для перевірки клієнтського рендерингу
function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

// Обгортка для компонентів, що потребують клієнтського рендерингу
function ClientOnly({ children, fallback = null }) {
  const isClient = useIsClient()

  if (!isClient) {
    return fallback
  }

  return children
}

// ============================= SVG ІКОНКИ =============================

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

// ============================= КАСТОМНИЙ ХУК ДЛЯ НАВІГАЦІЇ =============================

const useNavigationState = () => {
  const [expanded, setExpanded] = useState(false)
  const openRef = useRef(null)
  const closeRef = useRef(null)
  const isClient = useIsClient()

  const toggleNavigation = useCallback(() => {
    if (!isClient) return

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
  }, [isClient])

  const closeNavigation = useCallback(() => {
    if (!isClient) return
    setExpanded(false)
  }, [isClient])

  return {
    expanded,
    openRef,
    closeRef,
    toggleNavigation,
    closeNavigation,
    isClient,
  }
}

// ============================= HEADER КОМПОНЕНТ =============================

const Header = ({
  panelId,
  icon: Icon,
  expanded,
  onToggle,
  toggleRef,
  invert = false,
}) => {
  const { logoHovered, setLogoHovered } = useContext(RootLayoutContext)
  const { t, currentLocale, isReady } = useTranslations()

  const handleLogoHover = useCallback(() => setLogoHovered(true), [setLogoHovered])
  const handleLogoLeave = useCallback(() => setLogoHovered(false), [setLogoHovered])

  return (
    <Container className="relative z-50 flex justify-between py-8">
      <div className="relative z-10 flex items-center gap-16">
        <Link
          href={`/${currentLocale || 'uk'}`}
          aria-label="Головна"
          onMouseEnter={handleLogoHover}
          onMouseLeave={handleLogoLeave}
          className="transition-transform duration-200 hover:scale-105"
        >
          <ClientOnly
            fallback={<Logomark className="h-8 sm:hidden" />}
          >
            <Logomark className="h-8 sm:hidden" />
            <Logo
              className="hidden h-8 sm:block"
              invert={invert}
              filled={logoHovered}
            />
          </ClientOnly>
        </Link>

        {/* Навігаційні посилання для десктопу */}
        <div className="hidden lg:flex lg:gap-10">
          <NavLinks invert={invert} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Переключення мов */}
        <ClientOnly>
          <LanguageSwitcher invert={invert} />
        </ClientOnly>

        {/* Кнопка меню */}
        <button
          ref={toggleRef}
          type="button"
          onClick={onToggle}
          aria-expanded={expanded ? 'true' : 'false'}
          aria-controls={panelId}
          className={clsx(
            'group -m-2.5 rounded-full p-2.5 transition-colors duration-200',
            invert ? 'hover:bg-white/10' : 'hover:bg-neutral-950/10',
          )}
          aria-label={
            expanded
              ? (isReady ? t('header.closeNavigation') : 'Закрити навігацію')
              : (isReady ? t('header.openNavigation') : 'Відкрити навігацію')
          }
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
    </Container>
  )
}

// ============================= НАВІГАЦІЙНІ ПОСИЛАННЯ =============================

const NavLinks = ({ invert = false }) => {
  const { t, currentLocale, isReady } = useTranslations()
  const pathname = usePathname()

  const getNavItems = () => {
    const baseLocale = currentLocale || 'uk'
    
    return [
      { 
        href: `/${baseLocale}/about`, 
        label: isReady ? t('nav.about') : 'Про нас' 
      },
      { 
        href: `/${baseLocale}/services`, 
        label: isReady ? t('nav.services') : 'Послуги' 
      },
      { 
        href: `/${baseLocale}/projects`, 
        label: isReady ? t('nav.projects') : 'Проекти' 
      },
      { 
        href: `/${baseLocale}/contact`, 
        label: isReady ? t('nav.contact') : 'Контакти' 
      },
    ]
  }

  return (
    <>
      {getNavItems().map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={clsx(
            'relative block text-base transition-colors duration-200',
            pathname === href
              ? (invert ? 'text-white' : 'text-neutral-950')
              : (invert 
                  ? 'text-neutral-300 hover:text-white' 
                  : 'text-neutral-700 hover:text-neutral-950'
                ),
          )}
        >
          {label}
          {pathname === href && (
            <span
              className={clsx(
                'absolute -bottom-1 left-0 h-0.5 w-full',
                invert ? 'bg-white' : 'bg-neutral-950'
              )}
            />
          )}
        </Link>
      ))}
    </>
  )
}

// ============================= МОБІЛЬНА НАВІГАЦІЯ =============================

const NavigationRow = ({ children }) => (
  <div className="even:mt-px sm:bg-neutral-950">
    <Container>
      <div className="grid grid-cols-1 sm:grid-cols-2">{children}</div>
    </Container>
  </div>
)

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

const Navigation = ({ onItemClick }) => {
  const { t, currentLocale, isReady } = useTranslations()
  const baseLocale = currentLocale || 'uk'

  const navigationItems = [
    { 
      href: `/${baseLocale}`, 
      label: isReady ? t('nav.home') : 'Головна' 
    },
    { 
      href: `/${baseLocale}/about`, 
      label: isReady ? t('nav.about') : 'Про нас' 
    },
    { 
      href: `/${baseLocale}/services`, 
      label: isReady ? t('nav.services') : 'Послуги' 
    },
    { 
      href: `/${baseLocale}/projects`, 
      label: isReady ? t('nav.projects') : 'Проекти' 
    },
    { 
      href: `/${baseLocale}/jobs`, 
      label: isReady ? t('nav.jobs') : 'Кар\'єра' 
    },
    { 
      href: `/${baseLocale}/contact`, 
      label: isReady ? t('nav.contact') : 'Контакти' 
    },
  ]

  return (
    <nav role="navigation" aria-label="Головна навігація">
      {navigationItems.map((item, index) => (
        <NavigationRow key={item.href}>
          <NavigationItem href={item.href} onClick={onItemClick}>
            {item.label}
          </NavigationItem>
          {index % 2 === 0 && navigationItems[index + 1] && (
            <NavigationItem 
              href={navigationItems[index + 1].href} 
              onClick={onItemClick}
            >
              {navigationItems[index + 1].label}
            </NavigationItem>
          )}
        </NavigationRow>
      ))}
    </nav>
  )
}

// ============================= ГОЛОВНИЙ LAYOUT =============================

function RootLayoutInner({ children }) {
  const [logoHovered, setLogoHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const pathname = usePathname()
  const panelId = useId()
  const navRef = useRef(null)
  
  const {
    expanded,
    openRef,
    closeRef,
    toggleNavigation,
    closeNavigation,
    isClient,
  } = useNavigationState()

  // Закриваємо навігацію при зміні маршруту
  useEffect(() => {
    if (expanded) {
      closeNavigation()
    }
  }, [pathname, expanded, closeNavigation])

  // Блокуємо прокрутку при відкритій навігації
  useEffect(() => {
    if (!isClient) return

    if (expanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [expanded, isClient])

  return (
    <RootLayoutContext.Provider value={{ logoHovered, setLogoHovered }}>
      <MotionConfig
        transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_CONFIG}
      >
        <header>
          {/* Основний header */}
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

          {/* Мобільна навігація */}
          <ClientOnly>
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
                        <ClientOnly>
                          <h2 className="font-display text-base font-semibold text-white">
                            Наша адреса
                          </h2>
                          <Offices
                            invert
                            className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2"
                          />
                        </ClientOnly>
                      </div>
                      <div className="sm:border-l sm:border-neutral-800 sm:pl-16">
                        <ClientOnly>
                          <h2 className="font-display text-base font-semibold text-white">
                            Слідкуйте за нами
                          </h2>
                          <SocialMedia className="mt-6" invert />
                        </ClientOnly>
                      </div>
                    </div>
                  </Container>
                </div>
              </motion.div>
            </motion.div>
          </ClientOnly>
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

            <ClientOnly>
              <Footer />
            </ClientOnly>
          </motion.div>
        </motion.div>
      </MotionConfig>
    </RootLayoutContext.Provider>
  )
}

// Головний експорт
export function RootLayout({ children }) {
  const pathname = usePathname()

  return (
    <RootLayoutInner key={pathname}>
      {children}
    </RootLayoutInner>
  )
}