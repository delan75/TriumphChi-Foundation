import { Download, Eye, FileSpreadsheet, FileText } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { ReportTemplate, ReportsCopy } from '../reportsContent';

export function ReportLibraryTable({
  copy,
  reports,
  onAction,
}: {
  copy: ReportsCopy;
  reports: ReportTemplate[];
  onAction: (label: string) => void;
}) {
  if (!reports.length) {
    return <p className="rounded-md border border-dashed border-ink-200 p-5 text-sm text-ink-500">{copy.table.empty}</p>;
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="min-w-[920px] w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="text-xs font-bold uppercase text-ink-400">
            <th className="border-b border-ink-100 px-3 py-3">{copy.table.report}</th>
            <th className="border-b border-ink-100 px-3 py-3">{copy.table.category}</th>
            <th className="border-b border-ink-100 px-3 py-3">{copy.table.lastGenerated}</th>
            <th className="border-b border-ink-100 px-3 py-3">{copy.table.format}</th>
            <th className="border-b border-ink-100 px-3 py-3 text-right">{copy.table.actions}</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.key} className="group">
              <td className="border-b border-ink-100 px-3 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-ink-50 text-foundation-700">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-ink-950">{report.name}</p>
                    <p className="mt-1 text-xs text-ink-500">{report.key}</p>
                  </div>
                </div>
              </td>
              <td className="border-b border-ink-100 px-3 py-4">
                <StatusBadge label={report.categoryLabel} tone="info" />
              </td>
              <td className="border-b border-ink-100 px-3 py-4 text-sm font-semibold text-ink-700">{report.lastGenerated}</td>
              <td className="border-b border-ink-100 px-3 py-4 text-sm font-black text-ink-900">{report.format}</td>
              <td className="border-b border-ink-100 px-3 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onAction(`${copy.actions.view}: ${report.name}`)}
                    className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-ink-200 px-3 text-xs font-black text-ink-700 transition hover:bg-ink-50"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    {copy.actions.view}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAction(`${report.format}: ${report.name}`)}
                    className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-foundation-600 px-3 text-xs font-black text-white transition hover:bg-foundation-900"
                  >
                    {report.format === 'Excel' ? <FileSpreadsheet className="h-4 w-4" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
                    {copy.actions.generate}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
