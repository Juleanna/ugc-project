'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Border } from '@/components/Border'
import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageIntro } from '@/components/PageIntro'
import logoBrightPath from '@/images/clients/bright-path/logo-dark.svg'
import logoFamilyFund from '@/images/clients/family-fund/logo-dark.svg'
import logoGreenLife from '@/images/clients/green-life/logo-dark.svg'
import logoHomeWork from '@/images/clients/home-work/logo-dark.svg'
import logoMailSmirk from '@/images/clients/mail-smirk/logo-dark.svg'
import logoNorthAdventures from '@/images/clients/north-adventures/logo-dark.svg'
import logoPhobia from '@/images/clients/phobia/logo-dark.svg'
import logoUnseal from '@/images/clients/unseal/logo-dark.svg'
import { useTranslations } from '@/hooks/useTranslations'

const caseStudies = [
  {
    client: 'FamilyFund',
    title: 'Військова форма нового покоління',
    description: 'Розробка сучасної військової форми з використанням інноваційних матеріалів.',
    summary: [
      'Підвищена міцність та комфорт',
      'Водовідштовхувальні властивості',
      'Ергономічний дизайн',
    ],
    logo: logoFamilyFund,
    image: { src: '/images/work/family-fund-1.jpg' },
    date: '2023-06',
    service: 'Розробка та виробництво',
    href: 'family-fund',
  },
  {
    client: 'Unseal',
    title: 'Медичний одяг преміум класу',
    description: 'Комфортний та функціональний медичний одяг для лікарень та клінік.',
    summary: [
      'Антибактеріальні властивості',
      'Дихаючі матеріали',
      'Стильний дизайн',
    ],
    logo: logoUnseal,
    image: { src: '/images/work/unseal-1.jpg' },
    date: '2023-04',
    service: 'Виробництво медичного одягу',
    href: 'unseal',
  },
  {
    client: 'Phobia',
    title: 'Захисний одяг для промисловості',
    description: 'Надійний захисний одяг для роботи в важких промислових умовах.',
    summary: [
      'Вогнестійкі матеріали',
      'Підвищена міцність',
      'Комфорт у носінні',
    ],
    logo: logoPhobia,
    image: { src: '/images/work/phobia-1.jpg' },
    date: '2023-02',
    service: 'Захисний одяг',
    href: 'phobia',
  },
]

function CaseStudy({ caseStudy }) {
  const { t, currentLocale } = useTranslations()
  
  return (
    <article>
      <Border className="grid grid-cols-3 gap-x-8 gap-y-8 pt-16">
        <div className="col-span-full sm:flex sm:items-center sm:justify-between sm:gap-x-8 lg:col-span-1 lg:block">
          <div className="sm:flex sm:items-center sm:gap-x-6 lg:block">
            <Image
              src={caseStudy.logo}
              alt=""
              className="h-16 w-16 flex-none"
              unoptimized
            />
            <h3 className="mt-6 text-sm font-semibold text-neutral-950 sm:mt-0 lg:mt-8">
              {caseStudy.client}
            </h3>
          </div>
          <div className="mt-1 flex gap-x-4 sm:mt-0 lg:block">
            <p className="text-sm tracking-wide text-neutral-950">
              {t('work.service') || 'Послуга'}
            </p>
            <p className="text-sm text-neutral-600 lg:mt-2">
              <time dateTime={caseStudy.date}>
                {new Date(caseStudy.date).toLocaleDateString('uk-UA', {
                  year: 'numeric',
                  month: 'long',
                })}
              </time>
            </p>
          </div>
        </div>
        <div className="col-span-full lg:col-span-2 lg:max-w-2xl">
          <p className="font-display text-4xl font-medium text-neutral-950">
            <Link href={`/${currentLocale}/work/${caseStudy.href}`}>{caseStudy.title}</Link>
          </p>
          <div className="mt-6 space-y-6 text-base text-neutral-600">
            <p>{caseStudy.description}</p>
          </div>
          <div className="mt-8 flex">
            <Button
              href={`/${currentLocale}/work/${caseStudy.href}`}
              aria-label={`${t('work.readCaseStudy') || 'Читати кейс'}: ${caseStudy.client}`}
            >
              {t('work.readCaseStudy') || 'Читати кейс'}
            </Button>
          </div>
          {caseStudy.summary && (
            <ul
              role="list"
              className="mt-8 flex flex-wrap gap-4 text-sm text-neutral-600"
            >
              {caseStudy.summary.map((item) => (
                <li key={item} className="rounded-full bg-neutral-100 px-4 py-1.5">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Border>
    </article>
  )
}

export default function Work() {
  const { t } = useTranslations()

  return (
    <>
      <PageIntro
        eyebrow={t('navigation.work') || 'Наша робота'}
        title={t('work.title') || 'Перевірена досконалість наших рішень'}
      >
        <p>
          {t('work.description') || 'Ми пишаємося роботою з провідними організаціями для створення інноваційного та функціонального спецодягу, який відповідає найвищим стандартам якості та безпеки.'}
        </p>
      </PageIntro>

      <Container className="mt-40">
        <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {caseStudies.map((caseStudy) => (
            <FadeIn key={caseStudy.href}>
              <CaseStudy caseStudy={caseStudy} />
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>

      <ContactSection />
    </>
  )
} 