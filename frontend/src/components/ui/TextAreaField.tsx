import React from 'react';
import { cn } from './cn';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: string;
  maxLength?: number;
}

export const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, helpText, maxLength, className, id, value, onChange, ...props }, ref) => {
    const textId = id || props.name;
    const errorId = `${textId}-error`;
    const helpId = `${textId}-help`;

    // Manage local character count
    const currentLength = typeof value === 'string' ? value.length : 0;

    const describedBy =
      [error ? errorId : null, helpText ? helpId : null].filter(Boolean).join(' ') || undefined;

    return (
      <div>
        <div className="flex justify-between items-end">
          <label htmlFor={textId} className="block text-sm font-bold text-ink-700">
            {label}
            {props.required && <span className="ml-1 text-support-red">*</span>}
          </label>
          {maxLength !== undefined && (
            <span
              className={cn(
                'text-xs',
                currentLength >= maxLength ? 'text-support-red font-bold' : 'text-ink-400',
              )}
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
        <div className="relative mt-1">
          <textarea
            ref={ref}
            id={textId}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            className={cn(
              'block w-full rounded-md border bg-white px-3 py-2.5 text-base text-ink-900 shadow-xs transition duration-200 focus:outline-hidden sm:text-sm min-h-[120px] resize-y leading-6',
              error
                ? 'border-support-red focus:border-support-red focus:ring-2 focus:ring-support-red/20'
                : 'border-ink-200 focus:border-foundation-500 focus:ring-2 focus:ring-foundation-500/20',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...props}
          />
        </div>
        {helpText && !error && (
          <p id={helpId} className="mt-2 text-xs leading-5 text-ink-500">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-2 flex items-center gap-1.5 text-sm text-support-red">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="shrink-0"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextAreaField.displayName = 'TextAreaField';
