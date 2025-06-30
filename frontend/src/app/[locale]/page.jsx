// frontend/src/app/[locale]/page.jsx - ФІНАЛЬНА ВЕРСІЯ З NAMESPACE
'use client'

import Image from 'next/image'
import Link from 'next/link'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { List, ListItem } from '@/components/List'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { Button } from '@/components/Button'
import { GridPattern } from '@/components/GridPattern'
import { usePageTranslations } from '@/hooks/useTranslations'

// Імпорт зображень
import logoBrightPath from '@/images/clients/bright-path/logo-light.svg'
import logoFamilyFund from '@/images/clients/family-fund/logo-light.svg'
import logoGreenLife from '@/images/clients/green-life/logo-light.svg'
import logoHomeWork from '@/images/clients/home-work/logo-light.svg'
import logoMailSmirk from '@/images/clients/mail-smirk/logo-light.svg'
import logoNorthAdventures from '@/images/clients/north-adventures/logo-light.svg'
import logoPhobiaDark from '@/images/clients/phobia/logo-dark.svg'
import logoPhobiaLight from '@/images/clients/phobia/logo-light.svg'
import logoUnseal from '@/images/clients/unseal/logo-light.svg'
import imageLaptop from '@/images/laptop.jpg'
import imageMeeting from '@/images/meeting.jpg'
import imageWhiteboard from '@/images/whiteboard.jpg'

// ============================= HERO СЕКЦІЯ =============================

function HeroSection() {
  const { t, locale } = usePageTranslations('homepage')

  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <FadeIn className="max-w-3xl">
        <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-7xl">
          {t('hero.title', 'Виробник спецодягу в Україні.')}
        </h1>
        <p className="mt-6 text-xl text-neutral-600">
          {t('hero.description', 'Ми створюємо якісний та надійний спецодяг, який забезпечує комфорт і безпеку в будь-яких умовах.')}
        </p>
        <div className="mt-10 flex gap-x-6">
          <Button href={`/${locale}/services`}>
            {t('hero.cta', 'Дізнатися більше')}
          </Button>
          <Button variant="outline" href={`/${locale}/contact`}>
            {t('hero.ctaSecondary', 'Каталог продукції')}
          </Button>
        </div>
      </FadeIn>
    </Container>
  )
}

// ============================= КЛІЄНТИ СЕКЦІЯ =============================

function Clients() {
  const { t } = usePageTranslations('homepage')

const clients = [
  ['Phobia', logoPhobiaLight],
  ['Family Fund', logoFamilyFund],
  ['Unseal', logoUnseal],
  ['Mail Smirk', logoMailSmirk],
  ['Home Work', logoHomeWork],
  ['Green Life', logoGreenLife],
  ['Bright Path', logoBrightPath],
  ['North Adventures', logoNorthAdventures],
]

  return (
    <div className="mt-24 rounded-4xl bg-neutral-950 py-20 sm:mt-32 sm:py-32 lg:mt-56">
      <Container>
        <FadeIn className="flex items-center gap-x-8">
          <h2 className="text-center font-display text-sm font-semibold tracking-wider text-white sm:text-left">
            {t('clients.title', 'Нам довіряють')}
          </h2>
          <div className="h-px flex-auto bg-neutral-800" />
        </FadeIn>
        <FadeInStagger faster>
          <ul
            role="list"
            className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4"
          >
            {clients.map(([client, logo], index) => (
              <li key={index}>
                <FadeIn>
                  <Image src={logo} alt={client} unoptimized 
                  sizes="(max-width: 640px) 100vw,
                       (max-width: 768px) 50vw,
                       (max-width: 1024px) 33vw,
                       25vw"
                  />
                </FadeIn>
              </li>
            ))}
          </ul>
        </FadeInStagger>
      </Container>
    </div>
  )
}

// ============================= КЕЙС-СТУДІЇ =============================

