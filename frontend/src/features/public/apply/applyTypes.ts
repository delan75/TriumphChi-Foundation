import { PublicApplicationPayload } from '../../../lib/api';

export type NeedType = PublicApplicationPayload['need_type'];
export type ContactRole = PublicApplicationPayload['contact_role'];
export type ContactMethod = PublicApplicationPayload['preferred_contact_method'];
export type SchoolEnrollmentStatus = NonNullable<PublicApplicationPayload['school_enrollment_status']>;
export type ApplyingFor = NonNullable<PublicApplicationPayload['applying_for']>;

export interface ApplicationFormState {
  applying_for: ApplyingFor;
  child_name: string;
  gender: string;
  date_of_birth: string;
  school_name: string;
  grade_level: string;
  region_name: string;
  village_name: string;
  school_enrollment_status: SchoolEnrollmentStatus;
  last_school_attended: string;
  education_interruption_reason: string;
  teacher_school_name: string;
  teacher_position: string;
  institution_name: string;
  institution_role: string;
  fee_amount: string;
  fee_due_date: string;
  exam_name: string;
  exam_date: string;
  exam_fee_amount: string;
  need_type: NeedType;
  need_summary: string;
  situation_summary: string;
  household_income_range: string;
  household_size: string;
  primary_caregiver_occupation: string;
  household_challenges: string;
  contact_role: ContactRole;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  preferred_contact_method: ContactMethod;
  consent: boolean;
}

export type ApplicationFormErrors = Partial<Record<keyof ApplicationFormState, string>>;

export interface DraftState {
  stepIndex: number;
  form: ApplicationFormState;
  updatedAt: string;
}

export interface ReviewGroup {
  title: string;
  items: Array<[string, string]>;
}

export const initialApplicationForm: ApplicationFormState = {
  applying_for: 'child',
  child_name: '',
  gender: '',
  date_of_birth: '',
  school_name: '',
  grade_level: '',
  region_name: '',
  village_name: '',
  school_enrollment_status: 'unsure',
  last_school_attended: '',
  education_interruption_reason: '',
  teacher_school_name: '',
  teacher_position: '',
  institution_name: '',
  institution_role: '',
  fee_amount: '',
  fee_due_date: '',
  exam_name: '',
  exam_date: '',
  exam_fee_amount: '',
  need_type: 'fees',
  need_summary: '',
  situation_summary: '',
  household_income_range: '',
  household_size: '',
  primary_caregiver_occupation: '',
  household_challenges: '',
  contact_role: 'guardian',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  preferred_contact_method: 'phone',
  consent: false,
};
