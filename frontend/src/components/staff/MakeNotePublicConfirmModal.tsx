import { Globe, Lock, AlertTriangle, X } from 'lucide-react';

interface MakeNotePublicConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void;
  locale?: string;
}

const copy = {
  en: {
    title: 'Are you sure you want to make this note public?',
    eyebrow: 'Public Visibility Warning',
    warning:
      'By default, all notes are internal and strictly confidential to Foundation staff. Making a note public means it will be displayed directly to the applicant when they track their application status online.',
    caution:
      'Internal verification observations, sensitive household details, and staff deliberations should remain internal.',
    internalCardTitle: 'Internal Note (Default)',
    internalCardDesc:
      'Confidential. Only accessible to authenticated Foundation staff members in this dashboard.',
    publicCardTitle: 'Public Note (Visible to Applicant)',
    publicCardDesc:
      'Applicant will see this comment on the public tracking page when checking their status.',
    confirmButton: 'Yes, Make Public',
    cancelButton: 'Keep Internal (Recommended)',
  },
  fr: {
    title: 'Voulez-vous vraiment rendre cette note publique ?',
    eyebrow: 'Avertissement de visibilité publique',
    warning:
      "Par défaut, toutes les notes sont internes et strictement confidentielles pour l'équipe de la Fondation. Rendre une note publique signifie qu'elle sera affichée directement au demandeur lorsqu'il suivra le statut de sa demande en ligne.",
    caution:
      "Les observations de vérification internes, les détails familiaux sensibles et les délibérations de l'équipe doivent rester internes.",
    internalCardTitle: 'Note interne (Par défaut)',
    internalCardDesc:
      "Confidentiel. Uniquement accessible aux membres de l'équipe de la Fondation dans ce tableau de bord.",
    publicCardTitle: 'Note publique (Visible par le demandeur)',
    publicCardDesc:
      "Le demandeur verra ce commentaire sur la page de suivi public lorsqu'il vérifiera son statut.",
    confirmButton: 'Oui, rendre publique',
    cancelButton: 'Garder interne (Recommandé)',
  },
} as const;

export function MakeNotePublicConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  onClose,
  locale = 'en',
}: MakeNotePublicConfirmModalProps) {
  if (!isOpen) return null;

  const t = copy[locale as keyof typeof copy] ?? copy.en;
  const handleClose = onClose ?? onCancel;

  return (
    <div
      className="fixed inset-0 z-60 grid min-h-dvh place-items-center overflow-y-auto bg-ink-950/80 px-4 py-8 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="make-note-public-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-ink-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-amber-600 px-6 py-5 text-white sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/20">
                <AlertTriangle className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-100">
                  {t.eyebrow}
                </p>
                <h3 id="make-note-public-title" className="mt-0.5 text-lg font-bold text-white">
                  {t.title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="focus-ring rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-4">
          <p className="text-sm leading-relaxed text-ink-700 font-medium">{t.warning}</p>

          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 leading-normal font-semibold">
            {t.caution}
          </div>

          {/* Comparison Cards */}
          <div className="grid gap-3 pt-1">
            <div className="flex items-start gap-3 rounded-lg border border-ink-200 bg-ink-50/50 p-3 text-left">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-ink-100 text-ink-700">
                <Lock className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-900">{t.internalCardTitle}</p>
                <p className="text-[11px] text-ink-600 leading-normal mt-0.5">
                  {t.internalCardDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-emerald-300 bg-emerald-50/60 p-3 text-left">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-emerald-100 text-emerald-800">
                <Globe className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">{t.publicCardTitle}</p>
                <p className="text-[11px] text-emerald-800 leading-normal mt-0.5">
                  {t.publicCardDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-ink-100">
            <button
              type="button"
              onClick={handleClose}
              className="focus-ring inline-flex h-10 items-center justify-center rounded-lg border border-ink-300 bg-white px-4 text-xs font-bold text-ink-700 shadow-xs transition hover:bg-ink-50"
            >
              {t.cancelButton}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 active:scale-95"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span>{t.confirmButton}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
