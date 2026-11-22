import { useState } from 'react';
import { Building2, Check, Copy, Mail, ShieldCheck, X } from 'lucide-react';
import type { PublicBankTransferDetails } from '../../lib/api';
import type { Locale } from '../../lib/i18n';

export interface BankTransferModalCopy {
  title: string;
  eyebrow: string;
  description: string;
  referenceLabel: string;
  referenceNotice: string;
  amountLabel: string;
  bankNameLabel: string;
  accountNameLabel: string;
  accountNumberLabel: string;
  ibanLabel: string;
  swiftLabel: string;
  branchLabel: string;
  emailSentNotice: string;
  anonymousNotice: string;
  copyButton: string;
  copiedButton: string;
  doneButton: string;
  securityNotice: string;
}

export const bankTransferModalCopy: Record<Locale, BankTransferModalCopy> = {
  en: {
    title: 'Bank Transfer & EFT Details',
    eyebrow: 'Direct Bank Wire',
    description:
      'Please use the banking details and reference number below to complete your transfer via your bank branch or online banking.',
    referenceLabel: 'Payment Reference',
    referenceNotice: 'Include this reference in your transfer memo so we can quickly verify your gift.',
    amountLabel: 'Expected Amount',
    bankNameLabel: 'Bank Name',
    accountNameLabel: 'Account Name',
    accountNumberLabel: 'Account Number / RIB',
    ibanLabel: 'IBAN',
    swiftLabel: 'SWIFT / BIC',
    branchLabel: 'Branch',
    emailSentNotice: 'A confirmation with these bank transfer instructions has been emailed to :email.',
    anonymousNotice: 'Please copy or record your reference number and bank details before closing.',
    copyButton: 'Copy',
    copiedButton: 'Copied!',
    doneButton: 'Done',
    securityNotice: 'Official TriumphChi Foundation banking credentials. Verified & secure.',
  },
  fr: {
    title: 'Coordonnées de virement bancaire',
    eyebrow: 'Virement bancaire direct',
    description:
      'Veuillez utiliser les coordonnées bancaires et la référence ci-dessous pour effectuer votre virement depuis votre banque ou votre application.',
    referenceLabel: 'Référence de paiement',
    referenceNotice: 'Indiquez cette référence dans le libellé de votre virement pour faciliter la confirmation de votre don.',
    amountLabel: 'Montant attendu',
    bankNameLabel: 'Nom de la banque',
    accountNameLabel: 'Nom du compte',
    accountNumberLabel: 'Numéro de compte / RIB',
    ibanLabel: 'IBAN',
    swiftLabel: 'SWIFT / BIC',
    branchLabel: 'Agence',
    emailSentNotice: 'Une confirmation avec ces instructions de virement a été envoyée par email à :email.',
    anonymousNotice: 'Veuillez noter ou copier votre référence et les coordonnées avant de fermer.',
    copyButton: 'Copier',
    copiedButton: 'Copié !',
    doneButton: 'Terminé',
    securityNotice: 'Coordonnées bancaires officielles de la Fondation TriumphChi. Vérifiées et sécurisées.',
  },
};

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  referenceNumber: string;
  amount: string;
  currency: string;
  bankDetails?: PublicBankTransferDetails | null;
  donorEmail?: string;
  copy?: BankTransferModalCopy;
}

