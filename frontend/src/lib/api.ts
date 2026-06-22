import { resolveLocale } from './localeRecovery';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_at?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  preferred_locale: string;
  status?: string;
  email_verified_at?: string | null;
  last_login_at?: string | null;
  roles?: string[];
  permissions?: string[];
}

export interface GlobalSearchResult {
  id: string;
  reference?: string | null;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  status_label?: string | null;
  resource: string;
  resource_label: string;
  module: string;
  module_path: string;
}

export interface GlobalSearchGroup {
  key: string;
  label: string;
  count: number;
  module: string;
  module_path: string;
}

export interface GlobalSearchResponse {
  query: string;
  results: GlobalSearchResult[];
  groups: GlobalSearchGroup[];
  meta: {
    returned: number;
    group_count: number;
    limit: number;
  };
}

export interface DashboardMetric {
  key: string;
  count: number;
  path: string;
  tone: 'info' | 'warning' | 'success';
}

export interface DashboardQueueItem {
  id: string;
  reference?: string | null;
  title: string;
  status: string;
  status_label: string;
  secondary?: string | null;
  updated_at?: string | null;
  path: string;
}

export interface DashboardQueue {
  key: string;
  count: number;
  path: string;
  items: DashboardQueueItem[];
}

export interface DashboardActivityItem {
  key: string;
  reference?: string | null;
  title: string;
  description: string;
  happened_at?: string | null;
  path: string;
}

export interface DashboardQuickAction {
  key: string;
  permission: string;
  path: string;
}

export interface DashboardSummaryResponse {
  metrics: DashboardMetric[];
  priority_queues: DashboardQueue[];
  recent_activity: DashboardActivityItem[];
  quick_actions: DashboardQuickAction[];
  snapshot: {
    accessible_modules: string[];
    generated_at: string;
  };
}

export interface AuthResponse {
  message?: string;
  token: TokenResponse | null;
  user: AuthUser;
}

