import { CalendarClock, Download, FileCheck2 } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { ReportsCopy, SavedReport, ScheduledReport } from '../reportsContent';

export function SavedReportsPanel({
  copy,
  reports,
  onDownload,
}: {
  copy: ReportsCopy;
  reports: SavedReport[];
  onDownload: (label: string) => void;
}) {
  return (
    <div className="grid gap-3">
      {reports.map((report) => (
        <article key={report.title} className="rounded-md border border-ink-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <FileCheck2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <StatusBadge label={report.status} tone={report.status.toLowerCase().includes('draft') ? 'warning' : 'success'} />
          </div>
          <h3 className="mt-4 text-sm font-black text-ink-950">{report.title}</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            <Line label={copy.table.lastGenerated} value={report.generatedAt} />
            <Line label="Owner" value={report.owner} />
            <Line label={copy.table.format} value={report.format} />
          </dl>
          <button
            type="button"
            onClick={() => onDownload(report.title)}
            className="focus-ring mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-ink-200 px-3 text-sm font-black text-ink-700 transition hover:bg-ink-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {copy.actions.download}
          </button>
        </article>
      ))}
    </div>
  );
}

export function ScheduledReportsPanel({ reports }: { reports: ScheduledReport[] }) {
  return (
    <div className="grid gap-3">
      {reports.map((report) => (
        <article key={report.title} className="rounded-md border border-ink-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-ink-950">{report.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{report.cadence}</p>
            </div>
          </div>
          <dl className="mt-4 grid gap-2 text-sm">
            <Line label="Recipient" value={report.recipient} />
            <Line label="Next run" value={report.nextRun} />
          </dl>
        </article>
      ))}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right font-bold text-ink-900">{value}</dd>
    </div>
  );
}
