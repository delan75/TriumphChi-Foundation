import { FormEvent, useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Clock3, HeartHandshake, MapPin, Phone, School, UsersRound, Search, Home, ShieldCheck, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { Seo } from '../../../components/seo/Seo';
import { DateOfBirthInput } from '../../../components/ui/DateOfBirthInput';
import { InputField } from '../../../components/ui/InputField';
import { SelectField } from '../../../components/ui/SelectField';
import { TextAreaField } from '../../../components/ui/TextAreaField';
import { StatusPill } from '../../../components/ui/StatusPill';
import { ApplicationTrackModal } from './ApplicationTrackModal';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { apiPublicLookup, apiSubmitPublicApplication, apiDownloadPreviewPdf, type PublicApplicationPayload, type PublicApplicationSubmissionResponse, type PublicLookupSuggestion } from '../../../lib/api';
//import { apiSubmitPublicApplication, apiDownloadPreviewPdf, type PublicApplicationPayload } from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import { publicContact } from '../../../lib/publicContact';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import heroImage from '../../../assets/landing/school_kids_in_cameroon.jpg';

interface ApplyPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

type NeedType = PublicApplicationPayload['need_type'];
type ContactRole = PublicApplicationPayload['contact_role'];
type ContactMethod = PublicApplicationPayload['preferred_contact_method'];
type SchoolEnrollmentStatus = NonNullable<PublicApplicationPayload['school_enrollment_status']>;

interface ApplicationFormState {
  applying_for: 'self' | 'child' | 'other';
  child_name: string;
  gender: string;
  date_of_birth: string;
  is_enrolled: boolean;
  school_name: string;
  grade_level: string;
  distance_to_school: string;
  interruption_reasons: string;
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
  household_size: number | '';
  primary_caregiver_occupation: string;
  household_challenges: string[];
  contact_role: ContactRole;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  preferred_contact_method: ContactMethod;
  documents: { type: string; id: number }[];
  consent: boolean;
}

interface DraftState {
  stepIndex: number;
  form: ApplicationFormState;
  updatedAt: string;
  draftToken?: string;
  applicationNumber?: string;
}

const STORAGE_KEY = 'triumphchi.public-application.draft.v1';

const initialForm: ApplicationFormState = {
  applying_for: 'child',
  child_name: '',
  gender: '',
  date_of_birth: '',
  is_enrolled: false,
  school_name: '',
  grade_level: '',
  distance_to_school: '',
  interruption_reasons: '',
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
  household_challenges: [],
  contact_role: 'guardian',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  preferred_contact_method: 'phone',
  documents: [],
  consent: false,
};

const fieldGroupsUnauth = [
  { key: 'child', icon: Home },
  { key: 'need', icon: HeartHandshake },
  { key: 'verification', icon: FileText },
  { key: 'contact', icon: Phone },
  { key: 'review', icon: ShieldCheck }, // Preview/Review step
] as const;

const fieldGroupsAuth = [
  { key: 'applying_for', icon: UsersRound },
  { key: 'child', icon: Home },
  { key: 'education', icon: School },
  { key: 'need', icon: HeartHandshake },
  { key: 'household', icon: Home },
  { key: 'verification', icon: UsersRound },
  { key: 'documents', icon: FileText },
  { key: 'review', icon: ShieldCheck },
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
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string; reference?: string } | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [schoolSuggestions, setSchoolSuggestions] = useState<PublicLookupSuggestion[]>([]);
  const [regionSuggestions, setRegionSuggestions] = useState<PublicLookupSuggestion[]>([]);
  const [villageSuggestions, setVillageSuggestions] = useState<PublicLookupSuggestion[]>([]);
  const debouncedSchoolQuery = useDebouncedValue(form.school_name.trim(), 220);
  const debouncedRegionQuery = useDebouncedValue(form.region_name.trim(), 220);
  const debouncedVillageQuery = useDebouncedValue(form.village_name.trim(), 220);

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

  useEffect(() => {
    let active = true;

    if (debouncedRegionQuery.length < 2) {
      setRegionSuggestions([]);
      return () => {
        active = false;
      };
    }

    void apiPublicLookup('regions', debouncedRegionQuery, locale)
      .then((response) => {
        if (active) {
          setRegionSuggestions(response.results);
        }
      })
      .catch(() => {
        if (active) {
          setRegionSuggestions([]);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedRegionQuery, locale]);

  useEffect(() => {
    let active = true;

    if (debouncedVillageQuery.length < 2) {
      setVillageSuggestions([]);
      return () => {
        active = false;
      };
    }

    void apiPublicLookup('villages', debouncedVillageQuery, locale, {
      region_name: form.region_name.trim() || undefined,
    })
      .then((response) => {
        if (active) {
          setVillageSuggestions(response.results);
        }
      })
      .catch(() => {
        if (active) {
          setVillageSuggestions([]);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedVillageQuery, form.region_name, locale]);

  useEffect(() => {
    let active = true;

    if (debouncedSchoolQuery.length < 2) {
      setSchoolSuggestions([]);
      return () => {
        active = false;
      };
    }

    void apiPublicLookup('schools', debouncedSchoolQuery, locale, {
      region_name: form.region_name.trim() || undefined,
      village_name: form.village_name.trim() || undefined,
    })
      .then((response) => {
        if (active) {
          setSchoolSuggestions(response.results);
        }
      })
      .catch(() => {
        if (active) {
          setSchoolSuggestions([]);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedSchoolQuery, form.region_name, form.village_name, locale]);

  const isAuthenticated = typeof window !== 'undefined' && Boolean(window.localStorage.getItem('auth_token'));
  const fieldGroups = isAuthenticated ? fieldGroupsAuth : fieldGroupsUnauth;

  const stepLabelsUnauth = [
    copy.childStepLabel,
    copy.needStepLabel,
    copy.verificationStepLabel || 'Verification',
    copy.contactStepLabel,
    copy.reviewStepLabel,
  ];

  const stepLabelsAuth = [
    copy.applyingForStepLabel || 'Applying For',
    copy.childStepLabel,
    copy.educationStepLabel || 'Education',
    copy.needStepLabel,
    copy.householdStepLabel || 'Household',
    copy.verificationStepLabel || 'Verification',
    copy.documentsStepLabel || 'Documents',
    copy.reviewStepLabel,
  ];

  const stepLabels = isAuthenticated ? stepLabelsAuth : stepLabelsUnauth;

  const contactRows = [
    { icon: Mail, label: copy.contactCards.email, value: publicContact.email, href: publicContact.emailHref },
    { icon: Phone, label: copy.contactCards.phone, value: publicContact.phoneDisplay, href: publicContact.phoneHref },
    { icon: MapPin, label: copy.contactCards.location, value: publicContact.location[locale], href: `/${locale}${contactPage.path[locale]}` },
    { icon: Clock3, label: copy.contactCards.responseTime, value: publicContact.responseTime[locale], href: `/${locale}${contactPage.path[locale]}` },
  ];

  const progress = ((currentStep + 1) / fieldGroups.length) * 100;
  const reviewGroups = isAuthenticated ? [
    {
      title: copy.reviewSections.child || 'Applying For & Child Details',
      items: [
        [copy.fields.applyingFor || 'Applying For', form.applying_for],
        [copy.fields.childName, form.child_name],
        [copy.fields.gender, form.gender || copy.optionalValue],
        [copy.fields.dateOfBirth, form.date_of_birth || copy.optionalValue],
      ],
    },
    {
      title: copy.reviewSections.education || 'Education Details',
      items: [
        [copy.fields.isEnrolled || 'Currently Enrolled?', form.is_enrolled ? 'Yes' : 'No'],
        [copy.fields.schoolName, form.school_name || copy.optionalValue],
        [copy.fields.gradeLevel, form.grade_level || copy.optionalValue],
        [copy.fields.distanceToSchool || 'Distance to School', form.distance_to_school || copy.optionalValue],
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
      title: copy.reviewSections.household || 'Household Situation',
      items: [
        [copy.fields.householdIncome || 'Income Range', form.household_income_range || copy.optionalValue],
        [copy.fields.householdSize || 'Household Size', String(form.household_size) || copy.optionalValue],
        [copy.fields.primaryCaregiverOccupation || 'Caregiver Occupation', form.primary_caregiver_occupation || copy.optionalValue],
      ],
    },
    {
      title: copy.reviewSections.contact,
      items: [
        [copy.fields.contactRole, copy.contactRoles.find((item) => item.value === form.contact_role)?.label ?? form.contact_role],
        [copy.fields.contactName, form.contact_name],
        [copy.fields.contactPhone, form.contact_phone],
        [copy.fields.contactEmail, form.contact_email || copy.optionalValue],
        [copy.fields.preferredContactMethod, copy.contactMethods.find((item) => item.value === form.preferred_contact_method)?.label ?? form.preferred_contact_method],
      ],
    },
  ] : [
    {
      title: copy.reviewSections.child || 'Applying For & Child Details',
      items: [
        [copy.fields.applyingFor || 'Applying For', form.applying_for],
        [copy.fields.childName, form.child_name],
        [copy.fields.gender, form.gender || copy.optionalValue],
        [copy.fields.dateOfBirth, form.date_of_birth ? new Date(form.date_of_birth).toLocaleDateString(locale) : copy.optionalValue],
        [copy.fields.gradeLevel, form.grade_level || copy.optionalValue],
        [copy.fields.schoolName, form.school_name || copy.optionalValue],
      ] as const,
    },
    {
      title: copy.reviewSections.need,
      items: [
        [copy.fields.needType, copy.needTypes.find((t) => t.value === form.need_type)?.label || form.need_type],
        [copy.fields.regionName, form.region_name || copy.optionalValue],
        [copy.fields.villageName, form.village_name || copy.optionalValue],
        [copy.fields.needSummary, form.need_summary.length > 100 ? `${form.need_summary.substring(0, 100)}...` : form.need_summary],
        [copy.fields.situationSummary, form.situation_summary.length > 100 ? `${form.situation_summary.substring(0, 100)}...` : form.situation_summary],
      ] as const,
    },
    {
      title: copy.reviewSections.household || 'Household Situation',
      items: [
        [copy.fields.householdIncome || 'Income Range', form.household_income_range || copy.optionalValue],
        [copy.fields.householdSize || 'Household Size', String(form.household_size) || copy.optionalValue],
        [copy.fields.primaryCaregiverOccupation || 'Caregiver Occupation', form.primary_caregiver_occupation || copy.optionalValue],
      ],
    },
    {
      title: copy.reviewSections.contact,
      items: [
        [copy.fields.contactRole, copy.contactRoles.find((item) => item.value === form.contact_role)?.label ?? form.contact_role],
        [copy.fields.contactName, form.contact_name],
        [copy.fields.contactPhone, form.contact_phone],
        [copy.fields.contactEmail, form.contact_email || copy.optionalValue],
        [copy.fields.preferredContactMethod, copy.contactMethods.find((item) => item.value === form.preferred_contact_method)?.label ?? form.preferred_contact_method],
      ],
    },
  ] : [
    {
      title: copy.reviewSections.child,
      items: [
        [copy.fields.childName, form.child_name],
        [copy.fields.gender, form.gender || copy.optionalValue],
        [copy.fields.dateOfBirth, form.date_of_birth ? new Date(form.date_of_birth).toLocaleDateString(locale) : copy.optionalValue],
        [copy.fields.gradeLevel, form.grade_level || copy.optionalValue],
        [copy.fields.schoolName, form.school_name || copy.optionalValue],
      ] as const,
    },
    {
      title: copy.reviewSections.need,
      items: [
        [copy.fields.needType, copy.needTypes.find((t) => t.value === form.need_type)?.label || form.need_type],
        [copy.fields.regionName, form.region_name || copy.optionalValue],
        [copy.fields.villageName, form.village_name || copy.optionalValue],
        [copy.fields.needSummary, form.need_summary.length > 100 ? `${form.need_summary.substring(0, 100)}...` : form.need_summary],
        [copy.fields.situationSummary, form.situation_summary.length > 100 ? `${form.situation_summary.substring(0, 100)}...` : form.situation_summary],
      ] as const,
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
    const nextErrors = validateStep(currentStep, form, copy, isAuthenticated);

    if (Object.keys(nextErrors).length > 0) {
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    setErrors((current) => {
      const next = { ...current };
      for (const key of stepFieldKeys(currentStep, isAuthenticated)) {
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
    const finalErrors = validateAll(form, copy, isAuthenticated);
    setErrors(finalErrors);
    setSubmitMessage(null);

    if (Object.keys(finalErrors).length > 0) {
      setCurrentStep(findFirstInvalidStep(finalErrors, isAuthenticated));
      setSubmitMessage({ type: 'error', text: copy.validation.review });
      return;
    }

    setIsSubmitting(true);

    try {
      // Drafts approach wasn't fully initialized with API here, fallback to full monolithic payload
      // as backend allows full monolithic `store` method as well.
      const payload: PublicApplicationPayload = {
        applying_for: form.applying_for,
        child_name: form.child_name.trim(),
        gender: form.gender.trim() || undefined,
        date_of_birth: form.date_of_birth || undefined,
        is_enrolled: form.is_enrolled,
        school_name: form.school_name.trim() || undefined,
        grade_level: form.grade_level.trim() || undefined,
        distance_to_school: form.distance_to_school.trim() || undefined,
        interruption_reasons: form.interruption_reasons.trim() || undefined,
        region_name: form.region_name.trim() || undefined,
        village_name: form.village_name.trim() || undefined,
        need_type: form.need_type,
        need_summary: form.need_summary.trim(),
        situation_summary: form.situation_summary.trim(),
        household_income_range: form.household_income_range.trim() || undefined,
        household_size: typeof form.household_size === 'number' ? form.household_size : undefined,
        primary_caregiver_occupation: form.primary_caregiver_occupation.trim() || undefined,
        household_challenges: form.household_challenges,
        contact_role: form.contact_role,
        contact_name: form.contact_name.trim(),
        contact_phone: form.contact_phone.trim(),
        contact_email: form.contact_email.trim() || undefined,
        preferred_contact_method: form.preferred_contact_method,
        documents: form.documents,
        consent: form.consent,
      };

      const response = await apiSubmitPublicApplication(payload, locale);

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
  const handleDownloadPdf = async () => {
    try {
      const payload: PublicApplicationPayload = {
        applying_for: form.applying_for,
        child_name: form.child_name.trim(),
        gender: form.gender || undefined,
        date_of_birth: form.date_of_birth || undefined,
        is_enrolled: form.is_enrolled,
        school_name: form.school_name.trim() || undefined,
        grade_level: form.grade_level.trim() || undefined,
        distance_to_school: form.distance_to_school.trim() || undefined,
        interruption_reasons: form.interruption_reasons.trim() || undefined,
        region_name: form.region_name.trim() || undefined,
        village_name: form.village_name.trim() || undefined,
        need_type: form.need_type,
        need_summary: form.need_summary.trim(),
        situation_summary: form.situation_summary.trim(),
        household_income_range: form.household_income_range.trim() || undefined,
        household_size: typeof form.household_size === 'number' ? form.household_size : undefined,
        primary_caregiver_occupation: form.primary_caregiver_occupation.trim() || undefined,
        household_challenges: form.household_challenges,
        contact_role: form.contact_role,
        contact_name: form.contact_name.trim(),
        contact_phone: form.contact_phone.trim(),
        contact_email: form.contact_email.trim() || undefined,
        preferred_contact_method: form.preferred_contact_method,
        documents: form.documents,
        consent: form.consent,
      };

      const blob = await apiDownloadPreviewPdf(payload, locale);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Application_Preview.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download PDF preview.');
    }
  };

  const content = renderStepContent(currentStep, form, errors, copy, updateField, reviewGroups, isAuthenticated, handleDownloadPdf);

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
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.18]"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              {copy.trackCta}
            </button>
            <Link
              to={`/${locale}${aboutPage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.18]"
            >
              {copy.aboutCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
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

      <ApplicationTrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        locale={locale}
      />
    </>
  );
}

function renderStepContent(
  stepIndex: number,
  form: ApplicationFormState,
  errors: Partial<Record<keyof ApplicationFormState, string>>,
  copy: any,
  updateField: <Field extends keyof ApplicationFormState>(field: Field, value: ApplicationFormState[Field]) => void,
  reviewGroups: any,
  isAuthenticated: boolean,
  onDownloadPdf: () => void
) {
  if (isAuthenticated) {
    if (stepIndex === 7) return renderReviewStep(form, errors, copy, updateField, reviewGroups, onDownloadPdf);
    return renderAuthStepContent(stepIndex, form, errors, copy, updateField);
  } else {
    if (stepIndex === 4) return renderReviewStep(form, errors, copy, updateField, reviewGroups, onDownloadPdf);
    return renderUnauthStepContent(stepIndex, form, errors, copy, updateField);
  }
}

function renderReviewStep(
  form: ApplicationFormState,
  errors: Partial<Record<keyof ApplicationFormState, string>>,
  copy: any,
  updateField: <Field extends keyof ApplicationFormState>(field: Field, value: ApplicationFormState[Field]) => void,
  reviewGroups: any,
  onDownloadPdf: () => void
) {
  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{copy.reviewStepLabel}</legend>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-md border border-foundation-100 bg-foundation-50 p-4">
        <div>
          <p className="text-sm font-black uppercase text-foundation-600">{copy.reviewEyebrow}</p>
          <p className="mt-2 text-base leading-7 text-ink-700">{copy.reviewBody}</p>
        </div>
        <button
          type="button"
          onClick={onDownloadPdf}
          className="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-foundation-200 bg-white px-4 text-sm font-bold text-foundation-700 transition hover:bg-foundation-50"
        >
          <FileText className="h-4 w-4" />
          Download PDF Preview
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {reviewGroups.map((group: any) => (
          <article key={group.title} className="rounded-md border border-ink-100 bg-ink-50 p-4">
            <h3 className="text-sm font-black uppercase text-ink-500">{group.title}</h3>
            <dl className="mt-3 space-y-3">
              {group.items.map(([label, value]: [string, string]) => (
                <div key={label}>
                  <dt className="text-xs font-bold uppercase text-ink-500">{label}</dt>
                  <dd className="mt-1 text-sm leading-6 text-ink-800">{value || copy.optionalValue}</dd>
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
          {copy.consent}
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

function renderUnauthStepContent(
  stepIndex: number,
  form: ApplicationFormState,
  errors: Partial<Record<keyof ApplicationFormState, string>>,
  copy: any,
  updateField: <Field extends keyof ApplicationFormState>(field: Field, value: ApplicationFormState[Field]) => void,
  reviewGroups: ReadonlyArray<{ readonly title: string; readonly items: ReadonlyArray<readonly [string, string]> }>,
) {
  if (stepIndex === 0) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.childStepLabel}</legend>
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
          <Field label={copy.fields.childName} id="child_name" error={errors.child_name} required>
            <input id="child_name" type="text" value={form.child_name} onChange={(event) => updateField('child_name', event.target.value)} className={fieldClass(Boolean(errors.child_name))} />
          </Field>
          <Field label={copy.fields.gender} id="gender">
            <select id="gender" value={form.gender} onChange={(event) => updateField('gender', event.target.value)} className={fieldClass(Boolean(errors.gender))}>
              {copy.genders.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <DateOfBirthInput
            id="date_of_birth"
            label={copy.fields.dateOfBirth}
            value={form.date_of_birth}
            onChange={(iso) => updateField('date_of_birth', iso)}
            error={errors.date_of_birth}
            helpText={copy.optionalHint}
            locale={copy === applyCopy.fr ? 'fr' : 'en'}
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
        <InputField
          id="school_name"
          label={copy.fields.schoolName}
          value={form.school_name}
          onChange={(event) => updateField('school_name', event.target.value)}
          error={errors.school_name}
          helpText={copy.schoolHint}
          placeholder={copy.schoolPlaceholder}
          list="school_name-suggestions"
        />
        {form.contact_role === 'child' ? (
          <div className="rounded-md border border-foundation-100 bg-foundation-50 p-4 text-sm leading-6 text-foundation-900">
            {copy.childApplicantNote}
          </div>
        ) : null}
      </fieldset>
    );
  }

  if (stepIndex === 1) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.needStepLabel}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
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
          <InputField
            id="region_name"
            label={copy.fields.regionName}
            value={form.region_name}
            onChange={(event) => updateField('region_name', event.target.value)}
            error={errors.region_name}
            helpText={copy.optionalHint}
            list="region_name-suggestions"
          />
          <Field label={copy.fields.needType} id="need_type" error={errors.need_type} required>
            <select id="need_type" value={form.need_type} onChange={(event) => updateField('need_type', event.target.value as NeedType)} className={fieldClass(Boolean(errors.need_type))}>
              {copy.needTypes.map((option: any) => (
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
        <InputField
          id="village_name"
          label={copy.fields.villageName}
          value={form.village_name}
          onChange={(event) => updateField('village_name', event.target.value)}
          error={errors.village_name}
          helpText={copy.optionalHint}
          list="village_name-suggestions"
        />
        {form.school_enrollment_status === 'not_enrolled' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              id="last_school_attended"
              label={copy.fields.lastSchoolAttended}
              value={form.last_school_attended}
              onChange={(event) => updateField('last_school_attended', event.target.value)}
              error={errors.last_school_attended}
              required
              helpText={copy.lastSchoolHint}
            />
            <InputField
              id="education_interruption_reason"
              label={copy.fields.educationInterruptionReason}
              value={form.education_interruption_reason}
              onChange={(event) => updateField('education_interruption_reason', event.target.value)}
              error={errors.education_interruption_reason}
              required
              helpText={copy.interruptionHint}
            />
          </div>
        ) : null}
        {form.need_type === 'fees' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              id="fee_amount"
              label={copy.fields.feeAmount}
              value={form.fee_amount}
              onChange={(event) => updateField('fee_amount', event.target.value)}
              error={errors.fee_amount}
              required
              helpText={copy.feeAmountHint}
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
          <div className="grid gap-5 sm:grid-cols-2">
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
          </div>
        ) : null}
        {form.need_type === 'exam' ? (
          <InputField
            id="exam_fee_amount"
            label={copy.fields.examFeeAmount}
            value={form.exam_fee_amount}
            onChange={(event) => updateField('exam_fee_amount', event.target.value)}
            error={errors.exam_fee_amount}
            required
            helpText={copy.examFeeHint}
          />
        ) : null}
        <TextAreaField
          id="need_summary"
          label={copy.fields.needSummary}
          value={form.need_summary}
          onChange={(event) => updateField('need_summary', event.target.value)}
          error={errors.need_summary}
          required
          helpText={copy.needSummaryHint}
          maxLength={5000}
        />
        <TextAreaField
          id="situation_summary"
          label={copy.fields.situationSummary}
          value={form.situation_summary}
          onChange={(event) => updateField('situation_summary', event.target.value)}
          error={errors.situation_summary}
          required
          helpText={copy.situationSummaryHint}
          maxLength={7000}
        />
      </fieldset>
    );
  }

  if (stepIndex === 2) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.verificationStepLabel || 'Verification'}</legend>
        <div className="rounded-md border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-ink-900 mb-2">{copy.fields.documentsLabel || 'Upload Supporting Documents'}</p>
          <p className="text-xs text-ink-500 mb-4">{copy.fields.documentsHint || 'Please provide fee statement, result slip, or receipt.'}</p>
          {/* Note: In a real app we would use apiUploadApplicationDocument here. For now we just add a placeholder. */}
          <div className="border-2 border-dashed border-ink-200 rounded-md p-6 text-center text-ink-500 hover:bg-ink-50 hover:border-ink-300 transition-colors cursor-pointer">
            <FileText className="mx-auto h-8 w-8 mb-2" />
            <span className="text-sm">Click to upload document</span>
          </div>
        </div>
      </fieldset>
    );
  }

  if (stepIndex === 3) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.contactStepLabel}</legend>
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
          <Field label={copy.fields.contactRole} id="contact_role" error={errors.contact_role} required>
            <select id="contact_role" value={form.contact_role} onChange={(event) => updateField('contact_role', event.target.value as ContactRole)} className={fieldClass(Boolean(errors.contact_role))}>
              {copy.contactRoles.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={copy.fields.contactMethod} id="preferred_contact_method" error={errors.preferred_contact_method} required>
            <select id="preferred_contact_method" value={form.preferred_contact_method} onChange={(event) => updateField('preferred_contact_method', event.target.value as ContactMethod)} className={fieldClass(Boolean(errors.preferred_contact_method))}>
              {copy.contactMethods.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {form.contact_role === 'teacher' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              id="teacher_school_name_step2"
              label={copy.fields.teacherSchoolName}
              value={form.teacher_school_name}
              onChange={(event) => updateField('teacher_school_name', event.target.value)}
              error={errors.teacher_school_name}
              required
            />
            <InputField
              id="teacher_position_step2"
              label={copy.fields.teacherPosition}
              value={form.teacher_position}
              onChange={(event) => updateField('teacher_position', event.target.value)}
              error={errors.teacher_position}
              required
            />
          </div>
        ) : null}
        {form.contact_role === 'school_representative' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              id="institution_name_step2"
              label={copy.fields.institutionName}
              value={form.institution_name}
              onChange={(event) => updateField('institution_name', event.target.value)}
              error={errors.institution_name}
              required
            />
            <InputField
              id="institution_role_step2"
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

  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{copy.reviewStepLabel}</legend>
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
                <div key={label}>
                  <dt className="text-xs font-bold uppercase text-ink-500">{label}</dt>
                  <dd className="mt-1 text-sm leading-6 text-ink-800">{String(value) || copy.optionalValue}</dd>
                </div>
  return null;
}

function renderAuthStepContent(
  stepIndex: number,
  form: ApplicationFormState,
  errors: Partial<Record<keyof ApplicationFormState, string>>,
  copy: any,
  updateField: <Field extends keyof ApplicationFormState>(field: Field, value: ApplicationFormState[Field]) => void,
) {
  if (stepIndex === 0) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.applyingForStepLabel || 'Applying For'}</legend>
        <Field label={copy.fields.applyingFor || 'Who are you applying for?'} id="applying_for">
          <select id="applying_for" value={form.applying_for} onChange={(event) => updateField('applying_for', event.target.value as any)} className={fieldClass(Boolean(errors.applying_for))}>
            <option value="child">A child</option>
            <option value="self">Myself</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </fieldset>
    );
  }

  if (stepIndex === 1) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.childStepLabel}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.fields.childName} id="child_name" error={errors.child_name} required>
            <input id="child_name" type="text" value={form.child_name} onChange={(event) => updateField('child_name', event.target.value)} className={fieldClass(Boolean(errors.child_name))} />
          </Field>
          <Field label={copy.fields.gender} id="gender">
            <select id="gender" value={form.gender} onChange={(event) => updateField('gender', event.target.value)} className={fieldClass(Boolean(errors.gender))}>
              {copy.genders.map((option: any) => (
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
        </div>
      </fieldset>
    );
  }

  if (stepIndex === 2) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.educationStepLabel || 'Education'}</legend>
        <label className="flex items-start gap-3 rounded-md border border-ink-100 bg-white p-4 text-sm leading-6 text-ink-600 mb-4">
          <input
            type="checkbox"
            checked={form.is_enrolled}
            onChange={(event) => updateField('is_enrolled', event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-ink-300 text-foundation-600 focus:ring-foundation-500"
          />
          <span>{copy.fields.isEnrolled || 'Is the child currently enrolled in school?'}</span>
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.fields.schoolName} id="school_name" helpText={copy.schoolHint}>
            <input id="school_name" type="text" value={form.school_name} onChange={(event) => updateField('school_name', event.target.value)} className={fieldClass(Boolean(errors.school_name))} placeholder={copy.schoolPlaceholder} />
          </Field>
          <Field label={copy.fields.gradeLevel} id="grade_level" helpText={copy.optionalHint}>
            <input id="grade_level" type="text" value={form.grade_level} onChange={(event) => updateField('grade_level', event.target.value)} className={fieldClass(Boolean(errors.grade_level))} placeholder={copy.gradeLevelPlaceholder} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 mt-4">
          <Field label={copy.fields.distanceToSchool || 'Distance to School'} id="distance_to_school" helpText={copy.optionalHint}>
            <input id="distance_to_school" type="text" value={form.distance_to_school} onChange={(event) => updateField('distance_to_school', event.target.value)} className={fieldClass(Boolean(errors.distance_to_school))} placeholder="e.g. 5 km or 30 mins walk" />
          </Field>
          <Field label={copy.fields.interruptionReasons || 'School Interruptions'} id="interruption_reasons" helpText={copy.optionalHint}>
            <input id="interruption_reasons" type="text" value={form.interruption_reasons} onChange={(event) => updateField('interruption_reasons', event.target.value)} className={fieldClass(Boolean(errors.interruption_reasons))} placeholder="Any reasons for missing school?" />
          </Field>
        </div>
      </fieldset>
    );
  }

  if (stepIndex === 3) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.needStepLabel}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.fields.needType} id="need_type" error={errors.need_type} required>
            <select id="need_type" value={form.need_type} onChange={(event) => updateField('need_type', event.target.value as NeedType)} className={fieldClass(Boolean(errors.need_type))}>
              {copy.needTypes.map((option: any) => (
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

  if (stepIndex === 4) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.householdStepLabel || 'Household Situation'}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.fields.householdIncome || 'Estimated Monthly Income'} id="household_income_range" helpText={copy.optionalHint}>
            <input id="household_income_range" type="text" value={form.household_income_range} onChange={(event) => updateField('household_income_range', event.target.value)} className={fieldClass(Boolean(errors.household_income_range))} placeholder="e.g. Under 50,000 XAF" />
          </Field>
          <Field label={copy.fields.householdSize || 'Number of people in household'} id="household_size" helpText={copy.optionalHint}>
            <input id="household_size" type="number" min="1" value={form.household_size} onChange={(event) => updateField('household_size', parseInt(event.target.value) || '')} className={fieldClass(Boolean(errors.household_size))} />
          </Field>
        </div>
        <Field label={copy.fields.primaryCaregiverOccupation || 'Primary Caregiver Occupation'} id="primary_caregiver_occupation" helpText={copy.optionalHint}>
          <input id="primary_caregiver_occupation" type="text" value={form.primary_caregiver_occupation} onChange={(event) => updateField('primary_caregiver_occupation', event.target.value)} className={fieldClass(Boolean(errors.primary_caregiver_occupation))} placeholder="e.g. Farmer, Trader" />
        </Field>
      </fieldset>
    );
  }

  if (stepIndex === 5) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.contactStepLabel}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.fields.contactRole} id="contact_role" error={errors.contact_role} required>
            <select id="contact_role" value={form.contact_role} onChange={(event) => updateField('contact_role', event.target.value as ContactRole)} className={fieldClass(Boolean(errors.contact_role))}>
              {copy.contactRoles.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={copy.fields.contactMethod} id="preferred_contact_method" error={errors.preferred_contact_method} required>
            <select id="preferred_contact_method" value={form.preferred_contact_method} onChange={(event) => updateField('preferred_contact_method', event.target.value as ContactMethod)} className={fieldClass(Boolean(errors.preferred_contact_method))}>
              {copy.contactMethods.map((option: any) => (
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

  if (stepIndex === 6) {
    return (
      <fieldset className="grid gap-5">
        <legend className="sr-only">{copy.documentsStepLabel || 'Documents'}</legend>
        <div className="rounded-md border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-ink-900 mb-2">{copy.fields.documentsLabel || 'Upload Supporting Documents'}</p>
          <p className="text-xs text-ink-500 mb-4">{copy.fields.documentsHint || 'Please provide fee statement, result slip, or receipt.'}</p>
          <div className="border-2 border-dashed border-ink-200 rounded-md p-6 text-center text-ink-500 hover:bg-ink-50 hover:border-ink-300 transition-colors cursor-pointer">
            <FileText className="mx-auto h-8 w-8 mb-2" />
            <span className="text-sm">Click to upload document</span>
          </div>
        </div>
      </fieldset>
    );
  }

  return null;
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
      return [
        'need_type',
        'need_summary',
        'situation_summary',
        'region_name',
        'village_name',
        'school_enrollment_status',
        'last_school_attended',
        'education_interruption_reason',
        'fee_amount',
        'fee_due_date',
        'exam_name',
        'exam_date',
        'exam_fee_amount',
      ];
    case 2:
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
function stepFieldKeys(stepIndex: number, isAuthenticated: boolean): Array<keyof ApplicationFormState> {
  if (!isAuthenticated) {
    switch (stepIndex) {
      case 0: return ['child_name', 'gender', 'date_of_birth', 'school_name', 'grade_level'];
      case 1: return ['need_type', 'need_summary', 'situation_summary', 'region_name', 'village_name'];
      case 2: return ['documents']; // Verification step
      case 3: return ['contact_role', 'contact_name', 'contact_phone', 'contact_email', 'preferred_contact_method'];
      default: return ['consent'];
    }
  }

  switch (stepIndex) {
    case 0: return ['applying_for'];
    case 1: return ['child_name', 'gender', 'date_of_birth'];
    case 2: return ['is_enrolled', 'school_name', 'grade_level', 'distance_to_school', 'interruption_reasons'];
    case 3: return ['need_type', 'need_summary', 'situation_summary', 'region_name', 'village_name'];
    case 4: return ['household_income_range', 'household_size', 'primary_caregiver_occupation', 'household_challenges'];
    case 5: return ['contact_role', 'contact_name', 'contact_phone', 'contact_email', 'preferred_contact_method'];
    case 6: return ['documents'];
    default: return ['consent'];
  }
}

function validateStep(
  stepIndex: number,
  form: ApplicationFormState,
  copy: typeof applyCopy.en,
  isAuthenticated: boolean
): Partial<Record<keyof ApplicationFormState, string>> {
  const errors: Partial<Record<keyof ApplicationFormState, string>> = {};

  if (stepIndex === 0 && !form.child_name.trim()) {
    errors.child_name = copy.validation.childName;
  }

  if (stepIndex === 1) {
    if (!form.school_enrollment_status) {
      errors.school_enrollment_status = copy.validation.schoolEnrollmentStatus;
    }

    if (!form.need_summary.trim()) {
      errors.need_summary = copy.validation.needSummary;
    }
    if (!form.situation_summary.trim()) {
      errors.situation_summary = copy.validation.situationSummary;
  if (!isAuthenticated) {
    if (stepIndex === 0 && !form.child_name.trim()) errors.child_name = copy.validation.childName;
    if (stepIndex === 1) {
      if (!form.need_summary.trim()) errors.need_summary = copy.validation.needSummary;
      if (!form.situation_summary.trim()) errors.situation_summary = copy.validation.situationSummary;
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

  if (stepIndex === 2) {
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

    if (form.contact_role === 'school_representative') {
      if (!form.institution_name.trim()) {
        errors.institution_name = copy.validation.institutionName;
      }

      if (!form.institution_role.trim()) {
        errors.institution_role = copy.validation.institutionRole;
      }
    }
    if (stepIndex === 3) {
      if (!form.contact_name.trim()) errors.contact_name = copy.validation.contactName;
      if (!form.contact_phone.trim()) errors.contact_phone = copy.validation.contactPhone;
    }
    return errors;
  }

  if (stepIndex === 1 && !form.child_name.trim()) errors.child_name = copy.validation.childName;
  if (stepIndex === 3) {
    if (!form.need_summary.trim()) errors.need_summary = copy.validation.needSummary;
    if (!form.situation_summary.trim()) errors.situation_summary = copy.validation.situationSummary;
  }
  if (stepIndex === 5) {
    if (!form.contact_name.trim()) errors.contact_name = copy.validation.contactName;
    if (!form.contact_phone.trim()) errors.contact_phone = copy.validation.contactPhone;
  }

  return errors;
}

function validateAll(
  form: ApplicationFormState,
  copy: typeof applyCopy.en,
  isAuthenticated: boolean
): Partial<Record<keyof ApplicationFormState, string>> {
  const totalSteps = isAuthenticated ? 8 : 5;
  let allErrors = {};
  for (let i = 0; i < totalSteps - 1; i++) {
    allErrors = { ...allErrors, ...validateStep(i, form, copy, isAuthenticated) };
  }
  return {
    ...allErrors,
    ...(form.consent ? {} : { consent: copy.validation.consent }),
  };
}

function findFirstInvalidStep(errors: Partial<Record<keyof ApplicationFormState, string>>): number {
  if (errors.child_name || errors.gender || errors.date_of_birth || errors.school_name || errors.grade_level) {
    return 0;
  }

  if (
    errors.need_type ||
    errors.need_summary ||
    errors.situation_summary ||
    errors.region_name ||
    errors.village_name ||
    errors.school_enrollment_status ||
    errors.last_school_attended ||
    errors.education_interruption_reason ||
    errors.fee_amount ||
    errors.fee_due_date ||
    errors.exam_name ||
    errors.exam_date ||
    errors.exam_fee_amount
  ) {
    return 1;
  }

  if (
    errors.contact_role ||
    errors.contact_name ||
    errors.contact_phone ||
    errors.contact_email ||
    errors.preferred_contact_method ||
    errors.teacher_school_name ||
    errors.teacher_position ||
    errors.institution_name ||
    errors.institution_role
  ) {
    return 2;
function findFirstInvalidStep(errors: Partial<Record<keyof ApplicationFormState, string>>, isAuthenticated: boolean): number {
  if (!isAuthenticated) {
    if (errors.child_name || errors.gender || errors.date_of_birth || errors.school_name || errors.grade_level) return 0;
    if (errors.need_type || errors.need_summary || errors.situation_summary || errors.region_name || errors.village_name) return 1;
    if (errors.documents) return 2;
    if (errors.contact_role || errors.contact_name || errors.contact_phone || errors.contact_email || errors.preferred_contact_method) return 3;
    return 4;
  }

  if (errors.applying_for) return 0;
  if (errors.child_name || errors.gender || errors.date_of_birth) return 1;
  if (errors.is_enrolled || errors.school_name || errors.grade_level || errors.distance_to_school || errors.interruption_reasons) return 2;
  if (errors.need_type || errors.need_summary || errors.situation_summary || errors.region_name || errors.village_name) return 3;
  if (errors.household_income_range || errors.household_size || errors.primary_caregiver_occupation || errors.household_challenges) return 4;
  if (errors.contact_role || errors.contact_name || errors.contact_phone || errors.contact_email || errors.preferred_contact_method) return 5;
  if (errors.documents) return 6;
  return 7;
}

const applyCopy = {
  en: {
    heroImageAlt: 'Children learning together in a rural school in Cameroon.',
    startCta: 'Start application',
    trackCta: 'Track application',
    helpCta: 'Need help?',
    aboutCta: 'About the foundation',
    introEyebrow: 'Application intake',
    introTitle: 'Tell us about the child and the support they need.',
    introBody:
      "Use this form to share the child's details, the school need, and the responsible adult or organization we should contact. We only ask for what helps us begin the review respectfully and carefully.",
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
    childStepLabel: '1. Child Details',
    needStepLabel: '2. Support Needed',
    contactStepLabel: '3. Contact Person',
    reviewStepLabel: '4. Review & Confirm',
    applyingForStepLabel: 'Applying For',
    educationStepLabel: 'Education Details',
    householdStepLabel: 'Household Situation',
    verificationStepLabel: 'Verification',
    documentsStepLabel: 'Documents',
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
      child: 'Child Details',
      need: 'Support Needed',
      contact: 'Contact Person',
      education: 'Education',
      household: 'Household',
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
      childName: "Child's Full Name",
      gender: 'Gender',
      dateOfBirth: 'Date of birth',
      schoolName: 'School name',
      gradeLevel: 'Class or grade level',
      regionName: 'Region',
      villageName: 'Village or community',
      schoolEnrollmentStatus: 'Is the child currently enrolled?',
      lastSchoolAttended: 'Last school attended',
      educationInterruptionReason: 'What has interrupted schooling?',
      teacherSchoolName: 'Teacher school name',
      teacherPosition: 'Teacher position',
      institutionName: 'Institution name',
      institutionRole: 'Your role at the institution',
      feeAmount: 'Fee amount',
      feeDueDate: 'Fee due date',
      examName: 'Exam name',
      examDate: 'Exam date',
      examFeeAmount: 'Exam fee amount',
      needType: 'What support is needed?',
      needSummary: 'What support is needed?',
      situationSummary: 'What is happening?',
      contactRole: 'Who are you in relation to the child?',
      contactName: 'Responsible adult or contact person',
      contactPhone: 'Phone number',
      contactEmail: 'Email address',
      contactMethod: 'Preferred contact method',
      dateOfBirth: 'Date of Birth',
      schoolName: 'Current or Last School Name',
      gradeLevel: 'Current or Next Grade/Class',
      regionName: 'Region / Province',
      villageName: 'City / Village / Quarter',
      needType: 'Primary Support Needed',
      needSummary: 'Brief Summary of Need',
      situationSummary: 'Family / Household Situation',
      contactRole: 'Relationship to Child',
      contactName: 'Contact Person Name',
      contactPhone: 'Phone Number',
      contactEmail: 'Email Address',
      contactMethod: 'Preferred Contact Method',
      preferredContactMethod: 'Preferred Contact Method',
      applyingFor: 'Who are you applying for?',
      isEnrolled: 'Is the child currently enrolled in school?',
      distanceToSchool: 'Distance to School',
      interruptionReasons: 'School Interruptions',
      householdIncome: 'Estimated Monthly Income',
      householdSize: 'Number of people in household',
      primaryCaregiverOccupation: 'Primary Caregiver Occupation',
      documentsLabel: 'Upload Supporting Documents',
      documentsHint: 'Please provide fee statement, result slip, or receipt.',
    },
    childApplicantNote: 'Because a child is applying, please make sure an adult contact is listed for follow-up.',
    lastSchoolHint: 'If the child is not currently enrolled, share the most recent school they attended if you know it.',
    interruptionHint: 'Help us understand why schooling stopped or has been delayed.',
    feeAmountHint: 'If you know the amount, include it here. This helps us understand the gap clearly.',
    examFeeHint: 'If you know the exam fee amount, include it here.',
    schoolEnrollmentStatuses: [
      { value: 'enrolled', label: 'Currently enrolled' },
      { value: 'not_enrolled', label: 'Not currently enrolled' },
      { value: 'unsure', label: 'Not sure' },
    ],
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
      { value: 'teacher', label: 'Teacher' },
      { value: 'school_representative', label: 'School representative' },
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
      childName: 'Please enter the childÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢s name.',
      needSummary: 'Please tell us what support is needed.',
      situationSummary: 'Please tell us what is happening.',
      schoolEnrollmentStatus: 'Please tell us whether the child is currently enrolled.',
      schoolNameCurrent: 'Please enter the school name.',
      lastSchoolAttended: 'Please tell us the last school attended.',
      educationInterruptionReason: 'Please tell us what interrupted schooling.',
      teacherSchoolName: 'Please enter the teacherÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢s school name.',
      teacherPosition: 'Please enter the teacherÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢s position.',
      institutionName: 'Please enter the institution name.',
      institutionRole: 'Please enter your role at the institution.',
      feeAmount: 'Please share the fee amount if this support is about fees.',
      examName: 'Please share the exam name.',
      examFeeAmount: 'Please share the exam fee amount.',
      contactName: 'Please enter the contact personÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢s name.',
      contactPhone: 'Please enter a phone number.',
      consent: 'Please confirm that the details are correct and that we may follow up.',
      review: 'Please review the highlighted fields and continue.',
      failed: 'We could not send the application. Please try again.',
    },
  },
  fr: {
    heroImageAlt: 'Des enfants apprennent ensemble dans une ÃƒÂ©cole rurale au Cameroun.',
    startCta: 'Commencer la demande',
    trackCta: 'Suivre la demande',
    helpCta: "Besoin d'aide ?",
    aboutCta: 'Ãƒâ‚¬ propos de la fondation',
    introEyebrow: 'DÃƒÂ©pÃƒÂ´t de demande',
    introTitle: "Parlez-nous de l'enfant et du soutien nÃƒÂ©cessaire.",
    introBody:
      "Utilisez ce formulaire pour partager les informations de l'enfant, le besoin scolaire et l'adulte ou l'organisation que nous devons contacter. Nous ne demandons que ce qui nous aide ÃƒÂ  commencer l'examen avec respect et soin.",
    highlights: [
      {
        icon: School,
        title: "Identifier l'enfant",
        body: 'Partagez assez de dÃƒÂ©tails pour reconnaÃƒÂ®tre le contexte scolaire.',
      },
      {
        icon: HeartHandshake,
        title: 'Expliquer le besoin',
        body: "Dites-nous ce qui empÃƒÂªche la prÃƒÂ©sence ou la progression ÃƒÂ  l'ÃƒÂ©cole.",
      },
      {
        icon: UsersRound,
        title: 'Contacter la bonne personne',
        body: 'Nommez la personne qui peut aider ÃƒÂ  vÃƒÂ©rifier la situation et continuer la discussion.',
      },
    ],
    formEyebrow: 'Formulaire de demande',
    formTitle: 'Enregistrez votre progression au fur et ÃƒÂ  mesure.',
    progressLabel: 'Progression',
    saveDraftLabel: 'Brouillon enregistrÃƒÂ©',
    lastSavedLabel: 'DerniÃƒÂ¨re sauvegarde',
    clearDraftLabel: 'Effacer le brouillon',
    childStepLabel: "Informations sur l'enfant",
    needStepLabel: 'Besoin ÃƒÂ©ducatif',
    contactStepLabel: 'Personne ÃƒÂ  contacter',
    reviewStepLabel: 'VÃƒÂ©rifier et envoyer',
    childStepLabel: "1. DÃ©tails de l'enfant",
    needStepLabel: '2. Soutien nÃ©cessaire',
    contactStepLabel: '3. Personne de contact',
    reviewStepLabel: '4. VÃ©rification',
    applyingForStepLabel: 'Demande Pour',
    educationStepLabel: 'Éducation',
    householdStepLabel: 'Situation Familiale',
    verificationStepLabel: 'Vérification',
    documentsStepLabel: 'Documents',
    backLabel: 'Retour',
    continueLabel: 'Continuer',
    submitLabel: 'Envoyer la demande',
    sendingLabel: 'Envoi...',
    referenceLabel: 'RÃƒÂ©fÃƒÂ©rence',
    optionalValue: 'Non renseignÃƒÂ©',
    optionalHint: 'Facultatif',
    schoolHint: "Si vous ne connaissez pas le nom exact de l'ÃƒÂ©cole, vous pouvez laisser ce champ vide.",
    gradeLevelPlaceholder: 'Exemple : CM2',
    schoolPlaceholder: "Nom de l'ÃƒÂ©cole ou du centre",
    needSummaryHint: 'Une courte description du besoin et de son importance.',
    situationSummaryHint: 'DÃƒÂ©crivez clairement la situation pour que nous comprenions le contexte.',
    reviewEyebrow: "VÃƒÂ©rifiez avant l'envoi",
    reviewBody: "Merci de relire les informations ci-dessous. Une fois la demande envoyÃƒÂ©e, nous l'examinerons et contacterons la personne indiquÃƒÂ©e.",
    consentLabel: "Je confirme que les informations ci-dessus sont exactes et que la Fondation TriumphChi peut contacter la personne indiquÃƒÂ©e pour donner suite ÃƒÂ  cette demande.",
    reviewSections: {
      child: "Informations sur l'enfant",
      need: 'Besoin ÃƒÂ©ducatif',
      contact: 'Personne ÃƒÂ  contacter',
      child: "DÃ©tails de l'enfant",
      need: 'Soutien nÃ©cessaire',
      contact: 'Personne de contact',
      education: 'Éducation',
      household: 'Foyer',
    },
    nextStepsEyebrow: 'Ce qui se passe ensuite',
    nextStepsTitle: 'Un processus simple de la demande au suivi.',
    nextStepsBody: "Le formulaire n'est que le point de dÃƒÂ©part. AprÃƒÂ¨s l'envoi, la demande est examinÃƒÂ©e et le contact responsable est joint avec soin.",
    nextSteps: [
      { caption: '01', title: 'Recevoir', body: 'Nous recevons la demande et crÃƒÂ©ons une rÃƒÂ©fÃƒÂ©rence de suivi.' },
      { caption: '02', title: 'Examiner', body: 'Les dÃƒÂ©tails sont vÃƒÂ©rifiÃƒÂ©s pour avancer avec clartÃƒÂ© et respect.' },
      { caption: '03', title: 'Recontacter', body: 'Nous contactons la personne indiquÃƒÂ©e et poursuivons la conversation.' },
    ],
    helpEyebrow: "Besoin d'un coup de main ?",
    helpTitle: 'Vous pouvez nous joindre avant ou aprÃƒÂ¨s lÃ¢â‚¬â„¢envoi du formulaire.',
    helpBody: "Si vous avez besoin d'aide pour remplir le formulaire ou souhaitez parler ÃƒÂ  quelqu'un, utilisez les coordonnÃƒÂ©es ci-dessous.",
    contactCards: {
      email: 'Email',
      phone: 'TÃƒÂ©lÃƒÂ©phone',
      location: 'Lieu',
      responseTime: 'DÃƒÂ©lai de rÃƒÂ©ponse',
    },
    fields: {
      childName: "Nom complet de l'enfant",
      gender: 'Genre',
      dateOfBirth: 'Date de naissance',
      schoolName: "Nom de l'ÃƒÂ©cole",
      gradeLevel: 'Classe ou niveau',
      regionName: 'RÃƒÂ©gion',
      villageName: 'Village ou communautÃƒÂ©',
      schoolEnrollmentStatus: "L'enfant est-il actuellement inscrit ?",
      lastSchoolAttended: 'DerniÃƒÂ¨re ÃƒÂ©cole frÃƒÂ©quentÃƒÂ©e',
      educationInterruptionReason: 'QuÃ¢â‚¬â„¢est-ce qui a interrompu la scolaritÃƒÂ© ?',
      teacherSchoolName: "Nom de l'ÃƒÂ©cole de l'enseignant",
      teacherPosition: 'Poste de lÃ¢â‚¬â„¢enseignant',
      institutionName: "Nom de l'institution",
      institutionRole: 'Votre rÃƒÂ´le dans lÃ¢â‚¬â„¢institution',
      feeAmount: 'Montant des frais',
      feeDueDate: 'Date dÃ¢â‚¬â„¢ÃƒÂ©chÃƒÂ©ance des frais',
      examName: 'Nom de lÃ¢â‚¬â„¢examen',
      examDate: 'Date de lÃ¢â‚¬â„¢examen',
      examFeeAmount: 'Montant des frais dÃ¢â‚¬â„¢examen',
      needType: 'Quel soutien est nÃƒÂ©cessaire ?',
      needSummary: 'Quel soutien est nÃƒÂ©cessaire ?',
      situationSummary: 'Que se passe-t-il ?',
      contactRole: "Quel est votre lien avec l'enfant ?",
      contactName: 'Adulte responsable ou personne ÃƒÂ  contacter',
      contactPhone: 'NumÃƒÂ©ro de tÃƒÂ©lÃƒÂ©phone',
      schoolName: 'Nom de l’Ã©cole (actuelle ou derniÃ¨re)',
      gradeLevel: 'Classe / Niveau',
      regionName: 'RÃ©gion / Province',
      villageName: 'Ville / Village / Quartier',
      needType: 'Type de soutien principal',
      needSummary: 'Bref rÃ©sumÃ© du besoin',
      situationSummary: 'Situation familiale / RÃ©sidence',
      contactRole: "Lien avec l'enfant",
      contactName: 'Nom du contact',
      contactPhone: 'NumÃ©ro de tÃ©lÃ©phone',
      contactEmail: 'Adresse email',
      contactMethod: 'Moyen de contact prÃƒÂ©fÃƒÂ©rÃƒÂ©',
      contactMethod: 'MÃ©thode de contact prÃ©fÃ©rÃ©e',
      preferredContactMethod: 'MÃ©thode de contact prÃ©fÃ©rÃ©e',
      applyingFor: 'Pour qui postulez-vous?',
      isEnrolled: "L'enfant est-il actuellement inscrit à l'école?",
      distanceToSchool: "Distance jusqu'à l'école",
      interruptionReasons: "Interruptions scolaires",
      householdIncome: "Revenu mensuel estimé",
      householdSize: "Nombre de personnes dans le foyer",
      primaryCaregiverOccupation: "Profession du responsable",
      documentsLabel: 'Télécharger des Documents',
      documentsHint: 'Veuillez fournir un relevé de frais, bulletin de notes ou reçu.',
    },
    genders: [
      { value: '', label: 'Choisir le sexe' },
      { value: 'female', label: 'Femme' },
      { value: 'male', label: 'Homme' },
      { value: 'other', label: 'Autre' },
      { value: 'prefer-not-to-say', label: 'PrÃƒÂ©fÃƒÂ¨re ne pas dire' },
    ],
    needTypes: [
      { value: 'fees', label: 'Frais scolaires' },
      { value: 'books', label: 'Livres et matÃƒÂ©riel' },
      { value: 'uniform', label: 'Uniforme' },
      { value: 'exam', label: "Frais d'examen" },
      { value: 'transport', label: "Transport vers l'ÃƒÂ©cole" },
      { value: 'meals', label: 'Repas ou soutien de base' },
      { value: 'other', label: 'Autre' },
    ],
    contactRoles: [
      { value: 'guardian', label: 'Tuteur' },
      { value: 'parent', label: 'Parent' },
      { value: 'teacher', label: 'Enseignant' },
      { value: 'school_representative', label: "ReprÃƒÂ©sentant de l'ÃƒÂ©cole" },
      { value: 'school', label: "ReprÃƒÂ©sentant de l'ÃƒÂ©cole" },
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
      needSummary: 'Veuillez indiquer le soutien nÃƒÂ©cessaire.',
      situationSummary: 'Veuillez dÃƒÂ©crire la situation.',
      schoolEnrollmentStatus: "Veuillez prÃƒÂ©ciser si l'enfant est actuellement inscrit.",
      schoolNameCurrent: "Veuillez indiquer le nom de l'ÃƒÂ©cole actuelle.",
      lastSchoolAttended: 'Veuillez indiquer la derniÃƒÂ¨re ÃƒÂ©cole frÃƒÂ©quentÃƒÂ©e.',
      educationInterruptionReason: 'Veuillez prÃƒÂ©ciser ce qui a interrompu la scolaritÃƒÂ©.',
      teacherSchoolName: "Veuillez indiquer le nom de l'ÃƒÂ©cole de l'enseignant.",
      teacherPosition: "Veuillez indiquer la fonction de l'enseignant.",
      institutionName: "Veuillez indiquer le nom de l'institution.",
      institutionRole: 'Veuillez indiquer votre rÃƒÂ´le dans lÃ¢â‚¬â„¢institution.',
      feeAmount: 'Veuillez prÃƒÂ©ciser le montant des frais si la demande porte sur les frais scolaires.',
      examName: "Veuillez prÃƒÂ©ciser le nom de l'examen.",
      examFeeAmount: "Veuillez prÃƒÂ©ciser le montant des frais d'examen.",
      contactName: 'Veuillez saisir le nom de la personne ÃƒÂ  contacter.',
      contactPhone: 'Veuillez saisir un numÃƒÂ©ro de tÃƒÂ©lÃƒÂ©phone.',
      consent: 'Veuillez confirmer que les informations sont exactes et que nous pouvons faire un suivi.',
      review: 'Veuillez vÃƒÂ©rifier les champs indiquÃƒÂ©s et continuer.',
      failed: "Nous n'avons pas pu envoyer la demande. Veuillez rÃƒÂ©essayer.",
    },
    childApplicantNote: 'Parce qu’un enfant est concerné, veuillez indiquer un adulte pour le suivi.',
    lastSchoolHint: 'Si l’enfant n’est pas actuellement inscrit, indiquez la dernière école fréquentée si vous la connaissez.',
    interruptionHint: 'Aidez-nous à comprendre pourquoi la scolarité a été interrompue ou retardée.',
    feeAmountHint: 'Si vous connaissez le montant, indiquez-le ici pour mieux comprendre l’écart à couvrir.',
    examFeeHint: 'Si vous connaissez le montant des frais d’examen, indiquez-le ici.',
    schoolEnrollmentStatuses: [
      { value: 'enrolled', label: 'Actuellement inscrit' },
      { value: 'not_enrolled', label: 'Pas actuellement inscrit' },
      { value: 'unsure', label: 'Pas sûr' },
    ],
  },
} satisfies Record<Locale, {
  heroImageAlt: string;
  startCta: string;
  trackCta: string;
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
  applyingForStepLabel?: string;
  educationStepLabel?: string;
  householdStepLabel?: string;
  verificationStepLabel?: string;
  documentsStepLabel?: string;
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
    education?: string;
    household?: string;
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
    schoolEnrollmentStatus: string;
    lastSchoolAttended: string;
    educationInterruptionReason: string;
    teacherSchoolName: string;
    teacherPosition: string;
    institutionName: string;
    institutionRole: string;
    feeAmount: string;
    feeDueDate: string;
    examName: string;
    examDate: string;
    examFeeAmount: string;
    needType: string;
    needSummary: string;
    situationSummary: string;
    contactRole: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    contactMethod: string;
    preferredContactMethod?: string;
    applyingFor?: string;
    isEnrolled?: string;
    distanceToSchool?: string;
    interruptionReasons?: string;
    householdIncome?: string;
    householdSize?: string;
    primaryCaregiverOccupation?: string;
    documentsLabel?: string;
    documentsHint?: string;
  };
  genders: Array<{ value: string; label: string }>;
  needTypes: Array<{ value: NeedType; label: string }>;
  contactRoles: Array<{ value: ContactRole; label: string }>;
  contactMethods: Array<{ value: ContactMethod; label: string }>;
  validation: {
    childName: string;
    needSummary: string;
    situationSummary: string;
    schoolEnrollmentStatus: string;
    schoolNameCurrent: string;
    lastSchoolAttended: string;
    educationInterruptionReason: string;
    teacherSchoolName: string;
    teacherPosition: string;
    institutionName: string;
    institutionRole: string;
    feeAmount: string;
    examName: string;
    examFeeAmount: string;
    contactName: string;
    contactPhone: string;
    consent: string;
    review: string;
    failed: string;
  };
  childApplicantNote: string;
  lastSchoolHint: string;
  interruptionHint: string;
  feeAmountHint: string;
  examFeeHint: string;
  schoolEnrollmentStatuses: Array<{ value: SchoolEnrollmentStatus; label: string }>;
}>;
