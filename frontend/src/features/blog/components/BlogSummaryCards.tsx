import { Archive, ClipboardList, FileText, Send, Sparkles } from 'lucide-react';
import { cn } from '../../../components/ui/cn';
import type { BlogPostSummary } from '../../../lib/api';
import type { BlogCopy } from '../blogContent';

interface BlogSummaryCardsProps {
  summary?: BlogPostSummary;
  copy: BlogCopy;
}

const cardConfig = [
  { key: 'total', icon: FileText, tone: 'bg-ink-900 text-white' },
  { key: 'draft', icon: ClipboardList, tone: 'bg-blue-50 text-blue-800' },
  { key: 'review', icon: Send, tone: 'bg-amber-50 text-amber-800' },
  { key: 'published', icon: Sparkles, tone: 'bg-emerald-50 text-emerald-800' },
  { key: 'archived', icon: Archive, tone: 'bg-ink-50 text-ink-700' },
] as const;

export function BlogSummaryCards({ summary, copy }: BlogSummaryCardsProps) {
  const values = {
    total: summary?.total_count ?? 0,
    draft: summary?.draft_count ?? 0,
    review: summary?.review_count ?? 0,
    published: summary?.published_count ?? 0,
    archived: summary?.archived_count ?? 0,
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cardConfig.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className={cn('rounded-md border border-ink-100 p-4 shadow-xs', card.tone)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase opacity-75">{copy.summary[card.key]}</p>
                <p className="mt-2 text-3xl font-black leading-none">{values[card.key]}</p>
              </div>
              <Icon className="h-5 w-5 opacity-75" aria-hidden="true" />
            </div>
          </article>
        );
      })}
    </div>
  );
}
