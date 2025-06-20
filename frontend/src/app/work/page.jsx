import Image from 'next/image'
import Link from 'next/link'

import { Blockquote } from '@/components/Blockquote'
import { Border } from '@/components/Border'
import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageIntro } from '@/components/PageIntro'
import { Testimonial } from '@/components/Testimonial'
import logoBrightPath from '@/images/clients/bright-path/logo-dark.svg'
import logoFamilyFund from '@/images/clients/family-fund/logo-dark.svg'
import logoGreenLife from '@/images/clients/green-life/logo-dark.svg'
import logoHomeWork from '@/images/clients/home-work/logo-dark.svg'
import logoMailSmirk from '@/images/clients/mail-smirk/logo-dark.svg'
import logoNorthAdventures from '@/images/clients/north-adventures/logo-dark.svg'
import logoPhobia from '@/images/clients/phobia/logo-dark.svg'
import logoUnseal from '@/images/clients/unseal/logo-dark.svg'
import { formatDate } from '@/lib/formatDate'
import { loadCaseStudies } from '@/lib/mdx'

function CaseStudies({ caseStudies }) {
    return (
        <Container className="mt-40">
            <FadeIn>
                <h2 className="font-display text-2xl font-semibold text-neutral-950">
                    Наші колекції
                </h2>
            </FadeIn>
            <div className="mt-10 space-y-20 sm:space-y-24 lg:space-y-32">
                {caseStudies.map((caseStudy) => (
                    <FadeIn key={caseStudy.client}>
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
                                        <p className="text-sm tracking-tight text-neutral-950 after:ml-4 after:font-semibold after:text-neutral-300 after:content-['/'] lg:mt-2 lg:after:hidden">
                                            {caseStudy.service}
                                        </p>
                                        <p className="text-sm text-neutral-950 lg:mt-2">
                                            <time dateTime={caseStudy.date}>
                                                {formatDate(caseStudy.date)}
                                            </time>
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-full lg:col-span-2 lg:max-w-2xl">
                                    <p className="font-display text-4xl font-medium text-neutral-950">
                                        <Link href={caseStudy.href}>{caseStudy.title}</Link>
                                    </p>
                                    <div className="mt-6 space-y-6 text-base text-neutral-600">
                                        {caseStudy.summary.map((paragraph) => (
                                            <p key={paragraph}>{paragraph}</p>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex">
                                        <Button
                                            href={caseStudy.href}
                                            aria-label={`Детальніше: ${caseStudy.client}`}
                                        >
                                            Детальніше
                                        </Button>
                                    </div>
                                    {caseStudy.testimonial && (
                                        <Blockquote
                                            author={caseStudy.testimonial.author}
                                            className="mt-12"
                                        >
                                            {caseStudy.testimonial.content}
                                        </Blockquote>
                                    )}
                                </div>
                            </Border>
                        </article>
                    </FadeIn>
                ))}
            </div>
        </Container>
    )
}

const clients = [
    ['Мережа магазинів "Мода"', logoPhobia],
    ['Корпорація "Бізнес Стиль"', logoFamilyFund],
    ['Бренд "Українська Мрія"', logoUnseal],
    ['Спортивний клуб "Чемпіон"', logoMailSmirk],
    ['Готельна мережа "Комфорт"', logoHomeWork],
    ['Еко-бренд "Зелене життя"', logoGreenLife],
    ['Мережа ресторанів "Смачно"', logoBrightPath],
    ['Туристична агенція "Мандри"', logoNorthAdventures],
]

function Clients() {
    return (
        <Container className="mt-24 sm:mt-32 lg:mt-40">
            <FadeIn>
                <h2 className="font-display text-2xl font-semibold text-neutral-950">
                    Наші клієнти
                </h2>
            </FadeIn>
            <FadeInStagger className="mt-10" faster>
                <Border as={FadeIn} />
                <ul
                    role="list"
                    className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4"
                >
                    {clients.map(([client, logo]) => (
                        <li key={client} className="group">
                            <FadeIn className="overflow-hidden">
                                <Border className="pt-12 group-[&:nth-child(-n+2)]:-mt-px sm:group-[&:nth-child(3)]:-mt-px lg:group-[&:nth-child(4)]:-mt-px">
                                    <Image src={logo} alt={client} unoptimized />
                                </Border>
                            </FadeIn>
                        </li>
                    ))}
                </ul>
            </FadeInStagger>
        </Container>
    )
}

export const metadata = {
    title: 'Наші Вироби',
    description:
        'Ми пропонуємо широкий асортимент якісного одягу, виготовленого з найкращих матеріалів та з увагою до кожної деталі.',
}

export default async function Work() {
    let caseStudies = await loadCaseStudies()

    return (
        <>
            <PageIntro
                eyebrow="Наші вироби"
                title="Якісний одяг для будь-яких потреб."
            >
                <p>
                    Ми пишаємося тим, що пропонуємо широкий асортимент виробів, які відповідають найвищим стандартам якості. Від спеціалізованого до корпоративного вбрання - ми маємо рішення для будь-яких потреб.
                </p>
            </PageIntro>

            <CaseStudies caseStudies={caseStudies} />

            <Testimonial
                className="mt-24 sm:mt-32 lg:mt-40"
                client={{ name: 'Мережа магазинів "Стиль"', logo: logoMailSmirk }}
            >
                Ми обрали <em>UGC </em> через їхню репутацію якості. Вони перевершили наші очікування, створивши унікальну колекцію в рекордні терміни.
            </Testimonial>

            <Clients />

            <ContactSection />
        </>
    )
}
