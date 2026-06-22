import { HeartHandshake, School, UsersRound } from 'lucide-react';
import { Locale } from '../../../lib/i18n';
import { ApplyingFor, ContactMethod, ContactRole, NeedType, SchoolEnrollmentStatus } from './applyTypes';

export interface ApplyCopy {
  heroImageAlt: string;
  startCta: string;
  trackCta: string;
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
  backLabel: string;
  continueLabel: string;
  submitLabel: string;
  sendingLabel: string;
  previewPdfLabel: string;
  referenceLabel: string;
  optionalValue: string;
  optionalHint: string;
  schoolHint: string;
  gradeLevelPlaceholder: string;
  schoolPlaceholder: string;
  needSummaryHint: string;
  situationSummaryHint: string;
  childApplicantNote: string;
  lastSchoolHint: string;
  interruptionHint: string;
  feeAmountHint: string;
  examFeeHint: string;
  reviewEyebrow: string;
  reviewBody: string;
  consentLabel: string;
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
  stepLabels: {
    applyingFor: string;
    child: string;
    education: string;
    need: string;
    household: string;
    contact: string;
    review: string;
  };
  reviewSections: {
    child: string;
    education: string;
    need: string;
    household: string;
    contact: string;
  };
  fields: {
    applyingFor: string;
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
    householdIncome: string;
    householdSize: string;
    primaryCaregiverOccupation: string;
    householdChallenges: string;
    contactRole: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    contactMethod: string;
  };
  applyingForOptions: Array<{ value: ApplyingFor; label: string }>;
  genders: Array<{ value: string; label: string }>;
  schoolEnrollmentStatuses: Array<{ value: SchoolEnrollmentStatus; label: string }>;
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
    previewFailed: string;
  };
}

