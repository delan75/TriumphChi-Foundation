import { BarChart3, ClipboardCheck, HandCoins, ShieldCheck, UsersRound } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { GlobalSearchPanel } from '../../components/staff/GlobalSearchPanel';
import { WorkspaceCard } from '../../components/staff/WorkspaceCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { staffDashboardContent } from '../../content/staffDashboard';
import { readStoredAuthUser } from '../../lib/auth';
import { isLocale, type Locale } from '../../lib/i18n';

const workspaceIcons = {
  applications: ClipboardCheck,
  beneficiaries: UsersRound,
  funding: HandCoins,
  reports: BarChart3,
};

const workspaceTones = {
  applications: 'amber',
  beneficiaries: 'foundation',
  funding: 'blue',
  reports: 'ink',
} as const;

export function StaffDashboardPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = staffDashboardContent[activeLocale];
  const user = readStoredAuthUser();
  const permissions = user?.permissions ?? [];
  const workspacePermissions = buildWorkspacePermissions();
  const accessibleWorkspaces = copy.workspace.cards.filter((workspace) =>
    workspacePermissions[workspace.key].some((permission) => permissions.includes(permission)),
  );

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={<StatusBadge label={copy.liveBadge} tone="info" />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <GlobalSearchPanel
          locale={activeLocale}
          title={copy.search.title}
          description={copy.search.description}
          placeholder={copy.search.placeholder}
          helperText={copy.search.helperText}
          emptyText={copy.search.emptyText}
          shortQueryText={copy.search.shortQueryText}
          permissionsHint={copy.search.permissionsHint}
          visibleScopesLabel={copy.search.visibleScopesLabel}
          scopeLabels={accessibleWorkspaces.map((workspace) => workspace.title)}
          openWorkspaceLabel={copy.search.openWorkspaceLabel}
          clearLabel={copy.search.clearLabel}
          resultSingular={copy.search.resultSingular}
          resultPlural={copy.search.resultPlural}
          noVisibleScopes={copy.search.noVisibleScopes}
        />

        <DashboardPanel title={copy.access.title} description={copy.access.description}>
          <dl className="grid gap-4 sm:grid-cols-2">
            <SummaryItem label={copy.access.metrics.user} value={user?.name ?? copy.access.fallbackUser} />
            <SummaryItem label={copy.access.metrics.locale} value={formatLocale(activeLocale)} />
            <SummaryItem label={copy.access.metrics.permissions} value={String(permissions.length)} />
            <SummaryItem label={copy.access.metrics.workspaces} value={String(accessibleWorkspaces.length)} />
          </dl>

          <div className="mt-5 rounded-md border border-foundation-100 bg-foundation-50 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white text-foundation-700 shadow-sm">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foundation-900">{copy.access.noteTitle}</h3>
                <p className="mt-1 text-sm leading-6 text-foundation-900">{copy.access.noteBody}</p>
              </div>
            </div>
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.workspace.cards.map((workspace) => {
          const Icon = workspaceIcons[workspace.key];
          const available = workspacePermissions[workspace.key].some((permission) => permissions.includes(permission));

          return (
            <WorkspaceCard
              key={workspace.key}
              icon={Icon}
              title={workspace.title}
              description={workspace.description}
              footer={workspace.footer}
              ctaLabel={copy.workspace.available}
              lockedLabel={copy.workspace.locked}
              available={available}
              tone={workspaceTones[workspace.key]}
              to={buildWorkspacePath(activeLocale, workspace.key)}
            />
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <DashboardPanel title={copy.rhythm.title} description={copy.rhythm.description}>
          <div className="space-y-4">
            {copy.rhythm.items.map((item, index) => (
              <div key={item.title} className="grid gap-3 border-b border-ink-100 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[2.5rem_1fr]">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-ink-50 text-sm font-semibold text-foundation-700">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title={copy.privacy.title}
          description={copy.privacy.description}
          action={<StatusBadge label={copy.access.privateBadge} tone="success" />}
        >
          <div className="space-y-4">
            {copy.privacy.items.map((item) => (
              <article key={item.title} className="rounded-md border border-ink-100 bg-ink-50 p-4">
                <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-500">{item.description}</p>
              </article>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel title={copy.lifecycle.title} description={copy.lifecycle.description}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {copy.lifecycle.steps.map((step, index) => (
            <article key={step.title} className="rounded-md border border-ink-100 bg-ink-50 p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-bold text-foundation-700">
                {index + 1}
              </div>
              <h3 className="font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink-500">{step.description}</p>
            </article>
          ))}
        </div>
      </DashboardPanel>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-ink-50 p-4">
      <dt className="text-sm font-medium text-ink-500">{label}</dt>
      <dd className="mt-2 text-xl font-semibold text-ink-900">{value}</dd>
    </div>
  );
}

function buildWorkspacePermissions() {
  return {
    applications: ['applications.view'],
    beneficiaries: ['beneficiaries.view', 'schools.view'],
    funding: ['donors.view', 'donations.view', 'funds.view', 'allocations.view', 'payments.view'],
    reports: ['impact_updates.view', 'audit_logs.view'],
  } satisfies Record<'applications' | 'beneficiaries' | 'funding' | 'reports', string[]>;
}

function buildWorkspacePath(locale: Locale, key: 'applications' | 'beneficiaries' | 'funding' | 'reports') {
  return `/${locale}/staff/${key}`;
}

function formatLocale(locale: Locale) {
  return locale === 'fr' ? 'Francais' : 'English';
}

