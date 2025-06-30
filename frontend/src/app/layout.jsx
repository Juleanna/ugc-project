import '@/styles/tailwind.css'

export const metadata = {
  title: 'UGC - Українська компанія надійного одягу',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uk" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  )
} 