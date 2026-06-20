import { Locale } from './i18n';

const env = import.meta.env;
const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;

interface PublicContact {
  email: string;
  emailHref: string;
  phoneDisplay: string;
  phoneHref: string;
  location: Record<Locale, string>;
  responseTime: Record<Locale, string>;
}

const normalizePhoneTel = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const hasLeadingPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  // Basic E.164-style guardrails: international numbers are up to 15 digits.
  if (digitsOnly.length < MIN_PHONE_DIGITS || digitsOnly.length > MAX_PHONE_DIGITS) return '';

  if (hasLeadingPlus) {
    return `+${digitsOnly}`;
  }

  // If no '+' was provided, only accept already international-looking digits.
  // Reject likely local/trunk-prefixed values (for example, leading zero).
  if (digitsOnly.startsWith('0')) return '';

  return `+${digitsOnly}`;
};

const email = env.VITE_PUBLIC_CONTACT_EMAIL ?? 'support@triumphchi.org';
const phoneDisplay = env.VITE_PUBLIC_CONTACT_PHONE_DISPLAY ?? '+237 000 000 000';
const defaultPhoneTel = normalizePhoneTel('+237 000 000 000');
const configuredPhoneTel = normalizePhoneTel(env.VITE_PUBLIC_CONTACT_PHONE_TEL ?? phoneDisplay);
const phoneTel = configuredPhoneTel || defaultPhoneTel || '+237000000000';

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
  return supportText[locale] ?? supportText.en;
}
