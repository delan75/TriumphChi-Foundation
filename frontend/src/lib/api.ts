import { resolveLocale } from './localeRecovery';
import { isPublicDonationConfig } from './donationConfig';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.triumphchi.org/api/v1';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_at?: string;
}

export interface AuthUser {
  id: number;
  uuid?: string;
  employee_number?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  preferred_locale: string;
  status?: string;
  email_verified_at?: string | null;
  last_login_at?: string | null;
  registered_via?: string | null;
  profile?: ManagedUserProfile | null;
  auth_providers?: Array<{
    provider: string;
    provider_email?: string | null;
    linked_at?: string | null;
    last_used_at?: string | null;
  }>;
  sessions?: Array<{
    id: number;
    name: string;
    last_used_at?: string | null;
    expires_at?: string | null;
    created_at?: string | null;
  }>;
  activity?: Array<{
    id: number;
    action: string;
    metadata?: Record<string, unknown> | null;
    ip_address?: string | null;
    created_at?: string | null;
  }>;
  roles?: string[];
  permissions?: string[];
}

export interface ManagedUserProfile {
  department?: string | null;
  position?: string | null;
  employment_type?: string | null;
  office_location?: string | null;
  joined_foundation_at?: string | null;
  bio?: string | null;
  skills?: string[];
  languages?: string[];
  certifications?: string[];
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

export interface ManagedUserRecord {
  id: number;
  uuid: string;
  employee_number?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  preferred_locale?: string | null;
  status: string;
  status_label?: string | null;
  email_verified_at?: string | null;
  registered_via?: string | null;
  registration_source?: string | null;
  last_login_at?: string | null;
  profile?: ManagedUserProfile | null;
  auth_providers?: Array<{
    provider: string;
    provider_email?: string | null;
    linked_at?: string | null;
    last_used_at?: string | null;
  }>;
  roles: Array<{ name: string; label: string }>;
  direct_permissions: string[];
  permissions: string[];
  sessions?: Array<{
    id: number;
    name: string;
    last_used_at?: string | null;
    expires_at?: string | null;
    created_at?: string | null;
  }>;
  activity?: Array<{
    id: number;
    action: string;
    metadata?: Record<string, unknown> | null;
    ip_address?: string | null;
    created_at?: string | null;
  }>;
  permissions_context: {
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_manage_access: boolean;
    can_activate: boolean;
    can_suspend: boolean;
    can_archive: boolean;
    can_terminate_sessions: boolean;
    is_self: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ManagedUserSummary {
  total_count: number;
  status_counts: Record<string, number>;
  active_count: number;
  invited_count: number;
  suspended_count: number;
  locked_count: number;
}

export interface ManagedUserListParams {
  search?: string;
  status?: string;
  role?: string;
  department?: string;
  position?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface ManagedUserPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  employee_number?: string | null;
  preferred_locale?: string;
  status?: string;
  roles?: string[];
  direct_permissions?: string[];
  profile?: ManagedUserProfile;
}

export interface UserAccessOptions {
  roles: Array<{ name: string; label: string; permissions: string[] }>;
  permission_groups: Array<{
    group: string;
    label: string;
    permissions: Array<{ name: string; label: string }>;
  }>;
  statuses: Array<{ value: string; label: string }>;
}

export interface ReportOptionRecord {
  value: string;
  label: string;
  code?: string | null;
  count?: number;
}

export interface ReportCategoryRecord {
  key: string;
  label: string;
  available: number;
  description: string;
}

export interface ReportTemplateRecord {
  key: string;
  name: string;
  category: string;
  format: string;
  formats: string[];
  permissions: string[];
  last_generated?: string | null;
}

export interface QuickReportRecord {
  key: string;
  template_key: string;
  title: string;
  description: string;
  category: string;
  permission: string;
  severity: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export interface ReportInsightRecord {
  key: string;
  label: string;
  value: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  path: string;
  permission: string;
}

export interface ReportRequestRecord {
  uuid: string;
  template_key: string;
  title: string;
  category: string;
  format: string;
  status: string;
  status_label?: string | null;
  progress: number;
  filters: Record<string, string>;
  fields: string[];
  queued_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  failed_at?: string | null;
  expires_at?: string | null;
}

export interface ReportFilterOptions {
  regions: ReportOptionRecord[];
  schools: ReportOptionRecord[];
  academic_years: ReportOptionRecord[];
  support_statuses: ReportOptionRecord[];
  funding_statuses: ReportOptionRecord[];
}

export interface ReportDashboardResponse {
  categories: ReportCategoryRecord[];
  quick_reports: QuickReportRecord[];
  templates: ReportTemplateRecord[];
  insights: ReportInsightRecord[];
  filter_options: ReportFilterOptions;
  queue: ReportRequestRecord[];
  saved_reports: ReportRequestRecord[];
  scheduled_reports: Array<Record<string, unknown>>;
}

export interface ReportGeneratePayload {
  template_key: string;
  format: string;
  filters?: Record<string, string>;
  fields?: string[];
  source?: string;
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
  id?: string | null;
  key: string;
  type?: string | null;
  icon?: string | null;
  reference?: string | null;
  title: string;
  subtitle?: string | null;
  event?: string | null;
  description: string;
  occurred_at?: string | null;
  happened_at?: string | null;
  path: string;
}

export interface DashboardQuickAction {
  key: string;
  permission: string;
  path: string;
  visible?: boolean;
}

export interface DashboardMonthlyActivityPoint {
  key: string;
  label: string;
  applications_count: number;
  donations_count: number;
  donations_amount: string;
  donations_amounts?: Record<string, string>;
}

export interface DashboardSummaryResponse {
  metrics: DashboardMetric[];
  priority_queues: DashboardQueue[];
  recent_activity: DashboardActivityItem[];
  quick_actions: DashboardQuickAction[];
  charts?: {
    monthly_activity: DashboardMonthlyActivityPoint[];
  };
  snapshot: {
    accessible_modules: string[];
    generated_at: string;
  };
}

export interface PublicDonationCurrencyConfig {
  symbol: string;
  minimum_amount: number;
  suggested_amounts: number[];
}

export interface PublicDonationOption {
  key: string;
  label: string;
}

export interface PublicDonationProvider {
  key: string;
  name: string;
  method: string;
  category: string;
  currencies: string[];
  country_codes?: string[];
  country_currency_map?: Record<string, string> | null;
}

export interface PublicBankTransferDetails {
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  iban?: string;
  swift_bic?: string;
  branch?: string;
  email_instructions?: boolean;
}

export interface PublicDonationConfig {
  default_currency: string;
  default_frequency: string;
  default_purpose: string;
  detected_country?: {
    country?: string | null;
    source?: string | null;
    signals?: Record<string, string | null>;
  };
  frequencies: PublicDonationOption[];
  currencies: Record<string, PublicDonationCurrencyConfig>;
  purposes: PublicDonationOption[];
  payment_providers: PublicDonationProvider[];
  bank_transfer?: PublicBankTransferDetails;
}

export interface PublicDonationIntentPayload {
  frequency: string;
  currency: string;
  amount: number;
  purpose: string;
  payment_provider: string;
  donor: {
    name?: string;
    email?: string;
    phone?: string;
    country: string;
  };
  anonymous: boolean;
  payment_consent?: boolean;
  client_reference?: string;
  similar_donation_acknowledged?: boolean;
}

export interface PublicDonationIntentResponse {
  uuid: string;
  intent_reference: string;
  donation: {
    uuid: string;
    reference_number: string;
    status: string;
    documents?: DonationDocumentRecord[];
  };
  payment_provider: {
    key: string;
    name: string;
    category: string;
  };
  amount: string;
  currency: string;
  frequency: string;
  purpose: string;
  status: string;
  checkout_url?: string | null;
  bank_transfer?: PublicBankTransferDetails | null;
  expires_at?: string | null;
}

export interface DonationDocumentRecord {
  uuid: string;
  document_number: string;
  type: string;
  status?: string;
  locale: string;
  title: string;
  issued_at?: string | null;
  download_url: string;
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
  draft_token?: string;
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
  household_income_range?: string;
  household_size?: number;
  primary_caregiver_occupation?: string;
  household_challenges?: string[];
  need_type: 'fees' | 'books' | 'uniform' | 'exam' | 'transport' | 'meals' | 'other';
  need_summary: string;
  situation_summary: string;
  contact_role:
    | 'parent'
    | 'guardian'
    | 'school'
    | 'school_representative'
    | 'teacher'
    | 'community_leader'
    | 'child'
    | 'other';
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
  beneficiary?: {
    uuid: string;
    internal_id: string;
    display_name: string;
    status: string;
    status_label: string | null;
  } | null;
}

export interface BeneficiaryRecord {
  id: number;
  uuid: string;
  internal_id: string;
  display_name: string;
  status: string;
  status_label: string | null;
  first_name: string;
  last_name: string;
  gender: string | null;
  date_of_birth: string | null;
  age: number | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  region: { id: number; name: string; code?: string | null } | null;
  village: { id: number; name: string } | null;
  education_level: string | null;
  admission_date: string | null;
  graduation_date: string | null;
  funding_progress: string | number | null;
  application?: ApplicationRecord | null;
  school: {
    id: number;
    uuid: string;
    code: string | null;
    name: string;
    region?: { id: number; name: string } | null;
    village?: { id: number; name: string } | null;
  } | null;
  current_need?: {
    uuid: string;
    type: string;
    title: string;
    status: string;
    status_label: string | null;
    amount_required: string;
    amount_funded: string;
    funding_gap: string;
    academic_year: string;
  } | null;
  needs?: Array<{
    id: number;
    uuid: string;
    type: string;
    title: string;
    description?: string | null;
    amount_required: string;
    amount_funded: string;
    funding_percentage: number;
    status: string;
    status_label: string | null;
    academic_year: string;
    funding_starts_at?: string | null;
    funding_ends_at?: string | null;
  }>;
  case_summary: {
    needs_count: number;
    sponsor_count: number;
    payments_count: number;
    impact_updates_count: number;
    latest_update_at?: string | null;
  };
  funding_summary: {
    amount_required: string;
    amount_funded: string;
    funding_gap: string;
    payments_total: string;
    currency: string;
    funding_percentage: number;
    has_funding_gap: boolean;
  };
  sponsorships?: Array<{
    uuid: string;
    reference: string;
    type: string;
    status: string;
    status_label: string | null;
    pledged_amount: string;
    currency: string;
    billing_frequency?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
    donor?: { uuid: string; name: string | null; email: string | null } | null;
  }>;
  payments?: Array<{
    uuid: string;
    reference: string;
    payee_name: string;
    amount: string;
    currency: string;
    method: string;
    status: string;
    status_label: string | null;
    payment_date?: string | null;
    fund?: { uuid: string; name: string; code?: string | null } | null;
  }>;
  support_history?: Array<{
    type: string;
    title: string;
    description?: string | null;
    happened_at?: string | null;
    actor?: string | null;
  }>;
  permissions: {
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_view_funding: boolean;
    can_record_payments: boolean;
    can_publish_updates: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface BeneficiarySummary {
  total_count: number;
  status_counts: Record<string, number>;
  active_support_count: number;
  awaiting_sponsorship_count: number;
  graduated_count: number;
  funding_gap_count: number;
  sponsored_count: number;
  school_changes_count: number;
}

export interface BeneficiaryListParams {
  status?: string;
  search?: string;
  school_id?: number;
  region_id?: number;
  gender?: string;
  sponsor_status?: 'sponsored' | 'unsponsored';
  funding_status?: 'funded' | 'funding_gap';
  academic_year?: string;
  education_level?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface DonationManagementRecord {
  id: number;
  uuid: string;
  reference_number: string;
  amount: string;
  currency: string;
  method: string;
  method_label: string | null;
  provider: string | null;
  provider_reference: string | null;
  status: string;
  status_label: string | null;
  donated_at: string | null;
  confirmed_at: string | null;
  receipt_available: boolean;
  notes?: string | null;
  donor?: {
    id: number | null;
    uuid: string | null;
    name: string | null;
    email: string | null;
    type: string | null;
    type_label: string | null;
    status: string | null;
  } | null;
  fund?: {
    id: number | null;
    uuid: string | null;
    code: string | null;
    name: string | null;
    currency: string | null;
    status: string | null;
  } | null;
  allocation_summary: {
    count: number;
    allocated_amount: string;
    unallocated_amount: string;
    currency: string;
  };
  payment_summary: {
    intents_count: number;
    transactions_count: number;
    latest_intent?: {
      uuid: string;
      intent_reference: string;
      provider?: string | null;
      status: string;
      amount: string;
      currency: string;
      expires_at?: string | null;
    } | null;
    latest_transaction?: {
      uuid: string;
      transaction_reference?: string | null;
      provider?: string | null;
      type: string;
      status: string;
      amount: string;
      currency: string;
      processed_at?: string | null;
    } | null;
  };
  allocations?: Array<{
    id: number;
    uuid: string;
    allocation_reference: string;
    amount: string;
    currency: string;
    status: string;
    status_label: string | null;
    allocated_at: string | null;
    educational_need?: {
      id: number;
      uuid: string;
      type: string;
      title: string;
      beneficiary?: {
        uuid: string;
        internal_id: string | null;
        display_name: string;
      } | null;
    } | null;
  }>;
  transactions?: Array<{
    uuid: string;
    transaction_reference?: string | null;
    provider_transaction_id?: string | null;
    type: string;
    status: string;
    amount: string;
    currency: string;
    processed_at?: string | null;
    provider?: string | null;
  }>;
  documents?: DonationDocumentRecord[];
  permissions: {
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_approve: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface DonationManagementSummary {
  total_count: number;
  status_counts: Record<string, number>;
  currency_totals: Record<string, { count: number; amount: string }>;
  provider_counts: Record<string, number>;
  source_distribution?: Array<{
    source: string;
    source_label: string;
    currency: string;
    count: number;
    amount: string;
  }>;
  filter_options?: {
    statuses: string[];
    providers: string[];
    currencies: string[];
    countries: Array<{ value: string; label: string }>;
    regions?: Array<{ value: string; label: string; code?: string | null }>;
  };
}

export interface ContactMessageAttachmentRecord {
  id: number;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  scan_status: string;
  download_url?: string | null;
}

export interface ContactMessageRecord {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string | null;
  reason: string;
  reason_label?: string | null;
  subject?: string | null;
  message: string;
  locale: string;
  status: string;
  status_label?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  staff_notes?: string | null;
  attachments_count: number;
  has_attachments: boolean;
  attachments?: ContactMessageAttachmentRecord[];
  handler?: {
    id: number;
    name: string;
    email: string;
  } | null;
  responded_at?: string | null;
  reviewed_at?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  permissions: {
    can_view: boolean;
    can_update: boolean;
    can_archive: boolean;
    can_view_attachments: boolean;
  };
}

export interface ContactMessageSummary {
  total_count: number;
  status_counts: Record<string, number>;
  reason_counts: Record<string, number>;
  attachments_count: number;
}

export interface ContactMessageListParams {
  status?: string;
  reason?: string;
  search?: string;
  has_attachments?: boolean;
  created_from?: string;
  created_to?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface ContactMessageAssignee {
  id: number;
  name: string;
  email: string;
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

export type LocalizedText = Partial<Record<'en' | 'fr', string | null>>;

export interface BlogCategoryRecord {
  id: number;
  uuid: string;
  name: LocalizedText;
  label: string;
  slug: LocalizedText;
  current_slug?: string | null;
  description?: LocalizedText | null;
  current_description?: string | null;
  color?: string | null;
  sort_order?: number;
  is_active: boolean;
  posts_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BlogTagRecord {
  id: number;
  uuid: string;
  name: LocalizedText;
  label: string;
  slug: LocalizedText;
  current_slug?: string | null;
  description?: LocalizedText | null;
  current_description?: string | null;
  is_active: boolean;
  posts_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BlogPostRecord {
  id: number;
  uuid: string;
  reference: string;
  title: LocalizedText;
  current_title: string;
  slug: LocalizedText;
  current_slug: string;
  excerpt?: LocalizedText | null;
  current_excerpt?: string | null;
  body: LocalizedText;
  current_body: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  status_label?: string | null;
  is_featured: boolean;
  featured_image_path?: string | null;
  featured_image_alt?: LocalizedText | null;
  current_featured_image_alt?: string | null;
  seo_title?: LocalizedText | null;
  current_seo_title?: string | null;
  seo_description?: LocalizedText | null;
  current_seo_description?: string | null;
  media?: BlogPostMediaRecord[];
  current_media?: BlogPostCurrentMediaRecord[];
  reading_minutes: number;
  published_at?: string | null;
  archived_at?: string | null;
  category?: BlogCategoryRecord | null;
  tags?: BlogTagRecord[];
  author?: { id: number; name: string; email?: string | null } | null;
  publisher?: { id: number; name: string } | null;
  permissions?: {
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_publish: boolean;
    can_delete: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface BlogPostMediaRecord {
  type?: 'image' | 'video';
  url: string;
  title?: LocalizedText | null;
  alt?: LocalizedText | null;
  caption?: LocalizedText | null;
  credit?: string | null;
  position?: number;
  layout?: 'full' | 'inset' | 'side';
}

export interface BlogPostCurrentMediaRecord {
  type?: 'image' | 'video';
  url: string;
  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  credit?: string | null;
  position: number;
  layout: 'full' | 'inset' | 'side';
}

export interface BlogMediaUploadRecord extends BlogPostMediaRecord {
  path: string;
  original_name: string;
  mime_type: string;
  size: number;
}

export interface BlogPostSummary {
  total_count: number;
  status_counts: Record<string, number>;
  draft_count: number;
  review_count: number;
  published_count: number;
  archived_count: number;
}

export interface BlogPostListParams {
  [key: string]: string | number | boolean | null | undefined;
  status?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PublicBlogPostListParams {
  [key: string]: string | number | boolean | null | undefined;
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface BlogPostPayload {
  title: LocalizedText;
  slug?: LocalizedText;
  excerpt?: LocalizedText;
  body: LocalizedText;
  status?: 'draft' | 'review' | 'published' | 'archived';
  blog_category_id?: number | null;
  tag_ids?: number[];
  is_featured?: boolean;
  featured_image_path?: string | null;
  featured_image_alt?: LocalizedText;
  seo_title?: LocalizedText;
  seo_description?: LocalizedText;
  media?: BlogPostMediaRecord[];
}

export interface BlogOptionsResponse {
  categories: BlogCategoryRecord[];
  tags: BlogTagRecord[];
  statuses?: Array<{ value: string; label: string }>;
}

export interface DonationListParams {
  status?: string;
  search?: string;
  provider?: string;
  source?: string;
  method?: string;
  currency?: string;
  country?: string;
  region_id?: number;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
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
    meta: envelope.meta as PaginatedResponse<ApplicationRecord>['meta'],
    links: envelope.links as PaginatedResponse<ApplicationRecord>['links'],
  };
}

export async function apiGetApplication(uuid: string): Promise<ApplicationRecord> {
  return apiGet<ApplicationRecord>(`/applications/${uuid}`);
}

export async function apiListBeneficiaries(params: BeneficiaryListParams): Promise<
  PaginatedResponse<BeneficiaryRecord> & {
    summary: BeneficiarySummary;
    filters: Record<string, string | number>;
  }
> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  if (params.school_id) qs.set('school_id', String(params.school_id));
  if (params.region_id) qs.set('region_id', String(params.region_id));
  if (params.gender) qs.set('gender', params.gender);
  if (params.sponsor_status) qs.set('sponsor_status', params.sponsor_status);
  if (params.funding_status) qs.set('funding_status', params.funding_status);
  if (params.academic_year) qs.set('academic_year', params.academic_year);
  if (params.education_level) qs.set('education_level', params.education_level);
  if (params.page) qs.set('page', String(params.page));
  if (params.per_page) qs.set('per_page', String(params.per_page));
  if (params.sort) qs.set('sort', params.sort);
  if (params.direction) qs.set('direction', params.direction);
  const query = qs.toString();

  const response = await fetch(`${API_BASE_URL}/beneficiaries${query ? `?${query}` : ''}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to fetch beneficiaries.');

  return {
    data: (envelope.data as BeneficiaryRecord[]) ?? [],
    meta: envelope.meta as PaginatedResponse<BeneficiaryRecord>['meta'],
    links: envelope.links as PaginatedResponse<BeneficiaryRecord>['links'],
    summary: (envelope.summary as BeneficiarySummary) ?? {
      total_count: 0,
      status_counts: {},
      active_support_count: 0,
      awaiting_sponsorship_count: 0,
      graduated_count: 0,
      funding_gap_count: 0,
      sponsored_count: 0,
      school_changes_count: 0,
    },
    filters: (envelope.filters as Record<string, string | number>) ?? {},
  };
}

export async function apiGetBeneficiary(uuid: string): Promise<BeneficiaryRecord> {
  const response = await fetch(`${API_BASE_URL}/beneficiaries/${uuid}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, `Failed to fetch beneficiary ${uuid}.`);

  return (envelope.data ?? envelope) as BeneficiaryRecord;
}

export async function apiListDonations(params: DonationListParams): Promise<
  PaginatedResponse<DonationManagementRecord> & {
    summary: DonationManagementSummary;
    filters: Record<string, string | number>;
  }
> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  if (params.provider) qs.set('provider', params.provider);
  if (params.source) qs.set('source', params.source);
  if (params.method) qs.set('method', params.method);
  if (params.currency) qs.set('currency', params.currency);
  if (params.country) qs.set('country', params.country);
  if (params.region_id) qs.set('region_id', String(params.region_id));
  if (params.page) qs.set('page', String(params.page));
  if (params.per_page) qs.set('per_page', String(params.per_page));
  if (params.sort) qs.set('sort', params.sort);
  if (params.direction) qs.set('direction', params.direction);
  const query = qs.toString();

  const response = await fetch(`${API_BASE_URL}/donations${query ? `?${query}` : ''}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to fetch donations.');

  return {
    data: (envelope.data as DonationManagementRecord[]) ?? [],
    meta: envelope.meta as PaginatedResponse<DonationManagementRecord>['meta'],
    links: envelope.links as PaginatedResponse<DonationManagementRecord>['links'],
    summary: (envelope.summary as DonationManagementSummary) ?? {
      total_count: 0,
      status_counts: {},
      currency_totals: {},
      provider_counts: {},
      source_distribution: [],
      filter_options: {
        statuses: [],
        providers: [],
        currencies: [],
        countries: [],
        regions: [],
      },
    },
    filters: (envelope.filters as Record<string, string | number>) ?? {},
  };
}

export async function apiGetDonation(uuid: string): Promise<DonationManagementRecord> {
  const response = await fetch(`${API_BASE_URL}/donations/${uuid}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, `Failed to fetch donation ${uuid}.`);

  return (envelope.data ?? envelope) as DonationManagementRecord;
}

export async function apiListContactMessages(params: ContactMessageListParams): Promise<
  PaginatedResponse<ContactMessageRecord> & {
    summary: ContactMessageSummary;
    filters: Record<string, string | number | boolean>;
  }
> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.reason) qs.set('reason', params.reason);
  if (params.search) qs.set('search', params.search);
  if (params.has_attachments !== undefined)
    qs.set('has_attachments', String(params.has_attachments));
  if (params.created_from) qs.set('created_from', params.created_from);
  if (params.created_to) qs.set('created_to', params.created_to);
  if (params.page) qs.set('page', String(params.page));
  if (params.per_page) qs.set('per_page', String(params.per_page));
  if (params.sort) qs.set('sort', params.sort);
  if (params.direction) qs.set('direction', params.direction);
  const query = qs.toString();

  const response = await fetch(`${API_BASE_URL}/contact-messages${query ? `?${query}` : ''}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to fetch contact inquiries.');

  return {
    data: (envelope.data as ContactMessageRecord[]) ?? [],
    meta: envelope.meta as PaginatedResponse<ContactMessageRecord>['meta'],
    links: envelope.links as PaginatedResponse<ContactMessageRecord>['links'],
    summary: (envelope.summary as ContactMessageSummary) ?? {
      total_count: 0,
      status_counts: {},
      reason_counts: {},
      attachments_count: 0,
    },
    filters: (envelope.filters as Record<string, string | number | boolean>) ?? {},
  };
}

export async function apiGetContactMessage(uuid: string): Promise<ContactMessageRecord> {
  const response = await fetch(`${API_BASE_URL}/contact-messages/${uuid}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, `Failed to fetch contact inquiry ${uuid}.`);

  return (envelope.data ?? envelope) as ContactMessageRecord;
}

export async function apiUpdateContactMessage(
  uuid: string,
  payload: { status: string; staff_notes?: string | null },
): Promise<ContactMessageRecord> {
  const response = await fetch(`${API_BASE_URL}/contact-messages/${uuid}`, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to update contact inquiry.');

  return (envelope.data ?? envelope) as ContactMessageRecord;
}

export async function apiAssignContactMessage(
  uuid: string,
  assignedTo: number | null,
): Promise<ContactMessageRecord> {
  const response = await fetch(`${API_BASE_URL}/contact-messages/${uuid}/assignment`, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ assigned_to: assignedTo }),
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to assign contact inquiry.');

  return (envelope.data ?? envelope) as ContactMessageRecord;
}

export async function apiForwardContactMessage(
  uuid: string,
  payload: { to_email: string; note?: string; mark_as_replied?: boolean },
): Promise<ContactMessageRecord> {
  const response = await fetch(`${API_BASE_URL}/contact-messages/${uuid}/forward`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to forward contact inquiry.');

  return (envelope.data ?? envelope) as ContactMessageRecord;
}

export async function apiDeleteContactMessage(uuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/contact-messages/${uuid}`, {
    method: 'DELETE',
    headers: buildHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    await parseJsonEnvelope(response, 'Failed to archive contact inquiry.');
  }
}

export async function apiListContactAssignees(): Promise<ContactMessageAssignee[]> {
  const response = await fetch(`${API_BASE_URL}/contact-messages/assignable-users`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to fetch assignable staff.');

  return (envelope.data ?? []) as ContactMessageAssignee[];
}

export async function apiListManagedUsers(params: ManagedUserListParams): Promise<
  PaginatedResponse<ManagedUserRecord> & {
    summary: ManagedUserSummary;
    filters: Record<string, string | number>;
  }
> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.role) qs.set('role', params.role);
  if (params.department) qs.set('department', params.department);
  if (params.position) qs.set('position', params.position);
  if (params.page) qs.set('page', String(params.page));
  if (params.per_page) qs.set('per_page', String(params.per_page));
  if (params.sort) qs.set('sort', params.sort);
  if (params.direction) qs.set('direction', params.direction);
  const query = qs.toString();

  const response = await fetch(`${API_BASE_URL}/users${query ? `?${query}` : ''}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to fetch users.');

  return {
    data: (envelope.data as ManagedUserRecord[]) ?? [],
    meta: envelope.meta as PaginatedResponse<ManagedUserRecord>['meta'],
    links: envelope.links as PaginatedResponse<ManagedUserRecord>['links'],
    summary: (envelope.summary as ManagedUserSummary) ?? {
      total_count: 0,
      status_counts: {},
      active_count: 0,
      invited_count: 0,
      suspended_count: 0,
      locked_count: 0,
    },
    filters: (envelope.filters as Record<string, string | number>) ?? {},
  };
}

export async function apiGetManagedUser(uuid: string): Promise<ManagedUserRecord> {
  const response = await fetch(`${API_BASE_URL}/users/${uuid}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, `Failed to fetch user ${uuid}.`);

  return (envelope.data ?? envelope) as ManagedUserRecord;
}

export async function apiCreateManagedUser(
  payload: ManagedUserPayload,
): Promise<ManagedUserRecord> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to create user account.');

  return (envelope.data ?? envelope) as ManagedUserRecord;
}

export async function apiUpdateManagedUser(
  uuid: string,
  payload: ManagedUserPayload,
): Promise<ManagedUserRecord> {
  const response = await fetch(`${API_BASE_URL}/users/${uuid}`, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to update user account.');

  return (envelope.data ?? envelope) as ManagedUserRecord;
}

export async function apiGetUserAccessOptions(): Promise<UserAccessOptions> {
  const response = await fetch(`${API_BASE_URL}/users/access-options`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to fetch user access options.');

  return (envelope.data ?? envelope) as UserAccessOptions;
}

export async function apiUpdateManagedUserAccess(
  uuid: string,
  payload: { roles: string[]; direct_permissions?: string[] },
): Promise<ManagedUserRecord> {
  const response = await fetch(`${API_BASE_URL}/users/${uuid}/access`, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to update user access.');

  return (envelope.data ?? envelope) as ManagedUserRecord;
}

export async function apiTransitionManagedUserStatus(
  uuid: string,
  action: 'activate' | 'suspend' | 'archive',
  note?: string,
): Promise<ManagedUserRecord> {
  const response = await fetch(`${API_BASE_URL}/users/${uuid}/${action}`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ note }),
  });

  const envelope = await parseJsonEnvelope(response, `Failed to ${action} user account.`);

  return (envelope.data ?? envelope) as ManagedUserRecord;
}

export async function apiTerminateManagedUserSessions(uuid: string): Promise<ManagedUserRecord> {
  const response = await fetch(`${API_BASE_URL}/users/${uuid}/terminate-sessions`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to terminate user sessions.');

  return (envelope.data ?? envelope) as ManagedUserRecord;
}

export async function apiRefreshDonationPaymentStatus(
  uuid: string,
): Promise<DonationManagementRecord> {
  const response = await fetch(`${API_BASE_URL}/donations/${uuid}/payment-status`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, `Failed to refresh donation ${uuid}.`);

  return (envelope.data ?? envelope) as DonationManagementRecord;
}

export async function apiDownloadApplicationPdf(uuid: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/applications/${uuid}/pdf`, {
    headers: buildHeaders({
      Accept: 'application/pdf',
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to generate application PDF.');
  }

  return response.blob();
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

  const response = await apiPublicGet<PublicLookupResponse>(
    `/public/lookups/${type}?${params.toString()}`,
    locale,
  );
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

export async function apiLogin(
  email: string,
  password: string,
  deviceName?: string,
): Promise<AuthResponse> {
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
): Promise<{
  message: string;
  data?: { channel: string; expires_in_minutes: number; verification?: VerificationContext };
}> {
  const response = await fetch(`${API_BASE_URL}/auth/email/otp/resend`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }, false),
    credentials: 'omit',
    body: JSON.stringify({ email, channel }),
  });

  const data = await parseJsonEnvelope(response, 'Failed to send verification code.');

  return {
    message: String(data.message ?? 'Verification code sent.'),
    data: data.data as
      | { channel: string; expires_in_minutes: number; verification?: VerificationContext }
      | undefined,
  };
}

export async function apiUpdateVerificationContact(payload: {
  current_email: string;
  password: string;
  email?: string;
  phone?: string;
  channel?: 'email' | 'sms' | 'whatsapp';
}): Promise<{
  message: string;
  data?: { channel: string; expires_in_minutes: number; verification?: VerificationContext };
}> {
  const response = await fetch(`${API_BASE_URL}/auth/verification/contact`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }, false),
    credentials: 'omit',
    body: JSON.stringify(payload),
  });

  const data = await parseJsonEnvelope(response, 'Failed to update verification details.');

  return {
    message: String(data.message ?? 'Verification details updated.'),
    data: data.data as
      | { channel: string; expires_in_minutes: number; verification?: VerificationContext }
      | undefined,
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

export async function apiExchangeOAuthCode(
  code: string,
  deviceName?: string,
): Promise<AuthResponse> {
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

export async function apiGetReportDashboard(): Promise<ReportDashboardResponse> {
  return apiGet('/reports/dashboard');
}

export async function apiGetReportQueue(): Promise<ReportRequestRecord[]> {
  return apiGet('/reports/queue');
}

export async function apiGenerateReport(
  payload: ReportGeneratePayload,
): Promise<ReportRequestRecord> {
  const response = await fetch(`${API_BASE_URL}/reports/generate`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<ReportRequestRecord>(response, 'Failed to queue report request.');
}

export async function apiGetDonationConfig(locale: string): Promise<PublicDonationConfig> {
  const config = await apiPublicGet<unknown>('/public/donation-config', locale);
  if (!isPublicDonationConfig(config)) {
    throw new Error(
      locale === 'fr'
        ? 'La configuration des dons est indisponible.'
        : 'Donation configuration is unavailable.',
    );
  }
  return config;
}

export async function apiCreateDonationIntent(
  payload: PublicDonationIntentPayload,
  locale: string,
): Promise<{ message: string; data?: PublicDonationIntentResponse }> {
  const response = await fetch(`${API_BASE_URL}/public/donation-intents`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    },
    credentials: 'omit',
    body: JSON.stringify(payload),
  });

  const data = await parseJsonEnvelope(
    response,
    'We could not prepare your donation. Please try again.',
  );

  return {
    message: String(data.message ?? 'Thank you. Your donation has been prepared securely.'),
    data: data.data as PublicDonationIntentResponse | undefined,
  };
}

export async function apiGetDonationIntentStatus(
  uuid: string,
  locale: string,
): Promise<PublicDonationIntentResponse> {
  return apiPublicGet<PublicDonationIntentResponse>(
    `/public/donation-intents/${uuid}/status`,
    locale,
  );
}

export async function apiCapturePaypalDonationIntent(
  uuid: string,
  orderId: string,
  locale: string,
): Promise<{ message: string; data?: PublicDonationIntentResponse }> {
  const response = await fetch(`${API_BASE_URL}/public/donation-intents/${uuid}/paypal/capture`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    },
    credentials: 'omit',
    body: JSON.stringify({ order_id: orderId }),
  });

  const data = await parseJsonEnvelope(
    response,
    'We could not verify your PayPal donation. Please try again.',
  );

  return {
    message: String(data.message ?? 'PayPal donation verified successfully.'),
    data: data.data as PublicDonationIntentResponse | undefined,
  };
}

export async function apiCancelPaypalDonationIntent(
  uuid: string,
  locale: string,
): Promise<{ message: string; data?: PublicDonationIntentResponse }> {
  const response = await fetch(`${API_BASE_URL}/public/donation-intents/${uuid}/paypal/cancel`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    },
    credentials: 'omit',
  });

  const data = await parseJsonEnvelope(
    response,
    'We could not update your PayPal donation. Please try again.',
  );

  return {
    message: String(data.message ?? 'PayPal donation cancelled.'),
    data: data.data as PublicDonationIntentResponse | undefined,
  };
}

export async function apiGlobalSearch(query: string, limit = 8): Promise<GlobalSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  return apiGet(`/global-search?${params.toString()}`);
}

export async function apiPublicListBlogPosts(
  params: PublicBlogPostListParams,
  locale: string,
): Promise<PaginatedResponse<BlogPostRecord>> {
  const query = buildQueryString(params);
  const response = await fetch(`${API_BASE_URL}/public/blog-posts${query ? `?${query}` : ''}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': locale,
    },
    credentials: 'omit',
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to fetch blog posts.');

  return {
    data: (envelope.data as BlogPostRecord[]) ?? [],
    meta: envelope.meta as PaginatedResponse<BlogPostRecord>['meta'],
    links: envelope.links as PaginatedResponse<BlogPostRecord>['links'],
  };
}

export async function apiPublicGetBlogPost(slug: string, locale: string): Promise<BlogPostRecord> {
  return apiPublicGet<BlogPostRecord>(`/public/blog-posts/${encodeURIComponent(slug)}`, locale);
}

export async function apiPublicGetBlogOptions(locale: string): Promise<BlogOptionsResponse> {
  return apiPublicGet<BlogOptionsResponse>('/public/blog/options', locale);
}

export async function apiListBlogPosts(params: BlogPostListParams): Promise<
  PaginatedResponse<BlogPostRecord> & {
    summary: BlogPostSummary;
  }
> {
  const query = buildQueryString(params);
  const response = await fetch(`${API_BASE_URL}/blog-posts${query ? `?${query}` : ''}`, {
    headers: buildHeaders(),
    credentials: 'include',
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to fetch blog posts.');

  return {
    data: (envelope.data as BlogPostRecord[]) ?? [],
    meta: envelope.meta as PaginatedResponse<BlogPostRecord>['meta'],
    links: envelope.links as PaginatedResponse<BlogPostRecord>['links'],
    summary: (envelope.summary as BlogPostSummary) ?? {
      total_count: 0,
      status_counts: {},
      draft_count: 0,
      review_count: 0,
      published_count: 0,
      archived_count: 0,
    },
  };
}

export async function apiGetBlogPost(uuid: string): Promise<BlogPostRecord> {
  return apiGet<BlogPostRecord>(`/blog-posts/${uuid}`);
}

export async function apiGetBlogOptions(): Promise<BlogOptionsResponse> {
  return apiGet<BlogOptionsResponse>('/blog/options');
}

export async function apiCreateBlogPost(payload: BlogPostPayload): Promise<BlogPostRecord> {
  const response = await fetch(`${API_BASE_URL}/blog-posts`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<BlogPostRecord>(response, 'Failed to create blog post.');
}

export async function apiUpdateBlogPost(
  uuid: string,
  payload: BlogPostPayload,
): Promise<BlogPostRecord> {
  const response = await fetch(`${API_BASE_URL}/blog-posts/${uuid}`, {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<BlogPostRecord>(response, 'Failed to update blog post.');
}

export async function apiTransitionBlogPostStatus(
  uuid: string,
  status: string,
): Promise<BlogPostRecord> {
  const response = await fetch(`${API_BASE_URL}/blog-posts/${uuid}/status`, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  return parseJsonResponse<BlogPostRecord>(response, 'Failed to update blog post status.');
}

export async function apiDeleteBlogPost(uuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/blog-posts/${uuid}`, {
    method: 'DELETE',
    headers: buildHeaders(),
    credentials: 'include',
  });

  await parseJsonEnvelope(response, 'Failed to delete blog post.');
}

export async function apiUploadBlogMedia(files: File[]): Promise<BlogMediaUploadRecord[]> {
  const body = new FormData();

  files.forEach((file) => body.append('media[]', file));

  const response = await fetch(`${API_BASE_URL}/blog-media`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body,
  });

  const envelope = await parseJsonEnvelope(response, 'Failed to upload blog media.');
  const data = (envelope.data ?? envelope) as { media?: BlogMediaUploadRecord[] };

  return data.media ?? [];
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
    message: String(
      data.message ??
        'If your email exists in our database, you will receive a reset link shortly.',
    ),
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

  const data = await parseJsonEnvelope(
    response,
    'Failed to reset password. The link may have expired.',
  );

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

  const data = await parseJsonEnvelope(
    response,
    'We could not send your message. Please try again.',
  );

  return {
    message: String(
      data.message ?? 'Thank you for contacting us. We will respond as soon as possible.',
    ),
  };
}

export async function apiCreateApplicationDraft(
  locale: string,
): Promise<{ data: { draft_token: string; application_number: string } }> {
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
  locale: string,
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
  locale: string,
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
    document_id: (env.data as { document_id: number }).document_id,
  };
}

export async function apiSubmitApplicationDraft(
  token: string,
  locale: string,
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

  const data = await parseJsonEnvelope(
    response,
    'We could not send your application. Please try again.',
  );

  return {
    message: String(
      data.message ?? 'Thank you. Your application has been received and will be reviewed.',
    ),
    data: data.data as PublicApplicationSubmissionResponse | undefined,
  };
}

export async function apiDownloadPreviewPdf(
  payload: PublicApplicationPayload,
  locale: string,
): Promise<Blob> {
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

function buildQueryString(params: object): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    query.set(key, String(value));
  });

  return query.toString();
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const envelope = await parseJsonEnvelope(response, fallbackMessage);

  if (envelope.success !== undefined && envelope.data !== undefined) {
    return envelope.data as T;
  }

  return envelope as T;
}

async function parseJsonEnvelope(
  response: Response,
  fallbackMessage: string,
): Promise<Record<string, unknown>> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment before trying again.');
    }

    // Safely extract the first validation error without crashing
    let firstError: string | null = null;
    const errorsObj = data.errors;

    if (errorsObj && typeof errorsObj === 'object') {
      const allErrors = Object.values(errorsObj as Record<string, unknown>).flat();
      const validError = allErrors.find((err): err is string => typeof err === 'string');
      firstError = validError ?? null;
    }

    throw new ApiRequestError(
      String(firstError ?? data.message ?? fallbackMessage),
      response.status,
      typeof data.code === 'string' ? data.code : undefined,
      data.data,
    );
  }

