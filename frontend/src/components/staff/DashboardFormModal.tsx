import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cn } from '../ui/cn';

interface DashboardFormModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  size?: 'md' | 'lg' | 'xl';
  closeLabel?: string;
  children: ReactNode;
  onClose: () => void;
}

const sizes = {
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export function DashboardFormModal({
  isOpen,
  title,
  description,
  size = 'lg',
  closeLabel = 'Close',
  children,
  onClose,
}: DashboardFormModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/55 px-4 py-6 backdrop-blur-sm sm:px-6" role="dialog" aria-modal="true" aria-labelledby="dashboard-form-modal-title">
      <div className={cn('mx-auto min-h-full w-full', sizes[size])}>
        <div className="flex min-h-full items-start justify-center">
          <section className="w-full overflow-hidden rounded-md border border-white/20 bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
              <div className="min-w-0">
                <h2 id="dashboard-form-modal-title" className="text-lg font-black text-ink-950">
                  {title}
                </h2>
                {description ? <p className="mt-1 text-sm leading-6 text-ink-500">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-50 hover:text-ink-950"
                aria-label={closeLabel}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>
            <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto px-5 py-5">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
