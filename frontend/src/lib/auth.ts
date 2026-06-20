import { Locale } from './i18n';

const AUTH_STORAGE_KEYS = ['triumphchi.authenticated', 'triumphchi.user', 'auth_token', 'token'] as const;
const AUTH_TOKEN_KEYS = ['auth_token', 'token'] as const;

function base64UrlDecode(input: string): string | null {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    if (typeof atob === 'function') {
      return atob(padded);
    }
    return null;
  } catch {
    return null;
  }
}

function isUnexpiredJwt(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const payloadRaw = base64UrlDecode(parts[1]);
  if (!payloadRaw) {
    return false;
  }

  try {
    const payload = JSON.parse(payloadRaw) as { exp?: unknown };
    if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
      return false;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowInSeconds;
  } catch {
    return false;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return AUTH_TOKEN_KEYS.some((key) => {
      const token = window.localStorage.getItem(key);
      return typeof token === 'string' && token.length > 0 && isUnexpiredJwt(token);
    });
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
      // Absolute URL with a scheme (http:, https:, etc.) should be rejected.
      const parsed = new URL(candidate);
      if (parsed.protocol) {
        return null;
      }
    } catch {
      // Relative URLs throw here; they are handled by normalization below.
    }
  }

  const normalized = (slashNormalized.startsWith('/') ? slashNormalized : `/${slashNormalized}`).replace(/\/{2,}/g, '/');

  return normalized;
}
