import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HeartHandshake, Mail, Menu, Phone, ShieldCheck, UserRound, X } from 'lucide-react';
import { cn } from '../../components/ui/cn';
import { publicNavigation, publicPages } from '../../content/publicPages';
import { Locale, t } from '../../lib/i18n';
import { LocaleSelector } from '../../components/ui/LocaleSelector';
import { buildAuthPath, isAuthenticated } from '../../lib/auth';
import { publicContact } from '../../lib/publicContact';

interface PublicHeaderProps {
  locale: Locale;
}

export function PublicHeader({ locale }: PublicHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const donatePath = `/${locale}${publicPages.find((page) => page.key === 'donate')?.path[locale] ?? '/donate'}`;
  const authState = isAuthenticated() || readPublicAuthState();
  const requestedPath = `${location.pathname}${location.search}`;
  const accountPath = authState ? `/${locale}/staff` : buildAuthPath(locale, 'login', requestedPath);
  const accountLabel = t(locale, authState ? 'account' : 'login');

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isOpen]);

  return (
    <>
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-white/20 bg-white/92 shadow-xs backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <NavLink to={`/${locale}`} className="focus-ring flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-md sm:gap-3 xl:flex-none">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foundation-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold leading-tight text-foundation-900 sm:truncate">{t(locale, 'appName')}</span>
            <span className="hidden truncate text-xs text-ink-500 sm:block">{t(locale, 'operationsSubtitle')}</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
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
          <div className="hidden xl:block">
            <LocaleSelector locale={locale} currentPath={location.pathname} />
          </div>
          <NavLink
            to={accountPath}
            className={cn(
              'focus-ring hidden min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition duration-200 xl:inline-flex',
              authState
                ? 'border-foundation-600 bg-foundation-600 text-white hover:bg-foundation-900'
                : 'border-ink-100 bg-white text-foundation-700 hover:border-foundation-100 hover:bg-foundation-50 hover:text-foundation-900',
            )}
            aria-label={accountLabel}
            title={accountLabel}
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            <span className="hidden 2xl:inline">{accountLabel}</span>
          </NavLink>
          <NavLink
            to={donatePath}
            aria-label={t(locale, 'donate')}
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-foundation-600 px-3 text-sm font-bold text-white shadow-xs transition duration-200 hover:bg-foundation-900 sm:gap-2 sm:px-4"
          >
            <HeartHandshake className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t(locale, 'donate')}</span>
          </NavLink>
          <button
            type="button"
            ref={menuButtonRef}
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-ink-100 bg-white text-ink-900 transition hover:bg-ink-50 xl:hidden"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="public-mobile-navigation"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="public-mobile-navigation"
        hidden={!isOpen}
        className={cn('absolute inset-x-0 top-full max-h-[calc(100dvh-4rem-1px)] flex-col border-t border-ink-100 bg-white shadow-xl xl:hidden', isOpen ? 'flex' : 'hidden')}
      >
        <nav className="grid min-h-0 gap-2 overflow-y-auto overscroll-contain px-4 py-3" aria-label="Mobile navigation">
          <NavLink
            to={accountPath}
            onClick={() => setIsOpen(false)}
            className={cn(
              'focus-ring flex min-h-12 items-center gap-3 rounded-md border px-3 text-base font-bold transition',
              authState
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
        <section aria-label={locale === 'fr' ? 'Coordonnées' : 'Contact details'} className="shrink-0 border-t border-ink-100 bg-foundation-50 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <h2 className="text-xs font-bold uppercase tracking-wide text-foundation-900">{locale === 'fr' ? 'Nous contacter' : 'Contact us'}</h2>
          <address className="not-italic">
            <a href={publicContact.emailHref} className="focus-ring flex min-h-11 items-center gap-3 rounded-md text-sm font-semibold text-foundation-900">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-all">{publicContact.email}</span>
            </a>
            <a href={publicContact.phoneHref} className="focus-ring flex min-h-11 items-center gap-3 rounded-md text-sm font-semibold text-foundation-900">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{publicContact.phoneDisplay}</span>
            </a>
          </address>
        </section>
      </div>
    </header>
    <div hidden={isOpen} className="fixed z-40 rounded-md shadow-lg xl:hidden" style={{ right: 'max(1rem, env(safe-area-inset-right))', bottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <LocaleSelector locale={locale} currentPath={location.pathname} openAbove />
    </div>
    </>
  );
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
