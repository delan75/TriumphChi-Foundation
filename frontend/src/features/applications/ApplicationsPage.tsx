import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

const rows = [
  ['APP-0001', 'Submitted', 'School submission', 'Centre Region'],
  ['APP-0002', 'Verification pending', 'Field officer', 'North West'],
  ['APP-0003', 'Review pending', 'Online', 'Littoral'],
];

export function ApplicationsPage() {
  return (
    <section>
      <PageHeader
        title="Applications"
        description="Scaffold for draft intake, verification notes, review decisions, supporting documents, and lifecycle status history."
      />
      <div className="overflow-hidden rounded-md border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-ink-50 text-ink-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Region</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map(([ref, status, source, region]) => (
              <tr key={ref}>
                <td className="px-4 py-4 font-medium text-ink-900">{ref}</td>
                <td className="px-4 py-4"><StatusBadge label={status} tone="warning" /></td>
                <td className="px-4 py-4 text-ink-500">{source}</td>
                <td className="px-4 py-4 text-ink-500">{region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

