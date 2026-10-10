import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { InputField } from '../../../components/ui/InputField';
import { StatusPill } from '../../../components/ui/StatusPill';
import { cn } from '../../../components/ui/cn';

export interface TrackingData {
  application_number: string;
  status: string;
  status_label: string;
  applicant_name: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  verification_notes: string | null;
}

interface ApplicationTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

const trackingCopy = {
  en: {
    title: 'Track Application',
    description: 'Enter your application number and the email address used to submit the application.',
    appNumberLabel: 'Application Number',
    appNumberPlaceholder: 'e.g. APP-XYZ',
    emailLabel: 'Contact Email',
    emailPlaceholder: 'Email used during application',
    checkStatus: 'Check Status',
    checking: 'Checking...',
    cancel: 'Cancel',
    applicant: 'Applicant',
    status: 'Status',
    submitted: 'Submitted',
    updatesNotes: 'Updates / Notes',
    close: 'Close',
    checkAnother: 'Check Another',
    unknown: 'Unknown',
    failedToTrack: 'Failed to track application'
  },
  fr: {
    title: 'Suivre la demande',
    description: 'Entrez votre numéro de demande et l\'adresse email utilisée pour soumettre la demande.',
    appNumberLabel: 'Numéro de demande',
    appNumberPlaceholder: 'ex. APP-XYZ',
    emailLabel: 'Email de contact',
    emailPlaceholder: 'Email utilisé lors de la demande',
    checkStatus: 'Vérifier le statut',
    checking: 'Vérification...',
    cancel: 'Annuler',
    applicant: 'Demandeur',
    status: 'Statut',
    submitted: 'Soumis',
    updatesNotes: 'Mises à jour / Notes',
    close: 'Fermer',
    checkAnother: 'Vérifier une autre',
    unknown: 'Inconnu',
    failedToTrack: 'Échec du suivi de la demande'
  }
} as const;

export function ApplicationTrackModal({ isOpen, onClose, locale }: ApplicationTrackModalProps) {
  const copy = trackingCopy[locale as keyof typeof trackingCopy] || trackingCopy.en;
  const [appNumber, setAppNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrackingData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        application_number: appNumber,
        email: email,
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'}/public/applications/track?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': locale,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || copy.failedToTrack);
      }

      const responseBody = await response.json();
      setData(responseBody.data as TrackingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failedToTrack);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setData(null);
      setError(null);
      setAppNumber('');
      setEmail('');
    }, 300);
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div 
        className={cn(
          "fixed inset-0 bg-ink-900/60 backdrop-blur-xs transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div 
            className={cn(
              "relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-lg sm:p-6",
              isOpen ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
            )}
          >
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-ink-400 hover:text-ink-500 focus:outline-hidden focus:ring-2 focus:ring-foundation-500 focus:ring-offset-2"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foundation-100 sm:mx-0 sm:h-10 sm:w-10">
                <Search className="h-5 w-5 text-foundation-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-black leading-6 text-ink-900" id="modal-title">
                  {copy.title}
                </h3>
                <div className="mt-2 text-sm text-ink-500">
                  {copy.description}
                </div>

                {!data ? (
                  <form onSubmit={handleTrack} className="mt-5 space-y-4">
                    <InputField
                      id="app_number"
                      label={copy.appNumberLabel}
                      value={appNumber}
                      onChange={(e) => setAppNumber(e.target.value)}
                      placeholder={copy.appNumberPlaceholder}
                      required
                    />
                    <InputField
                      id="app_email"
                      type="email"
                      label={copy.emailLabel}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={copy.emailPlaceholder}
                      required
                    />
                    
                    {error && (
                      <div className="rounded-md bg-support-red/10 p-3 text-sm text-support-red">
                        {error}
                      </div>
                    )}

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full justify-center rounded-md bg-foundation-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-foundation-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                      >
                        {isLoading ? copy.checking : copy.checkStatus}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-ink-900 shadow-xs ring-1 ring-inset ring-ink-300 hover:bg-ink-50 sm:mt-0 sm:w-auto"
                        onClick={handleClose}
                      >
                        {copy.cancel}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-6 border-t border-ink-100 pt-5">
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-xs font-bold uppercase text-ink-500">{copy.applicant}</dt>
                        <dd className="mt-1 text-sm font-semibold text-ink-900">{data.applicant_name}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase text-ink-500">{copy.status}</dt>
                        <dd className="mt-1">
                          <StatusPill status={data.status} label={data.status_label} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase text-ink-500">{copy.submitted}</dt>
                        <dd className="mt-1 text-sm text-ink-700">
                          {data.submitted_at ? new Date(data.submitted_at).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) : copy.unknown}
                        </dd>
                      </div>
                      
                      {data.verification_notes && (
                        <div className="rounded-md bg-ink-50 p-4">
                          <dt className="text-xs font-bold uppercase text-ink-500">{copy.updatesNotes}</dt>
                          <dd className="mt-1 text-sm text-ink-800 whitespace-pre-wrap">{data.verification_notes}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-foundation-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-foundation-500 sm:ml-3 sm:w-auto"
                        onClick={handleClose}
                      >
                        {copy.close}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-ink-900 shadow-xs ring-1 ring-inset ring-ink-300 hover:bg-ink-50 sm:mt-0 sm:w-auto"
                        onClick={() => setData(null)}
                      >
                        {copy.checkAnother}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
