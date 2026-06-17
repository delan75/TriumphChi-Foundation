import { PageHeader } from '../../components/ui/PageHeader';

export function ReportsPage() {
  return (
    <section>
      <PageHeader
        title="Reports"
        description="Future reporting hub for beneficiaries, schools, donors, sponsorships, donations, funding gaps, payments, applications, and impact metrics."
      />
      <div className="rounded-md border border-ink-100 bg-white p-5 shadow-sm">
        <p className="text-sm leading-6 text-ink-500">
          Reporting exports should support CSV, Excel, and PDF while respecting role permissions and child safeguarding rules.
        </p>
      </div>
    </section>
  );
}

