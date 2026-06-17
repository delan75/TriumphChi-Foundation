import { PageHeader } from '../../components/ui/PageHeader';

export function FundingPage() {
  return (
    <section>
      <PageHeader
        title="Funding"
        description="Scaffold for donations, funds, educational needs, allocations, sponsorships, balances, and school payments."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {['Donation to fund', 'Fund to need allocation', 'Payment to school'].map((label) => (
          <article key={label} className="rounded-md border border-ink-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink-900">{label}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">Traceable, auditable, and ready for supporting proof documents.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

