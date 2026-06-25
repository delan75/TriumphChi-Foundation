import type { Locale } from '../../lib/i18n';

export function statusTone(status: string | null | undefined): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  const normalized = (status ?? '').toLowerCase();

  if (['active', 'active_support', 'funded', 'sponsored', 'graduated', 'completed', 'accepted'].includes(normalized)) {
    return 'success';
  }

  if (['verification', 'review', 'pending', 'awaiting_sponsorship', 'submitted'].includes(normalized)) {
    return 'warning';
  }

  if (['funding_gap', 'overdue', 'critical', 'rejected', 'archived'].includes(normalized)) {
    return 'danger';
  }

  if (['application', 'draft', 'informational'].includes(normalized)) {
    return 'info';
  }

  return 'neutral';
}

export function formatMoney(amount: string | number | null | undefined, currency: string | null | undefined, locale: Locale) {
  const numericAmount = Number(amount ?? 0);
  const normalizedCurrency = typeof currency === 'string' ? currency.trim().toUpperCase() : '';

  if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalizedCurrency,
    maximumFractionDigits: normalizedCurrency === 'XAF' ? 0 : 2,
  }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
}

export function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export function fundingStatusLabel(hasFundingGap: boolean, copy: { funded: string; fundingGap: string }) {
  return hasFundingGap ? copy.fundingGap : copy.funded;
}

export function sponsorStatusLabel(count: number, copy: { sponsored: string; unsponsored: string }) {
  return count > 0 ? copy.sponsored : copy.unsponsored;
}
