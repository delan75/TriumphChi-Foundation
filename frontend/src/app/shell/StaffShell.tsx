import { Menu, ShieldCheck, X } from 'lucide-react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { LocaleSelector } from '../../components/ui/LocaleSelector';
import { readStoredAuthUser } from '../../lib/auth';
import { isLocale } from '../../lib/i18n';
import { staffWorkspaceContent } from '../../content/staffWorkspace';
import { StaffCommandSearch } from '../../components/staff/StaffCommandSearch';
import { StaffNotificationsMenu } from '../../components/staff/StaffNotificationsMenu';
import { StaffSidebar } from '../../components/staff/StaffSidebar';
import { StaffUserMenu } from '../../components/staff/StaffUserMenu';
import { useDashboardSummary } from '../../features/staff/useDashboardSummary';
import { useState } from 'react';
import { cn } from '../../components/ui/cn';
import { Seo } from '../../components/seo/Seo';

export function StaffShell() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = staffWorkspaceContent[activeLocale];
  const user = readStoredAuthUser();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const summaryQuery = useDashboardSummary();

  return (
    <>
      <Seo
        meta={{
          title: copy.shell.workspaceLabel,
          description: 'Authenticated workspace for TriumphChi Foundation staff.',
          path: { en: '/staff', fr: '/staff' },
          locale: activeLocale,
          noIndex: true,
        }}
      />
      <div className="min-h-dvh bg-ink-50 text-ink-900">
        <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-ink-100 bg-white text-ink-700 transition hover:bg-ink-50 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="flex min-w-0 items-center gap-3 lg:w-72">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foundation-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foundation-900">TriumphChi Foundation</p>
              <p className="truncate text-xs text-ink-500">{copy.shell.workspaceLabel}</p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 justify-center">
            <StaffCommandSearch
              locale={activeLocale}
              placeholder={copy.shell.searchPlaceholder}
              emptyText={copy.shell.searchEmpty}
              shortQueryText={copy.shell.searchTooShort}
              recentLabel={copy.shell.searchRecent}
              recentEmpty={copy.shell.searchRecentEmpty}
              openWorkspaceLabel={copy.shell.searchOpenWorkspace}
              clearLabel={copy.shell.searchClear}
              resultLabels={copy.shell.searchResults}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <LocaleSelector locale={activeLocale} currentPath={`${location.pathname}${location.search}`} />
            <StaffNotificationsMenu
              locale={activeLocale}
              summary={summaryQuery.data}
              labels={{
                title: copy.shell.notifications,
                empty: copy.shell.notificationsEmpty,
                openDashboard: copy.shell.notificationsOpenDashboard,
              }}
            />
            <StaffUserMenu locale={activeLocale} user={user} labels={copy.shell.userMenu} />
          </div>
        </div>
        </header>

        <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-md border border-ink-100 bg-white p-4 shadow-xs">
              <StaffSidebar locale={activeLocale} user={user} labels={copy.shell.nav} />
            </div>
          </aside>

          <main id="main-content" className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>

        <div
          className={cn(
            'fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-xs transition lg:hidden',
            mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <div className="absolute inset-0" aria-hidden="true" onClick={() => setMobileOpen(false)} />
          <div
            className={cn(
              'absolute left-0 top-0 h-full w-[88vw] max-w-sm bg-white shadow-2xl transition duration-200',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            <div className="flex min-h-16 items-center justify-between border-b border-ink-100 px-4">
              <div>
                <p className="text-sm font-semibold text-foundation-900">TriumphChi Foundation</p>
                <p className="text-xs text-ink-500">{copy.shell.workspaceLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-ink-100 bg-white text-ink-700 transition hover:bg-ink-50"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-4">
              <StaffSidebar locale={activeLocale} user={user} labels={copy.shell.nav} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
