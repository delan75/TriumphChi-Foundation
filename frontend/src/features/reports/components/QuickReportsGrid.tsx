import { ArrowRight, FileText } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { QuickReport, ReportsCopy } from '../reportsContent';

export function QuickReportsGrid({
  copy,
  reports,
  onGenerate,
}: {
  copy: ReportsCopy;
  reports: QuickReport[];
  onGenerate: (report: QuickReport) => void;
}) {
  if (!reports.length) {
    return <p className="text-sm text-ink-500">{copy.table.empty}</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {reports.map((report) => (
        <article
          key={report.key}
          className="group rounded-md border border-ink-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-foundation-100 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-ink-900 text-white">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <StatusBadge label={report.category} tone={report.severity} />
          </div>
          <h3 className="mt-4 text-base font-black text-ink-950">{report.title}</h3>
          <p className="mt-2 min-h-12 text-sm leading-6 text-ink-500">{report.description}</p>
          <button
            type="button"
            onClick={() => onGenerate(report)}
            className="focus-ring mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-black text-white transition hover:bg-foundation-900"
          >
            {copy.actions.generate}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </article>
      ))}
    </div>
  );
}