export function BankTransferModal({
  isOpen,
  onClose,
  locale,
  referenceNumber,
  amount,
  currency,
  bankDetails,
  donorEmail,
  copy: customCopy,
}: BankTransferModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const copy = customCopy ?? bankTransferModalCopy[locale] ?? bankTransferModalCopy.en;

  async function handleCopy(text: string, key: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 2000);
    } catch {
      // Ignore copy error
    }
  }

  const bankName = bankDetails?.bank_name ?? 'Afriland First Bank';
  const accountName = bankDetails?.account_name ?? 'TriumphChi Foundation';
  const accountNumber = bankDetails?.account_number ?? '10005 00001 01234567890 12';
  const iban = bankDetails?.iban ?? 'CM21 1000 5000 0101 2345 6789 012';
  const swiftBic = bankDetails?.swift_bic ?? 'AFRICMCX';
  const branch = bankDetails?.branch ?? 'Yaounde Central Branch';

  return (
    <div
      className="fixed inset-0 z-120 grid min-h-dvh place-items-center overflow-y-auto bg-ink-950/80 px-4 py-8 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-transfer-modal-title"
      aria-describedby="bank-transfer-modal-description"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-foundation-100 bg-white shadow-2xl shadow-ink-950/30">
        {/* Header */}
        <div className="bg-foundation-900 px-6 py-6 text-white sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/10 ring-1 ring-white/20">
                <Building2 className="h-6 w-6 text-foundation-200" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-foundation-200">{copy.eyebrow}</p>
                <h2 id="bank-transfer-modal-title" className="mt-1 text-xl font-black text-white sm:text-2xl">
                  {copy.title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <p id="bank-transfer-modal-description" className="mt-3 text-sm leading-relaxed text-foundation-100">
            {copy.description}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Reference Notice Box */}
          <div className="rounded-lg border-2 border-dashed border-foundation-600 bg-foundation-50/60 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-foundation-800">
                  {copy.referenceLabel}
                </span>
                <p className="mt-1 font-mono text-xl font-black tracking-tight text-foundation-950 sm:text-2xl">
                  {referenceNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(referenceNumber, 'ref')}
                className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-foundation-600 px-4 text-xs font-black text-white transition hover:bg-foundation-700 active:scale-95"
              >
                {copiedKey === 'ref' ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>{copy.copiedButton}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span>{copy.copyButton}</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-xs font-medium text-foundation-800 leading-normal">
              {copy.referenceNotice}
            </p>
          </div>

          {/* Amount Badge */}
          <div className="flex items-center justify-between rounded-lg border border-ink-100 bg-ink-50/50 px-4 py-3">
            <span className="text-sm font-bold text-ink-600">{copy.amountLabel}</span>
            <span className="text-lg font-black text-ink-900">
              {amount} {currency}
            </span>
          </div>

          {/* Banking Details Grid */}
          <div className="overflow-hidden rounded-lg border border-ink-200 divide-y divide-ink-100 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-ink-50/30">
              <span className="font-bold text-ink-600">{copy.bankNameLabel}</span>
              <span className="font-black text-ink-900 sm:text-right mt-1 sm:mt-0">{bankName}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white">
              <span className="font-bold text-ink-600">{copy.accountNameLabel}</span>
              <span className="font-black text-ink-900 sm:text-right mt-1 sm:mt-0">{accountName}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-ink-50/30 gap-2">
              <span className="font-bold text-ink-600">{copy.accountNumberLabel}</span>
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="font-mono font-bold text-ink-900 break-all">{accountNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(accountNumber, 'acc')}
                  className="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-600 transition hover:bg-ink-100"
                  aria-label={`${copy.copyButton} ${copy.accountNumberLabel}`}
                >
                  {copiedKey === 'acc' ? (
                    <Check className="h-3.5 w-3.5 text-foundation-600" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {iban ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white gap-2">
                <span className="font-bold text-ink-600">{copy.ibanLabel}</span>
                <div className="flex items-center gap-2 sm:justify-end">
                  <span className="font-mono font-bold text-ink-900 break-all">{iban}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(iban, 'iban')}
                    className="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-600 transition hover:bg-ink-100"
                    aria-label={`${copy.copyButton} ${copy.ibanLabel}`}
                  >
                    {copiedKey === 'iban' ? (
                      <Check className="h-3.5 w-3.5 text-foundation-600" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            ) : null}

            {swiftBic ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-ink-50/30 gap-2">
                <span className="font-bold text-ink-600">{copy.swiftLabel}</span>
                <div className="flex items-center gap-2 sm:justify-end">
                  <span className="font-mono font-bold text-ink-900">{swiftBic}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(swiftBic, 'swift')}
                    className="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-600 transition hover:bg-ink-100"
                    aria-label={`${copy.copyButton} ${copy.swiftLabel}`}
                  >
                    {copiedKey === 'swift' ? (
                      <Check className="h-3.5 w-3.5 text-foundation-600" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            ) : null}

            {branch ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white">
                <span className="font-bold text-ink-600">{copy.branchLabel}</span>
                <span className="font-bold text-ink-800 sm:text-right mt-1 sm:mt-0">{branch}</span>
              </div>
            ) : null}
          </div>

          {/* Email / Anonymous Guidance */}
          {donorEmail ? (
            <div className="flex items-center gap-3 rounded-lg bg-foundation-50 p-3.5 text-xs text-foundation-900 border border-foundation-200">
              <Mail className="h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
              <span>{copy.emailSentNotice.replace(':email', donorEmail)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-ink-50 p-3.5 text-xs text-ink-700 border border-ink-200">
              <ShieldCheck className="h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
              <span>{copy.anonymousNotice}</span>
            </div>
          )}

          {/* Security & Action */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-foundation-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-foundation-900"
            >
              {copy.doneButton}
            </button>
            <p className="text-center text-xs text-ink-500 font-medium">
              {copy.securityNotice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
