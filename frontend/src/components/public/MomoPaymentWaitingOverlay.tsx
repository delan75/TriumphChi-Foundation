import {
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Loader2,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../ui/cn';

export type MomoPaymentOverlayStatus = 'request_sent' | 'waiting' | 'confirmed' | 'failed' | 'timeout';

export interface MomoPaymentWaitingOverlayCopy {
  titleSent: string;
  bodyPrepared: string;
  bodyPrompt: string;
  phoneLabel: string;
  amountLabel: string;
  statusLabel: string;
  preparedLabel: string;
  requestSentLabel: string;
  waitingApprovalLabel: string;
  paymentConfirmedLabel: string;
  waitingFirst: string;
  waitingSecond: string;
  waitingLong: string;
  confirmedTitle: string;
  confirmedBody: string;
  failedTitle: string;
  failedBody: string;
  timeoutTitle: string;
  timeoutBody: string;
  timeoutFollowUp: string;
  progressLabel: string;
  spinnerLabel: string;
  closeLabel: string;
  tryAgainLabel: string;
  chooseAnotherLabel: string;
  checkAgainLabel: string;
  approvedCheckLabel: string;
  continueLabel: string;
  receiptLabel: string;
  supportSummary: string;
  supportTitle: string;
  supportBody: string;
  supportMessageLabel: string;
  supportPlaceholder: string;
  supportSendLabel: string;
  supportSendingLabel: string;
  supportSentFallback: string;
}

interface MomoPaymentWaitingOverlayProps {
  isOpen: boolean;
  phoneNumber: string;
  amount: string;
  currency: string;
  status: MomoPaymentOverlayStatus;
  attempts: number;
  maxAttempts: number;
  message?: string;
  supportMessage: string;
  supportStatusMessage?: string;
  isSendingSupportNote?: boolean;
  receiptHref?: string;
  canClose: boolean;
  copy: MomoPaymentWaitingOverlayCopy;
  onRetry: () => void;
  onChooseAnother: () => void;
  onClose: () => void;
  onCheckAgain: () => void;
  onSupportMessageChange: (value: string) => void;
  onSendSupportNote: () => void;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function MomoPaymentWaitingOverlay({
  isOpen,
  phoneNumber,
  amount,
  currency,
  status,
  attempts,
  maxAttempts,
  message,
  supportMessage,
  supportStatusMessage,
  isSendingSupportNote = false,
  receiptHref,
  canClose,
  copy,
  onRetry,
  onChooseAnother,
  onClose,
  onCheckAgain,
  onSupportMessageChange,
  onSendSupportNote,
}: MomoPaymentWaitingOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleId = 'momo-payment-overlay-title';
  const descriptionId = 'momo-payment-overlay-description';
  const isActive = status === 'request_sent' || status === 'waiting';
  const isConfirmed = status === 'confirmed';
  const isFailed = status === 'failed';
  const isTimedOut = status === 'timeout';
  const canSendSupportNote = supportMessage.trim().length >= 10 && !isSendingSupportNote;
  const progress = Math.min(Math.max(attempts / maxAttempts, 0), 1);
  const secondsElapsed = attempts * 5;

  const statusText = useMemo(() => {
    if (isConfirmed) {
      return copy.confirmedBody;
    }

    if (isFailed) {
      return message || copy.failedBody;
    }

    if (isTimedOut) {
      return copy.timeoutFollowUp;
    }

    if (secondsElapsed >= 25) {
      return copy.waitingLong;
    }

    if (secondsElapsed >= 10) {
      return copy.waitingSecond;
    }

    return copy.waitingFirst;
  }, [copy, isConfirmed, isFailed, isTimedOut, message, secondsElapsed]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTarget = containerRef.current?.querySelector<HTMLElement>(focusableSelector) ?? containerRef.current;
    focusTarget?.focus();

    function trapFocus(event: KeyboardEvent) {
      if (event.key === 'Escape' && !canClose) {
        event.preventDefault();
        return;
      }

      if (event.key !== 'Tab' || !containerRef.current) {
        return;
      }

      const focusableElements = Array.from(containerRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', trapFocus);

    return () => {
      document.removeEventListener('keydown', trapFocus);
      previousActiveElement?.focus();
    };
  }, [canClose, isOpen]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] min-h-dvh overflow-y-auto bg-foundation-950/92 px-4 py-5 backdrop-blur-md sm:px-6 sm:py-8"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-3xl items-center outline-none sm:min-h-[calc(100dvh-4rem)]"
      >
        <div className="relative w-full overflow-hidden rounded-md border border-white/15 bg-white shadow-2xl shadow-foundation-950/45">
          {canClose ? (
            <button
              type="button"
              onClick={onClose}
              className="focus-ring absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-md bg-white/95 text-ink-700 shadow-sm transition hover:bg-foundation-50"
              aria-label={copy.closeLabel}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}

          <div className={cn('relative overflow-hidden px-5 pb-8 pt-10 text-white sm:px-8', isFailed ? 'bg-red-950' : 'bg-foundation-900')}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_48%)]" aria-hidden="true" />
            <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-white/10 shadow-inner sm:h-24 sm:w-24">
              {isConfirmed ? (
                <CheckCircle2 className="h-11 w-11 text-foundation-100 sm:h-12 sm:w-12" aria-hidden="true" />
              ) : isFailed ? (
                <CircleAlert className="h-11 w-11 text-red-100 sm:h-12 sm:w-12" aria-hidden="true" />
              ) : isTimedOut ? (
                <Clock3 className="h-11 w-11 text-foundation-100 sm:h-12 sm:w-12" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-11 w-11 text-foundation-100 sm:h-12 sm:w-12" aria-hidden="true" />
              )}
            </div>

            <div className="relative mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-black uppercase tracking-wide text-foundation-50">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              MTN MoMo
            </div>

            <h3 id={titleId} className="relative mx-auto mt-4 max-w-xl text-center text-2xl font-black leading-tight sm:text-3xl">
              {overlayTitle(status, copy)}
            </h3>
            <p id={descriptionId} className="relative mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-foundation-50 sm:text-base">
              {isActive ? copy.bodyPrepared : message || overlayBody(status, copy)}
            </p>
            {isActive ? (
              <p className="relative mx-auto mt-2 max-w-2xl text-center text-sm leading-6 text-foundation-100">
                {copy.bodyPrompt}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 px-5 py-5 sm:px-8 sm:py-7">
            <div className="grid gap-3 rounded-md border border-foundation-100 bg-foundation-50 p-4 sm:grid-cols-2">
              <DataPill label={copy.phoneLabel} value={phoneNumber} />
              <DataPill label={copy.amountLabel} value={`${amount} ${currency}`} />
            </div>

            <div className="rounded-md border border-ink-100 bg-white p-4 shadow-sm" aria-live="polite">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className={cn('grid h-14 w-14 shrink-0 place-items-center rounded-full', isFailed ? 'bg-red-50 text-red-700' : isConfirmed ? 'bg-foundation-50 text-foundation-700' : 'bg-foundation-700 text-white')}>
                  {isActive ? (
                    <>
                      <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
                      <span className="sr-only">{copy.spinnerLabel}</span>
                    </>
                  ) : isConfirmed ? (
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  ) : isFailed ? (
                    <CircleAlert className="h-7 w-7" aria-hidden="true" />
                  ) : (
                    <Clock3 className="h-7 w-7" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase text-foundation-700">{copy.statusLabel}</p>
                  <p className="mt-1 text-base font-black leading-6 text-ink-900">{statusText}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3 text-xs font-black uppercase text-foundation-800">
                  <span>{copy.progressLabel}</span>
                  <span>{Math.min(attempts, maxAttempts)}/{maxAttempts}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-foundation-100">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500 ease-out', isFailed ? 'bg-red-600' : 'bg-foundation-600')}
                    style={{ width: `${isActive ? Math.max(progress * 100, attempts > 0 ? 8 : 4) : 100}%` }}
                  />
                </div>
              </div>
            </div>

            <ol className="grid gap-3 sm:grid-cols-4" aria-label="MoMo donation progress">
              <TimelineStep label={copy.preparedLabel} complete />
              <TimelineStep label={copy.requestSentLabel} complete />
              <TimelineStep label={copy.waitingApprovalLabel} complete={isConfirmed} active={isActive || isTimedOut} failed={isFailed} />
              <TimelineStep label={copy.paymentConfirmedLabel} complete={isConfirmed} active={isConfirmed} failed={isFailed} />
            </ol>

            {isConfirmed ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {receiptHref ? (
                  <a
                    href={receiptHref}
                    className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-foundation-200 bg-white px-4 text-sm font-black text-foundation-900 transition hover:bg-foundation-50"
                  >
                    {copy.receiptLabel}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-foundation-700 px-4 text-sm font-black text-white transition hover:bg-foundation-900"
                >
                  {copy.continueLabel}
                </button>
              </div>
            ) : null}

            {isFailed ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={onRetry} className="focus-ring min-h-12 rounded-md bg-foundation-700 px-4 text-sm font-black text-white transition hover:bg-foundation-900">
                  {copy.tryAgainLabel}
                </button>
                <button type="button" onClick={onChooseAnother} className="focus-ring min-h-12 rounded-md border border-foundation-200 bg-white px-4 text-sm font-black text-foundation-900 transition hover:bg-foundation-50">
                  {copy.chooseAnotherLabel}
                </button>
                <button type="button" onClick={onClose} className="focus-ring min-h-12 rounded-md border border-ink-200 bg-white px-4 text-sm font-black text-ink-700 transition hover:bg-ink-50">
                  {copy.closeLabel}
                </button>
              </div>
            ) : null}

            {isTimedOut ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={onCheckAgain} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-700 px-4 text-sm font-black text-white transition hover:bg-foundation-900">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  {copy.approvedCheckLabel}
                </button>
                <button type="button" onClick={onCheckAgain} className="focus-ring min-h-12 rounded-md border border-foundation-200 bg-white px-4 text-sm font-black text-foundation-900 transition hover:bg-foundation-50">
                  {copy.checkAgainLabel}
                </button>
                <button type="button" onClick={onClose} className="focus-ring min-h-12 rounded-md border border-ink-200 bg-white px-4 text-sm font-black text-ink-700 transition hover:bg-ink-50">
                  {copy.closeLabel}
                </button>
              </div>
            ) : null}

            {isFailed || isTimedOut ? (
              <details className="group rounded-md border border-ink-100 bg-ink-50 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-ink-900">
                  <span className="inline-flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-foundation-700" aria-hidden="true" />
                    {copy.supportSummary}
                  </span>
                  <ChevronDown className="h-5 w-5 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="mt-4">
                  <h4 className="text-base font-black text-ink-900">{copy.supportTitle}</h4>
                  <p className="mt-1 text-sm leading-6 text-ink-600">{copy.supportBody}</p>
                  <label htmlFor="momo-support-message" className="mt-4 block text-sm font-black text-ink-900">
                    {copy.supportMessageLabel}
                  </label>
                  <textarea
                    id="momo-support-message"
                    value={supportMessage}
                    onChange={(event) => onSupportMessageChange(event.target.value)}
                    placeholder={copy.supportPlaceholder}
                    rows={4}
                    className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink-200 bg-white px-3 py-3 text-sm leading-6 text-ink-900"
                  />
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      disabled={!canSendSupportNote}
                      onClick={onSendSupportNote}
                      className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-foundation-700 px-4 text-sm font-black text-white transition hover:bg-foundation-900 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {isSendingSupportNote ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <MessageSquareText className="h-4 w-4" aria-hidden="true" />}
                      {isSendingSupportNote ? copy.supportSendingLabel : copy.supportSendLabel}
                    </button>
                    {supportStatusMessage ? (
                      <p className="text-sm font-bold leading-6 text-ink-600" role="status">
                        {supportStatusMessage}
                      </p>
                    ) : null}
                  </div>
                </div>
              </details>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white px-3 py-3 shadow-sm">
      <p className="text-xs font-black uppercase text-foundation-700">{label}</p>
      <p className="mt-1 break-words text-base font-black text-ink-900">{value}</p>
    </div>
  );
}

function TimelineStep({
  label,
  complete = false,
  active = false,
  failed = false,
}: {
  label: string;
  complete?: boolean;
  active?: boolean;
  failed?: boolean;
}) {
  return (
    <li className={cn('rounded-md border p-3 text-sm font-black leading-5', failed ? 'border-red-200 bg-red-50 text-red-800' : complete ? 'border-foundation-200 bg-foundation-50 text-foundation-900' : active ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-ink-100 bg-ink-50 text-ink-500')}>
      <span className="flex items-center gap-2">
        {failed ? (
          <CircleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
        ) : complete ? (
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        ) : active ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          <span className="h-5 w-5 shrink-0 rounded-full border border-current" aria-hidden="true" />
        )}
        {label}
      </span>
    </li>
  );
}

function overlayTitle(status: MomoPaymentOverlayStatus, copy: MomoPaymentWaitingOverlayCopy) {
  if (status === 'confirmed') {
    return copy.confirmedTitle;
  }

  if (status === 'failed') {
    return copy.failedTitle;
  }

  if (status === 'timeout') {
    return copy.timeoutTitle;
  }

  return copy.titleSent;
}

function overlayBody(status: MomoPaymentOverlayStatus, copy: MomoPaymentWaitingOverlayCopy) {
  if (status === 'confirmed') {
    return copy.confirmedBody;
  }

  if (status === 'failed') {
    return copy.failedBody;
  }

  if (status === 'timeout') {
    return copy.timeoutBody;
  }

  return copy.bodyPrepared;
}
