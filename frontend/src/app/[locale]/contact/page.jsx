'use client'

import { useId } from 'react'
import Link from 'next/link'

import { Border } from '@/components/Border'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Offices } from '@/components/Offices'
import { PageIntro } from '@/components/PageIntro'
import { SocialMedia } from '@/components/SocialMedia'
import { useTranslations } from '@/hooks/useTranslations'

function TextInput({ label, ...props }) {
  let id = useId()

  return (
    <div className="group relative z-0 transition-all focus-within:z-10">
      <input
        type="text"
        id={id}
        {...props}
        placeholder=" "
        className="peer block w-full border border-neutral-300 bg-transparent px-6 pb-4 pt-12 text-base/6 text-neutral-950 ring-4 ring-transparent transition focus:border-neutral-950 focus:outline-none focus:ring-neutral-950/5 group-first:rounded-t-2xl group-last:rounded-b-2xl"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-6 top-1/2 -mt-3 origin-left text-base/6 text-neutral-500 transition-all duration-200 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-neutral-950 peer-[:not(:placeholder-shown)]:-translate-y-4 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-neutral-950"
      >
        {label}
      </label>
    </div>
  )
}

function ContactForm() {
  const { t } = useTranslations()
  
  return (
    <FadeIn className="lg:order-last">
      <form>
        <h2 className="font-display text-base font-semibold text-neutral-950">
          {t('contact.form.title') || 'Форма зворотнього звʼязку'}
        </h2>
        <div className="isolate mt-6 -space-y-px rounded-2xl bg-white/50">
          <TextInput label={t('contact.form.name') || 'Імʼя'} name="name" autoComplete="name" />
          <TextInput
            label={t('contact.form.email') || 'Пошта'}
            type="email"
            name="email"
            autoComplete="email"
          />
          <TextInput
            label={t('contact.form.company') || 'Компанія'}
            name="company"
            autoComplete="organization"
          />
          <TextInput label={t('contact.form.phone') || 'Телефон'} type="tel" name="phone" autoComplete="tel" />
          <TextInput label={t('contact.form.message') || 'Повідомлення'} name="message" />
        </div>
        <Button type="submit" className="mt-10">
          {t('contact.form.submit') || 'Давайте обговоримо проєкт'}
        </Button>
      </form>
    </FadeIn>
  )
}

function ContactDetails() {
  const { t } = useTranslations()
  
  return (
    <FadeIn>
      <h2 className="font-display text-base font-semibold text-neutral-950">
        {t('contact.office.title') || 'Наш офіс'}
      </h2>
      <p className="mt-6 text-base text-neutral-600">
        {t('contact.office.description') || 'Віддаєте перевагу особистим зустрічам? Ми ні, але мусимо вказати наші адреси тут з юридичних причин.'}
      </p>

      <Offices className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2" />

      <Border className="mt-16 pt-16">
        <h2 className="font-display text-base font-semibold text-neutral-950">
          {t('header.contact') || 'Контакти'}
        </h2>
        <dl className="mt-6 grid grid-cols-1 gap-8 text-sm sm:grid-cols-2">
          {[
            [t('contact.details.email') || 'Пошта', 'hello@ugc.llc'],
            [t('contact.details.phone') || 'Телефон', '+380 73 000 00 00'],
          ].map(([label, value]) => (
            <div key={value}>
              <dt className="font-semibold text-neutral-950">{label}</dt>
              <dd>
                {label === (t('contact.details.email') || 'Пошта') ? (
                  <Link
                    href={`mailto:${value}`}
                    className="text-neutral-600 hover:text-neutral-950"
                  >
                    {value}
                  </Link>
                ) : (
                  <Link
                    href={`tel:${value.replace(/\s+/g, '')}`}
                    className="text-neutral-600 hover:text-neutral-950"
                  >
                    {value}
                  </Link>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Border>
    </FadeIn>
  )
}

export default function Contact() {
  const { t } = useTranslations()
  
  return (
    <>
      <PageIntro 
        eyebrow={t('header.contact') || 'Звʼяжіться з нами'} 
        title={t('contact.title') || 'Давайте працювати разом'}
      >
        <p>{t('contact.description') || 'Оберіть зручний спосіб звʼязку з нами.'}</p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <div className="grid grid-cols-1 gap-x-8 gap-y-24 lg:grid-cols-2">
          <ContactForm />
          <ContactDetails />
        </div>
      </Container>
    </>
  )
} 