export interface VerificationContext {
  email: string;
  masked_email: string;
  masked_phone?: string | null;
  has_phone: boolean;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export interface ContactDraftAttachment {
  path: string;
  original_name: string;
  size: number;
  mime_type: string;
  preview_url?: string;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  reason: string;
  subject?: string;
  message: string;
  consent: boolean;
  draft_attachments?: ContactDraftAttachment[];
}

export interface PublicApplicationPayload {
  // Step 1: Who Are You Applying For
  applying_for?: 'self' | 'child' | 'other';
  // Step 2: Child Information
  child_name: string;
  gender?: string;
  date_of_birth?: string;
  // Step 3: Education Information
  is_enrolled?: boolean;
  school_name?: string;
  grade_level?: string;
  distance_to_school?: string;
  interruption_reasons?: string;
  // Location
  region_name?: string;
  village_name?: string;
  school_enrollment_status?: 'enrolled' | 'not_enrolled' | 'unsure';
  last_school_attended?: string;
  education_interruption_reason?: string;
  teacher_school_name?: string;
  teacher_position?: string;
  institution_name?: string;
  institution_role?: string;
  fee_amount?: string;
  fee_due_date?: string;
  exam_name?: string;
  exam_date?: string;
  exam_fee_amount?: string;
  need_type: 'fees' | 'books' | 'uniform' | 'exam' | 'transport' | 'meals' | 'other';
  need_summary: string;
  situation_summary: string;
  contact_role: 'parent' | 'guardian' | 'school' | 'school_representative' | 'teacher' | 'community_leader' | 'child' | 'other';
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  preferred_contact_method: 'phone' | 'sms' | 'whatsapp' | 'email';
  // Step 7: Documents
  documents?: { type: string; id: number }[];
  // Step 8: Review & Submit
  consent: boolean;
}

export interface PublicApplicationSubmissionResponse {
  uuid: string;
  application_number: string;
  submitted_at?: string;
}

export interface PublicLookupSuggestion {
  id: number;
  label: string;
  secondary?: string | null;
}

export interface PublicLookupResponse {
  type: 'regions' | 'villages' | 'schools';
  results: PublicLookupSuggestion[];
  count: number;
}

export interface ApplicationRecord {
  id: number;
  uuid: string;
  source: string;
  source_label: string | null;
  status: string;
  status_label: string | null;
  application_number: string;
  applicant_name: string;
  gender: string | null;
  date_of_birth: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  region: { id: number; name: string } | null;
  village: { id: number; name: string } | null;
  school: { id: number; name: string } | null;
  submitted_by: number | null;
  needs_assessment: string | null;
  household_income_range: string | null;
  household_size: number | null;
  primary_caregiver_occupation: string | null;
  household_challenges: string[] | null;
  intake_payload: Record<string, unknown> | null;
  verification_notes: string | null;
  submitted_at: string | null;
  verified_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export async function apiListApplications(params: {
  status?: string;
  search?: string;
  source?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<ApplicationRecord>> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  if (params.source) qs.set('source', params.source);
  if (params.page) qs.set('page', String(params.page));
  if (params.per_page) qs.set('per_page', String(params.per_page));
  const query = qs.toString();

  const response = await fetch(`${API_BASE_URL}/applications${query ? `?${query}` : ''}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to fetch applications.');
  return {
    data: (envelope.data as ApplicationRecord[]) ?? [],
    meta: (envelope.meta as PaginatedResponse<ApplicationRecord>['meta']),
    links: (envelope.links as PaginatedResponse<ApplicationRecord>['links']),
  };
}

export async function apiGetApplication(uuid: string): Promise<ApplicationRecord> {
  return apiGet<ApplicationRecord>(`/applications/${uuid}`);
}

export async function apiTransitionApplicationStatus(
  uuid: string,
  status: string,
  notes?: string,
): Promise<ApplicationRecord> {
  const response = await fetch(`${API_BASE_URL}/applications/${uuid}/status`, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ status, notes }),
  });
  return parseJsonResponse<ApplicationRecord>(response, 'Failed to update application status.');
}


export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  return parseJsonResponse<T>(response, `API request failed with ${response.status}`);
}

export async function apiPublicGet<T>(path: string, locale?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (locale) {
    headers['Accept-Language'] = locale;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    credentials: 'omit',
  });

  return parseJsonResponse<T>(response, `API request failed with ${response.status}`);
}

export async function apiPublicLookup(
  type: 'regions' | 'villages' | 'schools',
  query: string,
  locale: string,
  filters?: { region_name?: string; village_name?: string },
): Promise<PublicLookupResponse> {
  const params = new URLSearchParams({
    q: query,
  });

  if (filters?.region_name) {
    params.set('region_name', filters.region_name);
  }

  if (filters?.village_name) {
    params.set('village_name', filters.village_name);
  }

  const response = await apiPublicGet<PublicLookupResponse>(`/public/lookups/${type}?${params.toString()}`, locale);
  return response;
}

export async function apiPublicPost<T>(path: string, payload: unknown, locale: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    },
    credentials: 'omit',
    body: JSON.stringify(payload),
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
  phone: string | undefined,
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
      phone: phone || undefined,
      password,
      password_confirmation: passwordConfirmation,
      preferred_locale: preferredLocale || 'en',
      device_name: deviceName || 'web-client',
    }),
  });

  return parseJsonResponse<AuthResponse>(response, `Registration failed with ${response.status}`);
}

export async function apiResendVerificationOtp(
  email: string,
  channel: 'email' | 'sms' | 'whatsapp' = 'email',
): Promise<{ message: string; data?: { channel: string; expires_in_minutes: number; verification?: VerificationContext } }> {
  const response = await fetch(`${API_BASE_URL}/auth/email/otp/resend`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }, false),
    credentials: 'omit',
    body: JSON.stringify({ email, channel }),
  });

  const data = await parseJsonEnvelope(response, 'Failed to send verification code.');

  return {
    message: String(data.message ?? 'Verification code sent.'),
    data: data.data as { channel: string; expires_in_minutes: number; verification?: VerificationContext } | undefined,
  };
}

export async function apiUpdateVerificationContact(payload: {
  current_email: string;
  password: string;
  email?: string;
  phone?: string;
  channel?: 'email' | 'sms' | 'whatsapp';
}): Promise<{ message: string; data?: { channel: string; expires_in_minutes: number; verification?: VerificationContext } }> {
  const response = await fetch(`${API_BASE_URL}/auth/verification/contact`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }, false),
    credentials: 'omit',
    body: JSON.stringify(payload),
  });

  const data = await parseJsonEnvelope(response, 'Failed to update verification details.');

  return {
    message: String(data.message ?? 'Verification details updated.'),
    data: data.data as { channel: string; expires_in_minutes: number; verification?: VerificationContext } | undefined,
  };
}

export async function apiVerifyEmailOtp(
  email: string,
  code: string,
  deviceName?: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/email/otp/verify`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }, false),
    credentials: 'omit',
    body: JSON.stringify({
      email,
      code,
      device_name: deviceName || 'web-client',
    }),
  });

  return parseJsonResponse<AuthResponse>(response, 'Failed to verify account.');
}

