import type { Locale } from '../../lib/i18n';
import type { BeneficiaryRecord } from '../../lib/api';
import type { BeneficiariesCopy } from './beneficiariesContent';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export function statusTone(status: string | null | undefined): Tone {
  const normalized = (status ?? '').toLowerCase();

  if (
    [
      'active',
      'active_support',
      'funded',
      'sponsored',
      'graduated',
      'completed',
      'accepted',
    ].includes(normalized)
  ) {
    return 'success';
  }

  if (
    ['verification', 'review', 'pending', 'awaiting_sponsorship', 'submitted'].includes(normalized)
  ) {
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

export function formatMoney(
  amount: string | number | null | undefined,
  currency: string | null | undefined,
  locale: Locale,
) {
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

export function fundingStatusLabel(
  hasFundingGap: boolean,
  copy: { funded: string; fundingGap: string },
) {
  return hasFundingGap ? copy.fundingGap : copy.funded;
}

export function sponsorStatusLabel(
  count: number,
  copy: { sponsored: string; unsponsored: string },
) {
  return count > 0 ? copy.sponsored : copy.unsponsored;
}

export function currentNeedLabel(beneficiary: BeneficiaryRecord, copy: BeneficiariesCopy) {
  return beneficiary.current_need?.title || copy.filters.noActiveNeeds;
}

export function currentNeedDescription(
  beneficiary: BeneficiaryRecord,
  copy: BeneficiariesCopy,
  locale: Locale,
) {
  const need = beneficiary.current_need;

  if (!need) {
    return copy.tableHelp.noNeed;
  }

  const gap = formatMoney(need.funding_gap, beneficiary.funding_summary.currency, locale);
  const status = need.status_label ?? need.status;

  return `${copy.tableHelp.currentNeed} ${status}. ${copy.profile.gap}: ${gap}.`;
}

export function fundingState(
  beneficiary: BeneficiaryRecord,
  copy: BeneficiariesCopy,
  locale: Locale,
): { label: string; tone: Tone; description: string } {
  const required = Number(beneficiary.funding_summary.amount_required ?? 0);
  const funded = Number(beneficiary.funding_summary.amount_funded ?? 0);
  const gap = Number(beneficiary.funding_summary.funding_gap ?? 0);
  const currency = beneficiary.funding_summary.currency;

  if (required <= 0 || beneficiary.case_summary.needs_count <= 0) {
    return {
      label: copy.filters.noActiveNeeds,
      tone: 'neutral',
      description: copy.tableHelp.noNeed,
    };
  }

  if (funded > required) {
    return {
      label: copy.filters.overfunded,
      tone: 'info',
      description: `${copy.tableHelp.fundingOverfunded} ${copy.profile.amountRequired}: ${formatMoney(required, currency, locale)}. ${copy.profile.amountFunded}: ${formatMoney(funded, currency, locale)}.`,
    };
  }

  if (gap <= 0) {
    return {
      label: copy.filters.fullyFunded,
      tone: 'success',
      description: `${copy.tableHelp.fundingFullyFunded} ${copy.profile.amountRequired}: ${formatMoney(required, currency, locale)}.`,
    };
  }

  if (funded > 0) {
    return {
      label: copy.filters.partiallyFunded,
      tone: 'warning',
      description: `${copy.tableHelp.fundingPartiallyFunded} ${copy.profile.amountFunded}: ${formatMoney(funded, currency, locale)}. ${copy.profile.gap}: ${formatMoney(gap, currency, locale)}.`,
    };
  }

  return {
    label: copy.filters.awaitingFunding,
    tone: 'danger',
    description: `${copy.tableHelp.fundingAwaiting} ${copy.profile.amountRequired}: ${formatMoney(required, currency, locale)}.`,
  };
}

export function sponsorshipState(
  beneficiary: BeneficiaryRecord,
  copy: BeneficiariesCopy,
): { label: string; tone: Tone; description: string } {
  const count = beneficiary.case_summary.sponsor_count;

  if (count <= 0) {
    return {
      label: copy.filters.unsponsored,
      tone: 'neutral',
      description: copy.tableHelp.sponsorshipNone,
    };
  }

  if (count > 1) {
    return {
      label: copy.filters.multipleSponsors,
      tone: 'success',
      description: `${copy.tableHelp.sponsorshipMultiple} ${copy.profile.sponsorCount}: ${count}.`,
    };
  }

  if (beneficiary.funding_summary.has_funding_gap) {
    return {
      label: copy.filters.sharedSponsorship,
      tone: 'info',
      description: copy.tableHelp.sponsorshipShared,
    };
  }

  return {
    label: copy.filters.sponsored,
    tone: 'success',
    description: copy.tableHelp.sponsorshipOne,
  };
}
