import { NextResponse } from 'next/server'

const locales = ['uk', 'en']
const defaultLocale = 'uk'

export function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  // Check if pathname already includes a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect to default locale if no locale is specified
  if (pathnameIsMissingLocale) {
    if (pathname === '/') {
      // Redirect root to default locale
      return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
    }
    
    // For other paths, add default locale prefix
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url))
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|.*\\.).*)',
  ],
} 