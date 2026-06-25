/**
 * DateOfBirthInput
 *
 * A reusable segmented DD / MM / YYYY date-of-birth input component.
 *
 * Features:
 * - Three separate text inputs with numeric keyboard on mobile
 * - Auto-advance: day→month when 2 digits; month→year when 2 digits
 * - Backspace navigation: moves focus back to previous segment when current is empty
 * - Validates: required, real calendar date, not future, year ≥ 1900, configurable min age
 * - Single error message below the group
 * - Fully accessible: fieldset/legend, aria-labels, aria-describedby
 * - Outputs ISO "YYYY-MM-DD" string via onChange
 *
 * Usage:
 *   <DateOfBirthInput
 *     id="date_of_birth"
 *     label="Date of birth"
 *     value="1990-05-15"        // ISO string or ""
 *     onChange={(iso) => ...}   // called with "YYYY-MM-DD" or "" when incomplete
 *     error="..."               // external error message (e.g. from form validation)
 *     required
 *     minAge={13}               // default 0 (no minimum)
 *   />
 */

import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { cn } from './cn';

// ─── Validation helpers ────────────────────────────────────────────────────────

const MIN_YEAR = 1900;

export interface DobValidationMessages {
  required: string;
  invalidDate: string;
  future: string;
  tooOld: string;
  minAge: (age: number) => string;
}

const defaultMessages: DobValidationMessages = {
  required: 'Please enter your date of birth.',
  invalidDate: 'Please enter a valid date.',
  future: 'Date of birth cannot be in the future.',
  tooOld: 'Please enter a valid year.',
  minAge: (age) => `You must be at least ${age} years old.`,
};

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(month: number, year: number): number {
  const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return days[month] ?? 0;
}

export function validateDob(
  day: string,
  month: string,
  year: string,
  options: { required?: boolean; minAge?: number; messages?: Partial<DobValidationMessages> } = {},
): string | null {
  const msgs: DobValidationMessages = { ...defaultMessages, ...options.messages };
  const { required = true, minAge = 0 } = options;

  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  const allEmpty = !day && !month && !year;

  if (allEmpty) {
    return required ? msgs.required : null;
  }

  // Partial fill — treat as required
  if (!day || !month || !year || year.length < 4) {
    return msgs.required;
  }

  // Year bounds
  if (Number.isNaN(y) || y < MIN_YEAR || y > new Date().getFullYear() + 1) {
    return msgs.tooOld;
  }

  // Month range
  if (Number.isNaN(m) || m < 1 || m > 12) {
    return msgs.invalidDate;
  }

  // Day range
  if (Number.isNaN(d) || d < 1 || d > daysInMonth(m, y)) {
    return msgs.invalidDate;
  }

  const dob = new Date(y, m - 1, d);

  // Re-verify date didn't roll over (e.g. month 13)
  if (dob.getFullYear() !== y || dob.getMonth() !== m - 1 || dob.getDate() !== d) {
    return msgs.invalidDate;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dob >= today) {
    return msgs.future;
  }

  if (minAge > 0) {
    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - minAge);
    if (dob > minDate) {
      return msgs.minAge(minAge);
    }
  }

  return null;
}

// ─── Parse ISO → parts ────────────────────────────────────────────────────────

