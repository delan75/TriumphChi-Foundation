import { ArrowRight, ShieldCheck, UserRound } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { cn } from '../../../components/ui/cn';
import type { ManagedUserRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import { formatUserDate, userStatusTone } from '../userUtils';
import type { UsersCopy } from '../usersContent';

interface UserRecordsProps {
  copy: UsersCopy;
  locale: Locale;
  users: ManagedUserRecord[];
  selectedUuid: string | null;
  isLoading: boolean;
  onOpen: (uuid: string) => void;
}

export function UserRecords({
  copy,
  locale,
  users,
  selectedUuid,
  isLoading,
  onOpen,
}: UserRecordsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-md border border-ink-100 bg-white"
          />
        ))}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-md border border-dashed border-ink-200 bg-ink-50 p-6 text-center text-sm font-medium text-ink-500">
        {copy.table.empty}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {users.map((user) => (
          <button
            key={user.uuid}
            type="button"
            onClick={() => onOpen(user.uuid)}
            className={cn(
              'focus-ring rounded-md border bg-white p-4 text-left shadow-xs transition hover:-translate-y-0.5',
              selectedUuid === user.uuid
                ? 'border-foundation-300 ring-2 ring-foundation-100'
                : 'border-ink-100',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-ink-900">{user.name}</p>
                <p className="mt-1 truncate text-xs text-ink-500">{user.email}</p>
              </div>
              <StatusBadge
                label={user.status_label ?? copy.statuses[user.status] ?? user.status}
                tone={userStatusTone(user.status)}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Compact
                label={copy.table.access}
                value={user.roles.map((role) => role.label).join(', ') || '-'}
              />
              <Compact label={copy.labels.department} value={user.profile?.department ?? '-'} />
              <Compact label={copy.labels.employeeNumber} value={user.employee_number ?? '-'} />
              <Compact
                label={copy.labels.lastLogin}
                value={formatUserDate(user.last_login_at, locale)}
              />
            </div>
          </button>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-ink-100 bg-white lg:block">
        <table className="min-w-[980px] divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              {[
                copy.table.user,
                copy.table.access,
                copy.table.organization,
                copy.table.status,
                copy.table.lastLogin,
                copy.table.actions,
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold uppercase text-ink-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {users.map((user) => (
              <tr
                key={user.uuid}
                className={cn(
                  'transition hover:bg-foundation-50/40',
                  selectedUuid === user.uuid && 'bg-foundation-50/60',
                )}
              >
                <td className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foundation-50 text-foundation-700">
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-ink-900">{user.name}</p>
                      <p className="mt-1 text-xs text-ink-500">{user.email}</p>
                      <p className="mt-1 text-xs font-semibold text-ink-600">
                        {user.employee_number ?? user.phone ?? '-'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-56">
                    <p className="truncate text-sm font-bold text-ink-800">
                      {user.roles.map((role) => role.label).join(', ') || copy.detail.noRoles}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-ink-500">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {user.permissions.length} {copy.detail.inheritedPermissions}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-ink-600">
                  <p className="font-bold text-ink-800">{user.profile?.department ?? '-'}</p>
                  <p className="mt-1 text-xs">{user.profile?.position ?? '-'}</p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={user.status_label ?? copy.statuses[user.status] ?? user.status}
                    tone={userStatusTone(user.status)}
                  />
                </td>
                <td className="px-4 py-4 text-sm text-ink-600">
                  {formatUserDate(user.last_login_at, locale)}
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onOpen(user.uuid)}
                    className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-foundation-700 transition hover:bg-foundation-50"
                  >
                    {copy.table.open}
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
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase text-ink-400">{label}</p>
      <p className="mt-1 truncate font-bold text-ink-900">{value}</p>
    </div>
  );
}
