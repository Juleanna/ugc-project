import { useId } from 'react'
import Link from 'next/link'

import { Border } from '@/components/Border'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Offices } from '@/components/Offices'
import { PageIntro } from '@/components/PageIntro'
import { SocialMedia } from '@/components/SocialMedia'

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

function RadioInput({ label, ...props }) {
  return (
    <label className="flex gap-x-3">
      <input
        type="radio"
        {...props}
        className="h-6 w-6 flex-none appearance-none rounded-full border border-neutral-950/20 outline-none checked:border-[0.5rem] checked:border-neutral-950 focus-visible:ring-1 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
      />
      <span className="text-base/6 text-neutral-950">{label}</span>
    </label>
  )
}

function ContactForm() {
  return (
    <FadeIn className="lg:order-last">
      <form>
        <h2 className="font-display text-base font-semibold text-neutral-950">
          Форма зворотнього звʼязку
        </h2>
        <div className="isolate mt-6 -space-y-px rounded-2xl bg-white/50">
          <TextInput label="Імʼя" name="name" autoComplete="name" />
          <TextInput
            label="Пошта"
            type="email"
            name="email"
            autoComplete="email"
          />
          <TextInput
            label="Компанія"
            name="company"
            autoComplete="organization"
          />
          <TextInput label="Телефон" type="tel" name="phone" autoComplete="tel" />
          <TextInput label="Повідомлення" name="message" />
          {/*<div className="border border-neutral-300 px-6 py-8 first:rounded-t-2xl last:rounded-b-2xl">*/}
          {/*  <fieldset>*/}
          {/*    <legend className="text-base/6 text-neutral-500">Budget</legend>*/}
          {/*    <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">*/}
          {/*      <RadioInput label="$25K – $50K" name="budget" value="25" />*/}
          {/*      <RadioInput label="$50K – $100K" name="budget" value="50" />*/}
          {/*      <RadioInput label="$100K – $150K" name="budget" value="100" />*/}
          {/*      <RadioInput label="More than $150K" name="budget" value="150" />*/}
          {/*    </div>*/}
          {/*  </fieldset>*/}
          {/*</div>*/}
        </div>
        <Button type="submit" className="mt-10">
          Давайте обговоримо проєкт
        </Button>
      </form>
    </FadeIn>
  )
}

function ContactDetails() {
  return (
    <FadeIn>
      <h2 className="font-display text-base font-semibold text-neutral-950">
        Наш офіс
      </h2>
      <p className="mt-6 text-base text-neutral-600">
          Віддаєте перевагу особистим зустрічам? Ми ні, але мусимо вказати наші адреси тут з юридичних причин.
      </p>

      <Offices className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2" />

        <Border className="mt-16 pt-16">
            <h2 className="font-display text-base font-semibold text-neutral-950">
                Контакти
            </h2>
            <dl className="mt-6 grid grid-cols-1 gap-8 text-sm sm:grid-cols-2">
                {[
                    ['Пошта', 'hello@ugc.llc'],
                    ['Телефон', '+380 73 000 00 00'],
                ].map(([label, value]) => (
                    <div key={value}>
                        <dt className="font-semibold text-neutral-950">{label}</dt>
                        <dd>
                            {label === 'Пошта' ? (
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


        <Border className="mt-16 pt-16">
        <h2 className="font-display text-base font-semibold text-neutral-950">
          {/*Follow us*/}
        </h2>
        {/*<SocialMedia className="mt-6" />*/}
      </Border>
    </FadeIn>
  )
}

export const metadata = {
  title: 'Звʼяжіться з нами',
  description: 'Давайте працювати разом.',
}

export default function Contact() {
  return (
    <>
      <PageIntro eyebrow="Звʼяжіться з нами" title="Давайте працювати разом">
        <p>Оберіть зручний спосіб звʼязку з нами.</p>
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