function parseIso(iso: string): { day: string; month: string; year: string } {
  if (!iso) return { day: '', month: '', year: '' };
  const [y = '', m = '', d = ''] = iso.split('-');
  // Remove leading zeros for display but keep them if they were stored
  return { day: d, month: m, year: y };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DateOfBirthInputProps {
  id: string;
  label: string;
  value: string; // ISO "YYYY-MM-DD" or ""
  onChange: (isoValue: string) => void;
  onBlur?: () => void;
  error?: string | null;
  required?: boolean;
  minAge?: number;
  messages?: Partial<DobValidationMessages>;
  /** Called with validation error (or null) whenever value changes */
  onValidate?: (error: string | null) => void;
  className?: string;
  helpText?: string;
  /** Locale — used for the DD/MM/YYYY vs MM/DD/YYYY label (default: en-GB => DD/MM/YYYY) */
  locale?: string;
}

export function DateOfBirthInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  minAge = 0,
  messages,
  onValidate,
  className,
  helpText,
  locale = 'en-GB',
}: DateOfBirthInputProps) {
  const isMonthFirst = locale.toLowerCase().startsWith('en-us');
  const { day: initDay, month: initMonth, year: initYear } = parseIso(value);

  const [day, setDay] = useState(initDay);
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [touched, setTouched] = useState(false);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const errorId = `${id}-dob-error`;
  const helpId = `${id}-dob-help`;

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    const { day: d, month: m, year: y } = parseIso(value);
    setDay(d);
    setMonth(m);
    setYear(y);
  }, [value]);

  // Emit ISO whenever parts change
  function emit(d: string, m: string, y: string) {
    if (d && m && y && y.length === 4) {
      const dd = d.padStart(2, '0');
      const mm = m.padStart(2, '0');
      onChange(`${y}-${mm}-${dd}`);
    } else {
      onChange('');
    }
    if (onValidate) {
      const err = validateDob(d, m, y, { required, minAge, messages });
      onValidate(err);
    }
  }

  // ── Day input ──────────────────────────────────────────────────────────────
  function handleDayChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    setDay(digits);
    emit(digits, month, year);

    // Auto-advance: 2 digits entered, or leading digit > 3
    if (digits.length === 2 || (digits.length === 1 && parseInt(digits, 10) > 3)) {
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  }

  // ── Month input ────────────────────────────────────────────────────────────
  function handleMonthChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    setMonth(digits);
    emit(day, digits, year);

    if (digits.length === 2 || (digits.length === 1 && parseInt(digits, 10) > 1)) {
      yearRef.current?.focus();
      yearRef.current?.select();
    }
  }

  // ── Year input ─────────────────────────────────────────────────────────────
  function handleYearChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setYear(digits);
    emit(day, month, digits);
  }

  // ── Backspace navigation ───────────────────────────────────────────────────
  function handleMonthKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !month) {
      e.preventDefault();
      dayRef.current?.focus();
      dayRef.current?.select();
    }
  }

  function handleYearKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !year) {
      e.preventDefault();
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  }

  // ── Blur ───────────────────────────────────────────────────────────────────
  function handleBlur() {
    setTouched(true);
    onBlur?.();
    if (onValidate) {
      const err = validateDob(day, month, year, { required, minAge, messages });
      onValidate(err);
    }
  }

  const hasError = Boolean(error);
  const describedBy = [hasError ? errorId : null, helpText ? helpId : null].filter(Boolean).join(' ') || undefined;

  const segmentBase =
    'h-11 rounded-md border bg-white text-center text-base font-semibold text-ink-900 shadow-sm transition duration-200 focus:outline-none focus:ring-2 placeholder:text-ink-300';
  const segmentNormal = 'border-ink-200 focus:border-foundation-500 focus:ring-foundation-500/20';
  const segmentError = 'border-support-red focus:border-support-red focus:ring-support-red/20';
  const segmentClass = cn(segmentBase, hasError || (touched && !value) ? segmentError : segmentNormal);

  return (
    <fieldset className={cn('min-w-0', className)} aria-required={required || undefined}>
      <legend className="block text-sm font-bold text-ink-700">
        {label}
        {required && (
          <span className="ml-1 text-support-red" aria-hidden="true">
            *
          </span>
        )}
      </legend>

      {/* Segmented inputs */}
      <div className="mt-1.5 flex items-center gap-1.5" role="group" aria-describedby={describedBy}>
        {/* Day */}
        <input
          ref={dayRef}
          id={`${id}-day`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={day}
          placeholder="DD"
          aria-label="Day"
          aria-invalid={hasError || undefined}
          onChange={(e) => handleDayChange(e.target.value)}
          onBlur={handleBlur}
          className={cn(segmentClass, 'w-[68px]')}
        />

        <span className="select-none text-lg font-bold text-ink-300" aria-hidden="true">
          /
        </span>

        {/* Month */}
        <input
          ref={monthRef}
          id={`${id}-month`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={month}
          placeholder="MM"
          aria-label="Month"
          aria-invalid={hasError || undefined}
          onChange={(e) => handleMonthChange(e.target.value)}
          onKeyDown={handleMonthKeyDown}
          onBlur={handleBlur}
          className={cn(segmentClass, 'w-[68px]')}
        />

        <span className="select-none text-lg font-bold text-ink-300" aria-hidden="true">
          /
        </span>

        {/* Year */}
        <input
          ref={yearRef}
          id={`${id}-year`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={year}
          placeholder="YYYY"
          aria-label="Year"
          aria-invalid={hasError || undefined}
          onChange={(e) => handleYearChange(e.target.value)}
          onKeyDown={handleYearKeyDown}
          onBlur={handleBlur}
          className={cn(segmentClass, 'w-[88px]')}
        />
      </div>

      {/* Help text */}
      {helpText && !error ? (
        <p id={helpId} className="mt-1.5 text-xs leading-5 text-ink-500">
          {helpText}
        </p>
      ) : null}

      {/* Error */}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-support-red">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