export async function apiExchangeOAuthCode(code: string, deviceName?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/oauth/exchange`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }, false),
    credentials: 'omit',
    body: JSON.stringify({
      code,
      device_name: deviceName || 'web-client',
    }),
  });

  return parseJsonResponse<AuthResponse>(response, `OAuth sign-in failed with ${response.status}`);
}

export async function apiGetCurrentUser(): Promise<AuthUser> {
  return apiGet('/auth/me');
}

export async function apiGetDashboardSummary(): Promise<DashboardSummaryResponse> {
  return apiGet('/dashboard/summary');
}

export async function apiGlobalSearch(query: string, limit = 8): Promise<GlobalSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  return apiGet(`/global-search?${params.toString()}`);
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
  const response = await fetch(`${API_BASE_URL}/public/contact-messages`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    },
    credentials: 'omit',
    body: JSON.stringify({
      ...payload,
      consent: payload.consent,
    }),
  });

  const data = await parseJsonEnvelope(response, 'We could not send your message. Please try again.');

  return {
    message: String(data.message ?? 'Thank you for contacting us. We will respond as soon as possible.'),
  };
}

export async function apiCreateApplicationDraft(locale: string): Promise<{ data: { draft_token: string; application_number: string } }> {
  const response = await fetch(`${API_BASE_URL}/public/applications/draft`, {
    method: 'POST',
    headers: buildHeaders({
      Accept: 'application/json',
      'Accept-Language': locale,
    }),
  });
  const env = await parseJsonEnvelope(response, 'Failed to initialize draft.');
  return { data: env.data as { draft_token: string; application_number: string } };
}

export async function apiSaveApplicationStep(
  token: string,
  stepIndex: number,
  payload: Partial<PublicApplicationPayload>,
  locale: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/public/applications/${token}/step/${stepIndex}`, {
    method: 'PUT',
    headers: buildHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    }),
    body: JSON.stringify(payload),
  });
  const env = await parseJsonEnvelope(response, 'Failed to save progress.');
  return { message: String(env.message ?? 'Saved') };
}

export async function apiUploadApplicationDocument(
  token: string,
  file: File,
  documentType: string,
  locale: string
): Promise<{ message: string; document_id: number }> {
  const body = new FormData();
  body.append('file', file);
  body.append('document_type', documentType);

  const response = await fetch(`${API_BASE_URL}/public/applications/${token}/documents`, {
    method: 'POST',
    headers: buildHeaders({
      Accept: 'application/json',
      'Accept-Language': locale,
    }),
    body,
  });
  const env = await parseJsonEnvelope(response, 'Failed to upload document.');
  return { 
    message: String(env.message ?? 'Uploaded'), 
    document_id: (env.data as any).document_id 
  };
}

export async function apiSubmitApplicationDraft(
  token: string,
  locale: string
): Promise<{ message: string; data?: PublicApplicationSubmissionResponse }> {
  const response = await fetch(`${API_BASE_URL}/public/applications/${token}/submit`, {
    method: 'POST',
    headers: buildHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    }),
  });
  const data = await parseJsonEnvelope(response, 'Failed to submit application.');
  return {
    message: String(data.message ?? 'Application submitted successfully.'),
    data: data.data as PublicApplicationSubmissionResponse | undefined,
  };
}

export async function apiSubmitPublicApplication(
  payload: PublicApplicationPayload,
  locale: string,
): Promise<{ message: string; data?: PublicApplicationSubmissionResponse }> {
  const response = await fetch(`${API_BASE_URL}/public/applications`, {
    method: 'POST',
    headers: buildHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    }),
    body: JSON.stringify(payload),
  });

  const data = await parseJsonEnvelope(response, 'We could not send your application. Please try again.');

  return {
    message: String(data.message ?? 'Thank you. Your application has been received and will be reviewed.'),
    data: data.data as PublicApplicationSubmissionResponse | undefined,
  };
}

export async function apiDownloadPreviewPdf(payload: PublicApplicationPayload, locale: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/public/applications/preview-pdf`, {
    method: 'POST',
    headers: buildHeaders({
      Accept: 'application/pdf',
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to generate PDF preview.');
  }

  return response.blob();
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

  const locale = readRequestLocale();

  if (locale) {
    headers['Accept-Language'] = locale;
    headers['X-Locale'] = locale;
  }

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

function readRequestLocale(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return resolveLocale(window.location.pathname).locale;
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

    throw new ApiRequestError(
      String(firstError ?? data.message ?? fallbackMessage),
      response.status,
      typeof data.code === 'string' ? data.code : undefined,
      data.data,
    );
  }

  return data;
}
