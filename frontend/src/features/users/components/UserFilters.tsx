import { Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ManagedUserListParams, UserAccessOptions } from '../../../lib/api';
import type { UsersCopy } from '../usersContent';

interface UserFiltersProps {
  copy: UsersCopy;
  filters: ManagedUserListParams;
  accessOptions?: UserAccessOptions;
  onChange: (filters: ManagedUserListParams) => void;
}

export function UserFilters({ copy, filters, accessOptions, onChange }: UserFiltersProps) {
  const update = (patch: ManagedUserListParams) => onChange({ ...filters, ...patch, page: 1 });

  return (
    <section className="rounded-md border border-ink-100 bg-white p-4 shadow-sm">
      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_180px_180px_160px_160px_auto]">
        <label className="min-w-0">
          <span className="text-xs font-bold uppercase text-ink-500">{copy.filters.search}</span>
          <span className="relative mt-2 block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              value={filters.search ?? ''}
              onChange={(event) => update({ search: event.target.value || undefined })}
              placeholder={copy.filters.searchPlaceholder}
              className="focus-ring min-h-11 w-full rounded-md border border-ink-200 bg-white py-2 pl-10 pr-3 text-sm text-ink-900 outline-none transition"
            />
          </span>
        </label>

        <Select label={copy.filters.status} value={filters.status ?? ''} onChange={(value) => update({ status: value || undefined })}>
          <option value="">{copy.filters.allStatuses}</option>
          {(accessOptions?.statuses ?? []).map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </Select>

        <Select label={copy.filters.role} value={filters.role ?? ''} onChange={(value) => update({ role: value || undefined })}>
          <option value="">{copy.filters.allRoles}</option>
          {(accessOptions?.roles ?? []).map((role) => (
            <option key={role.name} value={role.name}>{role.label}</option>
          ))}
        </Select>

        <Field label={copy.filters.department} value={filters.department ?? ''} onChange={(value) => update({ department: value || undefined })} />
        <Field label={copy.filters.position} value={filters.position ?? ''} onChange={(value) => update({ position: value || undefined })} />

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => onChange({ page: 1, per_page: filters.per_page ?? 12, sort: 'created_at', direction: 'desc' })}
            className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 xl:w-auto"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            {copy.filters.reset}
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="min-w-0">
      <span className="text-xs font-bold uppercase text-ink-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition"
      />
    </label>
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
    <label className="min-w-0">
      <span className="text-xs font-bold uppercase text-ink-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800 outline-none transition"
      >
        {children}
      </select>
    </label>
  );
}
