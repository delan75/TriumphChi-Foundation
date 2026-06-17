import { ArrowRight, FileText, HeartHandshake, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';

export function PublicHomePage() {
  return (
    <section>
      <PageHeader
        eyebrow="Cameroon education sponsorship"
        title="A transparent operating system for orphan-focused education support."
        description="The public site will share programs, impact, applications, and donation pathways. Private beneficiary records stay behind authenticated staff and portal workflows."
        action={
          <a
            href="/en/staff"
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-semibold text-white hover:bg-foundation-900"
          >
            View scaffold <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: FileText, title: 'Application intake', body: 'Online, school, field officer, and NGO staff application sources.' },
          { icon: ShieldCheck, title: 'Safeguarded records', body: 'Child information is private, audited, and never exposed through public APIs.' },
          { icon: HeartHandshake, title: 'Traceable sponsorship', body: 'Donations flow into funds, allocations, educational needs, and school payments.' },
        ].map((item) => (
          <article key={item.title} className="rounded-md border border-ink-100 bg-white p-5 shadow-sm">
            <item.icon className="mb-4 h-6 w-6 text-foundation-600" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

