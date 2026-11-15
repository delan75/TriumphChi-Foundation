import { Search, X } from 'lucide-react';
import type { DonationListParams, DonationManagementSummary } from '../../../lib/api';
import type { FundingCopy } from '../fundingContent';

interface DonationFiltersProps {
  copy: FundingCopy;
  filters: DonationListParams;
  summary?: DonationManagementSummary;
  onChange: (filters: DonationListParams) => void;
}

export function DonationFilters({ copy, filters, summary, onChange }: DonationFiltersProps) {
  const options = summary?.filter_options;
  const update = (key: keyof DonationListParams, value: string) => {
    onChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  return (
    <section className="rounded-md border border-ink-100 bg-white p-4 shadow-xs">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="donation-search" className="text-xs font-semibold uppercase text-ink-500">
            {copy.filters}
          </label>
          <div className="mt-2 flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-3 focus-within:ring-2 focus-within:ring-foundation-500 focus-within:ring-offset-2">
            <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
            <input
              id="donation-search"
              value={filters.search ?? ''}
              onChange={(event) => update('search', event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="min-h-10 flex-1 border-0 bg-transparent text-sm font-medium text-ink-900 outline-hidden"
            />
          </div>
        </div>

        <SelectFilter
          label={copy.status}
          value={filters.status ?? ''}
          onChange={(value) => update('status', value)}
          emptyLabel={copy.allStatuses}
          options={options?.statuses ?? []}
        />
        <SelectFilter
          label={copy.source}
          value={filters.source ?? ''}
          onChange={(value) => update('source', value)}
          emptyLabel={copy.allSources}
          options={options?.providers ?? []}
        />
        <SelectFilter
          label={copy.currency}
          value={filters.currency ?? ''}
          onChange={(value) => update('currency', value)}
          emptyLabel={copy.allCurrencies}
          options={options?.currencies ?? []}
        />
        <SelectFilter
          label={copy.country}
          value={filters.country ?? ''}
          onChange={(value) => update('country', value)}
          emptyLabel={copy.allCountries}
          options={(options?.countries ?? []).map((country) => ({
            value: country.value,
            label: country.label,
          }))}
        />
        <SelectFilter
          label={copy.region}
          value={filters.region_id ? String(filters.region_id) : ''}
          onChange={(value) =>
            onChange({ ...filters, region_id: value ? Number(value) : undefined, page: 1 })
          }
          emptyLabel={copy.allRegions}
          options={(options?.regions ?? []).map((region) => ({
            value: region.value,
            label: region.label,
          }))}
        />

        <button
          type="button"
          onClick={() =>
            onChange({ per_page: filters.per_page, sort: 'created_at', direction: 'desc' })
          }
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
  options: Array<string | { value: string; label: string }>;
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
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </label>
  );
}
