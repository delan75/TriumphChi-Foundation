import { LucideIcon } from 'lucide-react';
import { cn } from '../ui/cn';

export interface ImpactSummaryItem {
  value: string;
  label: string;
}

interface ImpactSummaryGridProps {
  eyebrow: string;
  title: string;
  body: string;
  items: ImpactSummaryItem[];
  icons: LucideIcon[];
  usesFallback?: boolean;
  fallbackNote?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

export function ImpactSummaryGrid({
  eyebrow,
  title,
  body,
  items,
  icons,
  usesFallback = false,
  fallbackNote,
  variant = 'light',
  className,
}: ImpactSummaryGridProps) {
  const dark = variant === 'dark';

  return (
    <section className={cn(dark ? 'bg-ink-900 text-white' : 'bg-white', className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className={cn('text-sm font-black uppercase', dark ? 'text-foundation-100' : 'text-foundation-600')}>{eyebrow}</p>
          <h2 className={cn('mt-2 text-3xl font-black leading-tight sm:text-4xl', dark ? 'text-white' : 'text-ink-900')}>{title}</h2>
          <p className={cn('mt-3 text-base leading-7', dark ? 'text-ink-100' : 'text-ink-500')}>{body}</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = icons[index] ?? icons[icons.length - 1];

            return (
              <article
                key={item.label}
                className={cn(
                  'rounded-md border p-5',
                  dark ? 'border-white/10 bg-white/5' : 'border-foundation-100 bg-foundation-50',
                )}
              >
                <Icon className={cn('h-6 w-6', dark ? 'text-foundation-100' : 'text-foundation-600')} aria-hidden="true" />
                <p className={cn('mt-4 text-3xl font-black', dark ? 'text-white' : 'text-ink-900')}>{item.value}</p>
                <p className={cn('mt-1 text-sm font-bold leading-6', dark ? 'text-ink-100' : 'text-ink-500')}>{item.label}</p>
              </article>
            );
          })}
        </div>

        {usesFallback && fallbackNote ? <p className={cn('mt-4 text-sm font-bold', dark ? 'text-ink-200' : 'text-ink-500')}>{fallbackNote}</p> : null}
      </div>
    </section>
  );
}
