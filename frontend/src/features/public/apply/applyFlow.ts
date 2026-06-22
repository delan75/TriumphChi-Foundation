import { BookOpen, HeartHandshake, Home, Phone, ShieldCheck, UsersRound } from 'lucide-react';
import { ApplyCopy } from './applyCopy';
import {
  ApplicationFormErrors,
  ApplicationFormState,
  ReviewGroup,
} from './applyTypes';

export interface ApplyStep {
  key: 'applyingFor' | 'child' | 'education' | 'need' | 'household' | 'contact' | 'review';
  label: string;
  icon: typeof Home;
}

export function getApplySteps(copy: ApplyCopy, isAuthenticated: boolean): ApplyStep[] {
  const allSteps: ApplyStep[] = [
    { key: 'applyingFor', label: copy.stepLabels.applyingFor, icon: UsersRound },
    { key: 'child', label: copy.stepLabels.child, icon: Home },
    { key: 'education', label: copy.stepLabels.education, icon: BookOpen },
    { key: 'need', label: copy.stepLabels.need, icon: HeartHandshake },
    { key: 'household', label: copy.stepLabels.household, icon: Home },
    { key: 'contact', label: copy.stepLabels.contact, icon: Phone },
    { key: 'review', label: copy.stepLabels.review, icon: ShieldCheck },
  ];

  if (isAuthenticated) {
    return allSteps;
  }

  return allSteps.filter((step) => !['applyingFor', 'household'].includes(step.key));
}

export function stepFieldKeys(stepKey: ApplyStep['key']): Array<keyof ApplicationFormState> {
  switch (stepKey) {
    case 'applyingFor':
      return ['applying_for'];
    case 'child':
      return ['child_name', 'gender', 'date_of_birth'];
    case 'education':
      return [
        'school_name',
        'grade_level',
        'region_name',
        'village_name',
        'school_enrollment_status',
        'last_school_attended',
        'education_interruption_reason',
      ];
    case 'need':
      return [
        'need_type',
        'need_summary',
        'situation_summary',
        'fee_amount',
        'fee_due_date',
        'exam_name',
        'exam_date',
        'exam_fee_amount',
      ];
    case 'household':
      return [
        'household_income_range',
        'household_size',
        'primary_caregiver_occupation',
        'household_challenges',
      ];
    case 'contact':
      return [
        'contact_role',
        'contact_name',
        'contact_phone',
        'contact_email',
        'preferred_contact_method',
        'teacher_school_name',
        'teacher_position',
        'institution_name',
        'institution_role',
      ];
    default:
      return ['consent'];
  }
}

export function validateStep(
  stepKey: ApplyStep['key'],
  form: ApplicationFormState,
  copy: ApplyCopy,
): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {};

  if (stepKey === 'child' && !form.child_name.trim()) {
    errors.child_name = copy.validation.childName;
  }

  if (stepKey === 'education') {
    if (!form.school_enrollment_status) {
      errors.school_enrollment_status = copy.validation.schoolEnrollmentStatus;
    }

    if (form.school_enrollment_status === 'enrolled' && !form.school_name.trim()) {
      errors.school_name = copy.validation.schoolNameCurrent;
    }

    if (form.school_enrollment_status === 'not_enrolled') {
      if (!form.last_school_attended.trim()) {
        errors.last_school_attended = copy.validation.lastSchoolAttended;
      }

      if (!form.education_interruption_reason.trim()) {
        errors.education_interruption_reason = copy.validation.educationInterruptionReason;
      }
    }
  }

  if (stepKey === 'need') {
    if (!form.need_summary.trim()) {
      errors.need_summary = copy.validation.needSummary;
    }

    if (!form.situation_summary.trim()) {
      errors.situation_summary = copy.validation.situationSummary;
    }

    if (form.need_type === 'fees' && !form.fee_amount.trim()) {
      errors.fee_amount = copy.validation.feeAmount;
    }

    if (form.need_type === 'exam') {
      if (!form.exam_name.trim()) {
        errors.exam_name = copy.validation.examName;
      }

      if (!form.exam_fee_amount.trim()) {
        errors.exam_fee_amount = copy.validation.examFeeAmount;
      }
    }
  }

  if (stepKey === 'contact') {
    if (!form.contact_name.trim()) {
      errors.contact_name = copy.validation.contactName;
    }

    if (!form.contact_phone.trim()) {
      errors.contact_phone = copy.validation.contactPhone;
    }

    if (form.contact_role === 'teacher') {
      if (!form.teacher_school_name.trim()) {
        errors.teacher_school_name = copy.validation.teacherSchoolName;
      }

      if (!form.teacher_position.trim()) {
        errors.teacher_position = copy.validation.teacherPosition;
      }
    }

    if (form.contact_role === 'school_representative' || form.contact_role === 'school') {
      if (!form.institution_name.trim()) {
        errors.institution_name = copy.validation.institutionName;
      }

      if (!form.institution_role.trim()) {
        errors.institution_role = copy.validation.institutionRole;
      }
    }
  }

  return errors;
}

