import { InputField } from '../../../components/ui/InputField';
import { SelectField } from '../../../components/ui/SelectField';
import { TextAreaField } from '../../../components/ui/TextAreaField';
import { DateOfBirthInput } from '../../../components/ui/DateOfBirthInput';
import { ApplyCopy } from './applyCopy';
import { ApplyStep } from './applyFlow';
import {
  ApplicationFormErrors,
  ApplicationFormState,
  ApplyingFor,
  ContactMethod,
  ContactRole,
  NeedType,
  ReviewGroup,
  SchoolEnrollmentStatus,
} from './applyTypes';

interface ApplyStepContentProps {
  step: ApplyStep;
  form: ApplicationFormState;
  errors: ApplicationFormErrors;
  copy: ApplyCopy;
  locale: string;
  reviewGroups: ReviewGroup[];
  updateField: <Field extends keyof ApplicationFormState>(field: Field, value: ApplicationFormState[Field]) => void;
}

export function ApplyStepContent({
  step,
  form,
  errors,
  copy,
  locale,
  reviewGroups,
  updateField,
}: ApplyStepContentProps) {
  switch (step.key) {
    case 'applyingFor':
      return <ApplyingForStep form={form} copy={copy} updateField={updateField} />;
    case 'child':
      return <ChildStep form={form} errors={errors} copy={copy} locale={locale} updateField={updateField} />;
    case 'education':
      return <EducationStep form={form} errors={errors} copy={copy} updateField={updateField} />;
    case 'need':
      return <NeedStep form={form} errors={errors} copy={copy} updateField={updateField} />;
    case 'household':
      return <HouseholdStep form={form} errors={errors} copy={copy} updateField={updateField} />;
    case 'contact':
      return <ContactStep form={form} errors={errors} copy={copy} updateField={updateField} />;
    default:
      return <ReviewStep form={form} errors={errors} copy={copy} reviewGroups={reviewGroups} updateField={updateField} />;
  }
}

function ApplyingForStep({
  form,
  copy,
  updateField,
}: Pick<ApplyStepContentProps, 'form' | 'copy' | 'updateField'>) {
  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{copy.stepLabels.applyingFor}</legend>
      <SelectField
        id="applying_for"
        label={copy.fields.applyingFor}
        value={form.applying_for}
        onChange={(event) => updateField('applying_for', event.target.value as ApplyingFor)}
        required
      >
        {copy.applyingForOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      {form.applying_for === 'self' ? (
        <div className="rounded-md border border-foundation-100 bg-foundation-50 p-4 text-sm leading-6 text-foundation-900">
          {copy.childApplicantNote}
        </div>
      ) : null}
    </fieldset>
  );
}

function ChildStep({
  form,
  errors,
  copy,
  locale,
  updateField,
}: Pick<ApplyStepContentProps, 'form' | 'errors' | 'copy' | 'locale' | 'updateField'>) {
  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{copy.stepLabels.child}</legend>
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField
          id="child_name"
          label={copy.fields.childName}
          value={form.child_name}
          onChange={(event) => updateField('child_name', event.target.value)}
          error={errors.child_name}
          required
        />
        <SelectField
          id="gender"
          label={copy.fields.gender}
          value={form.gender}
          onChange={(event) => updateField('gender', event.target.value)}
          error={errors.gender}
        >
          {copy.genders.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>
      <DateOfBirthInput
        id="date_of_birth"
        label={copy.fields.dateOfBirth}
        value={form.date_of_birth}
        onChange={(value) => updateField('date_of_birth', value)}
        error={errors.date_of_birth}
        helpText={copy.optionalHint}
        locale={locale}
      />
    </fieldset>
  );
}

