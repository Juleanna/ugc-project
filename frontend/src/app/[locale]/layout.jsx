import { RootLayout } from '@/components/RootLayout'
import '@/styles/tailwind.css'

export const metadata = {
  title: {
    template: '%s - UGC',
    default: 'UGC - Українська компанія надійного одягу',
  },
}

export async function generateStaticParams() {
  return [
    { locale: 'uk' },
    { locale: 'en' },
  ]
}

export default function LocaleLayout({ children, params }) {
  return (
    <html lang={params.locale} className="h-full bg-neutral-950 text-base antialiased">
      <body className="flex min-h-full flex-col">
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  )
} 