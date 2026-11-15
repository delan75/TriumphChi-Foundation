import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { Locale } from '../../../lib/i18n';
import type { OperationalInsight, ReportsCopy } from '../reportsContent';

export function OperationalInsights({
  copy,
  insights,
  locale,
}: {
  copy: ReportsCopy;
  insights: OperationalInsight[];
  locale: Locale;
}) {
  if (!insights.length) {
    return <p className="text-sm text-ink-500">{copy.table.empty}</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {insights.map((insight) => (
        <Link
          key={insight.key}
          to={`/${locale}${insight.path}`}
          className="focus-ring group rounded-md border border-ink-100 bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:border-foundation-100 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <StatusBadge label={insight.value} tone={insight.tone} />
            <ArrowUpRight
              className="h-4 w-4 text-ink-400 transition group-hover:text-foundation-700"
              aria-hidden="true"
            />
          </div>
          <p className="mt-4 text-sm font-black leading-6 text-ink-900">{insight.label}</p>
        </Link>
      ))}
    </div>
  );
}
