import { createI18n } from 'vue-i18n';
import enLocale from './locales/en.json';
import esLocale from './locales/es.json';

export default createI18n({
  locale: 'en',
  fallbackLocale: 'es',
  legacy: false,
  messages: {
    en: enLocale,
    es: esLocale,
  },
  globalInjection: true,
});
