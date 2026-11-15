import React from 'react';
import { cn } from './cn';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  helpText?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, helpText, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    const errorId = `${inputId}-error`;
    const helpId = `${inputId}-help`;

    const describedBy =
      [error ? errorId : null, helpText ? helpId : null].filter(Boolean).join(' ') || undefined;

    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-bold text-ink-700">
          {label}
          {props.required && <span className="ml-1 text-support-red">*</span>}
        </label>
        <div className="relative mt-1">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block min-h-12 w-full rounded-md border bg-white py-2.5 text-base text-ink-900 shadow-xs transition duration-200 focus:outline-hidden sm:text-sm',
              icon ? 'pl-10 pr-3' : 'px-3',
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

InputField.displayName = 'InputField';
