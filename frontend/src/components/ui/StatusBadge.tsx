import { cn } from './cn';

interface StatusBadgeProps {
  label: string;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

const tones = {
  neutral: 'bg-ink-100 text-ink-700',
  info: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-700',
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex min-h-7 items-center rounded-md px-2.5 text-xs font-semibold', tones[tone])}>
      {label}
    </span>
  );
}

