export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'verification_pending'
  | 'verified'
  | 'review_pending'
  | 'accepted'
  | 'rejected';

export type BeneficiaryStatus =
  | 'awaiting_sponsorship'
  | 'partially_funded'
  | 'fully_funded'
  | 'active_support'
  | 'graduated'
  | 'archived';

export interface LifecycleStep {
  key: string;
  label: string;
  description: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}
