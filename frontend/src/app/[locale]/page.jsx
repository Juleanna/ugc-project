// src/app/[locale]/page.jsx - ФІНАЛЬНА ВЕРСІЯ БЕЗ SSR ПРОБЛЕМ
'use client'

import Image from 'next/image'
import Link from 'next/link'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { List, ListItem } from '@/components/List'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { Testimonial } from '@/components/Testimonial'

// Імпорти для перекладів
import { useTranslations } from '@/hooks/useTranslations'
import { TranslatedText } from '@/contexts/TranslationContext'
import { NoSSR } from '@/components/NoSSR'

import logoBrightPath from '@/images/clients/bright-path/logo-light.svg'
import logoFamilyFund from '@/images/clients/family-fund/logo-light.svg'
import logoGreenLife from '@/images/clients/green-life/logo-light.svg'
import logoHomeWork from '@/images/clients/home-work/logo-light.svg'
import logoMailSmirk from '@/images/clients/mail-smirk/logo-light.svg'
import logoNorthAdventures from '@/images/clients/north-adventures/logo-light.svg'
import logoPhobiaDark from '@/images/clients/phobia/logo-dark.svg'
import logoPhobiaLight from '@/images/clients/phobia/logo-light.svg'
import logoUnseal from '@/images/clients/unseal/logo-light.svg'
import imageLaptop from '@/images/sewing.jpg'

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

// Статичні тексти як fallback
const STATIC_TEXTS = {
  hero: {
    title: 'Виробник спецодягу в Україні.',
    description: 'Ми створюємо якісний та надійний спецодяг, який забезпечує комфорт і безпеку в будь-яких умовах.'
  },
  clients: {
    title: 'Ми працюємо з провідними компаніями України та Європи'
  },
  caseStudies: {
    title: 'Надійність та якість у кожній деталі',
    description: 'Наш багаторічний досвід у виробництві спецодягу гарантує високу якість і надійність кожного виробу.',
    successfulProject: 'Успішний проєкт',
    phobia: {
      title: 'Захисний одяг для промисловості',
      description: 'Розробка та виготовлення спецодягу для захисту працівників у важких умовах.'
    },
    familyFund: {
      title: 'Медичний одяг',
      description: 'Комфортний та функціональний медичний одяг для персоналу лікарень.'
    },
    unseal: {
      title: 'Військова форма',
      description: 'Надійна та практична форма для військових підрозділів.'
    }
  },
  services: {
    eyebrow: 'Послуги',
    title: 'Ми створюємо якісний спецодяг під ваші потреби.',
    description: 'Ми виготовляємо спецодяг для різних галузей, включаючи військову форму, медичний одяг, а також спецодяг для інших сфер.',
    technicalSpecs: {
      title: 'Розробка технічних умов (ТУ)',
      description: 'Ми спеціалізуємося на створенні технічних умов згідно з вашими вимогами.'
    },
    tailoring: {
      title: 'Пошиття одягу',
      description: 'За вашими специфікаціями ми виготовляємо продукцію з використанням ваших матеріалів або наших власних.'
    },
    logoApplication: {
      title: 'Нанесення логотипу',
      description: 'Ми пропонуємо послуги нанесення логотипу або бренду на вироби.'
    },
    other: {
      title: 'Інше',
      description: 'Крім того, ми пропонуємо широкий асортимент готових виробів, тканин та фурнітури.'
    }
  },
  testimonial: {
    quote: 'Команда UGC перевершила наші очікування, забезпечивши високу якість спецодягу та дотримання термінів. Відмінна комунікація і професійний підхід зробили співпрацю легкою та ефективною.'
  }
}