export function validateAll(
  steps: ApplyStep[],
  form: ApplicationFormState,
  copy: ApplyCopy,
): ApplicationFormErrors {
  return {
    ...steps.reduce<ApplicationFormErrors>(
      (allErrors, step) => ({ ...allErrors, ...validateStep(step.key, form, copy) }),
      {},
    ),
    ...(form.consent ? {} : { consent: copy.validation.consent }),
  };
}

export function findFirstInvalidStep(steps: ApplyStep[], errors: ApplicationFormErrors): number {
  const index = steps.findIndex((step) =>
    stepFieldKeys(step.key).some((field) => Boolean(errors[field])),
  );

  return index >= 0 ? index : steps.length - 1;
}

export function buildReviewGroups(
  form: ApplicationFormState,
  copy: ApplyCopy,
  locale: string,
  options: { includeApplyingFor?: boolean; includeHousehold?: boolean } = {},
): ReviewGroup[] {
  const formatDate = form.date_of_birth ? new Date(form.date_of_birth).toLocaleDateString(locale) : copy.optionalValue;

  const groups: ReviewGroup[] = [
    {
      title: copy.reviewSections.child,
      items: [
        [copy.fields.childName, form.child_name],
        [copy.fields.gender, form.gender || copy.optionalValue],
        [copy.fields.dateOfBirth, formatDate],
      ],
    },
    {
      title: copy.reviewSections.education,
      items: [
        [copy.fields.schoolEnrollmentStatus, copy.schoolEnrollmentStatuses.find((item) => item.value === form.school_enrollment_status)?.label ?? form.school_enrollment_status],
        [copy.fields.schoolName, form.school_name || copy.optionalValue],
        [copy.fields.gradeLevel, form.grade_level || copy.optionalValue],
        [copy.fields.regionName, form.region_name || copy.optionalValue],
        [copy.fields.villageName, form.village_name || copy.optionalValue],
        [copy.fields.lastSchoolAttended, form.last_school_attended || copy.optionalValue],
      ],
    },
    {
      title: copy.reviewSections.need,
      items: [
        [copy.fields.needType, copy.needTypes.find((item) => item.value === form.need_type)?.label ?? form.need_type],
        [copy.fields.needSummary, truncate(form.need_summary)],
        [copy.fields.situationSummary, truncate(form.situation_summary)],
        [copy.fields.feeAmount, form.fee_amount || copy.optionalValue],
        [copy.fields.examName, form.exam_name || copy.optionalValue],
      ],
    },
    {
      title: copy.reviewSections.contact,
      items: [
        [copy.fields.contactRole, copy.contactRoles.find((item) => item.value === form.contact_role)?.label ?? form.contact_role],
        [copy.fields.contactName, form.contact_name],
        [copy.fields.contactPhone, form.contact_phone],
        [copy.fields.contactEmail, form.contact_email || copy.optionalValue],
        [copy.fields.contactMethod, copy.contactMethods.find((item) => item.value === form.preferred_contact_method)?.label ?? form.preferred_contact_method],
      ],
    },
  ];

  if (options.includeApplyingFor) {
    groups[0] = {
      ...groups[0],
      items: [
        [copy.fields.applyingFor, copy.applyingForOptions.find((item) => item.value === form.applying_for)?.label ?? form.applying_for],
        ...groups[0].items,
      ],
    };
  }

  if (options.includeHousehold) {
    groups.splice(3, 0, {
      title: copy.reviewSections.household,
      items: [
        [copy.fields.householdIncome, form.household_income_range || copy.optionalValue],
        [copy.fields.householdSize, form.household_size || copy.optionalValue],
        [copy.fields.primaryCaregiverOccupation, form.primary_caregiver_occupation || copy.optionalValue],
        [copy.fields.householdChallenges, truncate(form.household_challenges || copy.optionalValue)],
      ],
    });
  }

  return groups;
}

function truncate(value: string): string {
  return value.length > 120 ? `${value.substring(0, 120)}...` : value;
}
