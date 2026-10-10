import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, Mail, MapPin, Phone, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { Seo } from '../../../components/seo/Seo';
import { StatusPill } from '../../../components/ui/StatusPill';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import {
  apiDownloadPreviewPdf,
  apiPublicLookup,
  apiSubmitPublicApplication,
  PublicApplicationPayload,
  PublicLookupSuggestion,
} from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import { publicContact } from '../../../lib/publicContact';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { ApplicationTrackModal } from './ApplicationTrackModal';
import { ApplyStepContent } from './ApplyStepContent';
import { applyCopy } from './applyCopy';
import {
  buildReviewGroups,
  findFirstInvalidStep,
  getApplySteps,
  stepFieldKeys,
  validateAll,
  validateStep,
} from './applyFlow';
import {
  ApplicationFormErrors,
  ApplicationFormState,
  DraftState,
  initialApplicationForm,
} from './applyTypes';
import heroImage from '../../../assets/landing/school_kids_in_cameroon.jpg';

interface ApplyPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

const STORAGE_KEY = 'triumphchi.public-application.draft.v2';

export function ApplyPage({ locale, page }: ApplyPageProps) {
  const copy = applyCopy[locale];
  const homePage = getPageByKey('home');
  const aboutPage = getPageByKey('about');
  const contactPage = getPageByKey('contact');
  const isAuthenticated = readAuthState();
  const steps = useMemo(() => getApplySteps(copy, isAuthenticated), [copy, isAuthenticated]);

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<ApplicationFormState>(initialApplicationForm);
  const [errors, setErrors] = useState<ApplicationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string; reference?: string } | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftToken, setDraftToken] = useState<string | null>(null);
  const [schoolSuggestions, setSchoolSuggestions] = useState<PublicLookupSuggestion[]>([]);
  const [regionSuggestions, setRegionSuggestions] = useState<PublicLookupSuggestion[]>([]);
  const [villageSuggestions, setVillageSuggestions] = useState<PublicLookupSuggestion[]>([]);

  const debouncedSchoolQuery = useDebouncedValue(form.school_name.trim(), 220);
  const debouncedRegionQuery = useDebouncedValue(form.region_name.trim(), 220);
  const debouncedVillageQuery = useDebouncedValue(form.village_name.trim(), 220);
  const activeStep = steps[Math.min(currentStep, steps.length - 1)];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const reviewGroups = useMemo(
    () => buildReviewGroups(form, copy, locale, { includeApplyingFor: isAuthenticated, includeHousehold: isAuthenticated }),
    [copy, form, isAuthenticated, locale],
  );

  useEffect(() => {
    const draft = readDraft();

    if (draft) {
      setForm(draft.form);
      setCurrentStep(Math.min(draft.stepIndex, steps.length - 1));
      setSavedAt(draft.updatedAt);
      setDraftToken(draft.draftToken ?? null);
      setHasDraft(true);
    }
  }, [steps.length]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!hasMeaningfulDraft(form)) {
        window.localStorage.removeItem(STORAGE_KEY);
        setHasDraft(false);
        return;
      }

      const payload: DraftState = {
        stepIndex: currentStep,
        form,
        updatedAt: new Date().toISOString(),
        draftToken: draftToken ?? undefined,
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSavedAt(payload.updatedAt);
      setHasDraft(true);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [currentStep, draftToken, form]);

  useEffect(() => {
    return fetchSuggestions('regions', debouncedRegionQuery, locale, setRegionSuggestions);
  }, [debouncedRegionQuery, locale]);

  useEffect(() => {
    return fetchSuggestions('villages', debouncedVillageQuery, locale, setVillageSuggestions, {
      region_name: form.region_name.trim() || undefined,
    });
  }, [debouncedVillageQuery, form.region_name, locale]);

  useEffect(() => {
    return fetchSuggestions('schools', debouncedSchoolQuery, locale, setSchoolSuggestions, {
      region_name: form.region_name.trim() || undefined,
      village_name: form.village_name.trim() || undefined,
    });
  }, [debouncedSchoolQuery, form.region_name, form.village_name, locale]);

  const contactRows = [
    { icon: Mail, label: copy.contactCards.email, value: publicContact.email, href: publicContact.emailHref },
    { icon: Phone, label: copy.contactCards.phone, value: publicContact.phoneDisplay, href: publicContact.phoneHref },
    { icon: MapPin, label: copy.contactCards.location, value: publicContact.location[locale], href: `/${locale}${contactPage.path[locale]}` },
    { icon: Clock3, label: copy.contactCards.responseTime, value: publicContact.responseTime[locale], href: `/${locale}${contactPage.path[locale]}` },
  ];

  const updateField = <Field extends keyof ApplicationFormState>(field: Field, value: ApplicationFormState[Field]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitMessage(null);
  };

  const goNext = () => {
    const nextErrors = validateStep(activeStep.key, form, copy);

    if (Object.keys(nextErrors).length > 0) {
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    setErrors((current) => {
      const next = { ...current };
      stepFieldKeys(activeStep.key).forEach((field) => delete next[field]);
      return next;
    });
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const clearDraft = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setForm(initialApplicationForm);
    setCurrentStep(0);
    setErrors({});
    setSubmitMessage(null);
    setSavedAt(null);
    setDraftToken(null);
    setHasDraft(false);
  };

  const handlePreviewPdf = async () => {
    setIsPreviewing(true);
    setSubmitMessage(null);

    try {
      const blob = await apiDownloadPreviewPdf(buildPayload(form, draftToken ?? undefined), locale);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => window.URL.revokeObjectURL(url), 30_000);
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : copy.validation.previewFailed,
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalErrors = validateAll(steps, form, copy);
    setErrors(finalErrors);
    setSubmitMessage(null);

    if (Object.keys(finalErrors).length > 0) {
      setCurrentStep(findFirstInvalidStep(steps, finalErrors));
      setSubmitMessage({ type: 'error', text: copy.validation.review });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiSubmitPublicApplication(buildPayload(form), locale);
      window.localStorage.removeItem(STORAGE_KEY);
      setHasDraft(false);
      setSavedAt(null);
      setSubmitMessage({
        type: 'success',
        text: response.message,
        reference: response.data?.application_number,
      });
      setForm(initialApplicationForm);
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
            <button
              type="button"
              onClick={() => setIsTrackModalOpen(true)}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/18"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              {copy.trackCta}
            </button>
            <Link
              to={`/${locale}${aboutPage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/18"
            >
              {copy.aboutCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16">
          <div className="self-start lg:sticky lg:top-24">
            <SectionIntro eyebrow={copy.introEyebrow} title={copy.introTitle} body={copy.introBody} />
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {copy.highlights.map((item) => (
                <article key={item.title} className="rounded-md border border-ink-100 bg-ink-50 p-4 shadow-xs">
                  <item.icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h2 className="mt-4 text-base font-black text-ink-900">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div id="application-form" className="scroll-mt-24 rounded-md border border-ink-100 bg-white p-5 shadow-xs sm:p-6 lg:p-8">
            <ApplyFormHeader
              copy={copy}
              savedAt={savedAt}
              hasDraft={hasDraft}
              locale={locale}
              clearDraft={clearDraft}
            />

            <StepProgress
              steps={steps}
              currentStep={currentStep}
              progress={progress}
              progressLabel={copy.progressLabel}
              setCurrentStep={setCurrentStep}
            />

            <form onSubmit={handleSubmit} className="mt-6 grid gap-5" noValidate>
              <LookupDatalists
                schoolSuggestions={schoolSuggestions}
                regionSuggestions={regionSuggestions}
                villageSuggestions={villageSuggestions}
              />

              <ApplyStepContent
                step={activeStep}
                form={form}
                errors={errors}
                copy={copy}
                locale={locale}
                reviewGroups={reviewGroups}
                updateField={updateField}
              />

              <ApplyFormActions
                copy={copy}
                currentStep={currentStep}
                stepsLength={steps.length}
                isSubmitting={isSubmitting}
                isPreviewing={isPreviewing}
                submitMessage={submitMessage}
                goBack={goBack}
                goNext={goNext}
                previewPdf={handlePreviewPdf}
              />
            </form>
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.nextStepsEyebrow} title={copy.nextStepsTitle} body={copy.nextStepsBody} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.nextSteps.map((item, index) => (
              <article key={item.title} className="rounded-md border border-foundation-100 bg-white p-5 shadow-xs">
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
          <div className="rounded-md border border-ink-100 bg-white p-5 shadow-xs sm:p-6">
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

      <ApplicationTrackModal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} locale={locale} />
    </>
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

function ApplyFormHeader({
  copy,
  savedAt,
  hasDraft,
  locale,
  clearDraft,
}: {
  copy: typeof applyCopy.en;
  savedAt: string | null;
  hasDraft: boolean;
  locale: Locale;
  clearDraft: () => void;
}) {
  return (
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
  );
}

function StepProgress({
  steps,
  currentStep,
  progress,
  progressLabel,
  setCurrentStep,
}: {
  steps: ReturnType<typeof getApplySteps>;
  currentStep: number;
  progress: number;
  progressLabel: string;
  setCurrentStep: (index: number) => void;
}) {
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-normal text-ink-500">
        <span>{progressLabel}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 rounded-full bg-ink-100" aria-hidden="true">
        <div className="h-2 rounded-full bg-foundation-600 transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <button
            key={step.key}
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
            <span className="leading-5">{step.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LookupDatalists({
  schoolSuggestions,
  regionSuggestions,
  villageSuggestions,
}: {
  schoolSuggestions: PublicLookupSuggestion[];
  regionSuggestions: PublicLookupSuggestion[];
  villageSuggestions: PublicLookupSuggestion[];
}) {
  return (
    <>
      <datalist id="school_name-suggestions">
        {schoolSuggestions.map((item) => (
          <option key={item.id} value={item.label}>
            {item.secondary ?? ''}
          </option>
        ))}
      </datalist>
      <datalist id="region_name-suggestions">
        {regionSuggestions.map((item) => (
          <option key={item.id} value={item.label}>
            {item.secondary ?? ''}
          </option>
        ))}
      </datalist>
      <datalist id="village_name-suggestions">
        {villageSuggestions.map((item) => (
          <option key={item.id} value={item.label}>
            {item.secondary ?? ''}
          </option>
        ))}
      </datalist>
    </>
  );
}

function ApplyFormActions({
  copy,
  currentStep,
  stepsLength,
  isSubmitting,
  isPreviewing,
  submitMessage,
  goBack,
  goNext,
  previewPdf,
}: {
  copy: typeof applyCopy.en;
  currentStep: number;
  stepsLength: number;
  isSubmitting: boolean;
  isPreviewing: boolean;
  submitMessage: { type: 'success' | 'error'; text: string; reference?: string } | null;
  goBack: () => void;
  goNext: () => void;
  previewPdf: () => void;
}) {
  const isReviewStep = currentStep === stepsLength - 1;

  return (
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

        {!isReviewStep ? (
          <button
            type="button"
            onClick={goNext}
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white transition hover:bg-foundation-900"
          >
            {copy.continueLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={previewPdf}
              disabled={isPreviewing}
              className={cn(
                'focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-ink-100 px-5 text-sm font-black text-ink-700 transition hover:bg-ink-50',
                isPreviewing && 'cursor-not-allowed opacity-60',
              )}
            >
              {isPreviewing ? copy.sendingLabel : copy.previewPdfLabel}
            </button>
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
          </>
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
                <p className="mt-1 font-semibold">
                  {copy.referenceLabel}: {submitMessage.reference}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildPayload(form: ApplicationFormState, draftToken?: string): PublicApplicationPayload {
  return {
    draft_token: draftToken,
    applying_for: form.applying_for,
    child_name: form.child_name.trim(),
    gender: form.gender.trim() || undefined,
    date_of_birth: form.date_of_birth || undefined,
    school_name: form.school_name.trim() || undefined,
    grade_level: form.grade_level.trim() || undefined,
    region_name: form.region_name.trim() || undefined,
    village_name: form.village_name.trim() || undefined,
    school_enrollment_status: form.school_enrollment_status,
    last_school_attended: form.last_school_attended.trim() || undefined,
    education_interruption_reason: form.education_interruption_reason.trim() || undefined,
    teacher_school_name: form.teacher_school_name.trim() || undefined,
    teacher_position: form.teacher_position.trim() || undefined,
    institution_name: form.institution_name.trim() || undefined,
    institution_role: form.institution_role.trim() || undefined,
    fee_amount: form.fee_amount.trim() || undefined,
    fee_due_date: form.fee_due_date || undefined,
    exam_name: form.exam_name.trim() || undefined,
    exam_date: form.exam_date || undefined,
    exam_fee_amount: form.exam_fee_amount.trim() || undefined,
    household_income_range: form.household_income_range.trim() || undefined,
    household_size: form.household_size ? Number(form.household_size) : undefined,
    primary_caregiver_occupation: form.primary_caregiver_occupation.trim() || undefined,
    household_challenges: form.household_challenges.trim()
      ? form.household_challenges
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
      : undefined,
    need_type: form.need_type,
    need_summary: form.need_summary.trim(),
    situation_summary: form.situation_summary.trim(),
    contact_role: form.contact_role,
    contact_name: form.contact_name.trim(),
    contact_phone: form.contact_phone.trim(),
    contact_email: form.contact_email.trim() || undefined,
    preferred_contact_method: form.preferred_contact_method,
    consent: form.consent,
  };
}

function fetchSuggestions(
  type: 'regions' | 'villages' | 'schools',
  query: string,
  locale: Locale,
  setSuggestions: (items: PublicLookupSuggestion[]) => void,
  filters?: { region_name?: string; village_name?: string },
) {
  let active = true;

  if (query.length < 2) {
    setSuggestions([]);
    return () => {
      active = false;
    };
  }

  void apiPublicLookup(type, query, locale, filters)
    .then((response) => {
      if (active) {
        setSuggestions(response.results);
      }
    })
    .catch(() => {
      if (active) {
        setSuggestions([]);
      }
    });

  return () => {
    active = false;
  };
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
      form: { ...initialApplicationForm, ...parsed.form },
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function hasMeaningfulDraft(form: ApplicationFormState): boolean {
  return Boolean(
    form.child_name.trim() ||
      form.gender.trim() ||
      form.date_of_birth.trim() ||
      form.school_name.trim() ||
      form.grade_level.trim() ||
      form.region_name.trim() ||
      form.village_name.trim() ||
      form.need_summary.trim() ||
      form.situation_summary.trim() ||
      form.contact_name.trim() ||
      form.contact_phone.trim() ||
      form.contact_email.trim() ||
      form.consent,
  );
}

function readAuthState(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return Boolean(window.localStorage.getItem('auth_token'));
  } catch {
    return false;
  }
}

function formatSavedAt(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