function EducationStep({
  form,
  errors,
  copy,
  updateField,
}: Pick<ApplyStepContentProps, 'form' | 'errors' | 'copy' | 'updateField'>) {
  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{copy.stepLabels.education}</legend>
      <SelectField
        id="school_enrollment_status"
        label={copy.fields.schoolEnrollmentStatus}
        value={form.school_enrollment_status}
        onChange={(event) => updateField('school_enrollment_status', event.target.value as SchoolEnrollmentStatus)}
        error={errors.school_enrollment_status}
        required
      >
        {copy.schoolEnrollmentStatuses.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField
          id="school_name"
          label={copy.fields.schoolName}
          value={form.school_name}
          onChange={(event) => updateField('school_name', event.target.value)}
          error={errors.school_name}
          helpText={copy.schoolHint}
          placeholder={copy.schoolPlaceholder}
          list="school_name-suggestions"
          required={form.school_enrollment_status === 'enrolled'}
        />
        <InputField
          id="grade_level"
          label={copy.fields.gradeLevel}
          value={form.grade_level}
          onChange={(event) => updateField('grade_level', event.target.value)}
          error={errors.grade_level}
          helpText={copy.optionalHint}
          placeholder={copy.gradeLevelPlaceholder}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField
          id="region_name"
          label={copy.fields.regionName}
          value={form.region_name}
          onChange={(event) => updateField('region_name', event.target.value)}
          error={errors.region_name}
          helpText={copy.optionalHint}
          list="region_name-suggestions"
        />
        <InputField
          id="village_name"
          label={copy.fields.villageName}
          value={form.village_name}
          onChange={(event) => updateField('village_name', event.target.value)}
          error={errors.village_name}
          helpText={copy.optionalHint}
          list="village_name-suggestions"
        />
      </div>
      {form.school_enrollment_status === 'not_enrolled' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            id="last_school_attended"
            label={copy.fields.lastSchoolAttended}
            value={form.last_school_attended}
            onChange={(event) => updateField('last_school_attended', event.target.value)}
            error={errors.last_school_attended}
            helpText={copy.lastSchoolHint}
            required
          />
          <InputField
            id="education_interruption_reason"
            label={copy.fields.educationInterruptionReason}
            value={form.education_interruption_reason}
            onChange={(event) => updateField('education_interruption_reason', event.target.value)}
            error={errors.education_interruption_reason}
            helpText={copy.interruptionHint}
            required
          />
        </div>
      ) : null}
    </fieldset>
  );
}

function NeedStep({
  form,
  errors,
  copy,
  updateField,
}: Pick<ApplyStepContentProps, 'form' | 'errors' | 'copy' | 'updateField'>) {
  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{copy.stepLabels.need}</legend>
      <SelectField
        id="need_type"
        label={copy.fields.needType}
        value={form.need_type}
        onChange={(event) => updateField('need_type', event.target.value as NeedType)}
        error={errors.need_type}
        required
      >
        {copy.needTypes.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      {form.need_type === 'fees' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            id="fee_amount"
            label={copy.fields.feeAmount}
            value={form.fee_amount}
            onChange={(event) => updateField('fee_amount', event.target.value)}
            error={errors.fee_amount}
            helpText={copy.feeAmountHint}
            required
          />
          <InputField
            id="fee_due_date"
            type="date"
            label={copy.fields.feeDueDate}
            value={form.fee_due_date}
            onChange={(event) => updateField('fee_due_date', event.target.value)}
            error={errors.fee_due_date}
            helpText={copy.optionalHint}
          />
        </div>
      ) : null}
      {form.need_type === 'exam' ? (
        <div className="grid gap-5 sm:grid-cols-3">
          <InputField
            id="exam_name"
            label={copy.fields.examName}
            value={form.exam_name}
            onChange={(event) => updateField('exam_name', event.target.value)}
            error={errors.exam_name}
            required
          />
          <InputField
            id="exam_date"
            type="date"
            label={copy.fields.examDate}
            value={form.exam_date}
            onChange={(event) => updateField('exam_date', event.target.value)}
            error={errors.exam_date}
            helpText={copy.optionalHint}
          />
          <InputField
            id="exam_fee_amount"
            label={copy.fields.examFeeAmount}
            value={form.exam_fee_amount}
            onChange={(event) => updateField('exam_fee_amount', event.target.value)}
            error={errors.exam_fee_amount}
            helpText={copy.examFeeHint}
            required
          />
        </div>
      ) : null}
      <TextAreaField
        id="need_summary"
        label={copy.fields.needSummary}
        value={form.need_summary}
        onChange={(event) => updateField('need_summary', event.target.value)}
        error={errors.need_summary}
        helpText={copy.needSummaryHint}
        maxLength={5000}
        required
      />
      <TextAreaField
        id="situation_summary"
        label={copy.fields.situationSummary}
        value={form.situation_summary}
        onChange={(event) => updateField('situation_summary', event.target.value)}
        error={errors.situation_summary}
        helpText={copy.situationSummaryHint}
        maxLength={7000}
        required
      />
    </fieldset>
  );
}

function HouseholdStep({
  form,
  errors,
  copy,
  updateField,
}: Pick<ApplyStepContentProps, 'form' | 'errors' | 'copy' | 'updateField'>) {
  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{copy.stepLabels.household}</legend>
      <div className="grid gap-5 sm:grid-cols-3">
        <InputField
          id="household_income_range"
          label={copy.fields.householdIncome}
          value={form.household_income_range}
          onChange={(event) => updateField('household_income_range', event.target.value)}
          error={errors.household_income_range}
          helpText={copy.optionalHint}
        />
        <InputField
          id="household_size"
          type="number"
          min={1}
          label={copy.fields.householdSize}
          value={form.household_size}
          onChange={(event) => updateField('household_size', event.target.value)}
          error={errors.household_size}
          helpText={copy.optionalHint}
        />
        <InputField
          id="primary_caregiver_occupation"
          label={copy.fields.primaryCaregiverOccupation}
          value={form.primary_caregiver_occupation}
          onChange={(event) => updateField('primary_caregiver_occupation', event.target.value)}
          error={errors.primary_caregiver_occupation}
          helpText={copy.optionalHint}
        />
      </div>
      <TextAreaField
        id="household_challenges"
        label={copy.fields.householdChallenges}
        value={form.household_challenges}
        onChange={(event) => updateField('household_challenges', event.target.value)}
        error={errors.household_challenges}
        helpText={copy.optionalHint}
        maxLength={3000}
      />
    </fieldset>
  );
}

