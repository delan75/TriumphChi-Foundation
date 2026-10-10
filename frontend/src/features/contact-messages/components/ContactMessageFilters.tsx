import { RotateCcw, Search } from 'lucide-react';
import type { ContactMessageListParams } from '../../../lib/api';
import type { ContactMessagesCopy } from '../contactMessagesContent';

interface ContactMessageFiltersProps {
  copy: ContactMessagesCopy;
  filters: ContactMessageListParams;
  onChange: (filters: ContactMessageListParams) => void;
}

const statuses = ['new', 'reviewing', 'replied', 'archived', 'spam'];
const reasons = ['general', 'sponsorship', 'assistance', 'school', 'volunteer', 'partnership', 'church', 'corporate'];

export function ContactMessageFilters({ copy, filters, onChange }: ContactMessageFiltersProps) {
  const setFilter = (next: Partial<ContactMessageListParams>) => {
    onChange({ ...filters, ...next, page: 1 });
  };

  return (
    <div className="min-w-0 rounded-md border border-ink-100 bg-white p-4 shadow-xs">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_180px_160px_auto]">
        <label className="block">
          <span className="text-xs font-bold uppercase text-ink-500">{copy.filters.search}</span>
          <span className="relative mt-1 block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              value={filters.search ?? ''}
              onChange={(event) => setFilter({ search: event.target.value || undefined })}
              placeholder={copy.filters.searchPlaceholder}
              className="focus-ring min-h-11 w-full rounded-md border border-ink-200 bg-white pl-10 pr-3 text-sm text-ink-900 placeholder:text-ink-400"
            />
          </span>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase text-ink-500">{copy.filters.status}</span>
          <select
            value={filters.status ?? ''}
            onChange={(event) => setFilter({ status: event.target.value || undefined })}
            className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
          >
            <option value="">{copy.filters.all}</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {copy.statuses[status] ?? status}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase text-ink-500">{copy.filters.reason}</span>
          <select
            value={filters.reason ?? ''}
            onChange={(event) => setFilter({ reason: event.target.value || undefined })}
            className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
          >
            <option value="">{copy.filters.all}</option>
            {reasons.map((reason) => (
              <option key={reason} value={reason}>
                {copy.reasons[reason] ?? reason}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase text-ink-500">{copy.filters.attachments}</span>
          <select
            value={filters.has_attachments === true ? 'yes' : ''}
            onChange={(event) => setFilter({ has_attachments: event.target.value === 'yes' ? true : undefined })}
            className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
          >
            <option value="">{copy.filters.all}</option>
            <option value="yes">{copy.filters.withAttachments}</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => onChange({ page: 1, per_page: filters.per_page ?? 12, sort: 'created_at', direction: 'desc' })}
          className="focus-ring mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-ink-50 sm:col-span-2 xl:col-span-1 xl:mt-auto"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {copy.filters.reset}
        </button>
      </div>
    </div>
  );
}
