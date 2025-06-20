'use client'

import Link from 'next/link'

import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Logo } from '@/components/Logo'
import { socialMediaProfiles } from '@/components/SocialMedia'
import { useTranslations } from '@/hooks/useTranslations'

function Navigation() {
  const { t, currentLocale } = useTranslations()
  
  const navigation = [
    {
      title: t('navigation.work') || 'Наші вироби',
      links: [
        { title: 'КВВЗ', href: `/${currentLocale}/work/family-fund` },
        { title: 'КЛП', href: `/${currentLocale}/work/unseal` },
        { title: 'Футболка поло', href: `/${currentLocale}/work/phobia` },
        {
          title: (
            <>
              {t('caseStudies.readMore') || 'Дізнатись більше'} <span aria-hidden="true">&rarr;</span>
            </>
          ),
          href: `/${currentLocale}/work`,
        },
      ],
    },
    {
      title: t('footer.company') || 'Компанія',
      links: [
        { title: t('navigation.about') || 'Про компанію', href: `/${currentLocale}/about` },
        { title: t('navigation.process') || 'Процес виробництва', href: `/${currentLocale}/process` },
        { title: t('navigation.job') || 'Робота', href: `/${currentLocale}/job` },
        { title: t('header.contact') || 'Контакти', href: `/${currentLocale}/contact` },
      ],
    },
    {
      title: t('footer.socialMedia') || 'Соціальні мережі',
      links: socialMediaProfiles,
    },
  ]

  return (
    <nav>
      <ul role="list" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        {navigation.map((section, sectionIndex) => (
          <li key={sectionIndex}>
            <div className="font-display text-sm font-semibold tracking-wider text-neutral-950">
              {section.title}
            </div>
            <ul role="list" className="mt-4 text-sm text-neutral-700">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex} className="mt-4">
                  <Link
                    href={link.href}
                    className="transition hover:text-neutral-950"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 16 6" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 3 10 .5v2H0v1h10v2L16 3Z"
      />
    </svg>
  )
}

function NewsletterForm() {
  const { t } = useTranslations()
  
  return (
    <form className="max-w-sm">
      <h2 className="font-display text-sm font-semibold tracking-wider text-neutral-950">
        {t('footer.newsletter') || 'Залиште свою пошту'}
      </h2>
      <p className="mt-4 text-sm text-neutral-700">
        Subscribe to get the latest design news, articles, resources and
        inspiration.
      </p>
      <div className="relative mt-6">
        <input
          type="email"
          placeholder={t('footer.emailPlaceholder') || 'Email address'}
          autoComplete="email"
          aria-label="Email address"
          className="block w-full rounded-2xl border border-neutral-300 bg-transparent py-4 pl-6 pr-20 text-base/6 text-neutral-950 ring-4 ring-transparent transition placeholder:text-neutral-500 focus:border-neutral-950 focus:outline-none focus:ring-neutral-950/5"
        />
        <div className="absolute inset-y-1 right-1 flex justify-end">
          <button
            type="submit"
            aria-label="Submit"
            className="flex aspect-square h-full items-center justify-center rounded-xl bg-neutral-950 text-white transition hover:bg-neutral-800"
          >
            <ArrowIcon className="w-4" />
          </button>
        </div>
      </div>
    </form>
  )
}

export function Footer() {
  return (
    <Container as="footer" className="mt-24 w-full sm:mt-32 lg:mt-40">
      <FadeIn>
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
          <Navigation />
          {/*<div className="flex lg:justify-end">*/}
          {/*  <NewsletterForm />*/}
          {/*</div>*/}
        </div>
        <div className="mb-20 mt-24 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-t border-neutral-950/10 pt-12">
          <Link href="/" aria-label="Home">
            <Logo className="h-8" fillOnHover />
          </Link>
          <p className="text-sm text-neutral-700">
            © UGC LLC {new Date().getFullYear()}
          </p>
        </div>
      </FadeIn>
    </Container>
  )
}
