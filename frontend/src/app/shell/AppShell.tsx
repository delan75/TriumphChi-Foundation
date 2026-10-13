import { lazy, Suspense } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { isLocale, Locale } from '../../lib/i18n';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { PageLoading } from '../../components/ui/PageLoading';

const StaffShell = lazy(() => import('./StaffShell').then((module) => ({ default: module.StaffShell })));

export function AppShell() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith(`/${activeLocale}/staff`);

  if (!isStaffRoute) {
    return (
      <div className="min-h-dvh bg-ink-50 text-ink-900">
        <PublicHeader locale={activeLocale as Locale} />
        <main id="main-content" className="min-w-0">
          <Outlet />
        </main>
        <PublicFooter locale={activeLocale as Locale} />
      </div>
    );
  }

  return <Suspense fallback={<PageLoading />}><StaffShell /></Suspense>;
}

