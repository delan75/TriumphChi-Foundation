import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Locale } from '../../lib/i18n';
import type { DashboardSummaryResponse } from '../../lib/api';

interface StaffNotificationsMenuProps {
  locale: Locale;
  summary?: DashboardSummaryResponse;
  labels: {
    title: string;
    empty: string;
    openDashboard: string;
  };
}

export function StaffNotificationsMenu({ locale, summary, labels }: StaffNotificationsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const notifications = useMemo(
    () =>
      (summary?.priority_queues ?? [])
        .flatMap((queue) =>
          queue.items.map((item) => ({
            queueKey: queue.key,
            queuePath: queue.path,
            ...item,
          })),
        )
        .slice(0, 5),
    [summary],
  );

  const notificationCount = notifications.length;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="focus-ring relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-ink-100 bg-white text-ink-700 transition hover:bg-ink-50"
        aria-label={labels.title}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {notificationCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foundation-600 px-1 text-[10px] font-bold text-white">
            {notificationCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-md border border-ink-100 bg-white shadow-xl">
          <div className="border-b border-ink-100 px-4 py-4">
            <p className="text-sm font-semibold text-ink-900">{labels.title}</p>
          </div>
          {notifications.length ? (
            <div className="divide-y divide-ink-100">
              {notifications.map((item) => (
                <button
                  key={`${item.queueKey}-${item.id}`}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate(`/${locale}${item.queuePath}`);
                  }}
                  className="focus-ring flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition hover:bg-foundation-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                    <p className="mt-1 text-sm text-ink-500">{item.status_label}</p>
                  </div>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-5 text-sm text-ink-500">{labels.empty}</div>
          )}
          <div className="border-t border-ink-100 p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(`/${locale}/staff`);
              }}
              className="focus-ring flex min-h-11 w-full items-center justify-between rounded-md px-3 text-sm font-medium text-foundation-700 transition hover:bg-foundation-50 hover:text-foundation-900"
            >
              {labels.openDashboard}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
