import React from 'react';
import { cn } from './cn';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    const errorId = `${inputId}-error`;

    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-700">
          {label}
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
              'block w-full rounded-md border py-2.5 text-sm shadow-sm transition duration-200 focus:outline-none',
              icon ? 'pl-10 pr-3' : 'px-3',
              error
                ? 'border-support-red focus:border-support-red focus:ring-support-red/20'
                : 'border-ink-200 focus:border-foundation-500 focus:ring-2 focus:ring-foundation-500/20',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-2 text-sm text-support-red">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
