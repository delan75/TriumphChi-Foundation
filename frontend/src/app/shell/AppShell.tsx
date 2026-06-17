import { Outlet, NavLink, useParams } from 'react-router-dom';
import { BarChart3, GraduationCap, HandCoins, Home, Inbox, ShieldCheck, UsersRound } from 'lucide-react';
import { isLocale, Locale, t } from '../../lib/i18n';
import { cn } from '../../components/ui/cn';
import { publicNavigation } from '../../content/publicPages';

const navItems = [
  { to: '', label: 'Home', icon: Home },
  { to: 'staff', label: 'Dashboard', icon: BarChart3 },
  { to: 'staff/applications', label: 'Applications', icon: Inbox },
  { to: 'staff/beneficiaries', label: 'Beneficiaries', icon: UsersRound },
  { to: 'staff/funding', label: 'Funding', icon: HandCoins },
  { to: 'staff/reports', label: 'Reports', icon: GraduationCap },
];

export function AppShell() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';

  return (
    <div className="min-h-dvh bg-ink-50 text-ink-900">
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-foundation-600 text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foundation-900">{t(activeLocale as Locale, 'appName')}</p>
              <p className="text-xs text-ink-500">{t(activeLocale as Locale, 'operationsSubtitle')}</p>
            </div>
          </div>
          <div className="flex min-h-11 items-center rounded-md border border-ink-100 bg-ink-50 p-1 text-sm">
            <a className={localeLinkClass(activeLocale === 'en')} href="/en">
              EN
            </a>
            <a className={localeLinkClass(activeLocale === 'fr')} href="/fr">
              FR
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <nav className="lg:sticky lg:top-24 lg:h-fit">
          <div className="mb-3 rounded-md border border-ink-100 bg-white p-2 shadow-sm">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-normal text-ink-500">Public</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {publicNavigation.map((item) => (
                <NavLink
                  key={item.key}
                  to={`/${activeLocale}${item.path[activeLocale]}`}
                  end={item.key === 'home'}
                  className={({ isActive }) =>
                    cn(
                      'focus-ring flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-foundation-50 text-foundation-900'
                        : 'text-ink-700 hover:bg-ink-50 hover:text-ink-900',
                    )
                  }
                >
                  {item.label[activeLocale]}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-md border border-ink-100 bg-white p-2 shadow-sm sm:grid-cols-3 lg:grid-cols-1">
            <p className="col-span-2 px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-normal text-ink-500 sm:col-span-3 lg:col-span-1">
              Operations
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={`/${activeLocale}/${item.to}`}
                end={item.to === '' || item.to === 'staff'}
                className={({ isActive }) =>
                  cn(
                    'focus-ring flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-foundation-50 text-foundation-900'
                      : 'text-ink-700 hover:bg-ink-50 hover:text-ink-900',
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <main id="main-content" className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function localeLinkClass(active: boolean) {
  return cn(
    'focus-ring flex min-h-9 min-w-11 items-center justify-center rounded px-3 font-semibold',
    active ? 'bg-white text-foundation-900 shadow-sm' : 'text-ink-500 hover:text-ink-900',
  );
}

