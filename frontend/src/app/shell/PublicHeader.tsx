import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Globe2, HeartHandshake, Menu, ShieldCheck, UserRound, X } from 'lucide-react';
import { cn } from '../../components/ui/cn';
import { publicNavigation, publicPages } from '../../content/publicPages';
import { isLocale, Locale, t } from '../../lib/i18n';

interface PublicHeaderProps {
  locale: Locale;
}

export function PublicHeader({ locale }: PublicHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const donatePath = `/${locale}${publicPages.find((page) => page.key === 'donate')?.path[locale] ?? '/donate'}`;
  const accountPath = `/${locale}/staff`;
  const isAuthenticated = readPublicAuthState();
  const accountLabel = t(locale, isAuthenticated ? 'account' : 'login');

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/[0.92] shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <NavLink to={`/${locale}`} className="focus-ring flex min-h-11 min-w-0 items-center gap-3 rounded-md pr-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foundation-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-foundation-900">{t(locale, 'appName')}</span>
            <span className="block truncate text-xs text-ink-500">{t(locale, 'operationsSubtitle')}</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {publicNavigation
            .filter((item) => !['apply', 'donate'].includes(item.key))
            .map((item) => (
              <NavLink
                key={item.key}
                to={`/${locale}${item.path[locale]}`}
                end={item.key === 'home'}
                className={({ isActive }) =>
                  cn(
                    'focus-ring flex min-h-11 items-center rounded-md px-3 text-sm font-semibold transition duration-200',
                    isActive ? 'bg-foundation-50 text-foundation-900' : 'text-ink-700 hover:bg-ink-50 hover:text-foundation-900',
                  )
                }
              >
                {item.label[locale]}
              </NavLink>
            ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LocaleSwitcher locale={locale} currentPath={location.pathname} />
          <NavLink
            to={accountPath}
            className={cn(
              'focus-ring inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition duration-200',
              isAuthenticated
                ? 'border-foundation-600 bg-foundation-600 text-white hover:bg-foundation-900'
                : 'border-ink-100 bg-white text-foundation-700 hover:border-foundation-100 hover:bg-foundation-50 hover:text-foundation-900',
            )}
            aria-label={accountLabel}
            title={accountLabel}
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">{accountLabel}</span>
          </NavLink>
          <NavLink
            to={donatePath}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-3 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-foundation-900 sm:px-4"
          >
            <HeartHandshake className="h-4 w-4" aria-hidden="true" />
            <span>{t(locale, 'donate')}</span>
          </NavLink>
          <button
            type="button"
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-ink-100 bg-white text-ink-900 transition hover:bg-ink-50 lg:hidden"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'mobile-menu border-t border-ink-100 bg-white px-4 pb-4 pt-2 shadow-xl lg:hidden',
          isOpen ? 'mobile-menu-open' : 'mobile-menu-closed',
        )}
      >
        <nav className="grid gap-2" aria-label="Mobile navigation">
          <NavLink
            to={accountPath}
            onClick={() => setIsOpen(false)}
            className={cn(
              'focus-ring flex min-h-12 items-center gap-3 rounded-md border px-3 text-base font-bold transition',
              isAuthenticated
                ? 'border-foundation-600 bg-foundation-600 text-white hover:bg-foundation-900'
                : 'border-foundation-100 bg-white text-foundation-900 hover:bg-foundation-50',
            )}
          >
            <UserRound className="h-5 w-5" aria-hidden="true" />
            {accountLabel}
          </NavLink>
          {publicNavigation.map((item) => (
            <NavLink
              key={item.key}
              to={`/${locale}${item.path[locale]}`}
              end={item.key === 'home'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  'focus-ring flex min-h-12 items-center justify-between rounded-md px-3 text-base font-semibold transition',
                  isActive ? 'bg-foundation-50 text-foundation-900' : 'text-ink-700 hover:bg-ink-50 hover:text-foundation-900',
                )
              }
            >
              {item.label[locale]}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function LocaleSwitcher({ locale, currentPath }: { locale: Locale; currentPath: string }) {
  return (
    <label className="focus-within:shadow-focus relative flex min-h-11 items-center rounded-md border border-ink-100 bg-white pl-3 pr-8 text-xs font-black text-ink-700 transition hover:border-foundation-100 hover:bg-foundation-50">
      <span className="sr-only">Language selector</span>
      <Globe2 className="mr-2 h-4 w-4 text-foundation-600" aria-hidden="true" />
      <select
        value={locale}
        onChange={(event) => {
          window.location.href = localizedHref(currentPath, locale, event.target.value as Locale);
        }}
        className="h-10 appearance-none bg-transparent text-xs font-black uppercase outline-none"
        aria-label="Language selector"
      >
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-ink-500" aria-hidden="true" />
    </label>
  );
}

function localizedHref(currentPath: string, currentLocale: Locale, targetLocale: Locale) {
  const [, maybeLocale, ...rest] = currentPath.split('/');

  if (!isLocale(maybeLocale)) {
    return `/${targetLocale}`;
  }

  const normalizedPublicPath = `/${rest.join('/')}`.replace(/\/$/, '') || '/';
  const page = publicPages.find((candidate) => candidate.path[currentLocale] === normalizedPublicPath);

  if (page) {
    return `/${targetLocale}${page.path[targetLocale]}`;
  }

  return `/${targetLocale}/${rest.join('/')}`.replace(/\/$/, '');
}

function readPublicAuthState() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return [
      'triumphchi.authenticated',
      'triumphchi.user',
      'auth_token',
      'token',
    ].some((key) => Boolean(window.localStorage.getItem(key)));
  } catch {
    return false;
  }
}
