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
import { useTranslations } from '@/hooks/useTranslations'

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

function Clients() {
  const { t } = useTranslations()
  
  return (
    <div className="mt-24 rounded-4xl bg-neutral-950 py-20 sm:mt-32 sm:py-32 lg:mt-56">
      <Container>
        <FadeIn className="flex items-center gap-x-8">
          <h2 className="text-center font-display text-sm font-semibold tracking-wider text-white sm:text-left">
            {t('clients.title') || 'Ми працюємо з провідними компаніями України та Європи'}
          </h2>
          <div className="h-px flex-auto bg-neutral-800" />
        </FadeIn>
        <FadeInStagger faster>
          <ul
            role="list"
            className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4"
          >
            {clients.map(([client, logo]) => (
              <li key={client}>
                <FadeIn>
                  <Image src={logo} alt={client} unoptimized />
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
  const { t } = useTranslations()
  
  // Кейс-стаді з перекладами
  const caseStudies = [
    {
      href: '/work/phobia',
      logo: logoPhobiaLight,
      client: 'Phobia',
      date: '2023',
      title: t('caseStudies.items.phobia.title') || 'Захисний одяг для промисловості',
      description: t('caseStudies.items.phobia.description') || 'Розробка та виготовлення спецодягу для захисту працівників у важких умовах.'
    },
    {
      href: '/work/family-fund',
      logo: logoFamilyFund,
      client: 'Family Fund',
      date: '2023',
      title: t('caseStudies.items.familyFund.title') || 'Медичний одяг',
      description: t('caseStudies.items.familyFund.description') || 'Комфортний та функціональний медичний одяг для персоналу лікарень.'
    },
    {
      href: '/work/unseal',
      logo: logoUnseal,
      client: 'Unseal',
      date: '2022',
      title: t('caseStudies.items.unseal.title') || 'Військова форма',
      description: t('caseStudies.items.unseal.description') || 'Надійна та практична форма для військових підрозділів.'
    }
  ]
  
  return (
    <>
      <SectionIntro
        title={t('caseStudies.title') || 'Надійність та якість у кожній деталі'}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('caseStudies.description') || 'Наш багаторічний досвід у виробництві спецодягу гарантує високу якість і надійність кожного виробу.'}
        </p>
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
                  <time
                    dateTime={caseStudy.date}
                    className="font-semibold"
                  >
                    {caseStudy.date}
                  </time>
                  <span className="text-neutral-300" aria-hidden="true">
                    /
                  </span>
                  <span>{t('caseStudies.successfulProject') || 'Успішний проєкт'}</span>
                </p>
                <p className="mt-6 font-display text-2xl font-semibold text-neutral-950">
                  {caseStudy.title}
                </p>
                <p className="mt-4 text-base text-neutral-600">
                  {caseStudy.description}
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
  const { t } = useTranslations()
  
  return (
    <>
      <SectionIntro
        eyebrow={t('services.eyebrow') || 'Послуги'}
        title={t('services.title') || 'Ми створюємо якісний спецодяг під ваші потреби.'}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('services.description') || 'Ми виготовляємо спецодяг для різних галузей, включаючи військову форму, медичний одяг, а також спецодяг для інших сфер.'}
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
            <ListItem title={t('services.technicalSpecs.title') || 'Розробка технічних умов (ТУ)'}>
              {t('services.technicalSpecs.description') || 'Ми спеціалізуємося на створенні технічних умов згідно з вашими вимогами.'}
            </ListItem>
            <ListItem title={t('services.tailoring.title') || 'Пошиття одягу'}>
              {t('services.tailoring.description') || 'За вашими специфікаціями ми виготовляємо продукцію з використанням ваших матеріалів або наших власних.'}
            </ListItem>
            <ListItem title={t('services.logoApplication.title') || 'Нанесення логотипу'}>
              {t('services.logoApplication.description') || 'Ми пропонуємо послуги нанесення логотипу або бренду на вироби.'}
            </ListItem>
            <ListItem title={t('services.other.title') || 'Інше'}>
              {t('services.other.description') || 'Крім того, ми пропонуємо широкий асортимент готових виробів, тканин та фурнітури.'}
            </ListItem>
          </List>
        </div>
      </Container>
    </>
  )
}

export default function Home({ params }) {
  const { t } = useTranslations()

  return (
    <>
      <Container className="mt-24 sm:mt-32 md:mt-56">
        <FadeIn className="max-w-3xl">
          <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-7xl">
            {t('hero.title') || 'Виробник спецодягу в Україні.'}
          </h1>
          <p className="mt-6 text-xl text-neutral-600">
            {t('hero.description') || 'Ми створюємо якісний та надійний спецодяг, який забезпечує комфорт і безпеку в будь-яких умовах.'}
          </p>
        </FadeIn>
      </Container>

      <Clients />

      <CaseStudies />

      <Testimonial
        className="mt-24 sm:mt-32 lg:mt-40"
        client={{ name: 'Phobia', logo: logoPhobiaDark }}
      >
        {t('testimonial.quote') || 'Команда UGC перевершила наші очікування, забезпечивши високу якість спецодягу та дотримання термінів. Відмінна комунікація і професійний підхід зробили співпрацю легкою та ефективною.'}
      </Testimonial>

      <Services />

      <ContactSection />
    </>
  )
} 