import { ArrowRight, FileText } from 'lucide-react';
import type { DonationManagementRecord } from '../../../lib/api';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { FundingCopy } from '../fundingContent';
import type { Locale } from '../../../lib/i18n';

interface DonationRecordsProps {
  copy: FundingCopy;
  locale: Locale;
  donations: DonationManagementRecord[];
  isLoading: boolean;
  onOpen: (uuid: string) => void;
}

export function DonationRecords({ copy, locale, donations, isLoading, onOpen }: DonationRecordsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-md border border-ink-100 bg-white" />
        ))}
      </div>
    );
  }

  if (!donations.length) {
    return (
      <div className="rounded-md border border-dashed border-ink-200 bg-ink-50 p-6 text-center text-sm font-medium text-ink-500">
        {copy.empty}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {donations.map((donation) => (
          <button
            key={donation.uuid}
            type="button"
            onClick={() => onOpen(donation.uuid)}
            className="focus-ring rounded-md border border-ink-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foundation-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink-900">{donation.reference_number}</p>
                <p className="mt-1 truncate text-sm text-ink-500">{donation.donor?.name ?? '-'}</p>
              </div>
              <StatusBadge label={donation.status_label ?? donation.status} tone={statusTone(donation.status)} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Compact label={copy.amount} value={formatMoney(donation.amount, donation.currency, locale)} />
              <Compact label={copy.allocated} value={`${donation.allocation_summary.allocated_amount} ${donation.currency}`} />
              <Compact label={copy.method} value={donation.method_label ?? donation.method} />
              <Compact label={copy.date} value={formatDate(donation.donated_at, locale)} />
            </div>
          </button>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-md border border-ink-100 bg-white md:block">
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              {[copy.donor, copy.amount, copy.method, copy.fund, copy.allocated, copy.date, copy.actions].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase text-ink-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {donations.map((donation) => (
              <tr key={donation.uuid} className="transition hover:bg-foundation-50/40">
                <td className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foundation-50 text-foundation-700">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink-900">{donation.donor?.name ?? '-'}</p>
                      <p className="mt-1 text-xs text-ink-500">{donation.reference_number}</p>
                      <div className="mt-2">
                        <StatusBadge label={donation.status_label ?? donation.status} tone={statusTone(donation.status)} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-bold text-ink-900">{formatMoney(donation.amount, donation.currency, locale)}</td>
                <td className="px-4 py-4 text-sm text-ink-600">{donation.method_label ?? donation.method}</td>
                <td className="px-4 py-4 text-sm text-ink-600">{donation.fund?.name ?? '-'}</td>
                <td className="px-4 py-4 text-sm text-ink-600">
                  <span className="font-bold text-ink-900">{donation.allocation_summary.allocated_amount}</span>
                  <span className="text-ink-400"> / {donation.amount}</span>
                </td>
                <td className="px-4 py-4 text-sm text-ink-600">{formatDate(donation.donated_at, locale)}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onOpen(donation.uuid)}
                    className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-foundation-700 transition hover:bg-foundation-50"
                  >
                    {copy.open}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Compact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-ink-400">{label}</p>
      <p className="mt-1 font-bold text-ink-900">{value}</p>
    </div>
  );
}

export function statusTone(status: string | null | undefined): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (!status) {
    return 'neutral';
  }

  const normalized = status.toLowerCase();

  if (normalized === 'confirmed' || normalized === 'completed' || normalized === 'successful') {
    return 'success';
  }

  if (normalized === 'pending' || normalized === 'processing') {
    return 'warning';
  }

  if (normalized === 'failed' || normalized === 'cancelled') {
    return 'danger';
  }

  if (normalized === 'refunded') {
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
