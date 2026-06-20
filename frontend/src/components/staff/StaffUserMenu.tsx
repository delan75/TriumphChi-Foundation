import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, MonitorX, Settings2, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Locale } from '../../lib/i18n';
import type { AuthUser } from '../../lib/api';
import { apiLogout, apiLogoutAll } from '../../lib/api';
import { clearAuthSession } from '../../lib/auth';
import { cn } from '../ui/cn';

interface StaffUserMenuProps {
  locale: Locale;
  user: AuthUser | null;
  labels: {
    profile: string;
    settings: string;
    logout: string;
    logoutAll: string;
    roleFallback: string;
  };
}

export function StaffUserMenu({ locale, user, labels }: StaffUserMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<'logout' | 'logout-all' | null>(null);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout(mode: 'logout' | 'logout-all') {
    try {
      setBusy(mode);

      if (mode === 'logout-all') {
        await apiLogoutAll();
      } else {
        await apiLogout();
      }
    } catch {
      // Ignore and still clear local state.
    } finally {
      clearAuthSession();
      navigate(`/${locale}/login`, { replace: true });
    }
  }

  const initials = extractInitials(user?.name);
  const primaryRole = user?.roles?.[0] ?? labels.roleFallback;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="focus-ring inline-flex min-h-11 items-center gap-3 rounded-md border border-ink-100 bg-white px-3 text-left transition hover:bg-ink-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid h-8 w-8 place-items-center rounded-md bg-foundation-600 text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden min-w-0 lg:block">
          <span className="block truncate text-sm font-semibold text-ink-900">{user?.name ?? labels.roleFallback}</span>
          <span className="block truncate text-xs text-ink-500">{primaryRole}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-md border border-ink-100 bg-white shadow-xl">
          <div className="border-b border-ink-100 px-4 py-4">
            <p className="text-sm font-semibold text-ink-900">{user?.name ?? labels.roleFallback}</p>
            <p className="mt-1 text-sm text-ink-500">{user?.email}</p>
          </div>

          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(`/${locale}/staff/profile`);
              }}
              className="focus-ring flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-ink-700 transition hover:bg-ink-50"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              {labels.profile}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(`/${locale}/staff/settings`);
              }}
              className="focus-ring flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-ink-700 transition hover:bg-ink-50"
            >
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              {labels.settings}
            </button>
          </div>

          <div className="border-t border-ink-100 p-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => handleLogout('logout')}
              className={menuActionClass(busy !== null)}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {busy === 'logout' ? '...' : labels.logout}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => handleLogout('logout-all')}
              className={menuActionClass(busy !== null)}
            >
              <MonitorX className="h-4 w-4" aria-hidden="true" />
              {busy === 'logout-all' ? '...' : labels.logoutAll}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function extractInitials(name?: string) {
  if (!name) {
    return 'TC';
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'TC';
}

function menuActionClass(disabled: boolean) {
  return cn(
    'focus-ring flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-ink-700 transition hover:bg-ink-50',
    disabled && 'cursor-not-allowed opacity-60',
  );
}
