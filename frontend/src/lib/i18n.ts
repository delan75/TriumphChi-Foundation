export type Locale = 'en' | 'fr';

export const locales: Locale[] = ['en', 'fr'];

export const messages = {
  en: {
    appName: 'TriumphChi Foundation',
    dashboard: 'Dashboard',
    applications: 'Applications',
    beneficiaries: 'Beneficiaries',
    funding: 'Funding',
    reports: 'Reports',
  },
  fr: {
    appName: 'Fondation TriumphChi',
    dashboard: 'Tableau de bord',
    applications: 'Demandes',
    beneficiaries: 'Beneficiaires',
    funding: 'Financement',
    reports: 'Rapports',
  },
} satisfies Record<Locale, Record<string, string>>;

export function t(locale: Locale, key: keyof typeof messages.en): string {
  return messages[locale][key];
}

