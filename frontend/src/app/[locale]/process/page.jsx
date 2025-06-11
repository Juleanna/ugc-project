'use client'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { GridList, GridListItem } from '@/components/GridList'
import { PageIntro } from '@/components/PageIntro'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { TagList, TagListItem } from '@/components/TagList'
import imageLaptop from '@/images/sewing.jpg'
import { useTranslations } from '@/hooks/useTranslations'

function Section({ title, image, children }) {
  return (
    <Container className="group/section [counter-increment:section]">
      <div className="lg:flex lg:items-center lg:justify-end lg:gap-x-8 lg:group-even/section:justify-start xl:gap-x-20">
        <div className="flex justify-center lg:w-1/2 lg:justify-end lg:group-even/section:justify-start">
          <FadeIn className="w-[33.75rem] flex-none lg:w-[45rem]">
            <StylizedImage
              {...image}
              sizes="(min-width: 1024px) 41rem, 31rem"
              className="justify-center lg:justify-end lg:group-even/section:justify-start"
            />
          </FadeIn>
        </div>
        <div className="mt-12 lg:mt-0 lg:w-1/2 lg:flex-none lg:group-even/section:order-first">
          <FadeIn>
            <div
              className="font-display text-base font-semibold before:text-neutral-300 before:content-['/_' counter(section,decimal-leading-zero) '_/_'] after:text-neutral-950 after:content-[counter(section,decimal-leading-zero)]"
              aria-hidden="true"
            />
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
              {title}
            </h2>
            <div className="mt-6">{children}</div>
          </FadeIn>
        </div>
      </div>
    </Container>
  )
}

function Discover() {
  const { t } = useTranslations()
  
  return (
    <Section title={t('process.discover.title') || 'Дослідження'} image={{ src: imageLaptop }}>
      <div className="space-y-6 text-base text-neutral-600">
        <p>
          {t('process.discover.description1') || 'Ми починаємо з детального вивчення ваших потреб та вимог. Наша команда проводить ретельний аналіз специфіки вашої діяльності, умов праці та особливих потреб.'}
        </p>
        <p>
          {t('process.discover.description2') || 'На цьому етапі ми визначаємо технічні характеристики, матеріали, дизайн та функціональні особливості майбутнього спецодягу.'}
        </p>
      </div>

      <h3 className="mt-12 font-display text-base font-semibold text-neutral-950">
        {t('process.discover.included') || 'Що включено'}
      </h3>
      <TagList className="mt-4">
        <TagListItem>{t('process.discover.analysis') || 'Аналіз потреб'}</TagListItem>
        <TagListItem>{t('process.discover.consultation') || 'Консультація експертів'}</TagListItem>
        <TagListItem>{t('process.discover.materials') || 'Підбір матеріалів'}</TagListItem>
        <TagListItem>{t('process.discover.requirements') || 'Технічні вимоги'}</TagListItem>
        <TagListItem>{t('process.discover.design') || 'Концепція дизайну'}</TagListItem>
        <TagListItem>{t('process.discover.timeline') || 'Планування термінів'}</TagListItem>
      </TagList>
    </Section>
  )
}

function Build() {
  const { t } = useTranslations()
  
  return (
    <Section title={t('process.build.title') || 'Розробка'} image={{ src: imageLaptop, shape: 1 }}>
      <div className="space-y-6 text-base text-neutral-600">
        <p>
          {t('process.build.description1') || 'На основі зібраних даних ми розробляємо технічну документацію, створюємо лекала та виготовляємо перші зразки для тестування.'}
        </p>
        <p>
          {t('process.build.description2') || 'Кожен зразок проходить суворий контроль якості та тестування в реальних умовах використання.'}
        </p>
        <p>
          {t('process.build.description3') || 'Ми залучаємо вас до процесу розробки, забезпечуючи постійний зворотний зв\'язок та можливість внесення корекцій.'}
        </p>
      </div>

      <h3 className="mt-12 font-display text-base font-semibold text-neutral-950">
        {t('process.build.included') || 'Що включено'}
      </h3>
      <TagList className="mt-4">
        <TagListItem>{t('process.build.documentation') || 'Технічна документація'}</TagListItem>
        <TagListItem>{t('process.build.patterns') || 'Розробка лекал'}</TagListItem>
        <TagListItem>{t('process.build.prototypes') || 'Виготовлення зразків'}</TagListItem>
        <TagListItem>{t('process.build.testing') || 'Тестування якості'}</TagListItem>
        <TagListItem>{t('process.build.feedback') || 'Збір відгуків'}</TagListItem>
        <TagListItem>{t('process.build.improvements') || 'Вдосконалення'}</TagListItem>
      </TagList>
    </Section>
  )
}

