'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Border } from '@/components/Border'
import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { PageIntro } from '@/components/PageIntro'
import { useTranslations } from '@/hooks/useTranslations'

// Тимчасові дані про вакансії
const jobListings = [
    {
        title: 'Швачка',
        department: 'Виробництво',
        type: 'Повний робочий день',
        location: 'Київ, Україна',
        description: 'Шукаємо досвідчену швачку для роботи з виробництва спецодягу. Досвід роботи від 2 років.',
        requirements: [
            'Досвід роботи швачкою від 2 років',
            'Знання різних типів швів та технік пошиття',
            'Уважність до деталей',
            'Відповідальність та пунктуальність'
        ],
        href: '/job/seamstress',
        date: '2024-01-15'
    },
    {
        title: 'Технолог виробництва',
        department: 'Технічний відділ', 
        type: 'Повний робочий день',
        location: 'Київ, Україна',
        description: 'Потрібен технолог для розробки та вдосконалення процесів виробництва спецодягу.',
        requirements: [
            'Вища освіта за напрямом технології виробництва',
            'Досвід роботи технологом від 3 років',
            'Знання стандартів якості та технічних вимог',
            'Навички роботи з технічною документацією'
        ],
        href: '/job/production-technologist',
        date: '2024-01-10'
    },
    {
        title: 'Менеджер з продажу',
        department: 'Відділ продажів',
        type: 'Повний робочий день', 
        location: 'Київ, Україна',
        description: 'Шукаємо активного менеджера для розвитку продажів спецодягу та роботи з клієнтами.',
        requirements: [
            'Досвід роботи в продажах від 2 років',
            'Комунікабельність та навички переговорів',
            'Знання англійської мови',
            'Орієнтованість на результат'
        ],
        href: '/job/sales-manager',
        date: '2024-01-05'
    }
]

function JobListing({ job }) {
    const { t, currentLocale } = useTranslations()
    
    return (
        <article>
            <Border className="pt-16">
                <div className="relative lg:-mx-4 lg:flex lg:justify-end">
                    <div className="pt-10 lg:w-2/3 lg:flex-none lg:px-4 lg:pt-0">
                        <h2 className="font-display text-2xl font-semibold text-neutral-950">
                            <Link href={`/${currentLocale}${job.href}`}>{job.title}</Link>
                        </h2>
                        <dl className="lg:absolute lg:left-0 lg:top-0 lg:w-1/3 lg:px-4">
                            <dt className="sr-only">{t('job.publicationDate') || 'Дата публікації'}</dt>
                            <dd className="absolute left-0 top-0 text-sm text-neutral-950 lg:static">
                                <time dateTime={job.date}>
                                    {new Date(job.date).toLocaleDateString(currentLocale === 'en' ? 'en-US' : 'uk-UA', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            </dd>
                            <dt className="sr-only">{t('job.department') || 'Відділ'}</dt>
                            <dd className="mt-6">
                                <div className="text-sm text-neutral-950">
                                    <div className="font-semibold">{job.department}</div>
                                    <div>{job.type} • {job.location}</div>
                                </div>
                            </dd>
                        </dl>
                        <p className="mt-6 max-w-2xl text-base text-neutral-600">
                            {job.description}
                        </p>
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-neutral-950 mb-2">
                                {t('job.requirements') || 'Вимоги:'}
                            </h4>
                            <ul className="text-sm text-neutral-600 space-y-1">
                                {job.requirements.map((req, index) => (
                                    <li key={index}>• {req}</li>
                                ))}
                            </ul>
                        </div>
                        <Button
                            href={`/${currentLocale}${job.href}`}
                            aria-label={`${t('job.learnMore') || 'Детальніше про вакансію'}: ${job.title}`}
                            className="mt-8"
                        >
                            {t('job.learnMore') || 'Детальніше'}
                        </Button>
                    </div>
                </div>
            </Border>
        </article>
    )
}

export default function Job() {
    const { t } = useTranslations()

    return (
        <>
            <PageIntro 
                eyebrow={t('job.eyebrow') || "Кар'єра"} 
                title={t('job.title') || 'Відкриті вакансії та можливості'}
            >
                <p>
                    {t('job.description') || "Приєднуйтесь до нашої команди професіоналів та розвивайте свою кар'єру в інноваційному середовищі."}
                </p>
            </PageIntro>

            <Container className="mt-24 sm:mt-32 lg:mt-40">
                <div className="space-y-24 lg:space-y-32">
                    {jobListings.map((job, index) => (
                        <FadeIn key={index}>
                            <JobListing job={job} />
                        </FadeIn>
                    ))}
                </div>
            </Container>

            <ContactSection />
        </>
    )
} 