function Clients() {
  return (
    <div className="mt-24 rounded-4xl bg-neutral-950 py-20 sm:mt-32 sm:py-32 lg:mt-56">
      <Container>
        <FadeIn className="flex items-center gap-x-8">
          <h2 className="text-center font-display text-sm font-semibold tracking-wider text-white sm:text-left">
            <NoSSR fallback={STATIC_TEXTS.clients.title}>
              <TranslatedText 
                tKey="homepage.clients.title"
                fallback={STATIC_TEXTS.clients.title}
              />
            </NoSSR>
          </h2>
          <div className="h-px flex-auto bg-neutral-800" />
        </FadeIn>
        <FadeInStagger faster>
          <ul role="list" className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
            {clients.map(([client, logo]) => (
              <li key={client}>
                <FadeIn>
                  <Image 
                    src={logo} 
                    alt={client} 
                    unoptimized 
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

function CaseStudies() {
  const caseStudies = [
    {
      href: '/work/phobia',
      logo: logoPhobiaLight,
      client: 'Phobia',
      date: '2023',
      title: STATIC_TEXTS.caseStudies.phobia.title,
      description: STATIC_TEXTS.caseStudies.phobia.description,
      titleKey: 'homepage.caseStudies.phobia.title',
      descriptionKey: 'homepage.caseStudies.phobia.description'
    },
    {
      href: '/work/family-fund',
      logo: logoFamilyFund,
      client: 'Family Fund',
      date: '2023',
      title: STATIC_TEXTS.caseStudies.familyFund.title,
      description: STATIC_TEXTS.caseStudies.familyFund.description,
      titleKey: 'homepage.caseStudies.family_fund.title',
      descriptionKey: 'homepage.caseStudies.family_fund.description'
    },
    {
      href: '/work/unseal',
      logo: logoUnseal,
      client: 'Unseal',
      date: '2022',
      title: STATIC_TEXTS.caseStudies.unseal.title,
      description: STATIC_TEXTS.caseStudies.unseal.description,
      titleKey: 'homepage.caseStudies.unseal.title',
      descriptionKey: 'homepage.caseStudies.unseal.description'
    }
  ]

  return (
    <>
      <SectionIntro
        title={
          <NoSSR fallback={STATIC_TEXTS.caseStudies.title}>
            <TranslatedText 
              tKey="homepage.caseStudies.title"
              fallback={STATIC_TEXTS.caseStudies.title}
            />
          </NoSSR>
        }
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <NoSSR fallback={STATIC_TEXTS.caseStudies.description}>
          <TranslatedText 
            tKey="homepage.caseStudies.description"
            fallback={STATIC_TEXTS.caseStudies.description}
          />
        </NoSSR>
      </SectionIntro>
      <Container className="mt-16">
        <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {caseStudies.map((caseStudy) => (
            <FadeIn key={caseStudy.href} className="flex">
              <article className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
                <h3>
                  <Link href={caseStudy.href}>
                    <span className="absolute inset-0 rounded-3xl" />
                    <Image
                      src={caseStudy.logo}
                      alt={caseStudy.client}
                      className="h-16 w-16"
                      unoptimized
                    />
                  </Link>
                </h3>
                <p className="mt-6 flex gap-x-2 text-sm text-neutral-950">
                  <time dateTime={caseStudy.date} className="font-semibold">
                    {caseStudy.date}
                  </time>
                  <span className="text-neutral-300" aria-hidden="true">
                    /
                  </span>
                  <span>
                    <NoSSR fallback={STATIC_TEXTS.caseStudies.successfulProject}>
                      <TranslatedText 
                        tKey="homepage.caseStudies.successful_project"
                        fallback={STATIC_TEXTS.caseStudies.successfulProject}
                      />
                    </NoSSR>
                  </span>
                </p>
                <p className="mt-6 font-display text-2xl font-semibold text-neutral-950">
                  <NoSSR fallback={caseStudy.title}>
                    <TranslatedText 
                      tKey={caseStudy.titleKey}
                      fallback={caseStudy.title}
                    />
                  </NoSSR>
                </p>
                <p className="mt-4 text-base text-neutral-600">
                  <NoSSR fallback={caseStudy.description}>
                    <TranslatedText 
                      tKey={caseStudy.descriptionKey}
                      fallback={caseStudy.description}
                    />
                  </NoSSR>
                </p>
              </article>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </>
  )
}

function Services() {
  return (
    <>
      <SectionIntro
        eyebrow={
          <NoSSR fallback={STATIC_TEXTS.services.eyebrow}>
            <TranslatedText 
              tKey="homepage.services.eyebrow"
              fallback={STATIC_TEXTS.services.eyebrow}
            />
          </NoSSR>
        }
        title={
          <NoSSR fallback={STATIC_TEXTS.services.title}>
            <TranslatedText 
              tKey="homepage.services.title"
              fallback={STATIC_TEXTS.services.title}
            />
          </NoSSR>
        }
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <NoSSR fallback={STATIC_TEXTS.services.description}>
          <TranslatedText 
            tKey="homepage.services.description"
            fallback={STATIC_TEXTS.services.description}
          />
        </NoSSR>
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
            <ListItem title={
              <NoSSR fallback={STATIC_TEXTS.services.technicalSpecs.title}>
                <TranslatedText 
                  tKey="homepage.services.technical_specs.title"
                  fallback={STATIC_TEXTS.services.technicalSpecs.title}
                />
              </NoSSR>
            }>
              <NoSSR fallback={STATIC_TEXTS.services.technicalSpecs.description}>
                <TranslatedText 
                  tKey="homepage.services.technical_specs.description"
                  fallback={STATIC_TEXTS.services.technicalSpecs.description}
                />
              </NoSSR>
            </ListItem>
            <ListItem title={
              <NoSSR fallback={STATIC_TEXTS.services.tailoring.title}>
                <TranslatedText 
                  tKey="homepage.services.tailoring.title"
                  fallback={STATIC_TEXTS.services.tailoring.title}
                />
              </NoSSR>
            }>
              <NoSSR fallback={STATIC_TEXTS.services.tailoring.description}>
                <TranslatedText 
                  tKey="homepage.services.tailoring.description"
                  fallback={STATIC_TEXTS.services.tailoring.description}
                />
              </NoSSR>
            </ListItem>
            <ListItem title={
              <NoSSR fallback={STATIC_TEXTS.services.logoApplication.title}>
                <TranslatedText 
                  tKey="homepage.services.logo_application.title"
                  fallback={STATIC_TEXTS.services.logoApplication.title}
                />
              </NoSSR>
            }>
              <NoSSR fallback={STATIC_TEXTS.services.logoApplication.description}>
                <TranslatedText 
                  tKey="homepage.services.logo_application.description"
                  fallback={STATIC_TEXTS.services.logoApplication.description}
                />
              </NoSSR>
            </ListItem>
            <ListItem title={
              <NoSSR fallback={STATIC_TEXTS.services.other.title}>
                <TranslatedText 
                  tKey="homepage.services.other.title"
                  fallback={STATIC_TEXTS.services.other.title}
                />
              </NoSSR>
            }>
              <NoSSR fallback={STATIC_TEXTS.services.other.description}>
                <TranslatedText 
                  tKey="homepage.services.other.description"
                  fallback={STATIC_TEXTS.services.other.description}
                />
              </NoSSR>
            </ListItem>
          </List>
        </div>
      </Container>
    </>
  )
}

export default function Home({ params }) {
  return (
    <>
      <Container className="mt-24 sm:mt-32 md:mt-56">
        <FadeIn className="max-w-3xl">
          <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-7xl">
            <NoSSR fallback={STATIC_TEXTS.hero.title}>
              <TranslatedText 
                tKey="homepage.hero.title"
                fallback={STATIC_TEXTS.hero.title}
              />
            </NoSSR>
          </h1>
          <p className="mt-6 text-xl text-neutral-600">
            <NoSSR fallback={STATIC_TEXTS.hero.description}>
              <TranslatedText 
                tKey="homepage.hero.description"
                fallback={STATIC_TEXTS.hero.description}
              />
            </NoSSR>
          </p>
        </FadeIn>
      </Container>

      <Clients />
      <CaseStudies />
      
      <Testimonial
        className="mt-24 sm:mt-32 lg:mt-40"
        client={{ name: 'Phobia', logo: logoPhobiaDark }}
      >
        <NoSSR fallback={STATIC_TEXTS.testimonial.quote}>
          <TranslatedText 
            tKey="homepage.testimonial.quote"
            fallback={STATIC_TEXTS.testimonial.quote}
          />
        </NoSSR>
      </Testimonial>

      <Services />
      <ContactSection />
    </>
  )
}
