import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function BeneficiariesPage() {
  return (
    <section>
      <PageHeader
        title="Beneficiaries"
        description="Private workspace for school assignment, academic records, educational needs, documents, support history, and funding progress."
      />
      <div className="rounded-md border border-dashed border-foundation-500 bg-foundation-50 p-5">
        <StatusBadge label="Private child data" tone="success" />
        <p className="mt-3 max-w-3xl text-sm leading-6 text-foundation-900">
          This area is intentionally scoped for authenticated and authorized users only. Public routes must use curated impact
          stories and aggregate statistics instead of raw beneficiary records.
        </p>
      </div>
    </section>
  );
}

