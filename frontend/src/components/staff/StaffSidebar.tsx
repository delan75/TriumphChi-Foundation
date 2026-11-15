import { NavLink } from 'react-router-dom';
import type { Locale } from '../../lib/i18n';
import type { AuthUser } from '../../lib/api';
import { staffNavigation } from '../../content/staffNavigation';
import { cn } from '../ui/cn';

interface StaffSidebarProps {
  locale: Locale;
  user: AuthUser | null;
  labels: {
    overview: string;
    operations: string;
    account: string;
    dashboard: string;
    applications: string;
    beneficiaries: string;
    funding: string;
    contacts: string;
    blog: string;
    reports: string;
    users: string;
    profile: string;
    settings: string;
  };
  onNavigate?: () => void;
}

export function StaffSidebar({ locale, user, labels, onNavigate }: StaffSidebarProps) {
  const permissions = user?.permissions ?? [];
  const groups = {
    overview: labels.overview,
    operations: labels.operations,
    account: labels.account,
  } as const;

  return (
    <nav className="space-y-5" aria-label="Staff navigation">
      {Object.entries(groups).map(([groupKey, groupLabel]) => {
        const items = staffNavigation.filter(
          (item) =>
            item.group === groupKey && (!item.permission || permissions.includes(item.permission)),
        );

        if (!items.length) {
          return null;
        }

        return (
          <section key={groupKey}>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-normal text-ink-500">
              {groupLabel}
            </p>
            <div className="space-y-1">
              {items.map((item) => (
                <NavLink
                  key={item.key}
                  to={`/${locale}${item.path}`}
                  end={item.path === '/staff'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'focus-ring flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-foundation-50 text-foundation-900'
                        : 'text-ink-700 hover:bg-ink-50 hover:text-ink-900',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  <span>{labels[item.key]}</span>
                </NavLink>
              ))}
            </div>
          </section>
        );
      })}
    </nav>
  );
}