function ContactStep({
  form,
  errors,
  copy,
  updateField,
}: Pick<ApplyStepContentProps, 'form' | 'errors' | 'copy' | 'updateField'>) {
  const isSchoolContact = form.contact_role === 'school' || form.contact_role === 'school_representative';

  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{copy.stepLabels.contact}</legend>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          id="contact_role"
          label={copy.fields.contactRole}
          value={form.contact_role}
          onChange={(event) => updateField('contact_role', event.target.value as ContactRole)}
          error={errors.contact_role}
          required
        >
          {copy.contactRoles.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="preferred_contact_method"
          label={copy.fields.contactMethod}
          value={form.preferred_contact_method}
          onChange={(event) => updateField('preferred_contact_method', event.target.value as ContactMethod)}
          error={errors.preferred_contact_method}
          required
        >
          {copy.contactMethods.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>
      {form.contact_role === 'teacher' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            id="teacher_school_name"
            label={copy.fields.teacherSchoolName}
            value={form.teacher_school_name}
            onChange={(event) => updateField('teacher_school_name', event.target.value)}
            error={errors.teacher_school_name}
            required
          />
          <InputField
            id="teacher_position"
            label={copy.fields.teacherPosition}
            value={form.teacher_position}
            onChange={(event) => updateField('teacher_position', event.target.value)}
            error={errors.teacher_position}
            required
          />
        </div>
      ) : null}
      {isSchoolContact ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            id="institution_name"
            label={copy.fields.institutionName}
            value={form.institution_name}
            onChange={(event) => updateField('institution_name', event.target.value)}
            error={errors.institution_name}
            required
          />
          <InputField
            id="institution_role"
            label={copy.fields.institutionRole}
            value={form.institution_role}
            onChange={(event) => updateField('institution_role', event.target.value)}
            error={errors.institution_role}
            required
          />
        </div>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField
          id="contact_name"
          label={copy.fields.contactName}
          value={form.contact_name}
          onChange={(event) => updateField('contact_name', event.target.value)}
          error={errors.contact_name}
          required
        />
        <InputField
          id="contact_phone"
          type="tel"
          label={copy.fields.contactPhone}
          value={form.contact_phone}
          onChange={(event) => updateField('contact_phone', event.target.value)}
          error={errors.contact_phone}
          required
        />
      </div>
      <InputField
        id="contact_email"
        type="email"
        label={copy.fields.contactEmail}
        value={form.contact_email}
        onChange={(event) => updateField('contact_email', event.target.value)}
        error={errors.contact_email}
        helpText={copy.optionalHint}
      />
    </fieldset>
  );
}

function ReviewStep({
  form,
  errors,
  copy,
  reviewGroups,
  updateField,
}: Pick<ApplyStepContentProps, 'form' | 'errors' | 'copy' | 'reviewGroups' | 'updateField'>) {
  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{copy.stepLabels.review}</legend>
      <div className="rounded-md border border-foundation-100 bg-foundation-50 p-4">
        <p className="text-sm font-black uppercase text-foundation-600">{copy.reviewEyebrow}</p>
        <p className="mt-2 text-base leading-7 text-ink-700">{copy.reviewBody}</p>
      </div>
      <div className="grid gap-4">
        {reviewGroups.map((group) => (
          <article key={group.title} className="rounded-md border border-ink-100 bg-ink-50 p-4">
            <h3 className="text-sm font-black uppercase text-ink-500">{group.title}</h3>
            <dl className="mt-3 space-y-3">
              {group.items.map(([label, value]) => (
                <div key={`${group.title}-${label}`}>
                  <dt className="text-xs font-bold uppercase text-ink-500">{label}</dt>
                  <dd className="mt-1 text-sm leading-6 text-ink-800">{String(value) || copy.optionalValue}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <label className="flex gap-3 rounded-md border border-ink-100 bg-white p-4 text-sm leading-6 text-ink-700">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(event) => updateField('consent', event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-ink-300 text-foundation-600 focus:ring-foundation-500"
        />
        <span>
          {copy.consentLabel}
          {errors.consent ? <span className="mt-2 block text-support-red">{errors.consent}</span> : null}
        </span>
      </label>
    </fieldset>
  );
}
