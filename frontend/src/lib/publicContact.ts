import { Locale } from './i18n';

const env = import.meta.env;

interface PublicContact {
  email: string;
  emailHref: string;
  phoneDisplay: string;
  phoneHref: string;
  location: Record<Locale, string>;
  responseTime: Record<Locale, string>;
}

const normalizePhoneTel = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return `+${digitsOnly}`;
};

const email = env.VITE_PUBLIC_CONTACT_EMAIL ?? 'support@triumphchi.org';
const phoneDisplay = env.VITE_PUBLIC_CONTACT_PHONE_DISPLAY ?? '+237 000 000 000';
const phoneTel = normalizePhoneTel(env.VITE_PUBLIC_CONTACT_PHONE_TEL ?? phoneDisplay);

export const publicContact = {
  email,
  emailHref: `mailto:${email}`,
  phoneDisplay,
  phoneHref: `tel:${phoneTel}`,
  location: {
    en: env.VITE_PUBLIC_CONTACT_LOCATION_EN ?? 'Serving rural communities across Cameroon',
    fr: env.VITE_PUBLIC_CONTACT_LOCATION_FR ?? 'Au service des communautés rurales du Cameroun',
  },
  responseTime: {
    en: env.VITE_PUBLIC_CONTACT_RESPONSE_TIME_EN ?? 'We aim to respond as promptly as possible.',
    fr: env.VITE_PUBLIC_CONTACT_RESPONSE_TIME_FR ?? 'Nous répondons aussi rapidement que possible.',
  },
} satisfies PublicContact;

const supportText: Record<Locale, string> = {
  en: `Need help? Contact ${publicContact.email}`,
  fr: `Besoin d’aide ? Contactez ${publicContact.email}`,
};

export function getPublicContactSupportText(locale: Locale): string {
  return supportText[locale];
}