function CaseStudies() {
  const { t, locale } = usePageTranslations('homepage')

  const caseStudies = [
    {
      client: 'FamilyFund',
      title: t('caseStudies.familyFund.title', 'Медичний одяг нового покоління'),
      description: t('caseStudies.familyFund.description', 'Розробили інноваційний медичний одяг з антибактеріальними властивостями'),
      image: imageLaptop,
      date: '2023-12',
      service: t('caseStudies.familyFund.service', 'Медичний одяг'),
      href: 'family-fund',
    },
    {
      client: 'Unseal',
      title: t('caseStudies.unseal.title', 'Захисний одяг для важкої промисловості'),
      description: t('caseStudies.unseal.description', 'Створили захисний одяг для роботи в екстремальних умовах'),
      image: imageMeeting,
      date: '2023-10',
      service: t('caseStudies.unseal.service', 'Захисний одяг'),
      href: 'unseal',
    },
    {
      client: 'Phobia',
      title: t('caseStudies.phobia.title', 'Корпоративний одяг для HoReCa'),
      description: t('caseStudies.phobia.description', 'Розробили стильний та функціональний одяг для ресторанної індустрії'),
      image: imageWhiteboard,
      date: '2023-08',
      service: t('caseStudies.phobia.service', 'Корпоративний одяг'),
      href: 'phobia',
    },
  ]

  return (
    <>
      <SectionIntro
        title={t('caseStudies.title', 'Наші проекти')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('caseStudies.description', 'Ми пишаємося нашими проектами та результатами, які досягаємо разом з клієнтами.')}
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {caseStudies.map((caseStudy, index) => (
            <FadeIn key={index} className="flex">
              <article className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
                <div>
                  <div className="relative h-80 w-full overflow-hidden rounded-xl">
                    <Image
                      src={caseStudy.image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-6 text-base font-semibold text-neutral-950">
                    {caseStudy.client}
                  </h3>
                  <time
                    dateTime={caseStudy.date}
                    className="mt-1 text-sm text-neutral-600"
                  >
                    {new Date(caseStudy.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'uk-UA', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </time>
                  <p className="mt-6 font-display text-2xl font-semibold text-neutral-950">
                    {caseStudy.title}
                  </p>
                  <p className="mt-4 text-base text-neutral-600">
                    {caseStudy.description}
                  </p>
                </div>
                <div className="mt-8 flex">
                  <Button
                    href={`/${locale}/work/${caseStudy.href}`}
                    variant="outline"
                    className="w-full"
                  >
                    {t('caseStudies.readMore', 'Детальніше')}
                  </Button>
                </div>
              </article>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </>
  )
}

// ============================= ПОСЛУГИ =============================

function Services() {
  const { t, locale } = usePageTranslations('homepage')

  const services = [
    {
      title: t('services.medical.title', 'Медичний одяг'),
      description: t('services.medical.description', 'Сучасний медичний одяг з антибактеріальними властивостями'),
      href: 'medical',
    },
    {
      title: t('services.protective.title', 'Захисний одяг'),
      description: t('services.protective.description', 'Надійний захист для роботи в важких умовах'),
      href: 'protective',
    },
    {
      title: t('services.corporate.title', 'Корпоративний одяг'),
      description: t('services.corporate.description', 'Стильний та професійний одяг для вашого бізнесу'),
      href: 'corporate',
    },
    {
      title: t('services.horeca.title', 'Одяг для HoReCa'),
      description: t('services.horeca.description', 'Функціональний одяг для ресторанної індустрії'),
      href: 'horeca',
    },
  ]

  return (
    <>
      <SectionIntro
        eyebrow={t('services.eyebrow', 'Наші послуги')}
        title={t('services.title', 'Ми допомагаємо вам виглядати професійно')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('services.description', 'Наші послуги охоплюють повний цикл виробництва спецодягу - від розробки дизайну до пошиття та доставки.')}
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <div className="lg:flex lg:items-center lg:justify-end">
          <div className="flex justify-center lg:w-1/2 lg:justify-end lg:pr-12">
            <FadeIn className="w-[33.75rem] flex-none lg:w-[45rem]">
              <StylizedImage
                src={imageLaptop}
                sizes="(min-width: 1024px) 41rem, 31rem"
                className="justify-center lg:justify-end"
              />
            </FadeIn>
          </div>
          <List className="mt-16 lg:mt-0 lg:w-1/2 lg:min-w-[33rem] lg:pl-4">
            {services.map((service, index) => (
              <ListItem key={index} title={service.title}>
                {service.description}
              </ListItem>
            ))}
          </List>
        </div>
      </Container>
    </>
  )
}

// ============================= ПРОЦЕС РОБОТИ =============================

function Process() {
  const { t, locale } = usePageTranslations('homepage')

  const processSteps = [
    {
      title: t('process.consultation.title', 'Консультація'),
      description: t('process.consultation.description', 'Ми обговорюємо ваші потреби та вимоги до спецодягу'),
    },
    {
      title: t('process.design.title', 'Дизайн'),
      description: t('process.design.description', 'Розробляємо дизайн та підбираємо матеріали'),
    },
    {
      title: t('process.prototype.title', 'Прототип'),
      description: t('process.prototype.description', 'Створюємо зразки для тестування та затвердження'),
    },
    {
      title: t('process.production.title', 'Виробництво'),
      description: t('process.production.description', 'Запускаємо серійне виробництво з контролем якості'),
    },
  ]

  return (
    <>
      <SectionIntro
        eyebrow={t('process.eyebrow', 'Наш процес')}
        title={t('process.title', 'Як ми працюємо')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('process.description', 'Наш чітко структурований процес гарантує високу якість кінцевого продукту та повне задоволення клієнта.')}
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {processSteps.map((step, index) => (
            <FadeIn key={index}>
              <div className="rounded-3xl border border-neutral-200 p-8">
                <h3 className="font-display text-base font-semibold text-neutral-950">
                  {String(index + 1).padStart(2, '0')} {step.title}
                </h3>
                <p className="mt-4 text-sm text-neutral-600">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button href={`/${locale}/process`}>
            {t('process.learnMore', 'Детальніше про процес')}
          </Button>
        </div>
      </Container>
    </>
  )
}

// ============================= СТАТИСТИКА =============================

function Stats() {
  const { t } = usePageTranslations('homepage')

  const stats = [
    {
      value: '15+',
      label: t('stats.experience', 'Років досвіду'),
    },
    {
      value: '500+',
      label: t('stats.clients', 'Задоволених клієнтів'),
    },
    {
      value: '10K+',
      label: t('stats.products', 'Виготовлених виробів'),
    },
    {
      value: '99%',
      label: t('stats.satisfaction', 'Задоволеність якістю'),
    },
  ]

  return (
    <div className="relative -mt-16 pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[884px] overflow-hidden rounded-t-4xl bg-gradient-to-b from-neutral-50">
        <GridPattern
          className="absolute inset-0 h-full w-full fill-neutral-100 stroke-neutral-950/5 [mask-image:linear-gradient(to_bottom_left,white_40%,transparent_50%)]"
          yOffset={-270}
        />
      </div>
      <Container className="pt-24 sm:pt-32 lg:pt-40">
        <FadeIn>
          <h2 className="font-display text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
            {t('stats.title', 'Цифри, які говорять за нас')}
          </h2>
        </FadeIn>
        <FadeInStagger className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <FadeIn key={index}>
              <div className="text-center">
                <div className="font-display text-4xl font-semibold text-neutral-950 sm:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-neutral-600">
                  {stat.label}
                </div>
              </div>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </div>
  )
}

// ============================= ГОЛОВНИЙ КОМПОНЕНТ =============================

export default function Home() {
  return (
    <>
      <HeroSection />
      <Clients />
      <CaseStudies />
      <Services />
      <Process />
      <Stats />
      <ContactSection />
    </>
  )
}