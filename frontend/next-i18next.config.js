/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'uk',
    locales: ['uk', 'en'],
    localePath: './public/locales',
    localeDetection: false,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
} 