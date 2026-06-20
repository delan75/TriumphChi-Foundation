import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Home,
  School,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { Locale } from '../../../lib/i18n';
import heroImage from '../../../assets/landing/school_kids_in_cameroon.jpg';
import classroomImage from '../../../assets/landing/classroom-support.png';
import studyImage from '../../../assets/landing/kids_studying_tree.webp';
import ruralImage from '../../../assets/landing/rural_kids.jpg';
import covenantImage from '../../../assets/public/about/covenant-growth.jpg';

interface SponsorPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

const matterIcons = [School, BookOpen, GraduationCap, HeartHandshake];
const stepIcons = [UsersRound, ShieldCheck, HandHeart, CheckCircle2];
const optionIcons = [GraduationCap, UsersRound, BookOpen, HandHeart];
const accountabilityIcons = [FileText, GraduationCap, School, BookOpen, CheckCircle2];
const impactIcons = [School, BookOpen, GraduationCap, UsersRound, HeartHandshake, Home, CheckCircle2, HandHeart];

export function SponsorPage({ locale, page }: SponsorPageProps) {
  const copy = sponsorCopy[locale];
  const homePage = getPageByKey('home');
  const donatePage = getPageByKey('donate');
  const contactPage = getPageByKey('contact');

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
            <CtaLink to={`/${locale}${donatePage.path[locale]}`}>{copy.primaryCta}</CtaLink>
            <a
              href="#how-sponsorship-works"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.18]"
            >
              {copy.secondaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </>
        }
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-16">
          <ImageStory image={classroomImage} alt={copy.introImageAlt} caption={copy.introCaption} />
          <div className="self-center">
            <SectionIntro eyebrow={copy.introEyebrow} title={copy.introTitle} body={copy.introBody} />
            <p className="mt-5 text-lg font-black leading-7 text-foundation-900">{copy.introClosing}</p>
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.mattersEyebrow} title={copy.mattersTitle} body={copy.mattersBody} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.matters.map((item, index) => {
              const Icon = matterIcons[index];

              return <InfoCard key={item.title} icon={Icon} title={item.title} body={item.body} />;
            })}
          </div>
        </div>
      </section>

      <section id="how-sponsorship-works" className="scroll-mt-24 bg-ink-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-foundation-100">{copy.processEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{copy.processTitle}</h2>
            <p className="mt-3 text-base leading-7 text-ink-100">{copy.processBody}</p>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {copy.process.map((step, index) => {
              const Icon = stepIcons[index];

              return (
                <article key={step.title} className="rounded-md border border-white/10 bg-white/5 p-5 transition duration-200 hover:-translate-y-1 hover:bg-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-white text-foundation-900">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-black uppercase text-foundation-100">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-black">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-100">{step.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:py-16">
          <div className="self-center">
            <SectionIntro eyebrow={copy.flexibleEyebrow} title={copy.flexibleTitle} body={copy.flexibleBody} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.options.map((item, index) => {
              const Icon = optionIcons[index];

              return <InfoCard key={item.title} icon={Icon} title={item.title} body={item.body} />;
            })}
          </div>
        </div>
      </section>

      <section className="bg-foundation-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div className="self-center">
            <p className="text-sm font-black uppercase text-foundation-100">{copy.communityEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{copy.communityTitle}</h2>
            <div className="mt-5 grid gap-4 text-base leading-7 text-foundation-50">
              {copy.communityBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <ImageStory image={ruralImage} alt={copy.communityImageAlt} caption={copy.communityCaption} dark />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-16">
          <ImageStory image={studyImage} alt={copy.accountabilityImageAlt} caption={copy.accountabilityCaption} />
          <div className="self-center">
            <SectionIntro eyebrow={copy.accountabilityEyebrow} title={copy.accountabilityTitle} body={copy.accountabilityBody} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {copy.accountability.map((item, index) => {
                const Icon = accountabilityIcons[index];

                return (
                  <div key={item} className="flex min-h-12 items-center gap-3 rounded-md border border-ink-100 bg-ink-50 px-4 py-3 text-sm font-bold text-ink-700">
                    <Icon className="h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                    {item}
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-sm leading-6 text-ink-500">{copy.privacyNote}</p>
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.impactEyebrow} title={copy.impactTitle} body={copy.impactBody} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {copy.impact.map((item, index) => {
              const Icon = impactIcons[index];

              return (
                <div key={item} className="flex min-h-14 items-center gap-3 rounded-md border border-foundation-100 bg-white px-4 py-3 text-sm font-black text-ink-800 shadow-sm">
                  <Icon className="h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-ink-900 text-white">
        <img src={covenantImage} alt={copy.covenantImageAlt} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-70 saturate-[0.7]" loading="lazy" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,55,47,0.99),rgba(18,55,47,0.92)_50%,rgba(18,55,47,0.74))]" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_18%,rgba(215,243,234,0.18),transparent_26%),linear-gradient(0deg,rgba(18,55,47,0.74),transparent_42%)]" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-foundation-100">{copy.covenantEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{copy.covenantTitle}</h2>
            <p className="mt-5 text-base leading-7 text-foundation-50">{copy.covenantBody}</p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase text-foundation-600">{copy.finalEyebrow}</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black text-ink-900 sm:text-4xl">{copy.finalTitle}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-600">{copy.finalBody}</p>
            <p className="mt-3 text-sm font-bold text-ink-500">{copy.finalSupport}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CtaLink to={`/${locale}${donatePage.path[locale]}`}>{copy.primaryCta}</CtaLink>
            <CtaLink to={`/${locale}${contactPage.path[locale]}`} variant="secondary">
              {copy.contactCta}
            </CtaLink>
          </div>
        </div>
      </section>
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

function InfoCard({ icon: Icon, title, body }: { icon: typeof School; title: string; body: string }) {
  return (
    <article className="rounded-md border border-ink-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-black text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-500">{body}</p>
    </article>
  );
}

function ImageStory({ image, alt, caption, dark = false }: { image: string; alt: string; caption: string; dark?: boolean }) {
  return (
    <figure className={cn('overflow-hidden rounded-md border shadow-sm', dark ? 'border-white/10 bg-white/5' : 'border-ink-100 bg-white')}>
      <div className="relative isolate overflow-hidden">
        <img src={image} alt={alt} className="aspect-[4/3] w-full object-cover opacity-80 saturate-[0.74]" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,55,47,0.76),rgba(18,55,47,0.42)_48%,rgba(18,55,47,0.78))] mix-blend-multiply" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_18%,rgba(255,255,255,0.14),transparent_32%),linear-gradient(90deg,rgba(18,55,47,0.22),rgba(18,55,47,0.56))]" aria-hidden="true" />
      </div>
      <figcaption className={cn('px-4 py-3 text-sm leading-6', dark ? 'text-foundation-50' : 'text-ink-500')}>{caption}</figcaption>
    </figure>
  );
}

function CtaLink({ to, children, variant = 'primary' }: { to: string; children: string; variant?: 'primary' | 'secondary' }) {
  return (
    <Link
      to={to}
      className={cn(
        'focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-black transition duration-200 hover:-translate-y-0.5',
        variant === 'primary'
          ? 'bg-foundation-600 text-white shadow-sm hover:bg-foundation-900'
          : 'border border-foundation-200 bg-white text-foundation-900 hover:bg-foundation-100',
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

interface SponsorCopy {
  heroImageAlt: string;
  primaryCta: string;
  secondaryCta: string;
  contactCta: string;
  introEyebrow: string;
  introTitle: string;
  introBody: string;
  introClosing: string;
  introImageAlt: string;
  introCaption: string;
  mattersEyebrow: string;
  mattersTitle: string;
  mattersBody: string;
  matters: Array<{ title: string; body: string }>;
  processEyebrow: string;
  processTitle: string;
  processBody: string;
  process: Array<{ title: string; body: string }>;
  flexibleEyebrow: string;
  flexibleTitle: string;
  flexibleBody: string;
  options: Array<{ title: string; body: string }>;
  communityEyebrow: string;
  communityTitle: string;
  communityBody: string[];
  communityImageAlt: string;
  communityCaption: string;
  accountabilityEyebrow: string;
  accountabilityTitle: string;
  accountabilityBody: string;
  accountability: readonly string[];
  accountabilityImageAlt: string;
  accountabilityCaption: string;
  privacyNote: string;
  impactEyebrow: string;
  impactTitle: string;
  impactBody: string;
  impact: readonly string[];
  covenantEyebrow: string;
  covenantTitle: string;
  covenantBody: string;
  covenantImageAlt: string;
  finalEyebrow: string;
  finalTitle: string;
  finalBody: string;
  finalSupport: string;
}

const sponsorCopy = {
  en: {
    heroImageAlt: 'Children gathered for school activities in Cameroon.',
    primaryCta: 'Sponsor a Child',
    secondaryCta: 'How Sponsorship Works',
    contactCta: 'Contact Us',
    introEyebrow: 'Education should not end because of circumstances',
    introTitle: 'Sponsorship helps bridge the gap between a child and the classroom.',
    introBody:
      'Across rural communities in Cameroon, many children are only one school fee, one examination registration, one uniform, or one set of learning materials away from leaving school. Through the support of individuals, families, churches, businesses, and communities, children can remain in school and continue building a future through education.',
    introClosing: "Sponsorship is not simply financial assistance. It is a commitment to walk alongside a child's educational journey.",
    introImageAlt: 'Children learning together in a classroom.',
    introCaption: 'A child can keep learning when practical support, community care, and encouragement arrive together.',
    mattersEyebrow: 'Why sponsorship matters',
    mattersTitle: 'Small barriers can have lasting consequences.',
    mattersBody: 'A fee, a notebook, a uniform, or an exam registration can become the difference between continuing school and quietly dropping out.',
    matters: [
      { title: 'School Fees', body: 'Helping children stay enrolled and participate fully in school.' },
      { title: 'Learning Materials', body: 'Providing books, notebooks, pens, school bags, and essential supplies.' },
      { title: 'Examination Costs', body: 'Supporting registration fees and academic progression.' },
      { title: 'Mentorship and Encouragement', body: 'Connecting educational support with community care and encouragement.' },
    ],
    processEyebrow: 'How sponsorship works',
    processTitle: 'A simple and responsible process.',
    processBody: 'Every request should be handled carefully, respectfully, and through trusted local relationships.',
    process: [
      { title: 'Child Identified', body: 'A child is identified through an application, school recommendation, guardian request, church referral, or community leader.' },
      { title: 'Review and Verification', body: 'The foundation reviews educational needs and verifies information through trusted local relationships.' },
      { title: 'Support Allocation', body: 'Educational needs are assessed and funding is allocated appropriately.' },
      { title: 'Progress Follow-Up', body: 'Schools, families, and community partners help provide updates and monitor progress.' },
    ],
    flexibleEyebrow: 'Flexible sponsorship',
    flexibleTitle: 'Different ways to help.',
    flexibleBody: 'Not every child requires the same level of support, and not every sponsor has the same capacity to give. The sponsorship model allows multiple pathways for participation.',
    options: [
      { title: 'Full Sponsorship', body: "Support a child's educational needs for an academic period." },
      { title: 'Shared Sponsorship', body: "Join other sponsors in helping meet a child's educational needs." },
      { title: 'Educational Needs Sponsorship', body: 'Support specific needs such as fees, books, uniforms, examinations, or learning materials.' },
      { title: 'General Education Fund', body: 'Contribute to a shared fund that helps ensure no child is left behind when specific sponsorships are unavailable.' },
    ],
    communityEyebrow: 'A community approach',
    communityTitle: 'No child is left waiting because support is shared with care.',
    communityBody: [
      'TriumphChi Foundation does not operate on a winner-takes-all sponsorship model.',
      'If one child receives support while another remains without assistance, resources can be responsibly allocated to help ensure educational needs are addressed fairly across beneficiaries.',
      'Sponsorship supports children. The mission serves the community.',
      'This approach helps ensure that educational opportunities are not determined solely by visibility or popularity.',
    ],
    communityImageAlt: 'Children gathered in a rural community in Cameroon.',
    communityCaption: 'Sponsorship should strengthen the community around a child, not create ownership over a child.',
    accountabilityEyebrow: 'Updates and accountability',
    accountabilityTitle: 'Stay connected to the impact.',
    accountabilityBody: 'Sponsors may receive updates that show educational progress while protecting the privacy and wellbeing of every child.',
    accountability: ['Progress updates', 'Educational milestones', 'School participation updates', 'Aggregate impact reports', 'Stories of growth and learning'],
    accountabilityImageAlt: 'Children studying outdoors under a tree.',
    accountabilityCaption: 'The focus remains on education, progress, encouragement, and dignity.',
    privacyNote: 'Public information is carefully curated. Sensitive personal information is never shared publicly.',
    impactEyebrow: 'Sponsorship impact',
    impactTitle: 'What your support can help make possible.',
    impactBody: 'Support can touch many parts of a child’s education and strengthen the community structures around that child.',
    impact: [
      'School fees paid',
      'Uniforms provided',
      'Learning materials supplied',
      'Examinations completed',
      'Attendance improved',
      'Students continuing their education',
      'Mentorship opportunities created',
      'Communities strengthened',
    ],
    covenantEyebrow: 'Covenant giving',
    covenantTitle: 'Giving from a covenant, not from leftovers.',
    covenantBody:
      'Sponsorship is more than a financial transaction. It is a practical expression of commitment, compassion, and responsibility toward children whose education is at risk. Every contribution joins a wider effort to help children continue learning, growing, and preparing for the future.',
    covenantImageAlt: 'A hand watering young green shoots.',
    finalEyebrow: 'Walk alongside a child',
    finalTitle: "Walk alongside a child's educational journey.",
    finalBody: 'Education changes lives, strengthens communities, and creates opportunities that extend far beyond the classroom. Your sponsorship can help keep a child learning and moving forward with dignity.',
    finalSupport: "Questions about sponsorship? We'd be happy to explain the process and discuss the best way to get involved.",
  },
  fr: {
    heroImageAlt: 'Des enfants réunis pour des activités scolaires au Cameroun.',
    primaryCta: 'Parrainer un enfant',
    secondaryCta: 'Comment fonctionne le parrainage',
    contactCta: 'Nous contacter',
    introEyebrow: "L'éducation ne devrait pas s'arrêter à cause des circonstances",
    introTitle: "Le parrainage aide à combler l'écart entre un enfant et la salle de classe.",
    introBody:
      "Dans les communautés rurales du Cameroun, beaucoup d'enfants ne sont qu'à un frais scolaire, une inscription à l'examen, un uniforme ou un ensemble de fournitures de quitter l'école. Grâce au soutien des individus, familles, églises, entreprises et communautés, les enfants peuvent rester à l'école et continuer à construire un avenir par l'éducation.",
    introClosing: "Le parrainage n'est pas seulement une aide financière. C'est un engagement à accompagner le parcours scolaire d'un enfant.",
    introImageAlt: 'Des enfants apprennent ensemble dans une classe.',
    introCaption: "Un enfant peut continuer à apprendre lorsque le soutien pratique, le soin communautaire et l'encouragement arrivent ensemble.",
    mattersEyebrow: 'Pourquoi le parrainage compte',
    mattersTitle: 'De petits obstacles peuvent avoir de grandes conséquences.',
    mattersBody: "Un frais, un cahier, un uniforme ou une inscription à l'examen peut faire la différence entre continuer l'école et abandonner en silence.",
    matters: [
      { title: 'Frais scolaires', body: "Aider les enfants à rester inscrits et à participer pleinement à l'école." },
      { title: "Matériel d'apprentissage", body: 'Fournir livres, cahiers, stylos, sacs scolaires et fournitures essentielles.' },
      { title: "Frais d'examen", body: "Soutenir les inscriptions et la progression scolaire." },
      { title: 'Mentorat et encouragement', body: "Relier le soutien scolaire au soin communautaire et à l'encouragement." },
    ],
    processEyebrow: 'Comment fonctionne le parrainage',
    processTitle: 'Un processus simple et responsable.',
    processBody: 'Chaque demande doit être traitée avec soin, respect et à travers des relations locales de confiance.',
    process: [
      { title: 'Enfant identifié', body: "Un enfant est identifié par une demande, une recommandation d'école, un tuteur, une église ou un leader communautaire." },
      { title: 'Étude et vérification', body: 'La fondation examine les besoins scolaires et vérifie les informations avec des relations locales de confiance.' },
      { title: 'Soutien alloué', body: 'Les besoins scolaires sont évalués et les fonds sont alloués de manière appropriée.' },
      { title: 'Suivi des progrès', body: 'Les écoles, familles et partenaires communautaires aident à donner des nouvelles et suivre les progrès.' },
    ],
    flexibleEyebrow: 'Parrainage flexible',
    flexibleTitle: "Différentes manières d'aider.",
    flexibleBody: "Tous les enfants n'ont pas besoin du même niveau de soutien, et tous les parrains n'ont pas la même capacité de donner. Le modèle permet plusieurs façons de participer.",
    options: [
      { title: 'Parrainage complet', body: "Soutenir les besoins scolaires d'un enfant pendant une période académique." },
      { title: 'Parrainage partagé', body: "Rejoindre d'autres parrains pour répondre aux besoins scolaires d'un enfant." },
      { title: 'Parrainage des besoins scolaires', body: 'Soutenir des besoins précis comme les frais, livres, uniformes, examens ou fournitures.' },
      { title: "Fonds général d'éducation", body: "Contribuer à un fonds partagé qui aide à ne laisser aucun enfant sans soutien quand un parrainage spécifique n'est pas disponible." },
    ],
    communityEyebrow: 'Une approche communautaire',
    communityTitle: "Aucun enfant ne reste en attente lorsque le soutien est partagé avec soin.",
    communityBody: [
      "La Fondation TriumphChi ne fonctionne pas avec un modèle où un enfant gagne et l'autre reste sans aide.",
      "Si un enfant reçoit du soutien pendant qu'un autre reste sans assistance, les ressources peuvent être allouées avec responsabilité pour répondre équitablement aux besoins scolaires.",
      'Le parrainage soutient les enfants. La mission sert la communauté.',
      "Cette approche aide à faire en sorte que les opportunités scolaires ne dépendent pas seulement de la visibilité ou de la popularité.",
    ],
    communityImageAlt: 'Des enfants réunis dans une communauté rurale au Cameroun.',
    communityCaption: "Le parrainage doit renforcer la communauté autour d'un enfant, non créer une forme de possession sur l'enfant.",
    accountabilityEyebrow: 'Nouvelles et responsabilité',
    accountabilityTitle: "Rester connecté à l'impact.",
    accountabilityBody: "Les parrains peuvent recevoir des nouvelles qui montrent les progrès scolaires tout en protégeant la vie privée et le bien-être de chaque enfant.",
    accountability: ['Nouvelles de progrès', 'Étapes scolaires', "Participation à l'école", "Rapports d'impact agrégés", "Histoires de croissance et d'apprentissage"],
    accountabilityImageAlt: 'Des enfants étudient dehors sous un arbre.',
    accountabilityCaption: "Le centre reste l'éducation, les progrès, l'encouragement et la dignité.",
    privacyNote: 'Les informations publiques sont soigneusement préparées. Les informations personnelles sensibles ne sont jamais partagées publiquement.',
    impactEyebrow: 'Impact du parrainage',
    impactTitle: 'Ce que votre soutien peut rendre possible.',
    impactBody: "Le soutien peut toucher plusieurs aspects de l'éducation d'un enfant et fortifier les structures communautaires autour de lui.",
    impact: [
      'Frais scolaires payés',
      'Uniformes fournis',
      'Fournitures données',
      'Examens complétés',
      'Présence améliorée',
      "Élèves qui continuent l'école",
      'Mentorat rendu possible',
      'Communautés fortifiées',
    ],
    covenantEyebrow: "Don d'alliance",
    covenantTitle: 'Donner par alliance, pas avec les restes.',
    covenantBody:
      "Le parrainage est plus qu'une transaction financière. C'est une expression pratique d'engagement, de compassion et de responsabilité envers les enfants dont l'éducation est menacée. Chaque contribution rejoint un effort plus large pour aider les enfants à continuer d'apprendre, de grandir et de préparer l'avenir.",
    covenantImageAlt: 'Une main arrose de jeunes pousses vertes.',
    finalEyebrow: 'Marcher avec un enfant',
    finalTitle: "Marcher avec le parcours scolaire d'un enfant.",
    finalBody: "L'éducation change des vies, fortifie les communautés et crée des opportunités qui vont bien au-delà de la salle de classe. Votre parrainage peut aider un enfant à continuer d'apprendre et d'avancer avec dignité.",
    finalSupport: 'Des questions sur le parrainage ? Nous serons heureux d’expliquer le processus et la meilleure manière de participer.',
  },
} satisfies Record<Locale, SponsorCopy>;
