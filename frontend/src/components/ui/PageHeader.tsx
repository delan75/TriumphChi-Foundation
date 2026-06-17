import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-ink-100 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-normal text-foundation-600">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold text-ink-900 md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-ink-500">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
    </div>
  );
}

