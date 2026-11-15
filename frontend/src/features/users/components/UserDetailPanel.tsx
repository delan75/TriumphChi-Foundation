import { CheckCircle2, LockKeyhole, Power, ShieldCheck, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DashboardPanel } from '../../../components/staff/DashboardPanel';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { cn } from '../../../components/ui/cn';
import type { ManagedUserRecord, UserAccessOptions } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import { formatUserDate, userStatusTone } from '../userUtils';
import type { UsersCopy } from '../usersContent';

interface UserDetailPanelProps {
  copy: UsersCopy;
  locale: Locale;
  user: ManagedUserRecord | null;
  accessOptions?: UserAccessOptions;
  isLoading: boolean;
  isWorking: boolean;
  error?: string | null;
  onClose: () => void;
  onEdit: () => void;
  onAccessSave: (uuid: string, roles: string[], directPermissions: string[]) => Promise<void>;
  onStatusAction: (uuid: string, action: 'activate' | 'suspend' | 'archive') => Promise<void>;
  onTerminateSessions: (uuid: string) => Promise<void>;
}

type TabKey = 'overview' | 'access' | 'sessions' | 'activity';

export function UserDetailPanel({
  copy,
  locale,
  user,
  accessOptions,
  isLoading,
  isWorking,
  error,
  onClose,
  onEdit,
  onAccessSave,
  onStatusAction,
  onTerminateSessions,
}: UserDetailPanelProps) {
  const [tab, setTab] = useState<TabKey>('overview');
  const [roles, setRoles] = useState<string[]>([]);
  const [directPermissions, setDirectPermissions] = useState<string[]>([]);

  useEffect(() => {
    setRoles(user?.roles.map((role) => role.name) ?? []);
    setDirectPermissions(user?.direct_permissions ?? []);
    setTab('overview');
    // Initialize for another user while preserving edits during background refetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uuid]);

  const canMutateAccess = Boolean(
    user?.permissions_context.can_manage_access && !user.permissions_context.is_self,
  );
  const tabs = useMemo(
    () => [
      { key: 'overview' as const, label: copy.detail.overview },
      { key: 'access' as const, label: copy.detail.access },
      { key: 'sessions' as const, label: copy.detail.sessions },
      { key: 'activity' as const, label: copy.detail.activity },
    ],
    [copy],
  );

  if (!user && !isLoading) {
    return (
      <DashboardPanel
        title={copy.detail.emptyTitle}
        description={copy.detail.emptyBody}
        className="min-w-0"
      >
        <div className="grid min-h-60 place-items-center rounded-md border border-dashed border-ink-200 bg-ink-50 p-6 text-center">
          <div>
            <ShieldCheck className="mx-auto h-8 w-8 text-foundation-600" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-ink-600">{copy.detail.emptyBody}</p>
          </div>
        </div>
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel
      title={copy.detail.title}
      className="min-w-0"
      action={
        <button
          type="button"
          onClick={onClose}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-200 text-ink-600 transition hover:bg-ink-50"
          aria-label={copy.detail.close}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      }
    >
      {isLoading ? (
        <div className="h-60 animate-pulse rounded-md bg-ink-50" />
      ) : user ? (
        <div className="space-y-5">
          <div className="rounded-md border border-ink-100 bg-ink-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-lg font-black text-ink-900">{user.name}</p>
                <p className="mt-1 text-sm text-ink-500">{user.email}</p>
              </div>
              <StatusBadge
                label={user.status_label ?? copy.statuses[user.status] ?? user.status}
                tone={userStatusTone(user.status)}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.permissions_context.can_update ? (
                <ActionButton
                  icon={ShieldCheck}
                  label={copy.edit}
                  onClick={onEdit}
                  disabled={isWorking}
                />
              ) : null}
              {user.permissions_context.can_activate &&
              user.status !== 'active' &&
              !user.permissions_context.is_self ? (
                <ActionButton
                  icon={CheckCircle2}
                  label={copy.detail.activate}
                  onClick={() => onStatusAction(user.uuid, 'activate')}
                  disabled={isWorking}
                />
              ) : null}
              {user.permissions_context.can_suspend &&
              user.status !== 'suspended' &&
              !user.permissions_context.is_self ? (
                <ActionButton
                  icon={LockKeyhole}
                  label={copy.detail.suspend}
                  onClick={() => onStatusAction(user.uuid, 'suspend')}
                  disabled={isWorking}
                />
              ) : null}
              {user.permissions_context.can_archive &&
              user.status !== 'archived' &&
              !user.permissions_context.is_self ? (
                <ActionButton
                  icon={X}
                  label={copy.detail.archive}
                  onClick={() => onStatusAction(user.uuid, 'archive')}
                  disabled={isWorking}
                  tone="danger"
                />
              ) : null}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex min-w-max gap-2">
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={cn(
                    'focus-ring min-h-10 rounded-md px-3 text-sm font-bold transition',
                    tab === item.key
                      ? 'bg-foundation-600 text-white'
                      : 'bg-ink-50 text-ink-700 hover:bg-ink-100',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {tab === 'overview' ? (
            <div className="grid gap-4">
              <InfoSection title={copy.detail.identity}>
                <KeyValue label={copy.labels.employeeNumber} value={user.employee_number ?? '-'} />
                <KeyValue label={copy.labels.phone} value={user.phone ?? '-'} />
                <KeyValue label={copy.labels.locale} value={user.preferred_locale ?? '-'} />
                <KeyValue label={copy.labels.registeredVia} value={user.registered_via ?? '-'} />
                <KeyValue
                  label={copy.labels.created}
                  value={formatUserDate(user.created_at, locale)}
                />
              </InfoSection>
              <InfoSection title={copy.detail.organization}>
                <KeyValue label={copy.labels.department} value={user.profile?.department ?? '-'} />
                <KeyValue label={copy.labels.position} value={user.profile?.position ?? '-'} />
                <KeyValue
                  label={copy.labels.employmentType}
                  value={user.profile?.employment_type ?? '-'}
                />
                <KeyValue
                  label={copy.labels.location}
                  value={user.profile?.office_location ?? '-'}
                />
              </InfoSection>
              <InfoSection title={copy.detail.authentication}>
                <KeyValue
                  label={copy.labels.lastLogin}
                  value={formatUserDate(user.last_login_at, locale)}
                />
                <KeyValue label={copy.labels.sessions} value={String(user.sessions?.length ?? 0)} />
                <KeyValue
                  label={copy.detail.providers}
                  value={
                    user.auth_providers?.map((provider) => provider.provider).join(', ') ||
                    copy.detail.noProviders
                  }
                />
              </InfoSection>
            </div>
          ) : null}

          {tab === 'access' ? (
            <div className="space-y-5">
              <AccessGroup title={copy.detail.roles}>
                {(accessOptions?.roles ?? []).map((role) => (
                  <CheckboxRow
                    key={role.name}
                    label={role.label}
                    checked={roles.includes(role.name)}
                    disabled={!canMutateAccess || isWorking}
                    onChange={(checked) =>
                      setRoles((current) =>
                        checked
                          ? [...current, role.name]
                          : current.filter((item) => item !== role.name),
                      )
                    }
                  />
                ))}
              </AccessGroup>

              {(accessOptions?.permission_groups ?? []).map((group) => (
                <AccessGroup key={group.group} title={group.label}>
                  {group.permissions.map((permission) => (
                    <CheckboxRow
                      key={permission.name}
                      label={permission.label}
                      checked={directPermissions.includes(permission.name)}
                      disabled={!canMutateAccess || isWorking}
                      onChange={(checked) =>
                        setDirectPermissions((current) =>
                          checked
                            ? [...current, permission.name]
                            : current.filter((item) => item !== permission.name),
                        )
                      }
                    />
                  ))}
                </AccessGroup>
              ))}

              {canMutateAccess ? (
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => onAccessSave(user.uuid, roles, directPermissions)}
                  className="focus-ring inline-flex min-h-11 w-full items-center justify-center rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isWorking ? copy.saving : copy.save}
                </button>
              ) : (
                <p className="rounded-md bg-ink-50 p-3 text-sm font-semibold text-ink-500">
                  {copy.detail.actionUnavailable}
                </p>
              )}
            </div>
          ) : null}

          {tab === 'sessions' ? (
            <div className="space-y-3">
              {user.sessions?.length ? (
                user.sessions.map((session) => (
                  <div key={session.id} className="rounded-md border border-ink-100 p-3">
                    <p className="text-sm font-black text-ink-900">{session.name}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {copy.labels.lastLogin}: {formatUserDate(session.last_used_at, locale)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-md bg-ink-50 p-4 text-sm font-semibold text-ink-500">
                  {copy.detail.noSessions}
                </p>
              )}
              {user.permissions_context.can_terminate_sessions &&
              !user.permissions_context.is_self ? (
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => onTerminateSessions(user.uuid)}
                  className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-red-200 px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Power className="h-4 w-4" aria-hidden="true" />
                  {copy.detail.terminateSessions}
                </button>
              ) : null}
            </div>
          ) : null}

          {tab === 'activity' ? (
            <div className="space-y-3">
              {user.activity?.length ? (
                user.activity.map((activity) => (
                  <div key={activity.id} className="rounded-md border border-ink-100 p-3">
                    <p className="text-sm font-black text-ink-900">
                      {activity.action.replace(/_/g, ' ')}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {formatUserDate(activity.created_at, locale)} · {activity.ip_address ?? '-'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-md bg-ink-50 p-4 text-sm font-semibold text-ink-500">
                  {copy.detail.noActivity}
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </DashboardPanel>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone = 'default',
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'danger'
          ? 'bg-red-50 text-red-700 hover:bg-red-100'
          : 'bg-white text-ink-700 hover:bg-ink-100',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-ink-100 p-4">
      <h3 className="text-sm font-black text-ink-900">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-ink-50 p-3">
      <p className="text-xs font-bold uppercase text-ink-500">{label}</p>
      <p className="mt-1 wrap-break-word text-sm font-black text-ink-900">{value}</p>
    </div>
  );
}

function AccessGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded-md border border-ink-100 bg-white p-4" open>
      <summary className="cursor-pointer text-sm font-black text-ink-900">{title}</summary>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{children}</div>
    </details>
  );
}

function CheckboxRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        'flex min-h-11 items-center gap-3 rounded-md border border-ink-100 px-3 py-2 text-sm font-semibold',
        disabled ? 'bg-ink-50 text-ink-400' : 'bg-white text-ink-700',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded-sm border-ink-300 text-foundation-600"
      />
      <span>{label}</span>
    </label>
  );
}
