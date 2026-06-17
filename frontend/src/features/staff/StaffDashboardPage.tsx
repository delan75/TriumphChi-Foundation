import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { DashboardMetric, LifecycleStep } from '../../types/domain';

const metrics: DashboardMetric[] = [
  { label: 'Applications pending verification', value: '48', detail: 'Field review queue' },
  { label: 'Active beneficiaries', value: '300', detail: 'Initial program capacity' },
  { label: 'Open funding gap', value: 'XAF 12.4M', detail: 'Across active educational needs' },
  { label: 'School partners', value: '24', detail: 'Verified and pending schools' },
];

const lifecycle: LifecycleStep[] = [
  { key: 'application', label: 'Application', description: 'Draft and submitted intake records' },
  { key: 'verification', label: 'Verification', description: 'Field and school checks' },
  { key: 'review', label: 'Review', description: 'NGO staff decision workflow' },
  { key: 'accepted', label: 'Accepted', description: 'Ready for funding setup' },
  { key: 'sponsored', label: 'Sponsored', description: 'Partial or full sponsorship' },
  { key: 'active', label: 'Active Support', description: 'Payments, mentorship, and updates' },
  { key: 'graduated', label: 'Graduated', description: 'Completed or archived support' },
];

export function StaffDashboardPage() {
  return (
    <section>
      <PageHeader
        eyebrow="Staff operations"
        title="Beneficiary lifecycle command center"
        description="A staff-first dashboard for tracking applications, sponsorship readiness, funding gaps, school payments, and impact updates."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-md border border-ink-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-ink-500">{metric.label}</p>
            <p className="mt-3 text-2xl font-bold text-ink-900">{metric.value}</p>
            <p className="mt-2 text-sm text-ink-500">{metric.detail}</p>
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-md border border-ink-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Lifecycle pipeline</h2>
            <p className="text-sm text-ink-500">Every transition should be timestamped and audit logged.</p>
          </div>
          <StatusBadge label="Scaffold" tone="info" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {lifecycle.map((step, index) => (
            <article key={step.key} className="min-h-32 rounded-md border border-ink-100 bg-ink-50 p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-bold text-foundation-700">
                {index + 1}
              </div>
              <h3 className="font-semibold text-ink-900">{step.label}</h3>
              <p className="mt-1 text-sm leading-6 text-ink-500">{step.description}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

