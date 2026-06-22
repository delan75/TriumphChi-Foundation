import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, FileText, HeartHandshake, Home, Mail, MapPin, Phone, School, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { apiSubmitPublicApplication, type PublicApplicationPayload } from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import { publicContact } from '../../../lib/publicContact';
import heroImage from '../../../assets/landing/school_kids_in_cameroon.jpg';

interface ApplyPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

type NeedType = PublicApplicationPayload['need_type'];
type ContactRole = PublicApplicationPayload['contact_role'];
type ContactMethod = PublicApplicationPayload['preferred_contact_method'];

interface ApplicationFormState {
  child_name: string;
  gender: string;
  date_of_birth: string;
  school_name: string;
  grade_level: string;
  region_name: string;
  village_name: string;
  need_type: NeedType;
  need_summary: string;
  situation_summary: string;
  contact_role: ContactRole;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  preferred_contact_method: ContactMethod;
  consent: boolean;
}

interface DraftState {
  stepIndex: number;
  form: ApplicationFormState;
  updatedAt: string;
}

const STORAGE_KEY = 'triumphchi.public-application.draft.v1';

const initialForm: ApplicationFormState = {
  child_name: '',
  gender: '',
  date_of_birth: '',
  school_name: '',
  grade_level: '',
  region_name: '',
  village_name: '',
  need_type: 'fees',
  need_summary: '',
  situation_summary: '',
  contact_role: 'guardian',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  preferred_contact_method: 'phone',
  consent: false,
};

const fieldGroups = [
  {
    key: 'child',
    icon: Home,
  },
  {
    key: 'need',
    icon: HeartHandshake,
  },
  {
    key: 'contact',
    icon: Phone,
  },
  {
    key: 'review',
    icon: ShieldCheck,
  },
] as const;

