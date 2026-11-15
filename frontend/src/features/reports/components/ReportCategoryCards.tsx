import {
  BarChart3,
  Building2,
  ClipboardList,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Landmark,
  School,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../../components/ui/cn';
import type { ReportCategory, ReportCategoryKey, ReportsCopy } from '../reportsContent';

type IconCategoryKey = Exclude<ReportCategoryKey, 'all'>;

const icons: Record<IconCategoryKey, LucideIcon> = {
  applications: ClipboardList,
  beneficiaries: GraduationCap,
  schools: School,
  donations: HeartHandshake,
  sponsorships: Users,
  funding: HandCoins,
  payments: Landmark,
  impact: BarChart3,
  operations: Building2,
};

export function ReportCategoryCards({
  copy,
  categories,
  activeCategory,
  onSelect,
}: {
  copy: ReportsCopy;
  categories: ReportCategory[];
  activeCategory: ReportCategoryKey;
  onSelect: (category: ReportCategoryKey) => void;
}) {
  if (!categories.length) {
    return null;
  }

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={cn(
          'focus-ring rounded-md border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-xs',
          activeCategory === 'all'
            ? 'border-foundation-200 bg-foundation-50'
            : 'border-ink-100 bg-white hover:border-foundation-100',
        )}
      >
        <p className="text-xs font-bold uppercase text-ink-400">{copy.filters.all}</p>
        <p className="mt-2 text-3xl font-black text-ink-950">
          {categories.reduce((total, category) => total + category.available, 0)}
        </p>
        <p className="mt-1 text-sm font-semibold text-ink-600">{copy.sections.summary}</p>
      </button>

      {categories.map((category) => {
        const Icon = icons[category.key as IconCategoryKey];

        return (
          <button
            type="button"
            key={category.key}
            onClick={() => onSelect(category.key)}
            className={cn(
              'focus-ring rounded-md border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-xs',
              activeCategory === category.key
                ? 'border-foundation-200 bg-foundation-50'
                : 'border-ink-100 bg-white hover:border-foundation-100',
            )}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-foundation-600 text-white">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-ink-950">{category.label}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-500">
                  {category.description}
                </p>
              </div>
              <p className="shrink-0 text-2xl font-black text-ink-950">{category.available}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
