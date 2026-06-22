import React from 'react';
import { cn } from './cn';

interface StatusPillProps {
  label: string;
  status?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'info';
}

export function StatusPill({ label, status, tone = 'neutral' }: StatusPillProps) {
  // If status string is provided, try to infer the tone automatically
  let effectiveTone = tone;
  if (status) {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'verified':
      case 'success':
        effectiveTone = 'success';
        break;
      case 'rejected':
      case 'error':
        effectiveTone = 'warning'; // or red/danger
        break;
      case 'submitted':
      case 'pending':
        effectiveTone = 'info';
        break;
      default:
        effectiveTone = 'neutral';
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-bold leading-none',
        effectiveTone === 'neutral' && 'bg-ink-100 text-ink-600',
        effectiveTone === 'success' && 'bg-emerald-100 text-emerald-800',
        effectiveTone === 'warning' && 'bg-amber-100 text-amber-800',
        effectiveTone === 'info' && 'bg-blue-100 text-blue-800',
      )}
    >
      {effectiveTone === 'success' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {effectiveTone === 'warning' && <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
      {effectiveTone === 'info' && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
      {label}
    </span>
  );
}
