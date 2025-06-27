// frontend/src/app/page.jsx - ВИПРАВЛЕНА ВЕРСІЯ
import { redirect } from 'next/navigation'

export default function RootPage() {
  // Використовуємо server-side redirect замість клієнтського
  redirect('/uk')
}

