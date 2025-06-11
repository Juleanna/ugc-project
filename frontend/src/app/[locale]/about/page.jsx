'use client'

import Image from 'next/image'

import { Border } from '@/components/Border'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { GridList, GridListItem } from '@/components/GridList'
import { PageIntro } from '@/components/PageIntro'
import { PageLinks } from '@/components/PageLinks'
import { SectionIntro } from '@/components/SectionIntro'
import { StatList, StatListItem } from '@/components/StatList'
import { useTranslations } from '@/hooks/useTranslations'

export default function About() {
  const { t } = useTranslations()

  return (
    <>
      <PageIntro eyebrow={t('navigation.about') || 'Про нас'} title={t('about.title') || 'Наша сила — це співпраця'}>
        <p>
          {t('about.description') || 'Ми вірим, що наша сила полягає в нашому підході до співпраці, який ставить клієнтів у центр усього, що ми робимо.'}
        </p>
        <div className="mt-10 max-w-2xl space-y-6 text-base">
          <p>
            {t('about.story1') || 'UGC була заснована групою ентузіастів, які помітили потребу у високоякісному спецодязі для українських підприємств і установ.'}
          </p>
          <p>
            {t('about.story2') || 'У UGC ми більше ніж просто колеги — ми команда. Ми прагнемо створювати найкращий спецодяг і забезпечувати комфортні умови роботи для наших співробітників.'}
          </p>
        </div>
      </PageIntro>
      
      <Container className="mt-16">
        <StatList>
          <StatListItem value="50+" label={t('about.stats.employees') || 'Досвідчених співробітників'} />
          <StatListItem value="200+" label={t('about.stats.clients') || 'Задоволених клієнтів'} />
          <StatListItem value="₴10М+" label={t('about.stats.revenue') || 'Обіг за рік'} />
        </StatList>
      </Container>

      <SectionIntro
        eyebrow={t('about.culture.eyebrow') || 'Наші цінності'}
        title={t('about.culture.title') || 'Баланс з глибоким фокусом на якість'}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('about.culture.description') || 'Ми прагнемо створювати високоякісний спецодяг, дотримуючись найвищих стандартів виробництва та обслуговування клієнтів.'}
        </p>
      </SectionIntro>

      <Container className="mt-16">
        <GridList>
          <GridListItem title={t('about.values.quality') || 'Якість'}>
            {t('about.values.qualityDesc') || 'Кожен виріб проходить ретельну перевірку якості на всіх етапах виробництва.'}
          </GridListItem>
          <GridListItem title={t('about.values.innovation') || 'Інновації'}>
            {t('about.values.innovationDesc') || 'Ми постійно вдосконалюємо технології виробництва та впроваджуємо нові рішення.'}
          </GridListItem>
          <GridListItem title={t('about.values.reliability') || 'Надійність'}>
            {t('about.values.reliabilityDesc') || 'Наші клієнти можуть розраховувати на нас у будь-який час та за будь-яких обставин.'}
          </GridListItem>
          <GridListItem title={t('about.values.sustainability') || 'Відповідальність'}>
            {t('about.values.sustainabilityDesc') || 'Ми дбаємо про навколишнє середовище та соціальну відповідальність.'}
          </GridListItem>
          <GridListItem title={t('about.values.partnership') || 'Партнерство'}>
            {t('about.values.partnershipDesc') || 'Ми будуємо довгострокові партнерські відносини з нашими клієнтами.'}
          </GridListItem>
          <GridListItem title={t('about.values.excellence') || 'Досконалість'}>
            {t('about.values.excellenceDesc') || 'Ми прагнемо досконалості в кожній деталі нашої роботи.'}
          </GridListItem>
        </GridList>
      </Container>

      <ContactSection />
    </>
  )
} 