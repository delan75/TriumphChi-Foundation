import { Locale } from './i18n';

const AUTH_STORAGE_KEYS = ['triumphchi.authenticated', 'triumphchi.user', 'auth_token', 'token'] as const;

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return AUTH_STORAGE_KEYS.some((key) => Boolean(window.localStorage.getItem(key)));
  } catch {
    return false;
  }
}

export function buildAuthPath(locale: Locale, page: 'login' | 'register' | 'forgot-password' | 'reset-password', redirectTo?: string | null): string {
  const query = sanitizeRedirectTo(redirectTo);
  return query ? `/${locale}/${page}?redirectTo=${encodeURIComponent(query)}` : `/${locale}/${page}`;
}

export function resolvePostAuthPath(locale: Locale, redirectTo?: string | null): string {
  const sanitized = sanitizeRedirectTo(redirectTo);

  if (!sanitized) {
    return `/${locale}/staff`;
  }

  const authPagePrefixes = [
    `/${locale}/login`,
    `/${locale}/register`,
    `/${locale}/forgot-password`,
    `/${locale}/reset-password`,
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];

  if (authPagePrefixes.some((prefix) => sanitized.startsWith(prefix))) {
    return `/${locale}/staff`;
  }

  return sanitized;
}

export function sanitizeRedirectTo(redirectTo?: string | null): string | null {
  if (!redirectTo) {
    return null;
  }

  const trimmed = redirectTo.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  const slashNormalized = trimmed.replace(/\\/g, '/');

  // Reject scheme-relative external/network-path redirects after normalization.
  if (/^\/\//.test(slashNormalized)) {
    return null;
  }

  const normalized = (slashNormalized.startsWith('/') ? slashNormalized : `/${slashNormalized}`).replace(/\/{2,}/g, '/');

  return normalized;
}
