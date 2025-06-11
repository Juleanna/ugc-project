import { Blockquote } from '@/components/Blockquote'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { GridList, GridListItem } from '@/components/GridList'
import { GridPattern } from '@/components/GridPattern'
import { List, ListItem } from '@/components/List'
import { PageIntro } from '@/components/PageIntro'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { TagList, TagListItem } from '@/components/TagList'
import imageLaptop from '@/images/sewing.jpg'
import imageMeeting from '@/images/meeting.jpg'
import imageWhiteboard from '@/images/whiteboard.jpg'

function Section({ title, image, children }) {
  return (
      <Container className="group/section [counter-increment:section]">
        <div className="lg:flex lg:items-center lg:justify-end lg:gap-x-8 lg:group-even/section:justify-start xl:gap-x-20">
          <div className="flex justify-center">
            <FadeIn className="w-[33.75rem] flex-none lg:w-[45rem]">
              <StylizedImage
                  {...image}
                  sizes="(min-width: 1024px) 41rem, 31rem"
                  className="justify-center lg:justify-end lg:group-even/section:justify-start"
              />
            </FadeIn>
          </div>
          <div className="mt-12 lg:mt-0 lg:w-[37rem] lg:flex-none lg:group-even/section:order-first">
            <FadeIn>
              <div
                  className="font-display text-base font-semibold before:text-neutral-300 before:content-['/_'] after:text-neutral-950 after:content-[counter(section,decimal-leading-zero)]"
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
  return (
      <Section title="Розробка" image={{ src: imageWhiteboard }}>
        <div className="space-y-6 text-base text-neutral-600">
          <p>
            Ми починаємо з розробки <strong className="font-semibold text-neutral-950">технічних умов (ТУ)</strong> відповідно до ваших вимог. Наша команда експертів працює над тим, щоб зрозуміти ваші потреби та цілі.
          </p>
          <p>
            Наші дизайнери та технологи ретельно вибирають матеріали, розробляють лекала та виготовляють експериментальні зразки. Це дозволяє нам забезпечити <strong className="font-semibold text-neutral-950">найвищу якість</strong> кінцевої продукції.
          </p>
          <p>
            Ми проводимо детальний аналіз та тестування, щоб гарантувати, що кожен аспект виробу відповідає вашим очікуванням та галузевим стандартам.
          </p>
        </div>

        <h3 className="mt-12 font-display text-base font-semibold text-neutral-950">
          Включено в цей етап
        </h3>
        <TagList className="mt-4">
          <TagListItem>Детальні консультації</TagListItem>
          <TagListItem>Вибір матеріалів</TagListItem>
          <TagListItem>Розробка лекал</TagListItem>
          <TagListItem>Виготовлення зразків</TagListItem>
          <TagListItem>Тестування якості</TagListItem>
          <TagListItem>Технічна документація</TagListItem>
        </TagList>
      </Section>
  )
}

function Build() {
  return (
      <Section title="Виробництво" image={{ src: imageLaptop, shape: 1 }}>
        <div className="space-y-6 text-base text-neutral-600">
          <p>
            На основі затверджених технічних умов ми переходимо до <strong className="font-semibold text-neutral-950">пошиття одягу</strong>. Наше виробництво оснащене сучасним обладнанням, що дозволяє нам виготовляти продукцію найвищої якості.
          </p>
          <p>
            Ми можемо працювати як з вашими матеріалами, так і з нашими власними, забезпечуючи <strong className="font-semibold text-neutral-950">гнучкість</strong> у виборі сировини. Наші досвідчені майстри гарантують точність виконання кожного замовлення.
          </p>
          <p>
            Протягом всього процесу виробництва ми підтримуємо постійний зв'язок з клієнтом, інформуючи про прогрес та вносячи необхідні корективи для досягнення ідеального результату.
          </p>
        </div>

        <Blockquote
            author={{ name: 'Олена Іванова', role: 'Директор з виробництва' }}
            className="mt-12"
        >
          Наша команда прагне до досконалості в кожному стібку, забезпечуючи найвищу якість кожного виробу.
        </Blockquote>
      </Section>
  )
}

function Deliver() {
  return (
      <Section title="Фінішна обробка" image={{ src: imageMeeting, shape: 2 }}>
        <div className="space-y-6 text-base text-neutral-600">
          <p>
            Заключний етап нашого процесу включає <strong className="font-semibold text-neutral-950">нанесення логотипу</strong> або бренду на готові вироби. Ми пропонуємо різноманітні методи, включаючи шовкодрук, вишивку та термоперенос.
          </p>
          <p>
            Наша команда забезпечує <strong className="font-semibold text-neutral-950">високу якість</strong> нанесення, гарантуючи довговічність та привабливий вигляд вашого бренду на кожному виробі.
          </p>
          <p>
            Крім того, ми пропонуємо широкий асортимент готових виробів, тканин та фурнітури. Наші послуги підряду дозволяють нам <strong className="font-semibold text-neutral-950">адаптуватися</strong> під ваші специфічні потреби та вимоги.
          </p>
        </div>

        <h3 className="mt-12 font-display text-base font-semibold text-neutral-950">
          Включено в цей етап
        </h3>
        <List className="mt-8">
          <ListItem title="Нанесення логотипу">
            Ми використовуємо найсучасніші технології для забезпечення чіткості та довговічності вашого бренду на кожному виробі.
          </ListItem>
          <ListItem title="Контроль якості">
            Кожен виріб проходить ретельну перевірку перед відправкою, щоб гарантувати відповідність вашим стандартам.
          </ListItem>
          <ListItem title="Додаткові послуги">
            Ми пропонуємо широкий спектр додаткових послуг, включаючи пакування та логістику, щоб забезпечити повний цикл виробництва.
          </ListItem>
        </List>
      </Section>
  )
}

function Values() {
  return (
      <div className="relative mt-24 pt-24 sm:mt-32 sm:pt-32 lg:mt-40 lg:pt-40">
        <div className="absolute inset-x-0 top-0 -z-10 h-[884px] overflow-hidden rounded-t-4xl bg-gradient-to-b from-neutral-50">
          <GridPattern
              className="absolute inset-0 h-full w-full fill-neutral-100 stroke-neutral-950/5 [mask-image:linear-gradient(to_bottom_left,white_40%,transparent_50%)]"
              yOffset={-270}
          />
        </div>

        <SectionIntro
            eyebrow="Наші цінності"
            title="Баланс надійності та інновацій"
        >
          <p>
            Ми прагнемо залишатися на передньому краї модних тенденцій та технологій, одночасно зберігаючи перевірені часом методи виробництва. Наші основні цінності допомагають нам підтримувати цей баланс.
          </p>
        </SectionIntro>

        <Container className="mt-24">
          <GridList>
            <GridListItem title="Ретельність">
              Ми приділяємо увагу кожній деталі, від вибору тканини до останнього стібка, забезпечуючи найвищу якість кожного виробу.
            </GridListItem>
            <GridListItem title="Ефективність">
              Наша команда пишається тим, що ніколи не пропускає дедлайни, завдяки оптимізованим процесам виробництва та досвідченому персоналу.
            </GridListItem>
            <GridListItem title="Адаптивність">
              Кожен бізнес має унікальні потреби, і наш найбільший виклик - адаптувати наші послуги під індивідуальні вимоги кожного клієнта.
            </GridListItem>
            <GridListItem title="Чесність">
              Ми прозорі у всіх наших процесах і завжди надаємо клієнтам повну інформацію про хід виробництва та використані матеріали.
            </GridListItem>
            <GridListItem title="Лояльність">
              Ми будуємо довгострокові відносини з нашими клієнтами, які виходять за рамки просто виготовлення продукції, стаючи надійними партнерами.
            </GridListItem>
            <GridListItem title="Інноваційність">
              Світ моди постійно еволюціонує, і ми разом з ним. Ми постійно шукаємо нові технології та матеріали для покращення нашої продукції.
            </GridListItem>
          </GridList>
        </Container>
      </div>
  )
}

export const metadata = {
  title: 'Процес Виробництва',
  description:
      'Ми віримо в ефективність та максимізацію наших ресурсів, щоб забезпечити найкращу цінність для наших клієнтів.',
}

export default function Process() {
  return (
      <>
        <PageIntro eyebrow="Процес виробництва" title="Як ми працюємо">
          <p>
            Ми віримо в ефективність та максимізацію наших ресурсів, щоб забезпечити найкращу цінність для наших клієнтів. Наше швейне виробництво повного циклу пропонує комплексні рішення для всіх ваших потреб у виготовленні одягу.
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