  return data;
}

export interface BlogCategoryPayload {
  name: LocalizedText;
  slug: LocalizedText;
  description?: LocalizedText;
}

export interface BlogTagPayload {
  name: LocalizedText;
  slug: LocalizedText;
}

export async function apiCreateBlogCategory(
  payload: BlogCategoryPayload,
): Promise<BlogCategoryRecord> {
  const response = await fetch(`${API_BASE_URL}/blog-categories`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<BlogCategoryRecord>(response, 'Failed to create blog category.');
}

export async function apiUpdateBlogCategory(
  uuid: string,
  payload: BlogCategoryPayload,
): Promise<BlogCategoryRecord> {
  const response = await fetch(`${API_BASE_URL}/blog-categories/${uuid}`, {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<BlogCategoryRecord>(response, 'Failed to update blog category.');
}

export async function apiDeleteBlogCategory(uuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/blog-categories/${uuid}`, {
    method: 'DELETE',
    headers: buildHeaders(),
    credentials: 'include',
  });

  await parseJsonEnvelope(response, 'Failed to delete blog category.');
}

export async function apiCreateBlogTag(payload: BlogTagPayload): Promise<BlogTagRecord> {
  const response = await fetch(`${API_BASE_URL}/blog-tags`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<BlogTagRecord>(response, 'Failed to create blog tag.');
}

export async function apiUpdateBlogTag(
  uuid: string,
  payload: BlogTagPayload,
): Promise<BlogTagRecord> {
  const response = await fetch(`${API_BASE_URL}/blog-tags/${uuid}`, {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<BlogTagRecord>(response, 'Failed to update blog tag.');
}

export async function apiDeleteBlogTag(uuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/blog-tags/${uuid}`, {
    method: 'DELETE',
    headers: buildHeaders(),
    credentials: 'include',
  });

  await parseJsonEnvelope(response, 'Failed to delete blog tag.');
}
