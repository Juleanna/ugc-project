import '@/styles/tailwind.css'
import { TranslationProvider } from '@/contexts/TranslationContext'

export const metadata = {
  title: 'UGC - Українська компанія надійного одягу',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uk" className="h-full">
      <body className="h-full">
        <TranslationProvider 
          options={{
            enableBackend: true,
            fallbackToStatic: true,
            cacheTime: 15 * 60 * 1000, // 15 хвилин
          }}
        >
        {children}
        </TranslationProvider>
      </body>
    </html>
  )
} 