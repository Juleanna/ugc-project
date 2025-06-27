// src/app/layout.js - ПРОСТИЙ LAYOUT БЕЗ ЦИКЛІЧНИХ ЗАЛЕЖНОСТЕЙ

import { TranslationProvider } from '@/contexts/TranslationContext'
import { RootLayout } from '@/components/RootLayout'

export const metadata = {
  title: 'UGC - Виробник спецодягу',
  description: 'Якісний спецодяг від українського виробника',
}

export default function Layout({ children }) {
  return (
    <html lang="uk">
      <body>
        <TranslationProvider>
          <RootLayout>
            {children}
          </RootLayout>
        </TranslationProvider>
      </body>
    </html>
  )
}

