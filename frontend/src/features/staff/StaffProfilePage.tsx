import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Languages,
  LockKeyhole,
  Mail,
  MapPin,
  Monitor,
  Phone,
  RefreshCcw,
  ShieldCheck,
  UserRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cn } from '../../components/ui/cn';
import { apiGetCurrentUser, type AuthUser, type DashboardSummaryResponse } from '../../lib/api';
import { isLocale, type Locale } from '../../lib/i18n';
import { useDashboardSummary } from './useDashboardSummary';
import { staffProfileContent, type StaffProfileCopy } from './staffProfileContent';

type ProfileTab = 'overview' | 'activity' | 'access' | 'security' | 'preferences';

const tabs: ProfileTab[] = ['overview', 'activity', 'access', 'security', 'preferences'];

export function StaffProfilePage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = staffProfileContent[activeLocale];
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const currentUserQuery = useQuery({
    queryKey: ['auth-me-profile'],
    queryFn: apiGetCurrentUser,
    staleTime: 60_000,
  });
  const summaryQuery = useDashboardSummary();
  const user = currentUserQuery.data ?? null;
  const roleLabel = friendlyRole(user?.roles?.[0], copy);
  const department = user?.profile?.department || copy.empty.department;
  const position = user?.profile?.position || roleLabel || copy.empty.position;
  const initials = extractInitials(user?.name);
  const stats = useMemo(() => buildStats(summaryQuery.data, copy), [copy, summaryQuery.data]);
  const responsibilities = useMemo(() => buildResponsibilities(user, copy), [copy, user]);
  const permissionGroups = useMemo(() => groupPermissions(user?.permissions ?? []), [user?.permissions]);

  if (currentUserQuery.isLoading) {
    return <ProfileLoadingState copy={copy} />;
  }

  if (currentUserQuery.isError || !currentUserQuery.data) {
    return (
      <DashboardPanel
        title={copy.title}
        description={copy.errorDescription}
        action={
          <button
            type="button"
            onClick={() => currentUserQuery.refetch()}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            {copy.actions.refresh}
          </button>
        }
      >
        <div className="rounded-md border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-black">{copy.errorTitle}</p>
          <p className="mt-1 leading-6">{copy.errorDescription}</p>
        </div>
      </DashboardPanel>
    );
  }

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-md border border-ink-100 bg-white shadow-xs">
        <div className="staff-profile-hero px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="staff-profile-avatar grid h-24 w-24 shrink-0 place-items-center rounded-md text-3xl font-black shadow-xs">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={copy.labels.active} tone="success" />
                  <span className="staff-profile-chip inline-flex min-h-7 items-center rounded-md px-2.5 text-xs font-bold">
                    {department}
                  </span>
                </div>
                <h1 className="mt-3 truncate text-3xl font-black tracking-tight sm:text-4xl">{user?.name ?? copy.values.staffMember}</h1>
                <p className="staff-profile-hero-subtitle mt-2 text-sm font-semibold sm:text-base">{roleLabel}</p>
                <p className="staff-profile-hero-muted mt-1 text-sm">{position}</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[480px]">
              <HeroFact icon={CalendarDays} label={copy.labels.memberSince} value={formatDate(user?.profile?.joined_foundation_at ?? user?.email_verified_at, activeLocale)} />
              <HeroFact icon={Clock3} label={copy.labels.lastActive} value={formatDateTime(user?.last_login_at, activeLocale)} />
              <HeroFact icon={MapPin} label={copy.labels.timezone} value={Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Douala'} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-ink-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="max-w-2xl text-sm leading-6 text-ink-500">{copy.description}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="focus-ring inline-flex min-h-10 items-center rounded-md border border-ink-200 bg-white px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              {copy.actions.editProfile}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className="focus-ring inline-flex min-h-10 items-center rounded-md border border-ink-200 bg-white px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              {copy.actions.changePassword}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className="focus-ring inline-flex min-h-10 items-center rounded-md bg-foundation-600 px-3 text-sm font-bold text-white transition hover:bg-foundation-900"
            >
              {copy.actions.manageSecurity}
            </button>
            <button
              type="button"
              onClick={() => {
                void currentUserQuery.refetch();
                void summaryQuery.refetch();
              }}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50"
              aria-label={copy.actions.refresh}
            >
              <RefreshCcw className={cn('h-4 w-4', (currentUserQuery.isFetching || summaryQuery.isFetching) && 'animate-spin')} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto px-5 py-3 sm:px-6">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'focus-ring min-h-10 rounded-md px-3 text-sm font-bold transition',
                  activeTab === tab ? 'bg-foundation-600 text-white' : 'bg-ink-50 text-ink-700 hover:bg-ink-100',
                )}
              >
                {copy.tabs[tab]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeTab === 'overview' ? (
        <OverviewTab
          copy={copy}
          locale={activeLocale}
          user={user}
          stats={stats}
          responsibilities={responsibilities}
          activity={summaryQuery.data?.recent_activity ?? []}
        />
      ) : null}

      {activeTab === 'activity' ? (
        <ActivityTab copy={copy} locale={activeLocale} user={user} summary={summaryQuery.data} />
      ) : null}

      {activeTab === 'access' ? (
        <AccessTab copy={copy} roles={user?.roles ?? []} permissionGroups={permissionGroups} />
      ) : null}

      {activeTab === 'security' ? (
        <SecurityTab copy={copy} locale={activeLocale} user={user} />
      ) : null}

      {activeTab === 'preferences' ? (
        <PreferencesTab copy={copy} locale={activeLocale} user={user} />
      ) : null}
    </section>
  );
}

