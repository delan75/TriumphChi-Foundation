import type { Locale } from '../../lib/i18n';

export function contactStatusTone(status: string | null | undefined): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  switch ((status ?? '').toLowerCase()) {
    case 'new':
      return 'warning';
    case 'reviewing':
      return 'info';
    case 'replied':
      return 'success';
    case 'archived':
      return 'neutral';
    case 'spam':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function formatContactDate(value: string | null | undefined, locale: Locale, withTime = false) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(date);
}

export function formatFileSize(bytes: number | null | undefined) {
  const value = Number(bytes ?? 0);

  if (!Number.isFinite(value) || value <= 0) {
    return '0 KB';
  }

  if (value < 1024 * 1024) {
    return `${Math.ceil(value / 1024)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