export const applyCopy: Record<Locale, ApplyCopy> = {
  en: {
    heroImageAlt: 'Children learning together in a rural school in Cameroon.',
    startCta: 'Start application',
    trackCta: 'Track application',
    aboutCta: 'About the foundation',
    introEyebrow: 'Application intake',
    introTitle: 'Tell us about the child and the support they need.',
    introBody:
      'Use this form to share the child, the school situation, the need, and the responsible person we should contact. The form saves as you go.',
    highlights: [
      { icon: School, title: 'Identify the child', body: 'Share enough detail for us to understand the school context.' },
      { icon: HeartHandshake, title: 'Explain the need', body: 'Tell us what is standing in the way of learning.' },
      { icon: UsersRound, title: 'Reach the right adult', body: 'Name the person who can help us continue the conversation.' },
    ],
    formEyebrow: 'Application form',
    formTitle: 'Save your progress as you go.',
    progressLabel: 'Progress',
    saveDraftLabel: 'Draft saved',
    lastSavedLabel: 'Last saved',
    clearDraftLabel: 'Clear draft',
    backLabel: 'Back',
    continueLabel: 'Continue',
    submitLabel: 'Submit application',
    sendingLabel: 'Sending...',
    previewPdfLabel: 'Preview PDF',
    referenceLabel: 'Application reference',
    optionalValue: 'Not provided',
    optionalHint: 'Optional',
    schoolHint: 'Start typing to see school suggestions when available.',
    gradeLevelPlaceholder: 'Example: Primary 5',
    schoolPlaceholder: 'School name or learning centre',
    needSummaryHint: 'A short description of what is needed and why it matters.',
    situationSummaryHint: 'Describe the situation clearly so we can understand the context.',
    childApplicantNote: 'Because a child is applying, please make sure an adult contact is listed for follow-up.',
    lastSchoolHint: 'Share the most recent school attended if you know it.',
    interruptionHint: 'Help us understand why schooling stopped or has been delayed.',
    feeAmountHint: 'If you know the amount, include it here.',
    examFeeHint: 'If you know the exam fee amount, include it here.',
    reviewEyebrow: 'Review before sending',
    reviewBody: 'Please check the details below. Once sent, we will review the request and contact the person listed.',
    consentLabel:
      'I confirm that the details above are accurate and that TriumphChi Foundation may contact the person listed to follow up on this application.',
    nextStepsEyebrow: 'What happens next',
    nextStepsTitle: 'A simple process from request to follow-up.',
    nextStepsBody: 'After submission, the request is reviewed and the responsible contact is reached carefully.',
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
    stepLabels: {
      applyingFor: 'Who is applying?',
      child: 'Child details',
      education: 'Education',
      need: 'Education need',
      household: 'Household',
      contact: 'Contact person',
      review: 'Review and send',
    },
    reviewSections: {
      child: 'Child details',
      education: 'Education',
      need: 'Education need',
      household: 'Household situation',
      contact: 'Contact person',
    },
    fields: {
      applyingFor: 'Who are you applying for?',
      childName: 'Child full name',
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
      householdIncome: 'Estimated monthly income',
      householdSize: 'Household size',
      primaryCaregiverOccupation: 'Primary caregiver occupation',
      householdChallenges: 'Household challenges',
      contactRole: 'Who are you in relation to the child?',
      contactName: 'Responsible adult or contact person',
      contactPhone: 'Phone number',
      contactEmail: 'Email address',
      contactMethod: 'Preferred contact method',
    },
    applyingForOptions: [
      { value: 'child', label: 'A child' },
      { value: 'self', label: 'Myself' },
      { value: 'other', label: 'Someone else' },
    ],
    genders: [
      { value: '', label: 'Select gender' },
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Other' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' },
    ],
    schoolEnrollmentStatuses: [
      { value: 'enrolled', label: 'Currently enrolled' },
      { value: 'not_enrolled', label: 'Not currently enrolled' },
      { value: 'unsure', label: 'Not sure' },
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
      { value: 'school', label: 'School' },
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
      childName: "Please enter the child's name.",
      needSummary: 'Please tell us what support is needed.',
      situationSummary: 'Please tell us what is happening.',
      schoolEnrollmentStatus: 'Please tell us whether the child is currently enrolled.',
      schoolNameCurrent: 'Please enter the school name.',
      lastSchoolAttended: 'Please tell us the last school attended.',
      educationInterruptionReason: 'Please tell us what interrupted schooling.',
      teacherSchoolName: "Please enter the teacher's school name.",
      teacherPosition: "Please enter the teacher's position.",
      institutionName: 'Please enter the institution name.',
      institutionRole: 'Please enter your role at the institution.',
      feeAmount: 'Please share the fee amount.',
      examName: 'Please share the exam name.',
      examFeeAmount: 'Please share the exam fee amount.',
      contactName: "Please enter the contact person's name.",
      contactPhone: 'Please enter a phone number.',
      consent: 'Please confirm that the details are correct and that we may follow up.',
      review: 'Please review the highlighted fields and continue.',
      failed: 'We could not send the application. Please try again.',
      previewFailed: 'We could not generate the preview. Please try again.',
    },
  },
  fr: {
    heroImageAlt: 'Des enfants apprennent ensemble dans une ecole rurale au Cameroun.',
    startCta: 'Commencer la demande',
    trackCta: 'Suivre la demande',
    aboutCta: 'A propos de la fondation',
    introEyebrow: 'Depot de demande',
    introTitle: "Parlez-nous de l'enfant et du soutien necessaire.",
    introBody:
      "Utilisez ce formulaire pour partager les informations de l'enfant, le besoin scolaire et la personne responsable a contacter. Le formulaire enregistre votre progression.",
    highlights: [
      { icon: School, title: "Identifier l'enfant", body: 'Partagez assez de details pour comprendre le contexte scolaire.' },
      { icon: HeartHandshake, title: 'Expliquer le besoin', body: "Dites-nous ce qui empeche l'enfant de poursuivre sa scolarite." },
      { icon: UsersRound, title: 'Joindre la bonne personne', body: 'Indiquez la personne qui peut aider a continuer la conversation.' },
    ],
    formEyebrow: 'Formulaire de demande',
    formTitle: 'Enregistrez votre progression au fur et a mesure.',
    progressLabel: 'Progression',
    saveDraftLabel: 'Brouillon enregistre',
    lastSavedLabel: 'Derniere sauvegarde',
    clearDraftLabel: 'Effacer le brouillon',
    backLabel: 'Retour',
    continueLabel: 'Continuer',
    submitLabel: 'Envoyer la demande',
    sendingLabel: 'Envoi...',
    previewPdfLabel: 'Apercu PDF',
    referenceLabel: 'Reference',
    optionalValue: 'Non renseigne',
    optionalHint: 'Facultatif',
    schoolHint: "Commencez a saisir le nom de l'ecole pour voir les suggestions disponibles.",
    gradeLevelPlaceholder: 'Exemple : CM2',
    schoolPlaceholder: "Nom de l'ecole ou du centre",
    needSummaryHint: 'Une courte description du besoin et de son importance.',
    situationSummaryHint: 'Decrivez clairement la situation pour que nous comprenions le contexte.',
    childApplicantNote: "Parce qu'un enfant est concerne, veuillez indiquer un adulte pour le suivi.",
    lastSchoolHint: "Indiquez la derniere ecole frequentee si vous la connaissez.",
    interruptionHint: 'Aidez-nous a comprendre pourquoi la scolarite a ete interrompue ou retardee.',
    feeAmountHint: 'Si vous connaissez le montant, indiquez-le ici.',
    examFeeHint: "Si vous connaissez les frais d'examen, indiquez-les ici.",
    reviewEyebrow: "Verification avant l'envoi",
    reviewBody: "Merci de relire les informations ci-dessous. Une fois envoyee, la demande sera examinee et la personne indiquee sera contactee.",
    consentLabel:
      'Je confirme que les informations ci-dessus sont exactes et que la Fondation TriumphChi peut contacter la personne indiquee pour donner suite a cette demande.',
    nextStepsEyebrow: 'Ce qui se passe ensuite',
    nextStepsTitle: 'Un processus simple de la demande au suivi.',
    nextStepsBody: 'Apres envoi, la demande est examinee et le contact responsable est joint avec soin.',
    nextSteps: [
      { caption: '01', title: 'Recevoir', body: 'Nous recevons la demande et creons une reference de suivi.' },
      { caption: '02', title: 'Examiner', body: 'Les details sont verifies pour avancer avec clarte et respect.' },
      { caption: '03', title: 'Recontacter', body: 'Nous contactons la personne indiquee et poursuivons la conversation.' },
    ],
    helpEyebrow: "Besoin d'aide ?",
    helpTitle: "Vous pouvez nous joindre avant ou apres l'envoi du formulaire.",
    helpBody: "Si vous avez besoin d'aide pour remplir le formulaire ou parler a quelqu'un, utilisez les coordonnees ci-dessous.",
    contactCards: {
      email: 'Email',
      phone: 'Telephone',
      location: 'Lieu',
      responseTime: 'Delai de reponse',
    },
    stepLabels: {
      applyingFor: 'Qui fait la demande ?',
      child: "Informations sur l'enfant",
      education: 'Education',
      need: 'Besoin educatif',
      household: 'Foyer',
      contact: 'Personne a contacter',
      review: 'Verifier et envoyer',
    },
    reviewSections: {
      child: "Informations sur l'enfant",
      education: 'Education',
      need: 'Besoin educatif',
      household: 'Situation du foyer',
      contact: 'Personne a contacter',
    },
    fields: {
      applyingFor: 'Pour qui faites-vous la demande ?',
      childName: "Nom complet de l'enfant",
      gender: 'Sexe',
      dateOfBirth: 'Date de naissance',
      schoolName: "Nom de l'ecole",
      gradeLevel: 'Classe ou niveau',
      regionName: 'Region',
      villageName: 'Village ou communaute',
      schoolEnrollmentStatus: "L'enfant est-il actuellement inscrit ?",
      lastSchoolAttended: 'Derniere ecole frequentee',
      educationInterruptionReason: "Qu'est-ce qui a interrompu la scolarite ?",
      teacherSchoolName: "Nom de l'ecole de l'enseignant",
      teacherPosition: "Poste de l'enseignant",
      institutionName: "Nom de l'institution",
      institutionRole: "Votre role dans l'institution",
      feeAmount: 'Montant des frais',
      feeDueDate: "Date d'echeance des frais",
      examName: "Nom de l'examen",
      examDate: "Date de l'examen",
      examFeeAmount: "Montant des frais d'examen",
      needType: 'Quel soutien est necessaire ?',
      needSummary: 'Quel soutien est necessaire ?',
      situationSummary: 'Que se passe-t-il ?',
      householdIncome: 'Revenu mensuel estime',
      householdSize: 'Nombre de personnes dans le foyer',
      primaryCaregiverOccupation: 'Profession du responsable',
      householdChallenges: 'Difficultes du foyer',
      contactRole: "Quel est votre lien avec l'enfant ?",
      contactName: 'Adulte responsable ou personne a contacter',
      contactPhone: 'Numero de telephone',
      contactEmail: 'Adresse email',
      contactMethod: 'Moyen de contact prefere',
    },
    applyingForOptions: [
      { value: 'child', label: 'Un enfant' },
      { value: 'self', label: 'Moi-meme' },
      { value: 'other', label: "Quelqu'un d'autre" },
    ],
    genders: [
      { value: '', label: 'Choisir le sexe' },
      { value: 'female', label: 'Fille' },
      { value: 'male', label: 'Garcon' },
      { value: 'other', label: 'Autre' },
      { value: 'prefer-not-to-say', label: 'Prefere ne pas dire' },
    ],
    schoolEnrollmentStatuses: [
      { value: 'enrolled', label: 'Actuellement inscrit' },
      { value: 'not_enrolled', label: 'Pas actuellement inscrit' },
      { value: 'unsure', label: 'Pas sur' },
    ],
    needTypes: [
      { value: 'fees', label: 'Frais scolaires' },
      { value: 'books', label: 'Livres et materiel' },
      { value: 'uniform', label: 'Uniforme' },
      { value: 'exam', label: "Frais d'examen" },
      { value: 'transport', label: "Transport vers l'ecole" },
      { value: 'meals', label: 'Repas ou soutien de base' },
      { value: 'other', label: 'Autre' },
    ],
    contactRoles: [
      { value: 'guardian', label: 'Tuteur' },
      { value: 'parent', label: 'Parent' },
      { value: 'teacher', label: 'Enseignant' },
      { value: 'school_representative', label: "Representant de l'ecole" },
      { value: 'school', label: 'Ecole' },
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
      needSummary: 'Veuillez indiquer le soutien necessaire.',
      situationSummary: 'Veuillez decrire la situation.',
      schoolEnrollmentStatus: "Veuillez preciser si l'enfant est actuellement inscrit.",
      schoolNameCurrent: "Veuillez indiquer le nom de l'ecole actuelle.",
      lastSchoolAttended: 'Veuillez indiquer la derniere ecole frequentee.',
      educationInterruptionReason: 'Veuillez preciser ce qui a interrompu la scolarite.',
      teacherSchoolName: "Veuillez indiquer le nom de l'ecole de l'enseignant.",
      teacherPosition: "Veuillez indiquer la fonction de l'enseignant.",
      institutionName: "Veuillez indiquer le nom de l'institution.",
      institutionRole: "Veuillez indiquer votre role dans l'institution.",
      feeAmount: 'Veuillez preciser le montant des frais.',
      examName: "Veuillez preciser le nom de l'examen.",
      examFeeAmount: "Veuillez preciser le montant des frais d'examen.",
      contactName: 'Veuillez saisir le nom de la personne a contacter.',
      contactPhone: 'Veuillez saisir un numero de telephone.',
      consent: 'Veuillez confirmer que les informations sont exactes et que nous pouvons faire un suivi.',
      review: 'Veuillez verifier les champs indiques et continuer.',
      failed: "Nous n'avons pas pu envoyer la demande. Veuillez reessayer.",
      previewFailed: "Nous n'avons pas pu generer l'apercu. Veuillez reessayer.",
    },
  },
};