function OverviewTab({
  copy,
  locale,
  user,
  stats,
  responsibilities,
  activity,
}: {
  copy: StaffProfileCopy;
  locale: Locale;
  user: AuthUser | null;
  stats: Array<{ label: string; value: number; icon: LucideIcon }>;
  responsibilities: string[];
  activity: DashboardSummaryResponse['recent_activity'];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <DashboardPanel title={copy.sections.contact}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ProfileFact icon={Mail} label={copy.labels.email} value={user?.email ?? '-'} />
            <ProfileFact icon={Phone} label={copy.labels.phone} value={user?.phone ?? copy.empty.phone} />
            <ProfileFact icon={Languages} label={copy.labels.language} value={languageLabel(user?.preferred_locale ?? locale, copy)} />
            <ProfileFact icon={BriefcaseBusiness} label={copy.labels.employeeNumber} value={user?.employee_number ?? '-'} />
            <ProfileFact icon={MapPin} label={copy.labels.department} value={user?.profile?.department ?? copy.empty.department} />
            <ProfileFact icon={ShieldCheck} label={copy.labels.position} value={user?.profile?.position ?? copy.empty.position} />
          </div>
        </DashboardPanel>

        <DashboardPanel title={copy.sections.quickStats}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="profile-stat-card rounded-md border border-l-4 p-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="profile-stat-label text-xs font-bold uppercase">{stat.label}</p>
                    <p className="profile-stat-value mt-2 text-2xl font-black tabular-nums">{stat.value}</p>
                  </div>
                  <div className="profile-stat-icon grid h-10 w-10 shrink-0 place-items-center rounded-md">
                    <stat.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <div className="space-y-6">
        <DashboardPanel title={copy.sections.responsibilities}>
          <div className="flex flex-wrap gap-2">
            {responsibilities.map((responsibility) => (
              <span key={responsibility} className="inline-flex min-h-9 items-center rounded-md bg-foundation-50 px-3 text-sm font-bold text-foundation-800">
                {responsibility}
              </span>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel title={copy.sections.recentActivity}>
          <Timeline
            empty={copy.empty.activity}
            items={activity.slice(0, 5).map((item, index) => ({
              id: activityItemId('overview', item, index),
              title: item.title,
              description: item.subtitle ?? item.description,
              date: formatRelativeTime(item.occurred_at ?? item.happened_at, locale),
            }))}
          />
        </DashboardPanel>

        <DashboardPanel title={copy.sections.professionalProfile}>
          <p className="text-sm leading-6 text-ink-600">{user?.profile?.bio || copy.empty.profile}</p>
          <TagList items={[...(user?.profile?.skills ?? []), ...(user?.profile?.languages ?? []), ...(user?.profile?.certifications ?? [])]} />
        </DashboardPanel>
      </div>
    </div>
  );
}

function ActivityTab({ copy, locale, user, summary }: { copy: StaffProfileCopy; locale: Locale; user: AuthUser | null; summary?: DashboardSummaryResponse }) {
  const items = [
    ...(user?.activity ?? []).map((item) => ({
      id: `user-${item.id}`,
      title: humanize(item.action),
      description: item.ip_address ?? '',
      date: formatRelativeTime(item.created_at, locale),
    })),
    ...(summary?.recent_activity ?? []).map((item, index) => ({
      id: activityItemId('summary', item, index),
      title: item.title,
      description: item.subtitle ?? item.description,
      date: formatRelativeTime(item.occurred_at ?? item.happened_at, locale),
    })),
  ].slice(0, 12);

  return (
    <DashboardPanel title={copy.sections.recentActivity}>
      <Timeline empty={copy.empty.activity} items={items} />
    </DashboardPanel>
  );
}

function AccessTab({ copy, roles, permissionGroups }: { copy: StaffProfileCopy; roles: string[]; permissionGroups: Record<string, string[]> }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <DashboardPanel title={copy.sections.responsibilities}>
        <div className="space-y-2">
          {roles.length ? roles.map((role) => (
            <div key={role} className="rounded-md border border-ink-100 bg-ink-50 p-4">
              <p className="text-sm font-black text-ink-900">{friendlyRoleName(role)}</p>
            </div>
          )) : <p className="text-sm text-ink-500">{copy.empty.permissions}</p>}
        </div>
      </DashboardPanel>

      <DashboardPanel title={copy.sections.permissions}>
        {Object.keys(permissionGroups).length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {Object.entries(permissionGroups).map(([group, permissions]) => (
              <details key={group} className="rounded-md border border-ink-100 bg-white p-4" open>
                <summary className="cursor-pointer text-sm font-black text-ink-900">{friendlyRoleName(group)}</summary>
                <div className="mt-3 space-y-2">
                  {permissions.map((permission) => (
                    <div key={permission} className="flex items-center gap-2 rounded-md bg-ink-50 px-3 py-2 text-sm font-semibold text-ink-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <span>{friendlyPermissionAction(permission)}</span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-500">{copy.empty.permissions}</p>
        )}
      </DashboardPanel>
    </div>
  );
}

function SecurityTab({ copy, locale, user }: { copy: StaffProfileCopy; locale: Locale; user: AuthUser | null }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <DashboardPanel title={copy.sections.connectedAccounts}>
        <div className="space-y-3">
          {user?.auth_providers?.length ? user.auth_providers.map((provider) => (
            <div key={provider.provider} className="rounded-md border border-ink-100 bg-ink-50 p-4">
              <p className="text-sm font-black text-ink-900">{friendlyRoleName(provider.provider)}</p>
              <p className="mt-1 text-xs text-ink-500">{provider.provider_email ?? user.email}</p>
              <p className="mt-2 text-xs font-semibold text-ink-500">{copy.labels.lastActive}: {formatDateTime(provider.last_used_at, locale)}</p>
            </div>
          )) : <p className="text-sm text-ink-500">{copy.empty.providers}</p>}
        </div>
      </DashboardPanel>

      <DashboardPanel title={copy.sections.sessions}>
        <div className="space-y-3">
          {user?.sessions?.length ? user.sessions.map((session) => (
            <div key={session.id} className="flex items-start gap-3 rounded-md border border-ink-100 bg-white p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foundation-50 text-foundation-700">
                <Monitor className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-black text-ink-900">{session.name}</p>
                <p className="mt-1 text-xs text-ink-500">{copy.labels.lastActive}: {formatDateTime(session.last_used_at ?? session.created_at, locale)}</p>
              </div>
            </div>
          )) : <p className="text-sm text-ink-500">{copy.empty.sessions}</p>}
        </div>
      </DashboardPanel>

      <DashboardPanel title={copy.actions.manageSecurity}>
        <div className="grid gap-3 sm:grid-cols-2">
          <ProfileFact icon={LockKeyhole} label={copy.labels.twoFactor} value={copy.values.disabled} />
          <ProfileFact icon={Mail} label={copy.labels.recoveryEmail} value={user?.email ?? '-'} />
        </div>
      </DashboardPanel>
    </div>
  );
}

function PreferencesTab({ copy, locale, user }: { copy: StaffProfileCopy; locale: Locale; user: AuthUser | null }) {
  return (
    <DashboardPanel title={copy.sections.preferences}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ProfileFact icon={Languages} label={copy.labels.language} value={languageLabel(user?.preferred_locale ?? locale, copy)} />
        <ProfileFact icon={Monitor} label={copy.labels.theme} value={copy.values.lightTheme} />
        <ProfileFact icon={CalendarDays} label={copy.labels.dateFormat} value={locale === 'fr' ? '30 juin 2026' : 'Jun 30, 2026'} />
        <ProfileFact icon={Bell} label={copy.labels.notifications} value={copy.values.browserNotifications} />
        <ProfileFact icon={FileText} label={copy.values.weeklySummary} value={copy.values.enabled} />
      </div>
    </DashboardPanel>
  );
}

function HeroFact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="staff-profile-hero-fact rounded-md p-3">
      <div className="staff-profile-hero-label flex items-center gap-2">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <p className="staff-profile-hero-value mt-2 text-sm font-black">{value}</p>
    </div>
  );
}

function ProfileFact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-4 shadow-xs">
      <div className="flex items-center gap-2 text-ink-500">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <p className="text-xs font-bold uppercase">{label}</p>
      </div>
      <p className="mt-2 wrap-break-word text-sm font-black text-ink-900">{value}</p>
    </div>
  );
}

function Timeline({ empty, items }: { empty: string; items: Array<{ id: string; title: string; description?: string; date: string }> }) {
  if (!items.length) {
    return <p className="rounded-md border border-dashed border-ink-200 bg-ink-50 p-5 text-sm font-semibold text-ink-500">{empty}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <article key={`${item.id}-${index}`} className="flex gap-3 rounded-md border border-ink-100 bg-white p-4 shadow-xs">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-foundation-600" />
          <div className="min-w-0">
            <p className="text-sm font-black text-ink-900">{item.title}</p>
            {item.description ? <p className="mt-1 text-sm leading-6 text-ink-500">{item.description}</p> : null}
            <p className="mt-2 text-xs font-semibold text-ink-400">{item.date}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProfileLoadingState({ copy }: { copy: StaffProfileCopy }) {
  return (
    <section className="space-y-6" aria-busy="true">
      <header className="overflow-hidden rounded-md border border-ink-100 bg-white shadow-xs">
        <div className="staff-profile-hero px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="staff-profile-avatar h-24 w-24 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-7 w-28 rounded-md bg-white/20" />
                <div className="h-9 w-64 max-w-full rounded-md bg-white/20" />
                <div className="h-4 w-40 rounded-md bg-white/15" />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[480px]">
              {[copy.labels.memberSince, copy.labels.lastActive, copy.labels.timezone].map((label) => (
                <div key={label} className="staff-profile-hero-fact rounded-md p-3">
                  <div className="h-3 w-24 rounded-full bg-white/20" />
                  <div className="mt-3 h-4 w-28 rounded-full bg-white/25" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <DashboardPanel title={copy.loadingTitle} description={copy.loadingDescription}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-md border border-ink-100 bg-white p-4 shadow-xs">
              <div className="loading-line w-24" />
              <div className="loading-line mt-4 w-16" />
            </div>
          ))}
        </div>
      </DashboardPanel>
    </section>
  );
}

function activityItemId(prefix: string, item: DashboardSummaryResponse['recent_activity'][number], index: number) {
  return [prefix, item.id ?? item.reference ?? item.key, item.occurred_at ?? item.happened_at ?? 'undated', index].join('-');
}

function TagList({ items }: { items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="inline-flex min-h-8 items-center rounded-md bg-ink-100 px-2.5 text-xs font-bold text-ink-700">
          {item}
        </span>
      ))}
    </div>
  );
}

function buildStats(summary: DashboardSummaryResponse | undefined, copy: StaffProfileCopy) {
  const metric = (key: string) => summary?.metrics.find((item) => item.key === key)?.count ?? 0;

  return [
    { label: copy.stats.applicationsReviewed, value: metric('applications_pending_review'), icon: FileText },
    { label: copy.stats.beneficiariesManaged, value: metric('beneficiaries_supported'), icon: UserRound },
    { label: copy.stats.paymentsApproved, value: metric('funding_awaiting_allocation'), icon: WalletCards },
    { label: copy.stats.reportsGenerated, value: metric('reports_due'), icon: ShieldCheck },
  ];
}

function buildResponsibilities(user: AuthUser | null, copy: StaffProfileCopy): string[] {
  const permissions = user?.permissions ?? [];
  const responsibilities = new Set<string>();

  if (permissions.some((permission) => permission.startsWith('users.') || permission.includes('permissions'))) {
    responsibilities.add(copy.values.systemAdministrator);
  }
  if (permissions.some((permission) => permission.startsWith('applications.'))) {
    responsibilities.add('Application Review');
  }
  if (permissions.some((permission) => permission.startsWith('beneficiaries.'))) {
    responsibilities.add('Beneficiary Support');
  }
  if (permissions.some((permission) => permission.startsWith('donations.') || permission.startsWith('payments.') || permission.startsWith('funds.'))) {
    responsibilities.add('Financial Oversight');
  }
  if (permissions.some((permission) => permission.startsWith('reports.') || permission.startsWith('impact_updates.'))) {
    responsibilities.add('Reporting');
  }

  if (responsibilities.size === 0) {
    responsibilities.add(copy.values.staffMember);
  }

  return Array.from(responsibilities);
}

function groupPermissions(permissions: string[]): Record<string, string[]> {
  return permissions.reduce<Record<string, string[]>>((groups, permission) => {
    const [group, action] = permission.split('.');
    const key = group || 'other';
    groups[key] = [...(groups[key] ?? []), action || permission];
    return groups;
  }, {});
}

function friendlyRole(value: string | undefined, copy: StaffProfileCopy) {
  if (!value) {
    return copy.values.staffMember;
  }

  if (value === 'super_administrator' || value === 'administrator') {
    return copy.values.systemAdministrator;
  }

  return friendlyRoleName(value);
}

function friendlyRoleName(value: string) {
  return value
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function friendlyPermissionAction(value: string) {
  return friendlyRoleName(value);
}

function humanize(value: string) {
  return friendlyRoleName(value);
}

function languageLabel(locale: string, copy: StaffProfileCopy) {
  return locale === 'fr' ? copy.values.french : copy.values.english;
}

function extractInitials(name?: string) {
  if (!name) {
    return 'TC';
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'TC';
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatRelativeTime(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const [unit, amount] = units.find(([, amount]) => abs >= amount) ?? ['second', 1];

  return new Intl.RelativeTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { numeric: 'auto' }).format(Math.round(seconds / amount), unit);
}
