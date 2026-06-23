import { ChangeEvent, FormEvent, ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Clock,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  School,
  Send,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FaqSection } from '../../../components/public/FaqSection';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { Seo } from '../../../components/seo/Seo';
import { InputField } from '../../../components/ui/InputField';
import { SelectField } from '../../../components/ui/SelectField';
import { TextAreaField } from '../../../components/ui/TextAreaField';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { publicFaqSections } from '../../../content/publicFaqs';
import { apiSubmitContactMessage, ContactDraftAttachment } from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import { publicContact } from '../../../lib/publicContact';
import heroImage from '../../../assets/landing/rural-home-cameroon.jpg';
import contactImage from '../../../assets/landing/education_aid_project.jpg';
import communityImage from '../../../assets/landing/rural_kids.jpg';

interface ContactPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

type ContactReason = 'sponsorship' | 'assistance' | 'school' | 'volunteer' | 'partnership' | 'general';

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  reason: ContactReason;
  subject: string;
  message: string;
  consent: boolean;
}

const initialForm: ContactFormState = {
  name: '',
  email: '',
  phone: '',
  reason: 'general',
  subject: '',
  message: '',
  consent: false,
};

const reasonIcons: LucideIcon[] = [HeartHandshake, HandHeart, School, UsersRound, Building2, MessageSquareText];
const pageLinkIcons: LucideIcon[] = [HeartHandshake, HandHeart, BookOpen, GraduationCap, ShieldCheck];

