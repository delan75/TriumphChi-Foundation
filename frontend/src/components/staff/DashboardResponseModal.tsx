import { CheckCircle2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface DashboardResponseModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  durationMs?: number;
  closeLabel?: string;
  countdownLabel?: string;
  pausedLabel?: string;
  onClose: () => void;
}

export function DashboardResponseModal({
  isOpen,
  title,
  message,
  durationMs = 6500,
  closeLabel = 'Close',
  countdownLabel = 'Closing in',
  pausedLabel = 'Paused',
  onClose,
}: DashboardResponseModalProps) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setRemainingMs(durationMs);
    setIsPaused(false);
  }, [durationMs, isOpen, message, title]);

  useEffect(() => {
    if (!isOpen || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingMs((current) => Math.max(current - 100, 0));
    }, 100);

    return () => window.clearInterval(interval);
  }, [isOpen, isPaused]);

  useEffect(() => {
    if (isOpen && remainingMs <= 0) {
      onClose();
    }
  }, [isOpen, onClose, remainingMs]);

  const progress = useMemo(() => {
    if (!durationMs) {
      return 0;
    }

    return Math.max(0, Math.min(100, (remainingMs / durationMs) * 100));
  }, [durationMs, remainingMs]);

  if (!isOpen) {
    return null;
  }

  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md sm:inset-x-auto sm:right-6 sm:mx-0"
      role="dialog"
      aria-modal="false"
      aria-live="polite"
      aria-labelledby="dashboard-response-title"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="overflow-hidden rounded-md border border-emerald-100 bg-white shadow-2xl ring-1 ring-ink-900/5">
        <div className="flex items-start gap-3 p-4">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="dashboard-response-title" className="text-sm font-black text-ink-950">
              {title}
            </h2>
            <p className="mt-1 wrap-break-word text-sm leading-6 text-ink-600">{message}</p>
            <p className="mt-3 text-xs font-bold uppercase text-ink-400">
              {isPaused ? pausedLabel : `${countdownLabel} ${remainingSeconds}s`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="h-1 bg-ink-100" aria-hidden="true">
          <div className="h-full bg-emerald-500 transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
