import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../ui/cn';

type WorkspaceTone = 'foundation' | 'blue' | 'amber' | 'ink';

interface WorkspaceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  footer: string;
  ctaLabel: string;
  lockedLabel: string;
  to: string;
  available: boolean;
  tone?: WorkspaceTone;
}

const toneClasses: Record<WorkspaceTone, { icon: string; badge: string; border: string }> = {
  foundation: {
    icon: 'bg-foundation-50 text-foundation-700',
    badge: 'bg-foundation-50 text-foundation-900',
    border: 'hover:border-foundation-100',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-700',
    badge: 'bg-blue-50 text-blue-700',
    border: 'hover:border-blue-100',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-700',
    badge: 'bg-amber-50 text-amber-800',
    border: 'hover:border-amber-100',
  },
  ink: {
    icon: 'bg-ink-50 text-ink-700',
    badge: 'bg-ink-100 text-ink-700',
    border: 'hover:border-ink-200',
  },
};

export function WorkspaceCard({
  icon: Icon,
  title,
  description,
  footer,
  ctaLabel,
  lockedLabel,
  to,
  available,
  tone = 'foundation',
}: WorkspaceCardProps) {
  const toneClass = toneClasses[tone];

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-md', toneClass.icon)}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span
          className={cn(
            'inline-flex min-h-7 items-center rounded-md px-2.5 text-xs font-semibold',
            toneClass.badge,
          )}
        >
          {available ? ctaLabel : lockedLabel}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-ink-500">{description}</p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <p className="text-xs font-medium uppercase tracking-normal text-ink-500">{footer}</p>
        <ArrowRight className="h-4 w-4 text-ink-400" aria-hidden="true" />
      </div>
    </>
  );

  if (!available) {
    return (
      <article className="rounded-md border border-ink-100 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5">
        <div className="opacity-80">{content}</div>
      </article>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        'focus-ring block rounded-md border border-ink-100 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5',
        toneClass.border,
      )}
    >
      {content}
    </Link>
  );
}
