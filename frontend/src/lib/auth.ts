import { Locale } from './i18n';
import type { AuthResponse, AuthUser } from './api';

const AUTH_TOKEN_KEYS = ['auth_token', 'token'] as const;
const AUTH_EXPIRES_AT_KEY = 'auth_token_expires_at';

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const hasToken = AUTH_TOKEN_KEYS.some((key) => {
      const token = window.localStorage.getItem(key);
      return typeof token === 'string' && token.length > 0;
    });

    if (!hasToken) {
      return false;
    }

    const expiresAt = window.localStorage.getItem(AUTH_EXPIRES_AT_KEY);

    if (!expiresAt) {
      return true;
    }

    const expiresAtTime = Date.parse(expiresAt);

    return Number.isFinite(expiresAtTime) && expiresAtTime > Date.now();
  } catch {
    return false;
  }
}

export function storeAuthSession(response: AuthResponse): boolean {
  if (typeof window === 'undefined' || !response.token?.access_token) {
    return false;
  }

  window.localStorage.setItem('triumphchi.authenticated', 'true');
  window.localStorage.setItem('triumphchi.user', JSON.stringify(response.user));
  window.localStorage.setItem('auth_token', response.token.access_token);

  if (response.token.expires_at) {
    window.localStorage.setItem(AUTH_EXPIRES_AT_KEY, response.token.expires_at);
  } else {
    window.localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  }

  return true;
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('triumphchi.authenticated');
  window.localStorage.removeItem('triumphchi.user');
  window.localStorage.removeItem('auth_token');
  window.localStorage.removeItem('token');
  window.localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
}

export function readStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const payload = window.localStorage.getItem('triumphchi.user');

    if (!payload) {
      return null;
    }

    const parsed = JSON.parse(payload) as AuthUser | null;

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function buildAuthPath(locale: Locale, page: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-account', redirectTo?: string | null): string {
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

  const slashNormalized = trimmed.replace(/\\/g, '/');

  // Reject absolute/protocol-relative URLs (including encoded forms) using URL parsing.
  const candidates = [slashNormalized];
  try {
    const decoded = decodeURIComponent(slashNormalized);
    if (decoded !== slashNormalized) {
      candidates.push(decoded.replace(/\\/g, '/'));
    }
  } catch {
    // Ignore malformed percent-encoding; continue with original input.
  }

  for (const candidate of candidates) {
    if (candidate.startsWith('//')) {
      return null;
    }

    try {
      // If parsing succeeds without a base URL, it's an absolute URL; reject it.
      new URL(candidate);
      return null;
    } catch {
      // Relative URLs throw here; they are handled by normalization below.
    }
  }

  const normalized = (slashNormalized.startsWith('/') ? slashNormalized : `/${slashNormalized}`).replace(/\/{2,}/g, '/');

  return isProtectedRedirectPath(normalized) ? normalized : null;
}

function isProtectedRedirectPath(path: string): boolean {
  return /^\/(en|fr)\/staff(\/|$)/.test(path) || /^\/staff(\/|$)/.test(path);
}
