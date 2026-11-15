import { Search } from 'lucide-react';
import type { BlogOptionsResponse, BlogPostListParams } from '../../../lib/api';
import type { BlogCopy } from '../blogContent';

interface BlogFiltersProps {
  copy: BlogCopy;
  filters: BlogPostListParams;
  options?: BlogOptionsResponse;
  onChange: (filters: BlogPostListParams) => void;
}

export function BlogFilters({ copy, filters, options, onChange }: BlogFiltersProps) {
  return (
    <section className="rounded-md border border-ink-100 bg-white p-4 shadow-xs">
      <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(220px,1fr)_190px_150px_auto] md:items-end">
        <label className="min-w-0">
          <span className="text-xs font-black uppercase text-ink-500">{copy.filters.search}</span>
          <span className="relative mt-1 block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <input
              value={filters.search ?? ''}
              onChange={(event) => onChange({ ...filters, search: event.target.value, page: 1 })}
              placeholder={copy.filters.searchPlaceholder}
              className="focus-ring h-11 w-full rounded-md border border-ink-200 bg-white pl-10 pr-3 text-sm font-semibold text-ink-800 placeholder:text-ink-400"
            />
          </span>
        </label>

        <label>
          <span className="text-xs font-black uppercase text-ink-500">{copy.filters.status}</span>
          <select
            value={filters.status ?? ''}
            onChange={(event) =>
              onChange({ ...filters, status: event.target.value || undefined, page: 1 })
            }
            className="focus-ring mt-1 h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
          >
            <option value="">{copy.filters.allStatuses}</option>
            {(options?.statuses ?? []).map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-h-11 items-center gap-2 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 md:mt-5">
          <input
            type="checkbox"
            checked={Boolean(filters.featured)}
            onChange={(event) =>
              onChange({ ...filters, featured: event.target.checked || undefined, page: 1 })
            }
            className="h-4 w-4 rounded-sm border-ink-300 text-foundation-700"
          />
          {copy.filters.featured}
        </label>

        <button
          type="button"
          onClick={() =>
            onChange({
              page: 1,
              per_page: filters.per_page ?? 12,
              sort: 'created_at',
              direction: 'desc',
            })
          }
          className="focus-ring min-h-11 rounded-md border border-ink-200 px-4 text-sm font-black text-ink-700 transition hover:bg-ink-50"
        >
          {copy.filters.reset}
        </button>
      </div>
    </section>
  );
}