export function ContactPage({ locale, page }: ContactPageProps) {
  const copy = contactCopy[locale];
  const homePage = getPageByKey('home');
  const sponsorPage = getPageByKey('sponsor');
  const applyPage = getPageByKey('apply');
  const donatePage = getPageByKey('donate');
  const impactPage = getPageByKey('impact');
  const aboutPage = getPageByKey('about');
  const faqSection = publicFaqSections.contact;
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drafts, setDrafts] = useState<ContactDraftAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);
  const [submissionMessage, setSubmissionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const contactMethods = [
    { icon: Mail, label: copy.contactMethodLabels.email, value: publicContact.email, href: publicContact.emailHref },
    { icon: Phone, label: copy.contactMethodLabels.phone, value: publicContact.phoneDisplay, href: publicContact.phoneHref },
    { icon: MapPin, label: copy.contactMethodLabels.location, value: publicContact.location[locale], href: `/${locale}${page.path[locale]}` },
    { icon: Clock, label: copy.contactMethodLabels.responseTime, value: publicContact.responseTime[locale], href: `/${locale}${page.path[locale]}` },
  ];

  const publicLinks = useMemo(
    () => [
      { page: sponsorPage, text: copy.relatedLinks.sponsor },
      { page: applyPage, text: copy.relatedLinks.apply },
      { page: donatePage, text: copy.relatedLinks.donate },
      { page: impactPage, text: copy.relatedLinks.impact },
      { page: aboutPage, text: copy.relatedLinks.about },
    ],
    [aboutPage, applyPage, copy.relatedLinks, donatePage, impactPage, sponsorPage],
  );

  const updateField = <Field extends keyof ContactFormState>(field: Field, value: ContactFormState[Field]) => {
    setForm((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }

    if (submissionMessage) {
      setSubmissionMessage(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateContactForm(form, copy);
    setErrors(validationErrors);
    setSubmissionMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      setSubmissionMessage({ type: 'error', text: copy.validation.review });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiSubmitContactMessage(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          reason: form.reason,
          subject: form.subject.trim() || undefined,
          message: form.message.trim(),
          consent: form.consent,
          draft_attachments: drafts,
        },
        locale,
      );

      setSubmissionMessage({ type: 'success', text: response.message });
      setForm(initialForm);
      setDrafts([]);
      setAttachmentInputKey((current) => current + 1);
    } catch (error) {
      setSubmissionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : copy.validation.failed,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachmentsChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (submissionMessage) {
      setSubmissionMessage(null);
    }

    setIsUploading(true);
    const newDrafts: ContactDraftAttachment[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('attachment', file);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'}/public/contact-messages/draft-attachments`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-Language': locale,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || copy.validation.failed);
        }

        const data: ContactDraftAttachment = await response.json();
        
        if (file.type.startsWith('image/')) {
          data.preview_url = URL.createObjectURL(file);
        }
        
        newDrafts.push(data);
      }
      
      setDrafts((prev) => [...prev, ...newDrafts]);
    } catch (error) {
      setSubmissionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : copy.validation.failed,
      });
    } finally {
      setIsUploading(false);
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
              href="#contact-form"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-foundation-900 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-50"
            >
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              to={`/${locale}${applyPage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.18]"
            >
              {copy.secondaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <ImageStory image={contactImage} alt={copy.introImageAlt} caption={copy.introCaption} />
          <div className="self-center">
            <SectionIntro eyebrow={copy.introEyebrow} title={copy.introTitle} body={copy.introBody} />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {contactMethods.map((method) => {
                const Icon = method.icon;

                return (
                  <a
                    key={method.label}
                    href={method.href}
                    className="focus-ring rounded-md border border-ink-100 bg-ink-50 p-4 transition duration-200 hover:-translate-y-1 hover:border-foundation-100 hover:bg-foundation-50"
                  >
                    <Icon className="h-5 w-5 text-foundation-600" aria-hidden="true" />
                    <p className="mt-3 text-sm font-black text-ink-900">{method.label}</p>
                    <p className="mt-1 text-sm leading-6 text-ink-500">{method.value}</p>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.reasonsEyebrow} title={copy.reasonsTitle} body={copy.reasonsBody} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.reasons.map((reason, index) => {
              const Icon = reasonIcons[index];

              return (
                <article key={reason.title} className="rounded-md border border-foundation-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-black text-ink-900">{reason.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{reason.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contact-form" className="scroll-mt-24 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-16">
          <div className="rounded-md border border-ink-100 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-8">
              <p className="text-sm font-black uppercase text-foundation-600">{copy.formEyebrow}</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-ink-900">{copy.formTitle}</h2>
              <p className="mt-3 text-base leading-7 text-ink-500">{copy.formBody}</p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  label={copy.fields.name}
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  error={errors.name}
                  required
                />

                <InputField
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  label={copy.fields.email}
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  error={errors.email}
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  label={copy.fields.phone}
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  error={errors.phone}
                />

                <SelectField
                  id="contact-reason"
                  name="reason"
                  label={copy.fields.reason}
                  value={form.reason}
                  onChange={(event) => updateField('reason', event.target.value as ContactReason)}
                  error={errors.reason}
                  required
                >
                  {copy.reasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
              </div>

              <InputField
                id="contact-subject"
                name="subject"
                type="text"
                label={copy.fields.subject}
                value={form.subject}
                onChange={(event) => updateField('subject', event.target.value)}
                error={errors.subject}
                required
              />

              <TextAreaField
                id="contact-message"
                name="message"
                label={copy.fields.message}
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                error={errors.message}
                helpText={copy.messageHelp}
                maxLength={5000}
                required
              />

              <div>
                <label htmlFor="contact-attachments" className="block text-sm font-bold text-ink-700">
                  {copy.fields.attachments}
                </label>
                <div className="mt-1">
                  <input
                    id="contact-attachments"
                    key={attachmentInputKey}
                    name="attachments"
                    type="file"
                    multiple
                    disabled={isUploading || isSubmitting}
                    onChange={handleAttachmentsChange}
                    className="block min-h-12 w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-base text-ink-900 shadow-sm transition duration-200 file:mr-4 file:rounded-md file:border-0 file:bg-foundation-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-foundation-700 hover:file:bg-foundation-100 focus:border-foundation-500 focus:outline-none focus:ring-2 focus:ring-foundation-500/20 disabled:opacity-50 sm:text-sm"
                  />
                </div>
                {isUploading && (
                  <p className="mt-2 text-xs font-medium text-foundation-600 animate-pulse">Uploading file(s)...</p>
                )}
                {drafts.length > 0 && (
                  <ul className="mt-3 divide-y divide-ink-100 rounded-md border border-ink-100 bg-white">
                    {drafts.map((draft, idx) => (
                      <li key={idx} className="flex items-center justify-between py-2 pl-3 pr-4 text-sm">
                        <div className="flex w-0 flex-1 items-center">
                          {draft.mime_type.startsWith('image/') ? (
                            <div className="mr-3 h-8 w-8 flex-shrink-0 rounded bg-ink-100 flex items-center justify-center text-[10px] uppercase font-bold text-ink-500 overflow-hidden">
                              {draft.preview_url ? (
                                <img src={draft.preview_url} alt={draft.original_name} className="h-full w-full object-cover" />
                              ) : (
                                "IMG"
                              )}
                            </div>
                          ) : (
                            <svg className="mr-3 h-5 w-5 flex-shrink-0 text-ink-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="truncate font-medium text-ink-700">{draft.original_name}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-xs text-ink-500">
                          {(draft.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <label className="flex items-start gap-3 rounded-md border border-ink-100 bg-ink-50 p-4 text-sm leading-6 text-ink-600">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(event) => updateField('consent', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-ink-300 text-foundation-600 focus:ring-foundation-500"
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? 'contact-consent-error' : undefined}
                />
                <span>
                  {copy.fields.consent}
                  {errors.consent ? (
                    <span id="contact-consent-error" className="mt-2 block text-sm text-support-red">
                      {errors.consent}
                    </span>
                  ) : null}
                </span>
              </label>

              <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-900 sm:justify-self-start',
                    isSubmitting && 'cursor-not-allowed opacity-60 hover:translate-y-0',
                  )}
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isSubmitting ? copy.sending : copy.send}
                </button>

                {submissionMessage ? (
                  <div
                    className={cn(
                      'rounded-md border px-4 py-3 text-sm leading-6',
                      submissionMessage.type === 'success'
                        ? 'border-foundation-100 bg-foundation-50 text-foundation-900'
                        : 'border-support-red/20 bg-support-red/5 text-support-red',
                    )}
                    role={submissionMessage.type === 'success' ? 'status' : 'alert'}
                    aria-live="polite"
                  >
                    <div className="flex gap-2">
                      {submissionMessage.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      ) : null}
                      <span>{submissionMessage.text}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </form>
          </div>

          <aside className="grid content-start gap-5">
            <div className="rounded-md border border-foundation-100 bg-foundation-50 p-5">
              <ShieldCheck className="h-6 w-6 text-foundation-600" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-ink-900">{copy.safeguardingTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-600">{copy.safeguardingBody}</p>
            </div>
            <ImageStory image={communityImage} alt={copy.sideImageAlt} caption={copy.sideCaption} />
          </aside>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:pb-16">
          <SectionIntro eyebrow={copy.storiesEyebrow} title={copy.storiesTitle} body={copy.storiesBody} />
          <div className="grid gap-3 sm:grid-cols-2">
            {copy.stories.map((story) => (
              <div key={story} className="rounded-md border border-ink-100 bg-ink-50 p-4 text-sm leading-6 text-ink-600">
                {story}
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection
        eyebrow={faqSection.eyebrow[locale]}
        title={faqSection.title[locale]}
        body={faqSection.body[locale]}
        items={faqSection.items[locale]}
        surface="white"
      />

      <section className="bg-ink-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-foundation-100">{copy.linksEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{copy.linksTitle}</h2>
            <div className="mt-3 grid max-w-3xl gap-4 text-base leading-7 text-ink-100">
              {copy.linksBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {publicLinks.map((item, index) => {
              const Icon = pageLinkIcons[index];

              return (
                <Link
                  key={item.page.key}
                  to={`/${locale}${item.page.path[locale]}`}
                  className="focus-ring rounded-md border border-white/10 bg-white/5 p-5 transition duration-200 hover:-translate-y-1 hover:bg-white/10"
                >
                  <Icon className="h-5 w-5 text-foundation-100" aria-hidden="true" />
                  <p className="mt-4 text-base font-black">{item.page.label[locale]}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-100">{item.text}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function validateContactForm(form: ContactFormState, copy: ContactCopy) {
  const errors: Partial<Record<keyof ContactFormState, string>> = {};

  if (!form.name.trim()) {
    errors.name = copy.validation.name;
  }

  if (!form.email.trim()) {
    errors.email = copy.validation.email;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = copy.validation.emailInvalid;
  }

  if (!form.message.trim()) {
    errors.message = copy.validation.message;
  } else if (form.message.trim().length < 10) {
    errors.message = copy.validation.messageLength;
  }

  if (!form.consent) {
    errors.consent = copy.validation.consent;
  }

  return errors;
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

function ContactItem({ icon, title, text, href }: { icon: React.ReactNode; title: string; text: string; href?: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foundation-100 text-foundation-600">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-ink-900">{title}</h3>
        {href ? (
          <a href={href} className="mt-1 block text-ink-600 hover:text-foundation-600">
            {text}
          </a>
        ) : (
          <p className="mt-1 text-ink-600">{text}</p>
        )}
      </div>
    </div>
  );
}

function ImageStory({ image, alt, caption }: { image: string; alt: string; caption: string }) {
  return (
    <figure className="overflow-hidden rounded-md border border-ink-100 bg-white shadow-sm">
      <div className="relative isolate overflow-hidden">
        <img src={image} alt={alt} className="aspect-[4/3] w-full object-cover opacity-80 saturate-[0.74]" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,55,47,0.76),rgba(18,55,47,0.42)_48%,rgba(18,55,47,0.78))] mix-blend-multiply" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_18%,rgba(255,255,255,0.14),transparent_32%),linear-gradient(90deg,rgba(18,55,47,0.22),rgba(18,55,47,0.56))]" aria-hidden="true" />
      </div>
      <figcaption className="px-4 py-3 text-sm leading-6 text-ink-500">{caption}</figcaption>
    </figure>
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

interface ContactCopy {
  heroImageAlt: string;
  primaryCta: string;
  secondaryCta: string;
  introEyebrow: string;
  introTitle: string;
  introBody: string;
  introImageAlt: string;
  introCaption: string;
  contactMethodLabels: {
    email: string;
    phone: string;
    location: string;
    responseTime: string;
  };
  reasonsEyebrow: string;
  reasonsTitle: string;
  reasonsBody: string;
  reasons: Array<{ title: string; body: string }>;
  formEyebrow: string;
  formTitle: string;
  formBody: string;
  fields: {
    name: string;
    email: string;
    phone: string;
    reason: string;
    subject: string;
    message: string;
    attachments: string;
    consent: string;
  };
  reasonOptions: Array<{ value: ContactReason; label: string }>;
  messageHelp: string;
  attachmentsSelected: (count: number) => string;
  send: string;
  sending: string;
  validation: {
    name: string;
    email: string;
    emailInvalid: string;
    message: string;
    messageLength: string;
    consent: string;
    review: string;
    failed: string;
  };
  safeguardingTitle: string;
  safeguardingBody: string;
  sideImageAlt: string;
  sideCaption: string;
  storiesEyebrow: string;
  storiesTitle: string;
  storiesBody: string;
  stories: string[];
  linksEyebrow: string;
  linksTitle: string;
  linksBody: string[];
  relatedLinks: {
    sponsor: string;
    apply: string;
    donate: string;
    impact: string;
    about: string;
  };
}

const contactCopy = {
  en: {
    heroImageAlt: 'A rural home and community setting in Cameroon.',
    primaryCta: 'Send a Message',
    secondaryCta: 'Request Assistance',
    introEyebrow: 'Every conversation matters',
    introTitle: 'Meaningful support often begins with a simple conversation.',
    introBody:
      'Families seeking help, schools supporting students, churches serving their communities, donors looking to make a difference, and volunteers wanting to contribute all start in the same place, by reaching out. No matter your reason for contacting us, we would be happy to hear from you.',
    introImageAlt: 'Children receiving education support from community volunteers.',
    introCaption: 'A warm conversation can become the first step toward practical education support.',
    contactMethodLabels: {
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      responseTime: 'Response time',
    },
    reasonsEyebrow: 'How can we help?',
    reasonsTitle: "We're here to listen.",
    reasonsBody: 'Whether you want to support a child, ask for guidance, or explore a partnership, your message is welcome.',
    reasons: [
      { title: "Support a Child's Education", body: 'Learn more about helping children remain in school through education support and sponsorship.' },
      { title: 'Request Educational Assistance', body: 'Families, guardians, schools, churches, and community leaders can reach out regarding educational needs.' },
      { title: 'School Partnerships', body: 'Schools can connect with us about students, educational support, and collaboration opportunities.' },
      { title: 'Volunteer or Mentor', body: 'Explore opportunities to encourage, support, and walk alongside children and communities.' },
      { title: 'Churches and Community Groups', body: 'Discuss outreach opportunities, partnerships, and ways to support education together.' },
      { title: 'Corporate and Organizational Partnerships', body: 'Learn how your organization can contribute to educational opportunity and community impact.' },
    ],
    formEyebrow: 'Contact form',
    formTitle: 'Send us a message.',
    formBody: 'We welcome your questions, ideas, and inquiries. Please provide enough information for us to understand how we can help or respond appropriately.',
    fields: {
      name: 'Full name',
      email: 'Email address',
      phone: 'Phone number',
      reason: 'Reason for contact',
      subject: 'Subject',
      message: 'Message',
      attachments: 'Supporting file',
      consent: 'I confirm that this message is genuine and that the foundation may respond using the contact details provided.',
    },
    reasonOptions: [
      { value: 'general', label: 'General question' },
      { value: 'sponsorship', label: 'Sponsor a child' },
      { value: 'assistance', label: 'Request assistance' },
      { value: 'school', label: 'School coordination' },
      { value: 'volunteer', label: 'Volunteer or mentor' },
      { value: 'partnership', label: 'Church, company, or partner inquiry' },
    ],
    messageHelp: 'Please share enough context for us to understand how we can help.',
    attachmentsSelected: (count) => `${count} file${count === 1 ? '' : 's'} selected.`,
    send: 'Send message',
    sending: 'Sending...',
    validation: {
      name: 'Please enter your name.',
      email: 'Please enter your email address.',
      emailInvalid: 'Please enter a valid email address.',
      message: 'Please write a message.',
      messageLength: 'Please write at least 10 characters.',
      consent: 'Please confirm that we may respond to your message.',
      review: 'Please review the highlighted fields and try again.',
      failed: 'We could not send your message. Please try again.',
    },
    safeguardingTitle: 'We respond with care',
    safeguardingBody:
      'Every message represents a person, a family, a school, a church, or a community. We take that seriously and aim to respond with care.',
    sideImageAlt: 'Children gathered in a rural community in Cameroon.',
    sideCaption: 'Every meaningful journey begins with a conversation.',
    storiesEyebrow: 'Why people reach out',
    storiesTitle: 'Every inquiry has a story.',
    storiesBody: 'Some people come ready to give. Others come carrying a need, a question, or a hope for a child they know.',
    stories: [
      'Some people contact us because they want to support a child.',
      'Others are looking for educational assistance.',
      'Schools reach out on behalf of students.',
      'Churches seek partnership opportunities.',
      'Volunteers offer their time and encouragement.',
      'Community leaders share local needs.',
    ],
    linksEyebrow: 'A shared commitment',
    linksTitle: 'Working together for educational opportunity.',
    linksBody: [
      'Education is strongest when communities work together.',
      'Families, schools, churches, volunteers, donors, and local leaders each play an important role in helping children continue learning and preparing for the future.',
      'We believe meaningful change happens through relationships, trust, and a shared commitment to children.',
    ],
    relatedLinks: {
      sponsor: 'Learn how sponsorship helps children stay in school.',
      apply: 'Reach out about educational assistance.',
      donate: 'Give toward school needs and education support.',
      impact: 'See how education support is making a difference.',
      about: 'Understand the foundation story, values, and mission.',
    },
  },
  fr: {
    heroImageAlt: 'Une maison rurale et un cadre communautaire au Cameroun.',
    primaryCta: 'Envoyer un message',
    secondaryCta: 'Demander une aide',
    introEyebrow: 'Chaque conversation compte',
    introTitle: 'Un soutien commence souvent par une simple conversation.',
    introBody:
      "Familles en recherche d'aide, écoles qui accompagnent leurs élèves, églises au service de leurs communautés, donateurs qui veulent faire une différence et bénévoles prêts à contribuer commencent tous au même endroit : en nous contactant. Quelle que soit votre raison, nous serons heureux de vous lire.",
    introImageAlt: 'Des enfants reçoivent un soutien éducatif avec des bénévoles communautaires.',
    introCaption: 'Une conversation chaleureuse peut devenir le premier pas vers un soutien scolaire concret.',
    contactMethodLabels: {
      email: 'Email',
      phone: 'Téléphone',
      location: 'Lieu',
      responseTime: 'Délai de réponse',
    },
    reasonsEyebrow: 'Comment pouvons-nous aider ?',
    reasonsTitle: 'Nous sommes là pour écouter.',
    reasonsBody: 'Que vous souhaitiez soutenir un enfant, demander une orientation ou explorer un partenariat, votre message est le bienvenu.',
    reasons: [
      { title: "Soutenir l'éducation d'un enfant", body: "Découvrez comment aider des enfants à rester à l'école par le soutien scolaire et le parrainage." },
      { title: 'Demander une aide scolaire', body: 'Familles, tuteurs, écoles, églises et leaders communautaires peuvent nous parler des besoins scolaires.' },
      { title: 'Partenariats scolaires', body: 'Les écoles peuvent nous contacter concernant les élèves, le soutien scolaire et les collaborations possibles.' },
      { title: 'Bénévolat ou mentorat', body: "Explorez des manières d'encourager, de soutenir et de marcher avec les enfants et les communautés." },
      { title: 'Églises et groupes communautaires', body: "Échangeons sur les actions locales, les partenariats et les façons de soutenir l'éducation ensemble." },
      { title: "Partenariats d'entreprises et d'organisations", body: "Découvrez comment votre organisation peut contribuer à l'opportunité scolaire et à l'impact communautaire." },
    ],
    formEyebrow: 'Formulaire de contact',
    formTitle: 'Envoyez-nous un message.',
    formBody: 'Nous accueillons vos questions, idées et demandes. Merci de partager assez d’informations pour que nous comprenions comment aider ou répondre correctement.',
    fields: {
      name: 'Nom complet',
      email: 'Adresse email',
      phone: 'Téléphone',
      reason: 'Raison du contact',
      subject: 'Sujet',
      message: 'Message',
      attachments: 'Fichier de soutien',
      consent: 'Je confirme que ce message est sincère et que la fondation peut me répondre avec les coordonnées fournies.',
    },
    reasonOptions: [
      { value: 'general', label: 'Question générale' },
      { value: 'sponsorship', label: 'Parrainer un enfant' },
      { value: 'assistance', label: 'Demander une aide' },
      { value: 'school', label: 'Coordination avec une école' },
      { value: 'volunteer', label: 'Bénévolat ou mentorat' },
      { value: 'partnership', label: 'Église, entreprise ou partenaire' },
    ],
    messageHelp: 'Partagez assez de contexte pour que nous comprenions comment vous aider.',
    attachmentsSelected: (count) => `${count} fichier${count === 1 ? '' : 's'} sélectionné${count === 1 ? '' : 's'}.`,
    send: 'Envoyer le message',
    sending: 'Envoi...',
    validation: {
      name: 'Veuillez entrer votre nom.',
      email: 'Veuillez entrer votre adresse email.',
      emailInvalid: 'Veuillez entrer une adresse email valide.',
      message: 'Veuillez écrire un message.',
      messageLength: 'Veuillez écrire au moins 10 caractères.',
      consent: 'Veuillez confirmer que nous pouvons répondre à votre message.',
      review: 'Veuillez vérifier les champs indiqués et réessayer.',
      failed: "Votre message n'a pas pu être envoyé. Veuillez réessayer.",
    },
    safeguardingTitle: 'Nous répondons avec soin',
    safeguardingBody:
      'Chaque message représente une personne, une famille, une école, une église ou une communauté. Nous le prenons au sérieux et cherchons à répondre avec attention.',
    sideImageAlt: 'Des enfants réunis dans une communauté rurale au Cameroun.',
    sideCaption: 'Chaque parcours significatif commence par une conversation.',
    storiesEyebrow: 'Pourquoi les personnes nous contactent',
    storiesTitle: 'Chaque demande a une histoire.',
    storiesBody: "Certaines personnes viennent prêtes à donner. D'autres portent un besoin, une question ou une espérance pour un enfant qu'elles connaissent.",
    stories: [
      'Certaines personnes nous contactent parce qu’elles veulent soutenir un enfant.',
      'D’autres cherchent une aide scolaire.',
      'Des écoles nous écrivent au nom de leurs élèves.',
      'Des églises cherchent des possibilités de partenariat.',
      'Des bénévoles offrent leur temps et leurs encouragements.',
      'Des leaders communautaires partagent des besoins locaux.',
    ],
    linksEyebrow: 'Un engagement partagé',
    linksTitle: "Travailler ensemble pour l'opportunité scolaire.",
    linksBody: [
      "L'éducation est plus forte lorsque les communautés travaillent ensemble.",
      "Familles, écoles, églises, bénévoles, donateurs et leaders locaux jouent chacun un rôle important pour aider les enfants à continuer d'apprendre et à préparer l'avenir.",
      'Nous croyons que le changement significatif naît des relations, de la confiance et d’un engagement partagé envers les enfants.',
    ],
    relatedLinks: {
      sponsor: "Comprendre comment le parrainage aide les enfants à rester à l'école.",
      apply: 'Commencer avec les informations pour une aide scolaire.',
      donate: 'Donner pour les besoins scolaires et le soutien éducatif.',
      impact: 'Voir comment le soutien scolaire change des vies.',
      about: "Comprendre l'histoire, les valeurs et la mission de la fondation.",
    },
  },
} satisfies Record<Locale, ContactCopy>;
