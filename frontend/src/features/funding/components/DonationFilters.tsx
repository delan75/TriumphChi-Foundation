import { Search, X } from 'lucide-react';
import type { DonationListParams } from '../../../lib/api';
import type { FundingCopy } from '../fundingContent';

interface DonationFiltersProps {
  copy: FundingCopy;
  filters: DonationListParams;
  onChange: (filters: DonationListParams) => void;
}

const statuses = ['pending', 'confirmed', 'failed', 'cancelled', 'refunded'];
const providers = ['momo', 'paypal', 'cards', 'bank_transfer', 'manual'];
const currencies = ['XAF', 'USD', 'EUR', 'GBP'];

export function DonationFilters({ copy, filters, onChange }: DonationFiltersProps) {
  const update = (key: keyof DonationListParams, value: string) => {
    onChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  return (
    <section className="rounded-md border border-ink-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="donation-search" className="text-xs font-semibold uppercase text-ink-500">{copy.filters}</label>
          <div className="mt-2 flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-3 focus-within:ring-2 focus-within:ring-foundation-500 focus-within:ring-offset-2">
            <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
            <input
              id="donation-search"
              value={filters.search ?? ''}
              onChange={(event) => update('search', event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="min-h-10 flex-1 border-0 bg-transparent text-sm font-medium text-ink-900 outline-none"
            />
          </div>
        </div>

        <SelectFilter label={copy.status} value={filters.status ?? ''} onChange={(value) => update('status', value)} emptyLabel={copy.allStatuses} options={statuses} />
        <SelectFilter label={copy.provider} value={filters.provider ?? ''} onChange={(value) => update('provider', value)} emptyLabel={copy.allProviders} options={providers} />
        <SelectFilter label={copy.currency} value={filters.currency ?? ''} onChange={(value) => update('currency', value)} emptyLabel={copy.allCurrencies} options={currencies} />

        <button
          type="button"
          onClick={() => onChange({ per_page: filters.per_page, sort: 'created_at', direction: 'desc' })}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink-200 px-4 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          {copy.clear}
        </button>
      </div>
    </section>
  );
}

function SelectFilter({
  label,
  value,
  emptyLabel,
  options,
  onChange,
}: {
  label: string;
  value: string;
  emptyLabel: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-[150px] text-xs font-semibold uppercase text-ink-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold normal-case text-ink-800"
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
