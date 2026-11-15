import { useMemo } from 'react';
import {
  ArrowRight,
  Clock3,
  Layers3,
  RefreshCcw,
  Sparkles,
  UsersRound,
  FileText,
  Wallet,
  ShieldCheck,
  ListChecks,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cn } from '../../components/ui/cn';
import { staffDashboardText } from '../../content/staffDashboard';
import { readStoredAuthUser } from '../../lib/auth';
import { isLocale, type Locale } from '../../lib/i18n';
import { MonthlyOperationsChart } from './components/MonthlyOperationsChart';
import { useDashboardSummary } from './useDashboardSummary';

type MetricTone = 'info' | 'warning' | 'success';

const metricToneClasses: Record<MetricTone, string> = {
  info: 'bg-blue-50 text-blue-700 ring-blue-100',
  warning: 'bg-amber-50 text-amber-800 ring-amber-100',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};

const metricIcons: Record<string, LucideIcon> = {
  applications_pending_review: ListChecks,
  beneficiaries_supported: UsersRound,
  schools_connected: ShieldCheck,
  active_sponsorships: Wallet,
  funding_awaiting_allocation: RefreshCcw,
  reports_due: FileText,
};

const quickActionIcons: Record<string, LucideIcon> = {
  applications_review: ListChecks,
  beneficiaries_open: UsersRound,
  funding_open: Wallet,
  reports_open: FileText,
};

