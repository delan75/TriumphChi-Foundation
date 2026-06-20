import { defaultLocale, isLocale, Locale } from './i18n';

const LOCALE_STORAGE_KEY = 'triumphchi.locale';
const LOCALE_COOKIE_NAME = 'locale';

export interface LocaleRecoveryResult {
  locale: Locale;
  source: 'url' | 'user-profile' | 'local-storage' | 'cookie' | 'session-storage' | 'browser' | 'default';
}

export function resolveLocale(pathname: string): LocaleRecoveryResult {
  // Check if pathname already has locale
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  
  if (firstSegment && isLocale(firstSegment)) {
    return { locale: firstSegment, source: 'url' };
  }

  // Try user profile (for authenticated users)
  const userLocale = getUserProfileLocale();
  if (userLocale) {
    return { locale: userLocale, source: 'user-profile' };
  }

  // Try stored locale preference
  const storedLocale = getStoredLocale();
  if (storedLocale) {
    return { locale: storedLocale, source: 'local-storage' };
  }

  // Try cookie
  const cookieLocale = getCookieLocale();
  if (cookieLocale) {
    return { locale: cookieLocale, source: 'cookie' };
  }

  const sessionLocale = getSessionLocale();
  if (sessionLocale) {
    return { locale: sessionLocale, source: 'session-storage' };
  }

  // Try browser language
  const browserLocale = getBrowserLocale();
  if (browserLocale) {
    return { locale: browserLocale, source: 'browser' };
  }

  // Fallback to default
  return { locale: defaultLocale, source: 'default' };
}

export function buildLocalizedPath(pathname: string, search: string, hash: string, locale: Locale): string {
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  // Remove existing locale if present
  if (firstSegment && isLocale(firstSegment)) {
    pathSegments.shift();
  }

  // Build new path
  const newPath = `/${locale}${pathSegments.length ? '/' + pathSegments.join('/') : ''}`;
  return `${newPath}${search}${hash}`;
}

export function storeLocalePreference(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    sessionStorage.setItem(LOCALE_STORAGE_KEY, locale);
    setCookie(LOCALE_COOKIE_NAME, locale, 365);
  } catch {
    // Silent fail
  }
}

function getUserProfileLocale(): Locale | null {
  try {
    const userStr = localStorage.getItem('triumphchi.user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    if (user?.preferred_locale && isLocale(user.preferred_locale)) {
      return user.preferred_locale;
    }

    if (user?.locale && isLocale(user.locale)) {
      return user.locale;
    }
  } catch {
    // Silent fail
  }
  return null;
}

function getStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isLocale(stored)) {
      return stored;
    }
  } catch {
    // Silent fail
  }
  return null;
}

function getCookieLocale(): Locale | null {
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === LOCALE_COOKIE_NAME && isLocale(value)) {
        return value;
      }
    }
  } catch {
    // Silent fail
  }
  return null;
}

function getSessionLocale(): Locale | null {
  try {
    const stored = sessionStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isLocale(stored)) {
      return stored;
    }
  } catch {
    // Silent fail
  }
  return null;
}

function getBrowserLocale(): Locale | null {
  try {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (!browserLang) return null;

    const langCode = browserLang.split('-')[0].toLowerCase();
    if (isLocale(langCode)) {
      return langCode;
    }

    // Check for French variants
    if (browserLang.toLowerCase().startsWith('fr')) {
      return 'fr';
    }
  } catch {
    // Silent fail
  }
  return null;
}

function setCookie(name: string, value: string, days: number): void {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const secureAttr = window.location.protocol === 'https:' ? ';Secure' : '';
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureAttr}`;
  } catch {
    // Silent fail
  }
}