export function ApplyPage({ locale, page }: ApplyPageProps) {
  const copy = applyCopy[locale];
  const homePage = getPageByKey('home');
  const aboutPage = getPageByKey('about');
  const contactPage = getPageByKey('contact');
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string; reference?: string } | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const draft = readDraft();

    if (draft) {
      setForm(draft.form);
      setCurrentStep(Math.min(draft.stepIndex, fieldGroups.length - 1));
      setSavedAt(draft.updatedAt);
      setHasDraft(true);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const hasMeaningfulDraft =
        Boolean(form.child_name.trim()) ||
        Boolean(form.gender.trim()) ||
        Boolean(form.date_of_birth.trim()) ||
        Boolean(form.school_name.trim()) ||
        Boolean(form.grade_level.trim()) ||
        Boolean(form.region_name.trim()) ||
        Boolean(form.village_name.trim()) ||
        Boolean(form.need_summary.trim()) ||
        Boolean(form.situation_summary.trim()) ||
        Boolean(form.contact_name.trim()) ||
        Boolean(form.contact_phone.trim()) ||
        Boolean(form.contact_email.trim()) ||
        Boolean(form.consent);

      if (!hasMeaningfulDraft) {
        window.localStorage.removeItem(STORAGE_KEY);
        setHasDraft(false);
        return;
      }

      const payload: DraftState = {
        stepIndex: currentStep,
        form,
        updatedAt: new Date().toISOString(),
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSavedAt(payload.updatedAt);
      setHasDraft(true);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [currentStep, form]);

  const stepLabels = [
    copy.childStepLabel,
    copy.needStepLabel,
    copy.contactStepLabel,
    copy.reviewStepLabel,
  ];

  const contactRows = [
    { icon: Mail, label: copy.contactCards.email, value: publicContact.email, href: publicContact.emailHref },
    { icon: Phone, label: copy.contactCards.phone, value: publicContact.phoneDisplay, href: publicContact.phoneHref },
    { icon: MapPin, label: copy.contactCards.location, value: publicContact.location[locale], href: `/${locale}${contactPage.path[locale]}` },
    { icon: Clock3, label: copy.contactCards.responseTime, value: publicContact.responseTime[locale], href: `/${locale}${contactPage.path[locale]}` },
  ];

  const progress = ((currentStep + 1) / fieldGroups.length) * 100;
  const reviewGroups = [
    {
      title: copy.reviewSections.child,
      items: [
        [copy.fields.childName, form.child_name],
        [copy.fields.gender, form.gender || copy.optionalValue],
        [copy.fields.dateOfBirth, form.date_of_birth || copy.optionalValue],
        [copy.fields.schoolName, form.school_name || copy.optionalValue],
        [copy.fields.gradeLevel, form.grade_level || copy.optionalValue],
      ],
    },
    {
      title: copy.reviewSections.need,
      items: [
        [copy.fields.needType, copy.needTypes.find((item) => item.value === form.need_type)?.label ?? form.need_type],
        [copy.fields.needSummary, form.need_summary],
        [copy.fields.situationSummary, form.situation_summary],
        [copy.fields.regionName, form.region_name || copy.optionalValue],
        [copy.fields.villageName, form.village_name || copy.optionalValue],
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
  ] as const;

  const updateField = <Field extends keyof ApplicationFormState>(field: Field, value: ApplicationFormState[Field]) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (submitMessage) {
      setSubmitMessage(null);
    }
  };

  const goNext = () => {
    const nextErrors = validateStep(currentStep, form, copy);

    if (Object.keys(nextErrors).length > 0) {
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    setErrors((current) => {
      const next = { ...current };
      for (const key of stepFieldKeys(currentStep)) {
        delete next[key];
      }
      return next;
    });
    setCurrentStep((step) => Math.min(step + 1, fieldGroups.length - 1));
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const clearDraft = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setForm(initialForm);
    setCurrentStep(0);
    setErrors({});
    setSubmitMessage(null);
    setSavedAt(null);
    setHasDraft(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalErrors = validateAll(form, copy);
    setErrors(finalErrors);
    setSubmitMessage(null);

    if (Object.keys(finalErrors).length > 0) {
      setCurrentStep(findFirstInvalidStep(finalErrors));
      setSubmitMessage({ type: 'error', text: copy.validation.review });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiSubmitPublicApplication(
        {
          child_name: form.child_name.trim(),
          gender: form.gender.trim() || undefined,
          date_of_birth: form.date_of_birth || undefined,
          school_name: form.school_name.trim() || undefined,
          grade_level: form.grade_level.trim() || undefined,
          region_name: form.region_name.trim() || undefined,
          village_name: form.village_name.trim() || undefined,
          need_type: form.need_type,
          need_summary: form.need_summary.trim(),
          situation_summary: form.situation_summary.trim(),
          contact_role: form.contact_role,
          contact_name: form.contact_name.trim(),
          contact_phone: form.contact_phone.trim(),
          contact_email: form.contact_email.trim() || undefined,
          preferred_contact_method: form.preferred_contact_method,
          consent: form.consent,
        },
        locale,
      );

      window.localStorage.removeItem(STORAGE_KEY);
      setHasDraft(false);
      setSavedAt(null);
      setSubmitMessage({
        type: 'success',
        text: response.message,
        reference: response.data?.application_number,
      });
      setForm(initialForm);
      setCurrentStep(0);
      setErrors({});
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : copy.validation.failed,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = renderStepContent(currentStep, form, errors, copy, updateField, reviewGroups);

  return (
    <>
      <Seo
        meta={{
          title: page.seoTitle?.[locale] ?? page.title[locale],
          description: page.seoDescription?.[locale] ?? page.description[locale],
          path: page.path,
          locale,
          image: heroImage,
        }}
        structuredData={buildPublicPageSchema(page, locale)}
      />

      <PublicPageTitle
        locale={locale}
        title={page.title[locale]}
        description={page.description[locale]}
        backgroundImage={heroImage}
        backgroundAlt={copy.heroImageAlt}
        breadcrumbs={[
          { label: homePage.label[locale], to: `/${locale}${homePage.path[locale]}` },
          { label: page.label[locale] },
        ]}
        actions={
          <>
            <a
              href="#application-form"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-foundation-900 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-50"
            >
              {copy.startCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              to={`/${locale}${aboutPage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.18]"
            >
              {copy.aboutCta}
            </Link>
          </>
        }
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <div className="self-center">
            <SectionIntro eyebrow={copy.introEyebrow} title={copy.introTitle} body={copy.introBody} />
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {copy.highlights.map((item) => (
                <article key={item.title} className="rounded-md border border-ink-100 bg-ink-50 p-4 shadow-sm">
                  <item.icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h2 className="mt-4 text-base font-black text-ink-900">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div id="application-form" className="scroll-mt-24 rounded-md border border-ink-100 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase text-foundation-600">{copy.formEyebrow}</p>
                <h2 className="mt-2 text-3xl font-black leading-tight text-ink-900">{copy.formTitle}</h2>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill
                  label={savedAt ? `${copy.lastSavedLabel} ${formatSavedAt(savedAt, locale)}` : copy.saveDraftLabel}
                  tone={hasDraft ? 'success' : 'neutral'}
                />
                {hasDraft ? (
                  <button
                    type="button"
                    onClick={clearDraft}
                    className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-ink-100 px-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
                  >
                    {copy.clearDraftLabel}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-normal text-ink-500">
                <span>{copy.progressLabel}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-ink-100" aria-hidden="true">
                <div className="h-2 rounded-full bg-foundation-600 transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                {stepLabels.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      'focus-ring flex min-h-12 items-center gap-3 rounded-md border px-3 text-left text-sm font-semibold transition',
                      currentStep === index
                        ? 'border-foundation-200 bg-foundation-50 text-foundation-900'
                        : 'border-ink-100 bg-white text-ink-700 hover:bg-ink-50',
                    )}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-ink-100 text-xs font-black text-ink-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-5">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-5" noValidate>
              {content}

              <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  {currentStep > 0 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-ink-100 px-5 text-sm font-black text-ink-700 transition hover:bg-ink-50"
                    >
                      {copy.backLabel}
                    </button>
                  ) : null}

                  {currentStep < fieldGroups.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white transition hover:bg-foundation-900"
                    >
                      {copy.continueLabel}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        'focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white transition hover:bg-foundation-900',
                        isSubmitting && 'cursor-not-allowed opacity-60 hover:bg-foundation-600',
                      )}
                    >
                      {isSubmitting ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      )}
                      {isSubmitting ? copy.sendingLabel : copy.submitLabel}
                    </button>
                  )}
                </div>

                {submitMessage ? (
                  <div
                    className={cn(
                      'rounded-md border px-4 py-3 text-sm leading-6 sm:max-w-xl',
                      submitMessage.type === 'success'
                        ? 'border-foundation-100 bg-foundation-50 text-foundation-900'
                        : 'border-support-red/20 bg-support-red/5 text-support-red',
                    )}
                    role={submitMessage.type === 'success' ? 'status' : 'alert'}
                    aria-live="polite"
                  >
                    <div className="flex gap-2">
                      {submitMessage.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                      <div>
                        <p>{submitMessage.text}</p>
                        {submitMessage.reference ? (
                          <p className="mt-1 font-semibold">{copy.referenceLabel}: {submitMessage.reference}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.nextStepsEyebrow} title={copy.nextStepsTitle} body={copy.nextStepsBody} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.nextSteps.map((item, index) => (
              <article key={item.title} className="rounded-md border border-foundation-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-foundation-600 text-white">
                    {index + 1}
                  </span>
                  <span className="text-xs font-black uppercase text-foundation-600">{item.caption}</span>
                </div>
                <h2 className="mt-4 text-lg font-black text-ink-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-500">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-16">
          <div id="help-card" className="rounded-md border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black uppercase text-foundation-600">{copy.helpEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-ink-900">{copy.helpTitle}</h2>
            <p className="mt-3 text-base leading-7 text-ink-500">{copy.helpBody}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {contactRows.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="focus-ring rounded-md border border-ink-100 bg-ink-50 p-4 transition duration-200 hover:-translate-y-1 hover:border-foundation-100 hover:bg-foundation-50"
                >
                  <Icon className="h-5 w-5 text-foundation-600" aria-hidden="true" />
                  <p className="mt-3 text-sm font-black text-ink-900">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-500">{item.value}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function renderStepContent(
  stepIndex: number,
  form: ApplicationFormState,
  errors: Partial<Record<keyof ApplicationFormState, string>>,
  copy: typeof applyCopy.en,
  updateField: <Field extends keyof ApplicationFormState>(field: Field, value: ApplicationFormState[Field]) => void,
  reviewGroups: ReadonlyArray<{ readonly title: string; readonly items: ReadonlyArray<readonly [string, string]> }>,
) {
  if (stepIndex === 0) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.childStepLabel}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.fields.childName} id="child_name" error={errors.child_name} required>
            <input id="child_name" type="text" value={form.child_name} onChange={(event) => updateField('child_name', event.target.value)} className={fieldClass(Boolean(errors.child_name))} />
          </Field>
          <Field label={copy.fields.gender} id="gender">
            <select id="gender" value={form.gender} onChange={(event) => updateField('gender', event.target.value)} className={fieldClass(Boolean(errors.gender))}>
              {copy.genders.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.fields.dateOfBirth} id="date_of_birth" helpText={copy.optionalHint}>
            <input id="date_of_birth" type="date" value={form.date_of_birth} onChange={(event) => updateField('date_of_birth', event.target.value)} className={fieldClass(Boolean(errors.date_of_birth))} />
          </Field>
          <Field label={copy.fields.gradeLevel} id="grade_level" helpText={copy.optionalHint}>
            <input id="grade_level" type="text" value={form.grade_level} onChange={(event) => updateField('grade_level', event.target.value)} className={fieldClass(Boolean(errors.grade_level))} placeholder={copy.gradeLevelPlaceholder} />
          </Field>
        </div>
        <Field label={copy.fields.schoolName} id="school_name" helpText={copy.schoolHint}>
          <input id="school_name" type="text" value={form.school_name} onChange={(event) => updateField('school_name', event.target.value)} className={fieldClass(Boolean(errors.school_name))} placeholder={copy.schoolPlaceholder} />
        </Field>
      </fieldset>
    );
  }

  if (stepIndex === 1) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.needStepLabel}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.fields.needType} id="need_type" error={errors.need_type} required>
            <select id="need_type" value={form.need_type} onChange={(event) => updateField('need_type', event.target.value as NeedType)} className={fieldClass(Boolean(errors.need_type))}>
              {copy.needTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={copy.fields.regionName} id="region_name" helpText={copy.optionalHint}>
            <input id="region_name" type="text" value={form.region_name} onChange={(event) => updateField('region_name', event.target.value)} className={fieldClass(Boolean(errors.region_name))} />
          </Field>
        </div>
        <Field label={copy.fields.villageName} id="village_name" helpText={copy.optionalHint}>
          <input id="village_name" type="text" value={form.village_name} onChange={(event) => updateField('village_name', event.target.value)} className={fieldClass(Boolean(errors.village_name))} />
        </Field>
        <Field label={copy.fields.needSummary} id="need_summary" error={errors.need_summary} required helpText={copy.needSummaryHint}>
          <textarea id="need_summary" rows={5} value={form.need_summary} onChange={(event) => updateField('need_summary', event.target.value)} className={cn(fieldClass(Boolean(errors.need_summary)), 'min-h-36 resize-y leading-6')} />
        </Field>
        <Field label={copy.fields.situationSummary} id="situation_summary" error={errors.situation_summary} required helpText={copy.situationSummaryHint}>
          <textarea id="situation_summary" rows={5} value={form.situation_summary} onChange={(event) => updateField('situation_summary', event.target.value)} className={cn(fieldClass(Boolean(errors.situation_summary)), 'min-h-36 resize-y leading-6')} />
        </Field>
      </fieldset>
    );
  }

  if (stepIndex === 2) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.contactStepLabel}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.fields.contactRole} id="contact_role" error={errors.contact_role} required>
            <select id="contact_role" value={form.contact_role} onChange={(event) => updateField('contact_role', event.target.value as ContactRole)} className={fieldClass(Boolean(errors.contact_role))}>
              {copy.contactRoles.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={copy.fields.contactMethod} id="preferred_contact_method" error={errors.preferred_contact_method} required>
            <select id="preferred_contact_method" value={form.preferred_contact_method} onChange={(event) => updateField('preferred_contact_method', event.target.value as ContactMethod)} className={fieldClass(Boolean(errors.preferred_contact_method))}>
              {copy.contactMethods.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.fields.contactName} id="contact_name" error={errors.contact_name} required>
            <input id="contact_name" type="text" value={form.contact_name} onChange={(event) => updateField('contact_name', event.target.value)} className={fieldClass(Boolean(errors.contact_name))} />
          </Field>
          <Field label={copy.fields.contactPhone} id="contact_phone" error={errors.contact_phone} required>
            <input id="contact_phone" type="tel" value={form.contact_phone} onChange={(event) => updateField('contact_phone', event.target.value)} className={fieldClass(Boolean(errors.contact_phone))} />
          </Field>
        </div>
        <Field label={copy.fields.contactEmail} id="contact_email" helpText={copy.optionalHint}>
          <input id="contact_email" type="email" value={form.contact_email} onChange={(event) => updateField('contact_email', event.target.value)} className={fieldClass(Boolean(errors.contact_email))} />
        </Field>
      </fieldset>
    );
  }

  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{copy.reviewStepLabel}</legend>
      <div className="rounded-md border border-foundation-100 bg-foundation-50 p-4">
        <p className="text-sm font-black uppercase text-foundation-600">{copy.reviewEyebrow}</p>
        <p className="mt-2 text-base leading-7 text-ink-700">{copy.reviewBody}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {reviewGroups.map((group) => (
          <article key={group.title} className="rounded-md border border-ink-100 bg-ink-50 p-4">
            <h3 className="text-sm font-black uppercase text-ink-500">{group.title}</h3>
            <dl className="mt-3 space-y-3">
              {group.items.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold uppercase text-ink-500">{label}</dt>
                  <dd className="mt-1 text-sm leading-6 text-ink-800">{String(value) || copy.optionalValue}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <label className="flex items-start gap-3 rounded-md border border-ink-100 bg-white p-4 text-sm leading-6 text-ink-600">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(event) => updateField('consent', event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-ink-300 text-foundation-600 focus:ring-foundation-500"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? 'application-consent-error' : undefined}
        />
        <span>
          {copy.consentLabel}
          {errors.consent ? (
            <span id="application-consent-error" className="mt-2 block text-sm text-support-red">
              {errors.consent}
            </span>
          ) : null}
        </span>
      </label>
    </fieldset>
  );
}

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-black uppercase text-foundation-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight text-ink-900 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-ink-500">{body}</p>
    </div>
  );
}

function Field({
  label,
  id,
  error,
  helpText,
  children,
  required,
}: {
  label: string;
  id: string;
  error?: string;
  helpText?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink-700">
        {label}
        {required ? <span className="ml-1 text-support-red">*</span> : null}
      </label>
      <div className="mt-1">{children}</div>
      {helpText ? (
        <p id={`${id}-help`} className="mt-2 text-xs leading-5 text-ink-500">
          {helpText}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-support-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' }) {
  return (
    <span className={cn('inline-flex min-h-8 items-center rounded-md px-3 text-xs font-bold', tone === 'success' ? 'bg-foundation-50 text-foundation-800' : 'bg-ink-100 text-ink-600')}>
      {label}
    </span>
  );
}

function fieldClass(hasError: boolean) {
  return cn(
    'block min-h-12 w-full rounded-md border bg-white px-3 py-2.5 text-base text-ink-900 shadow-sm transition duration-200 focus:outline-none sm:text-sm',
    hasError
      ? 'border-support-red focus:border-support-red focus:ring-2 focus:ring-support-red/20'
      : 'border-ink-200 focus:border-foundation-500 focus:ring-2 focus:ring-foundation-500/20',
  );
}

function formatSavedAt(savedAt: string, locale: Locale): string {
  const date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) {
    return locale === 'fr' ? 'il y a un instant' : 'just now';
  }

  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function readDraft(): DraftState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const payload = window.localStorage.getItem(STORAGE_KEY);

    if (!payload) {
      return null;
    }

    const parsed = JSON.parse(payload) as DraftState | null;

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      stepIndex: Number.isFinite(parsed.stepIndex) ? parsed.stepIndex : 0,
      form: { ...initialForm, ...parsed.form },
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function stepFieldKeys(stepIndex: number): Array<keyof ApplicationFormState> {
  switch (stepIndex) {
    case 0:
      return ['child_name', 'gender', 'date_of_birth', 'school_name', 'grade_level'];
    case 1:
      return ['need_type', 'need_summary', 'situation_summary', 'region_name', 'village_name'];
    case 2:
      return ['contact_role', 'contact_name', 'contact_phone', 'contact_email', 'preferred_contact_method'];
    default:
      return ['consent'];
  }
}

function validateStep(
  stepIndex: number,
  form: ApplicationFormState,
  copy: typeof applyCopy.en,
): Partial<Record<keyof ApplicationFormState, string>> {
  const errors: Partial<Record<keyof ApplicationFormState, string>> = {};

  if (stepIndex === 0 && !form.child_name.trim()) {
    errors.child_name = copy.validation.childName;
  }

  if (stepIndex === 1) {
    if (!form.need_summary.trim()) {
      errors.need_summary = copy.validation.needSummary;
    }
    if (!form.situation_summary.trim()) {
      errors.situation_summary = copy.validation.situationSummary;
    }
  }

  if (stepIndex === 2) {
    if (!form.contact_name.trim()) {
      errors.contact_name = copy.validation.contactName;
    }
    if (!form.contact_phone.trim()) {
      errors.contact_phone = copy.validation.contactPhone;
    }
  }

  return errors;
}

function validateAll(
  form: ApplicationFormState,
  copy: typeof applyCopy.en,
): Partial<Record<keyof ApplicationFormState, string>> {
  return {
    ...validateStep(0, form, copy),
    ...validateStep(1, form, copy),
    ...validateStep(2, form, copy),
    ...(form.consent ? {} : { consent: copy.validation.consent }),
  };
}

function findFirstInvalidStep(errors: Partial<Record<keyof ApplicationFormState, string>>): number {
  if (errors.child_name || errors.gender || errors.date_of_birth || errors.school_name || errors.grade_level) {
    return 0;
  }

  if (errors.need_type || errors.need_summary || errors.situation_summary || errors.region_name || errors.village_name) {
    return 1;
  }

  if (errors.contact_role || errors.contact_name || errors.contact_phone || errors.contact_email || errors.preferred_contact_method) {
    return 2;
  }

  return 3;
}

const applyCopy = {
  en: {
    heroImageAlt: 'Children learning together in a rural school in Cameroon.',
    startCta: 'Start application',
    helpCta: 'Need help?',
    aboutCta: 'About the foundation',
    introEyebrow: 'Application intake',
    introTitle: 'Tell us about the child and the support they need.',
    introBody:
      'Use this form to share the child’s details, the school need, and the responsible adult or organization we should contact. We only ask for what helps us begin the review respectfully and carefully.',
    highlights: [
      {
        icon: School,
        title: 'Identify the child',
        body: 'Share enough detail for us to recognize the child and the school context.',
      },
      {
        icon: HeartHandshake,
        title: 'Explain the need',
        body: 'Tell us what is standing in the way of school attendance or progress.',
      },
      {
        icon: UsersRound,
        title: 'Reach the right adult',
        body: 'Name the person who can help us verify the situation and continue the conversation.',
      },
    ],
    formEyebrow: 'Application form',
    formTitle: 'Save your progress as you go.',
    progressLabel: 'Progress',
    saveDraftLabel: 'Draft saved',
    lastSavedLabel: 'Last saved',
    clearDraftLabel: 'Clear draft',
    childStepLabel: 'Child details',
    needStepLabel: 'Education need',
    contactStepLabel: 'Contact person',
    reviewStepLabel: 'Review and send',
    backLabel: 'Back',
    continueLabel: 'Continue',
    submitLabel: 'Submit application',
    sendingLabel: 'Sending...',
    referenceLabel: 'Application reference',
    optionalValue: 'Not provided',
    optionalHint: 'Optional',
    schoolHint: 'If you do not know the exact school name, you can leave this blank.',
    gradeLevelPlaceholder: 'Example: Primary 5',
    schoolPlaceholder: 'School name or centre',
    needSummaryHint: 'A short description of what is needed and why it matters.',
    situationSummaryHint: 'Describe the situation clearly so we can understand the context.',
    reviewEyebrow: 'Review before sending',
    reviewBody: 'Please check the details below. Once sent, we will review the request and contact the person listed.',
    consentLabel: 'I confirm that the details above are accurate and that TriumphChi Foundation may contact the person listed to follow up on this application.',
    reviewSections: {
      child: 'Child details',
      need: 'Education need',
      contact: 'Contact person',
    },
    nextStepsEyebrow: 'What happens next',
    nextStepsTitle: 'A simple process from request to follow-up.',
    nextStepsBody: 'The form is only the starting point. After submission, the request is reviewed and the responsible contact is reached carefully.',
    nextSteps: [
      { caption: '01', title: 'Receive', body: 'We receive the request and create a reference for tracking.' },
      { caption: '02', title: 'Review', body: 'The details are checked so the next step is clear and respectful.' },
      { caption: '03', title: 'Reach out', body: 'We contact the person you named and continue the conversation.' },
    ],
    helpEyebrow: 'Need a hand?',
    helpTitle: 'You can reach us before or after submitting the form.',
    helpBody: 'If you need help with the form or want to speak with someone directly, use the contact details below.',
    contactCards: {
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      responseTime: 'Response time',
    },
    fields: {
      childName: 'Child full name',
      gender: 'Gender',
      dateOfBirth: 'Date of birth',
      schoolName: 'School name',
      gradeLevel: 'Class or grade level',
      regionName: 'Region',
      villageName: 'Village or community',
      needType: 'What support is needed?',
      needSummary: 'What support is needed?',
      situationSummary: 'What is happening?',
      contactRole: 'Who are you in relation to the child?',
      contactName: 'Responsible adult or contact person',
      contactPhone: 'Phone number',
      contactEmail: 'Email address',
      contactMethod: 'Preferred contact method',
    },
    genders: [
      { value: '', label: 'Select gender' },
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Other' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' },
    ],
    needTypes: [
      { value: 'fees', label: 'School fees' },
      { value: 'books', label: 'Books and learning materials' },
      { value: 'uniform', label: 'Uniform' },
      { value: 'exam', label: 'Examination costs' },
      { value: 'transport', label: 'Transport to school' },
      { value: 'meals', label: 'Meals or basic support' },
      { value: 'other', label: 'Other' },
    ],
    contactRoles: [
      { value: 'guardian', label: 'Guardian' },
      { value: 'parent', label: 'Parent' },
      { value: 'school', label: 'School representative' },
      { value: 'community_leader', label: 'Community leader' },
      { value: 'child', label: 'The child' },
      { value: 'other', label: 'Other' },
    ],
    contactMethods: [
      { value: 'phone', label: 'Phone call' },
      { value: 'sms', label: 'SMS' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'email', label: 'Email' },
    ],
    validation: {
      childName: 'Please enter the child’s name.',
      needSummary: 'Please tell us what support is needed.',
      situationSummary: 'Please tell us what is happening.',
      contactName: 'Please enter the contact person’s name.',
      contactPhone: 'Please enter a phone number.',
      consent: 'Please confirm that the details are correct and that we may follow up.',
      review: 'Please review the highlighted fields and continue.',
      failed: 'We could not send the application. Please try again.',
    },
  },
  fr: {
    heroImageAlt: "Des enfants apprennent ensemble dans une Ã©cole rurale au Cameroun.",
    startCta: 'Commencer la demande',
    helpCta: 'Besoin d’aide ?',
    aboutCta: 'Ã€ propos de la fondation',
    introEyebrow: 'DÃ©pÃ´t de demande',
    introTitle: "Parlez-nous de l'enfant et du soutien nÃ©cessaire.",
    introBody:
      "Utilisez ce formulaire pour partager les informations de l'enfant, le besoin scolaire et l'adulte ou l'organisation que nous devons contacter. Nous ne demandons que ce qui nous aide Ã  commencer l'Ã©tude avec respect et soin.",
    highlights: [
      {
        icon: School,
        title: "Identifier l'enfant",
        body: 'Partagez assez de dÃ©tails pour reconnaÃ®tre le contexte scolaire.',
      },
      {
        icon: HeartHandshake,
        title: 'Expliquer le besoin',
        body: "Dites-nous ce qui empÃªche la prÃ©sence ou la progression Ã  l'Ã©cole.",
      },
      {
        icon: UsersRound,
        title: 'Contacter la bonne personne',
        body: 'Nommez la personne qui peut aider Ã  vÃ©rifier la situation et continuer la discussion.',
      },
    ],
    formEyebrow: 'Formulaire de demande',
    formTitle: 'Enregistrez votre progression au fur et Ã  mesure.',
    progressLabel: 'Progression',
    saveDraftLabel: 'Brouillon enregistrÃ©',
    lastSavedLabel: 'Dernière sauvegarde',
    clearDraftLabel: 'Effacer le brouillon',
    childStepLabel: "Informations sur l'enfant",
    needStepLabel: 'Besoin Ã©ducatif',
    contactStepLabel: 'Personne Ã  contacter',
    reviewStepLabel: 'VÃ©rifier et envoyer',
    backLabel: 'Retour',
    continueLabel: 'Continuer',
    submitLabel: 'Envoyer la demande',
    sendingLabel: 'Envoi...',
    referenceLabel: 'RÃ©fÃ©rence',
    optionalValue: 'Non renseignÃ©',
    optionalHint: 'Facultatif',
    schoolHint: "Si vous ne connaissez pas le nom exact de l'Ã©cole, vous pouvez laisser ce champ vide.",
    gradeLevelPlaceholder: 'Exemple : CM2',
    schoolPlaceholder: "Nom de l'Ã©cole ou du centre",
    needSummaryHint: 'Une courte description du besoin et de son importance.',
    situationSummaryHint: 'DÃ©crivez clairement la situation pour que nous comprenions le contexte.',
    reviewEyebrow: 'Vérifiez avant l’envoi',
    reviewBody: 'Merci de relire les informations ci-dessous. Une fois la demande envoyée, nous l’examinerons et contacterons la personne indiquée.',
    consentLabel: 'Je confirme que les informations ci-dessus sont exactes et que la Fondation TriumphChi peut contacter la personne indiquée pour donner suite à cette demande.',
    reviewSections: {
      child: "Informations sur l'enfant",
      need: 'Besoin Ã©ducatif',
      contact: 'Personne Ã contacter',
    },
    nextStepsEyebrow: 'Ce qui se passe ensuite',
    nextStepsTitle: 'Un processus simple de la demande au suivi.',
    nextStepsBody: 'Le formulaire n’est que le point de dÃ©part. AprÃ¨s l’envoi, la demande est examinÃ©e et le contact responsable est joint avec soin.',
    nextSteps: [
      { caption: '01', title: 'Recevoir', body: 'Nous recevons la demande et crÃ©ons une rÃ©fÃ©rence de suivi.' },
      { caption: '02', title: 'Examiner', body: 'Les dÃ©tails sont vÃ©rifiÃ©s pour avancer avec clartÃ© et respect.' },
      { caption: '03', title: 'Recontacter', body: 'Nous contactons la personne indiquÃ©e et poursuivons la conversation.' },
    ],
    helpEyebrow: 'Besoin d’un coup de main ?',
    helpTitle: 'Vous pouvez nous joindre avant ou aprÃ¨s l’envoi du formulaire.',
    helpBody: 'Si vous avez besoin d’aide pour remplir le formulaire ou souhaitez parler Ã  quelqu’un, utilisez les coordonnÃ©es ci-dessous.',
    contactCards: {
      email: 'Email',
      phone: 'TÃ©lÃ©phone',
      location: 'Lieu',
      responseTime: 'DÃ©lai de rÃ©ponse',
    },
    fields: {
      childName: "Nom complet de l'enfant",
      gender: 'Sexe',
      dateOfBirth: 'Date de naissance',
      schoolName: 'Nom de l’Ã©cole',
      gradeLevel: 'Classe ou niveau',
      regionName: 'RÃ©gion',
      villageName: 'Village ou communautÃ©',
      needType: 'Quel soutien est nÃ©cessaire ?',
      needSummary: 'Quel soutien est nÃ©cessaire ?',
      situationSummary: 'Que se passe-t-il ?',
      contactRole: "Quel est votre lien avec l'enfant ?",
      contactName: 'Adulte responsable ou personne Ã  contacter',
      contactPhone: 'NumÃ©ro de tÃ©lÃ©phone',
      contactEmail: 'Adresse email',
      contactMethod: 'Moyen de contact prÃ©fÃ©rÃ©',
    },
    genders: [
      { value: '', label: 'Choisir le sexe' },
      { value: 'female', label: 'Femme' },
      { value: 'male', label: 'Homme' },
      { value: 'other', label: 'Autre' },
      { value: 'prefer-not-to-say', label: 'PrÃ©fÃ¨re ne pas dire' },
    ],
    needTypes: [
      { value: 'fees', label: 'Frais scolaires' },
      { value: 'books', label: 'Livres et matÃ©riel' },
      { value: 'uniform', label: 'Uniforme' },
      { value: 'exam', label: "Frais d'examen" },
      { value: 'transport', label: 'Transport vers l’Ã©cole' },
      { value: 'meals', label: 'Repas ou soutien de base' },
      { value: 'other', label: 'Autre' },
    ],
    contactRoles: [
      { value: 'guardian', label: 'Tuteur' },
      { value: 'parent', label: 'Parent' },
      { value: 'school', label: 'ReprÃ©sentant de l’Ã©cole' },
      { value: 'community_leader', label: 'Leader communautaire' },
      { value: 'child', label: "L'enfant" },
      { value: 'other', label: 'Autre' },
    ],
    contactMethods: [
      { value: 'phone', label: 'Appel' },
      { value: 'sms', label: 'SMS' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'email', label: 'Email' },
    ],
    validation: {
      childName: "Veuillez saisir le nom de l'enfant.",
      needSummary: 'Veuillez indiquer le soutien nÃ©cessaire.',
      situationSummary: 'Veuillez dÃ©crire la situation.',
      contactName: 'Veuillez saisir le nom de la personne Ã  contacter.',
      contactPhone: 'Veuillez saisir un numÃ©ro de tÃ©lÃ©phone.',
      consent: 'Veuillez confirmer que les informations sont exactes et que nous pouvons faire un suivi.',
      review: 'Veuillez vÃ©rifier les champs indiquÃ©s et continuer.',
      failed: "Nous n'avons pas pu envoyer la demande. Veuillez rÃ©essayer.",
    },
  },
} satisfies Record<Locale, {
  heroImageAlt: string;
  startCta: string;
  helpCta: string;
  aboutCta: string;
  introEyebrow: string;
  introTitle: string;
  introBody: string;
  highlights: Array<{ icon: typeof School; title: string; body: string }>;
  formEyebrow: string;
  formTitle: string;
  progressLabel: string;
  saveDraftLabel: string;
  lastSavedLabel: string;
  clearDraftLabel: string;
  childStepLabel: string;
  needStepLabel: string;
  contactStepLabel: string;
  reviewStepLabel: string;
  backLabel: string;
  continueLabel: string;
  submitLabel: string;
  sendingLabel: string;
  referenceLabel: string;
  optionalValue: string;
  optionalHint: string;
  schoolHint: string;
  gradeLevelPlaceholder: string;
  schoolPlaceholder: string;
  needSummaryHint: string;
  situationSummaryHint: string;
  reviewEyebrow: string;
  reviewBody: string;
  consentLabel: string;
  reviewSections: {
    child: string;
    need: string;
    contact: string;
  };
  nextStepsEyebrow: string;
  nextStepsTitle: string;
  nextStepsBody: string;
  nextSteps: Array<{ caption: string; title: string; body: string }>;
  helpEyebrow: string;
  helpTitle: string;
  helpBody: string;
  contactCards: {
    email: string;
    phone: string;
    location: string;
    responseTime: string;
  };
  fields: {
    childName: string;
    gender: string;
    dateOfBirth: string;
    schoolName: string;
    gradeLevel: string;
    regionName: string;
    villageName: string;
    needType: string;
    needSummary: string;
    situationSummary: string;
    contactRole: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    contactMethod: string;
  };
  genders: Array<{ value: string; label: string }>;
  needTypes: Array<{ value: NeedType; label: string }>;
  contactRoles: Array<{ value: ContactRole; label: string }>;
  contactMethods: Array<{ value: ContactMethod; label: string }>;
  validation: {
    childName: string;
    needSummary: string;
    situationSummary: string;
    contactName: string;
    contactPhone: string;
    consent: string;
    review: string;
    failed: string;
  };
}>;
