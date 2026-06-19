export type Locale = 'en' | 'fr';

export const locales: Locale[] = ['en', 'fr'];
export const defaultLocale: Locale = 'en';

export function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'fr';
}

export const messages = {
  en: {
    appName: 'TriumphChi Foundation',
    operationsSubtitle: 'Giving from a covenant, not from leftovers',
    home: 'Home',
    about: 'About',
    programs: 'Programs',
    impact: 'Impact',
    donate: 'Donate',
    apply: 'Apply',
    sponsorChild: 'Sponsor a Child',
    contact: 'Contact',
    login: 'Login',
    account: 'Account',
    dashboard: 'Dashboard',
    applications: 'Applications',
    beneficiaries: 'Beneficiaries',
    funding: 'Funding',
    reports: 'Reports',
  },
  fr: {
    appName: 'Fondation TriumphChi',
    operationsSubtitle: 'Donner par alliance, pas avec les restes',
    home: 'Accueil',
    about: 'À propos',
    programs: 'Programmes',
    impact: 'Impact',
    donate: 'Donner',
    apply: 'Postuler',
    sponsorChild: 'Parrainer un enfant',
    contact: 'Contact',
    login: 'Connexion',
    account: 'Compte',
    dashboard: 'Tableau de bord',
    applications: 'Demandes',
    beneficiaries: 'Bénéficiaires',
    funding: 'Financement',
    reports: 'Rapports',
  },
} satisfies Record<Locale, Record<string, string>>;

export function t(locale: Locale, key: keyof typeof messages.en): string {
  return messages[locale][key];
}