export function StaffDashboardPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = staffDashboardText[activeLocale];
  const summaryQuery = useDashboardSummary();
  const user = readStoredAuthUser();
  const summary = summaryQuery.data;
  const metrics = summary?.metrics ?? [];
  const activity = summary?.recent_activity ?? [];
  const quickActions = summary?.quick_actions ?? [];
  const monthlyActivity = summary?.charts?.monthly_activity ?? [];
  const accessibleModules = summary?.snapshot.accessible_modules ?? [];

  const directPermissions = user?.permissions?.length ?? 0;
  const roleLabel = user?.roles?.[0] ?? copy.roleLabel;
  const lastLogin = formatDateTime(user?.last_login_at, activeLocale);
  const generatedAt = formatDateTime(summary?.snapshot.generated_at, activeLocale, true);

  const queuePreview = useMemo(
    () => (summary?.priority_queues ?? []).slice(0, 4),
    [summary?.priority_queues],
  );

  const topActions = quickActions.slice(0, 2);

  if (summaryQuery.isError) {
    return (
      <section className="space-y-4">
        <DashboardPanel
          title={copy.title}
          description={copy.subtitle}
          action={
            <button
              type="button"
              onClick={() => summaryQuery.refetch()}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-semibold text-white transition hover:bg-foundation-700"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              {copy.retryLabel}
            </button>
          }
        >
          <div className="rounded-md border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">{copy.errorTitle}</p>
            <p className="mt-1 leading-6">{copy.errorDescription}</p>
          </div>
        </DashboardPanel>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-md border border-ink-100 bg-white shadow-xs">
        <div className="border-b border-ink-100 bg-linear-to-r from-foundation-50 via-white to-white px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={copy.liveLabel} tone="success" />
                <span className="inline-flex min-h-7 items-center rounded-md bg-ink-100 px-2.5 text-xs font-semibold text-ink-600">
                  {generatedAt ? `${copy.generatedLabel} ${generatedAt}` : copy.generatedLabel}
                </span>
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                {copy.greeting}, {user?.name ?? copy.staffFallback}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
                {copy.subtitle}
              </p>
            </div>

            {topActions.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[360px] lg:max-w-[440px]">
                {topActions.map((action, index) => {
                  const actionCopy = copy.quickActionLabels[action.key] ?? {
                    title: action.key,
                    description: action.path,
                  };

                  return (
                    <TopActionLink
                      key={action.key}
                      to={`/${activeLocale}${action.path}`}
                      label={actionCopy.title}
                      hint={actionCopy.description}
                      icon={quickActionIcons[action.key] ?? Layers3}
                      tone={index === 0 ? 'foundation' : 'ink'}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <CompactStat label={copy.roleLabel} value={roleLabel} />
            <CompactStat label={copy.lastLoginLabel} value={lastLogin} />
            <CompactStat label={copy.workspaceLabel} value={copy.title} />
          </div>
        </div>
      </header>

      {summaryQuery.isLoading ? <DashboardSkeleton /> : null}

      {!summaryQuery.isLoading ? (
        <>
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-base font-semibold text-ink-900">{copy.metricsSectionTitle}</h2>
              <span className="text-xs font-semibold uppercase tracking-normal text-ink-500">
                {copy.liveLabel}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {metrics.length ? (
                metrics.map((metric) => {
                  const Icon = metricIcons[metric.key] ?? Layers3;
                  return (
                    <article
                      key={metric.key}
                      className="rounded-md border border-ink-100 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            'grid h-11 w-11 place-items-center rounded-md ring-1',
                            metricToneClasses[metric.tone as MetricTone] ?? metricToneClasses.info,
                          )}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <Link
                          to={`/${activeLocale}${metric.path}`}
                          className="focus-ring inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold text-foundation-700 transition hover:bg-foundation-50 hover:text-foundation-900"
                        >
                          {copy.openLabel}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                      <p className="mt-4 text-sm font-medium text-ink-500">
                        {copy.metricLabels[metric.key] ?? metric.key}
                      </p>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-ink-900 tabular-nums">
                        {formatNumber(metric.count, activeLocale)}
                      </p>
                    </article>
                  );
                })
              ) : (
                <article className="rounded-md border border-dashed border-ink-200 bg-white p-5 text-sm text-ink-500 shadow-xs sm:col-span-2 xl:col-span-3">
                  {copy.statusLabels.noData}
                </article>
              )}
            </div>
          </section>

          <MonthlyOperationsChart copy={copy} locale={activeLocale} data={monthlyActivity} />

          <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
            <DashboardPanel
              title={copy.queuesSectionTitle}
              action={
                <Link
                  to={`/${activeLocale}/staff/applications`}
                  className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-100 px-4 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  {copy.searchLabel}
                </Link>
              }
            >
              {queuePreview.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {queuePreview.map((queue) => (
                    <article
                      key={queue.key}
                      className="rounded-md border border-ink-100 bg-ink-50/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink-900">
                            {copy.queueLabels[queue.key] ?? queue.key}
                          </p>
                          <p className="mt-1 text-xs text-ink-500">
                            {formatNumber(queue.count, activeLocale)}{' '}
                            {queue.count === 1 ? copy.recordLabel : copy.recordsLabel}
                          </p>
                        </div>
                        <Link
                          to={`/${activeLocale}${queue.path}`}
                          className="focus-ring inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold text-foundation-700 transition hover:bg-white"
                        >
                          {copy.queueAction}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>

                      <div className="mt-4 space-y-2">
                        {queue.items.length ? (
                          queue.items.map((item) => (
                            <Link
                              key={item.id}
                              to={`/${activeLocale}${item.path}`}
                              className="focus-ring flex items-start justify-between gap-4 rounded-md bg-white px-3 py-3 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-semibold text-ink-900">
                                    {item.title}
                                  </p>
                                  {item.reference ? (
                                    <span className="rounded-md bg-ink-100 px-2 py-1 text-[11px] font-semibold text-ink-600">
                                      {item.reference}
                                    </span>
                                  ) : null}
                                </div>
                                {item.secondary ? (
                                  <p className="mt-1 text-xs leading-5 text-ink-500">
                                    {item.secondary}
                                  </p>
                                ) : null}
                              </div>
                              <div className="shrink-0 text-right">
                                <StatusBadge
                                  label={item.status_label}
                                  tone={statusTone(item.status)}
                                />
                                <p className="mt-2 text-[11px] text-ink-500">
                                  {formatRelativeTime(item.updated_at, activeLocale)}
                                </p>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <p className="rounded-md border border-dashed border-ink-200 bg-white px-3 py-4 text-sm text-ink-500">
                            {copy.queueEmpty}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-ink-200 bg-ink-50/40 p-4 text-sm text-ink-500">
                  {copy.statusLabels.noData}
                </div>
              )}
            </DashboardPanel>

            <div className="space-y-6">
              <DashboardPanel title={copy.activitySectionTitle}>
                {activity.length ? (
                  <div className="space-y-3">
                    {activity.slice(0, 6).map((item, index) => (
                      <Link
                        key={`${item.id ?? item.reference ?? item.key}-${item.occurred_at ?? item.happened_at ?? index}`}
                        to={`/${activeLocale}${item.path}`}
                        className="focus-ring flex items-start justify-between gap-4 rounded-md border border-ink-100 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-foundation-100 hover:shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                            {item.reference ? (
                              <span className="rounded-md bg-foundation-50 px-2 py-1 text-[11px] font-semibold text-foundation-800">
                                {item.reference}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-ink-500">
                            {item.subtitle ?? item.description}
                          </p>
                        </div>
                        <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-ink-400">
                          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatRelativeTime(item.occurred_at ?? item.happened_at, activeLocale)}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-ink-500">{copy.activityEmpty}</p>
                )}
              </DashboardPanel>

              <DashboardPanel title={copy.overviewSectionTitle}>
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <SummaryPill
                      label={copy.overviewLabels.accessibleModules}
                      value={formatNumber(accessibleModules.length, activeLocale)}
                    />
                    <SummaryPill
                      label={copy.overviewLabels.directPermissions}
                      value={formatNumber(directPermissions, activeLocale)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {accessibleModules.length ? (
                      accessibleModules.map((module) => (
                        <span
                          key={module}
                          className="inline-flex min-h-8 items-center rounded-md border border-ink-100 bg-ink-50 px-2.5 text-xs font-semibold text-ink-700"
                        >
                          {module}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-ink-500">{copy.statusLabels.noData}</span>
                    )}
                  </div>
                </div>
              </DashboardPanel>
            </div>
          </section>

          <DashboardPanel
            title={copy.actionsSectionTitle}
            action={
              <Link
                to={`/${activeLocale}/staff/reports`}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-100 px-4 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {copy.openReportsLabel}
              </Link>
            }
          >
            {quickActions.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {quickActions.map((action) => {
                  const ActionIcon = quickActionIcons[action.key] ?? Layers3;
                  const actionCopy = copy.quickActionLabels[action.key] ?? {
                    title: action.key,
                    description: action.path,
                  };

                  return (
                    <Link
                      key={action.key}
                      to={`/${activeLocale}${action.path}`}
                      className="focus-ring group rounded-md border border-ink-100 bg-white p-4 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-foundation-100 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-md bg-foundation-50 text-foundation-700 transition group-hover:bg-foundation-600 group-hover:text-white">
                          <ActionIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <ArrowRight
                          className="h-4 w-4 text-ink-400 transition group-hover:text-foundation-700"
                          aria-hidden="true"
                        />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-ink-900">
                        {actionCopy.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-ink-500">
                        {actionCopy.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm leading-6 text-ink-500">{copy.statusLabels.noData}</p>
            )}
          </DashboardPanel>
        </>
      ) : null}
    </section>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white px-4 py-3 shadow-xs">
      <p className="text-[11px] font-semibold uppercase tracking-normal text-ink-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white px-4 py-3 shadow-xs">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-ink-900 tabular-nums">{value}</p>
    </div>
  );
}

function TopActionLink({
  to,
  label,
  hint,
  icon: Icon,
  tone,
}: {
  to: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: 'foundation' | 'ink';
}) {
  return (
    <Link
      to={to}
      className={cn(
        'focus-ring group flex min-h-14 items-center justify-between gap-3 rounded-md border px-4 py-3 text-left shadow-xs transition duration-200 hover:-translate-y-0.5',
        tone === 'foundation'
          ? 'border-foundation-100 bg-foundation-600 text-white hover:bg-foundation-700'
          : 'border-ink-100 bg-white text-ink-900 hover:border-foundation-100 hover:bg-foundation-50',
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p
          className={cn(
            'mt-1 text-xs leading-5',
            tone === 'foundation' ? 'text-white/80' : 'text-ink-500',
          )}
        >
          {hint}
        </p>
      </div>
      <span
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-md transition',
          tone === 'foundation'
            ? 'bg-white/10 text-white'
            : 'bg-foundation-50 text-foundation-700 group-hover:bg-foundation-600 group-hover:text-white',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-md border border-ink-100 bg-white"
          />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <div className="h-104 animate-pulse rounded-md border border-ink-100 bg-white" />
        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-md border border-ink-100 bg-white" />
          <div className="h-48 animate-pulse rounded-md border border-ink-100 bg-white" />
        </div>
      </section>
      <div className="h-72 animate-pulse rounded-md border border-ink-100 bg-white" />
    </div>
  );
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale).format(value ?? 0);
}

function formatDateTime(value: string | null | undefined, locale: Locale, compact = false) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: compact ? 'medium' : 'long',
    timeStyle: compact ? 'short' : 'short',
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

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const diffHours = Math.round(diffMs / 3_600_000);
  const diffDays = Math.round(diffMs / 86_400_000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  }

  if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  }

  return rtf.format(diffMinutes, 'minute');
}

function statusTone(status: string): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  const normalized = status.toLowerCase();

  if (
    normalized.includes('verified') ||
    normalized.includes('active') ||
    normalized.includes('approved')
  ) {
    return 'success';
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('review') ||
    normalized.includes('verification')
  ) {
    return 'warning';
  }

  if (
    normalized.includes('rejected') ||
    normalized.includes('failed') ||
    normalized.includes('declined')
  ) {
    return 'danger';
  }

  if (normalized.includes('info') || normalized.includes('submitted')) {
    return 'info';
  }

  return 'neutral';
}
