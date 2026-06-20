const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  preferred_locale: string;
}

interface AuthResponse {
  token: TokenResponse;
  user: AuthUser;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  reason: string;
  subject?: string;
  message: string;
  consent: boolean;
  attachments?: File[];
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  return parseJsonResponse<T>(response, `API request failed with ${response.status}`);
}

export async function apiPublicGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'omit',
  });

  return parseJsonResponse<T>(response, `API request failed with ${response.status}`);
}

export async function apiLogin(email: string, password: string, deviceName?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }, false),
    credentials: 'omit',
    body: JSON.stringify({
      email,
      password,
      device_name: deviceName || 'web-client',
    }),
  });

  return parseJsonResponse<AuthResponse>(response, `Login failed with ${response.status}`);
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  preferredLocale?: string,
  deviceName?: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }, false),
    credentials: 'omit',
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      preferred_locale: preferredLocale || 'en',
      device_name: deviceName || 'web-client',
    }),
  });

  return parseJsonResponse<AuthResponse>(response, `Registration failed with ${response.status}`);
}

export async function apiGetCurrentUser(): Promise<AuthUser> {
  return apiGet('/auth/me');
}

export async function apiForgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }, false),
    credentials: 'omit',
    body: JSON.stringify({ email }),
  });

  const data = await parseJsonEnvelope(response, 'Failed to send reset link. Please try again.');

  return {
    message: String(data.message ?? 'If your email exists in our database, you will receive a reset link shortly.'),
  };
}

export async function apiResetPassword(
  token: string,
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }, false),
    credentials: 'omit',
    body: JSON.stringify({
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });

  const data = await parseJsonEnvelope(response, 'Failed to reset password. The link may have expired.');

  return {
    message: String(data.message ?? 'Password reset successfully.'),
  };
}

export async function apiSubmitContactMessage(
  payload: ContactMessagePayload,
  locale: string,
): Promise<{ message: string }> {
  const body = new FormData();

  body.append('name', payload.name);
  body.append('email', payload.email);
  body.append('reason', payload.reason);
  body.append('message', payload.message);
  body.append('consent', payload.consent ? '1' : '0');

  if (payload.phone) {
    body.append('phone', payload.phone);
  }

  if (payload.subject) {
    body.append('subject', payload.subject);
  }

  payload.attachments?.forEach((file) => {
    body.append('attachments[]', file);
  });

  const response = await fetch(`${API_BASE_URL}/public/contact-messages`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': locale,
    },
    credentials: 'omit',
    body,
  });

  const data = await parseJsonEnvelope(response, 'We could not send your message. Please try again.');

  return {
    message: String(data.message ?? 'Thank you for contacting us. We will respond as soon as possible.'),
  };
}

export async function apiLogout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
  });
}

export async function apiLogoutAll(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout-all`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
  });
}

function buildHeaders(extraHeaders: Record<string, string> = {}, includeToken = true): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...extraHeaders,
  };

  const token = includeToken ? readAuthToken() : null;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function readAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const envelope = await parseJsonEnvelope(response, fallbackMessage);

  if (envelope.success !== undefined && envelope.data !== undefined) {
    return envelope.data as T;
  }

  return envelope as T;
}

async function parseJsonEnvelope(response: Response, fallbackMessage: string): Promise<Record<string, unknown>> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment before trying again.');
    }

    const firstError = data.errors
      ? Object.values(data.errors as Record<string, string[]>).flat()[0]
      : null;

    throw new Error(String(firstError ?? data.message ?? fallbackMessage));
  }

  return data;
}
