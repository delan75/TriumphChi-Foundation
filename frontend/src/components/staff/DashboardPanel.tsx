import type { ReactNode } from 'react';
import { cn } from '../ui/cn';

interface DashboardPanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function DashboardPanel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: DashboardPanelProps) {
  return (
    <section className={cn('rounded-md border border-ink-100 bg-white shadow-xs', className)}>
      <header className="flex flex-col gap-3 border-b border-ink-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-ink-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={cn('px-5 py-5', bodyClassName)}>{children}</div>
    </section>
  );
}
