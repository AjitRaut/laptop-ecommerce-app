import React, { forwardRef, useId } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const control =
  'sf-field block w-full rounded-sf border bg-sf-surface/70 text-sf-ink placeholder:text-sf-subtle transition-[border-color,box-shadow] duration-200 focus:outline-none focus-visible:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

const controlState = (error?: string) =>
  error
    ? 'border-sf-danger/60 focus:border-sf-danger focus:ring-sf-danger/15'
    : 'border-sf-line-strong hover:border-sf-subtle/50 focus:border-sf-accent-strong focus:ring-sf-accent-strong/20';

interface FieldShellProps {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

const FieldShell: React.FC<FieldShellProps> = ({ id, label, error, hint, className, children }) => (
  <div className={clsx('w-full', className)}>
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-sf-ink">
        {label}
      </label>
    )}
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-sf-danger">
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-sf-subtle">
          {hint}
        </p>
      )
    )}
  </div>
);

const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  /** Interactive element (e.g. show-password button) placed inside the right edge. */
  rightSlot?: React.ReactNode;
  wrapperClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, leftIcon, rightSlot, wrapperClassName, className, id, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <FieldShell id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-sf-subtle [&>svg]:h-5 [&>svg]:w-5">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(fieldId, error, hint)}
            className={clsx(control, controlState(error), 'h-12 px-4', leftIcon && 'pl-11', rightSlot && 'pr-12', className)}
            {...props}
          />
          {rightSlot && <span className="absolute inset-y-0 right-0 flex w-12 items-center justify-center">{rightSlot}</span>}
        </div>
      </FieldShell>
    );
  }
);
TextField.displayName = 'TextField';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, hint, wrapperClassName, className, id, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <FieldShell id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={clsx(control, controlState(error), 'resize-y px-4 py-3', className)}
          {...props}
        />
      </FieldShell>
    );
  }
);
TextAreaField.displayName = 'TextAreaField';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, hint, wrapperClassName, className, id, children, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <FieldShell id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(fieldId, error, hint)}
            className={clsx(control, controlState(error), 'h-12 appearance-none pl-4 pr-10 [&>option]:bg-sf-surface [&>option]:text-sf-ink', className)}
            {...props}
          >
            {children}
          </select>
          <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sf-subtle" />
        </div>
      </FieldShell>
    );
  }
);
SelectField.displayName = 'SelectField';

interface CheckboxFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <div className={className}>
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            id={fieldId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            className="form-checkbox mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded-md border-sf-line-strong bg-sf-surface text-sf-accent-strong focus:ring-2 focus:ring-sf-accent-strong/40 focus:ring-offset-0"
            {...props}
          />
          <label htmlFor={fieldId} className="cursor-pointer text-sm leading-6 text-sf-muted">
            {label}
          </label>
        </div>
        {error && (
          <p role="alert" className="mt-1.5 text-sm text-sf-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);
CheckboxField.displayName = 'CheckboxField';