function Deliver() {
  const { t } = useTranslations()
  
  return (
    <Section title={t('process.deliver.title') || 'Виробництво'} image={{ src: imageLaptop, shape: 2 }}>
      <div className="space-y-6 text-base text-neutral-600">
        <p>
          {t('process.deliver.description1') || 'Після затвердження зразків ми переходимо до серійного виробництва. Наше сучасне обладнання та досвідчені спеціалісти гарантують високу якість кожного виробу.'}
        </p>
        <p>
          {t('process.deliver.description2') || 'Ми контролюємо кожен етап виробництва, від розкрою матеріалів до фінального контролю якості готової продукції.'}
        </p>
        <p>
          {t('process.deliver.description3') || 'Готова продукція упаковується згідно з вашими вимогами та доставляється у встановлені терміни.'}
        </p>
      </div>

      <h3 className="mt-12 font-display text-base font-semibold text-neutral-950">
        {t('process.deliver.included') || 'Що включено'}
      </h3>
      <TagList className="mt-4">
        <TagListItem>{t('process.deliver.production') || 'Серійне виробництво'}</TagListItem>
        <TagListItem>{t('process.deliver.quality') || 'Контроль якості'}</TagListItem>
        <TagListItem>{t('process.deliver.packaging') || 'Упаковка'}</TagListItem>
        <TagListItem>{t('process.deliver.delivery') || 'Доставка'}</TagListItem>
        <TagListItem>{t('process.deliver.support') || 'Підтримка після продажу'}</TagListItem>
        <TagListItem>{t('process.deliver.warranty') || 'Гарантійне обслуговування'}</TagListItem>
      </TagList>
    </Section>
  )
}

function Values() {
  const { t } = useTranslations()
  
  return (
    <div className="relative mt-24 pt-24 sm:mt-32 sm:pt-32 lg:mt-40 lg:pt-40">
      <div className="absolute inset-x-0 top-0 -z-10 h-[884px] overflow-hidden rounded-t-4xl bg-gradient-to-b from-neutral-50">
        <div className="absolute inset-0 bg-grid-neutral-900/5 [mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)]" />
      </div>

      <SectionIntro
        eyebrow={t('process.values.eyebrow') || 'Наші принципи'}
        title={t('process.values.title') || 'Якість на кожному етапі'}
      >
        <p>
          {t('process.values.description') || 'Ми дотримуємося найвищих стандартів якості та професіоналізму в кожному процесі виробництва спецодягу.'}
        </p>
      </SectionIntro>

      <Container className="mt-24">
        <GridList>
          <GridListItem title={t('process.values.quality') || 'Якість'}>
            {t('process.values.qualityDesc') || 'Кожен виріб проходить суворий контроль якості на всіх етапах виробництва.'}
          </GridListItem>
          <GridListItem title={t('process.values.innovation') || 'Інновації'}>
            {t('process.values.innovationDesc') || 'Використовуємо сучасні технології та матеріали для створення найкращих рішень.'}
          </GridListItem>
          <GridListItem title={t('process.values.efficiency') || 'Ефективність'}>
            {t('process.values.efficiencyDesc') || 'Оптимізовані процеси дозволяють нам дотримуватися термінів та бюджету.'}
          </GridListItem>
          <GridListItem title={t('process.values.reliability') || 'Надійність'}>
            {t('process.values.reliabilityDesc') || 'Ми гарантуємо стабільну якість та своєчасне виконання замовлень.'}
          </GridListItem>
          <GridListItem title={t('process.values.sustainability') || 'Екологічність'}>
            {t('process.values.sustainabilityDesc') || 'Дбаємо про навколишнє середовище, використовуючи екологічні матеріали.'}
          </GridListItem>
          <GridListItem title={t('process.values.support') || 'Підтримка'}>
            {t('process.values.supportDesc') || 'Надаємо повну підтримку клієнтам на всіх етапах співпраці.'}
          </GridListItem>
        </GridList>
      </Container>
    </div>
  )
}

export default function Process() {
  const { t } = useTranslations()
  
  return (
    <>
      <PageIntro eyebrow={t('navigation.process') || 'Процес'} title={t('process.title') || 'Наш процес виробництва'}>
        <p>
          {t('process.description') || 'Ми маємо чітко структурований процес виробництва, який гарантує високу якість кінцевого продукту та задоволення всіх вимог клієнта.'}
        </p>
      </PageIntro>

      <div className="mt-24 space-y-24 [counter-reset:section] sm:mt-32 sm:space-y-32 lg:mt-40 lg:space-y-40">
        <Discover />
        <Build />
        <Deliver />
      </div>

      <Values />

      <ContactSection />
    </>
  )
} 