import { Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BeneficiaryListParams } from '../../../lib/api';
import type { BeneficiariesCopy } from '../beneficiariesContent';

interface BeneficiaryFiltersProps {
  copy: BeneficiariesCopy;
  filters: BeneficiaryListParams;
  onChange: (filters: BeneficiaryListParams) => void;
}

const statusOptions = ['application', 'verification', 'review', 'accepted', 'active_support', 'graduated', 'archived'];

export function BeneficiaryFilters({ copy, filters, onChange }: BeneficiaryFiltersProps) {
  const update = (key: keyof BeneficiaryListParams, value: string) => {
    onChange({
      ...filters,
      page: 1,
      [key]: value || undefined,
    });
  };

  return (
    <section className="rounded-md border border-ink-100 bg-white p-4 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[minmax(240px,1.5fr)_repeat(6,minmax(130px,1fr))_auto]">
        <label className="relative block">
          <span className="sr-only">{copy.filters.search}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="search"
            value={filters.search ?? ''}
            onChange={(event) => update('search', event.target.value)}
            placeholder={copy.filters.searchPlaceholder}
            className="focus-ring h-11 w-full rounded-md border border-ink-200 bg-white pl-10 pr-3 text-sm font-medium text-ink-900 placeholder:text-ink-400"
          />
        </label>

        <Select label={copy.filters.status} value={filters.status ?? ''} onChange={(value) => update('status', value)}>
          <option value="">{copy.filters.all}</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {humanize(status)}
            </option>
          ))}
        </Select>

        <Select
          label={copy.filters.funding}
          value={filters.funding_status ?? ''}
          onChange={(value) => update('funding_status', value)}
        >
          <option value="">{copy.filters.all}</option>
          <option value="funded">{copy.filters.funded}</option>
          <option value="funding_gap">{copy.filters.fundingGap}</option>
        </Select>

        <Select
          label={copy.filters.sponsor}
          value={filters.sponsor_status ?? ''}
          onChange={(value) => update('sponsor_status', value)}
        >
          <option value="">{copy.filters.all}</option>
          <option value="sponsored">{copy.filters.sponsored}</option>
          <option value="unsponsored">{copy.filters.unsponsored}</option>
        </Select>

        <Select label={copy.filters.gender} value={filters.gender ?? ''} onChange={(value) => update('gender', value)}>
          <option value="">{copy.filters.all}</option>
          <option value="female">{copy.filters.female}</option>
          <option value="male">{copy.filters.male}</option>
        </Select>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-ink-400">{copy.filters.academicYear}</span>
          <input
            type="text"
            value={filters.academic_year ?? ''}
            onChange={(event) => update('academic_year', event.target.value)}
            className="focus-ring h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-medium text-ink-900"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-ink-400">{copy.filters.classLevel}</span>
          <input
            type="text"
            value={filters.education_level ?? ''}
            onChange={(event) => update('education_level', event.target.value)}
            className="focus-ring h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-medium text-ink-900"
          />
        </label>

        <button
          type="button"
          onClick={() => onChange({ page: 1, per_page: filters.per_page, sort: filters.sort, direction: filters.direction })}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 xl:mt-5"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          {copy.filters.reset}
        </button>
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase text-ink-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-bold text-ink-700"
      >
        {children}
      </select>
    </label>
  );
}

function humanize(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
