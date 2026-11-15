import type { Locale } from '../../lib/i18n';

export function userStatusTone(
  status?: string,
): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'active':
      return 'success';
    case 'invited':
    case 'pending':
      return 'info';
    case 'suspended':
    case 'locked':
      return 'warning';
    case 'archived':
    case 'disabled':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function formatUserDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}
