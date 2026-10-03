import { useId } from 'react';
import { PiCaretDown } from 'react-icons/pi';

// DESIGN-SYSTEM §8.7: label above (never placeholder-as-label), 16px+ text, error below linked by aria-describedby.
const CONTROL =
  'min-h-[44px] w-full rounded-xs border bg-mithila-card px-3 text-mithila-text disabled:opacity-50';

function useFieldIds(id, error, hint) {
  const generated = useId();
  const fieldId = id ?? generated;
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = hint && !error ? `${fieldId}-hint` : undefined;
  return { fieldId, errorId, hintId, describedBy: errorId ?? hintId };
}

function FieldLabel({ htmlFor, required, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-medium text-mithila-textSecondary">
      {children}
      {required && (
        <span aria-hidden="true" className="text-state-danger">
          {' '}
          *
        </span>
      )}
    </label>
  );
}

function FieldMessage({ error, hint, errorId, hintId }) {
  if (error) {
    return (
      <p id={errorId} className="mt-1 text-caption font-medium text-state-danger">
        {error}
      </p>
    );
  }
  return hint ? (
    <p id={hintId} className="mt-1 text-caption text-mithila-muted">
      {hint}
    </p>
  ) : null;
}

const borderFor = (error) => (error ? 'border-state-danger' : 'border-mithila-border');

export function TextField({ label, hint, error, required, id, className = '', ...input }) {
  const ids = useFieldIds(id, error, hint);
  return (
    <div className={className}>
      <FieldLabel htmlFor={ids.fieldId} required={required}>
        {label}
      </FieldLabel>
      <input
        id={ids.fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={`mt-1 ${CONTROL} ${borderFor(error)}`}
        {...input}
      />
      <FieldMessage error={error} hint={hint} errorId={ids.errorId} hintId={ids.hintId} />
    </div>
  );
}

export function TextAreaField({ label, hint, error, required, id, rows = 4, className = '', ...input }) {
  const ids = useFieldIds(id, error, hint);
  return (
    <div className={className}>
      <FieldLabel htmlFor={ids.fieldId} required={required}>
        {label}
      </FieldLabel>
      <textarea
        id={ids.fieldId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={`mt-1 block py-2.5 leading-snug ${CONTROL} ${borderFor(error)}`}
        {...input}
      />
      <FieldMessage error={error} hint={hint} errorId={ids.errorId} hintId={ids.hintId} />
    </div>
  );
}

/** Native <select> (best mobile picker) with a custom caret. `options` is `[{ value, label }]`. */
export function SelectField({ label, hint, error, required, id, options, placeholder, className = '', ...input }) {
  const ids = useFieldIds(id, error, hint);
  return (
    <div className={className}>
      <FieldLabel htmlFor={ids.fieldId} required={required}>
        {label}
      </FieldLabel>
      <div className="relative mt-1">
        <select
          id={ids.fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          className={`appearance-none pr-10 ${CONTROL} ${borderFor(error)}`}
          {...input}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <PiCaretDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mithila-muted"
        />
      </div>
      <FieldMessage error={error} hint={hint} errorId={ids.errorId} hintId={ids.hintId} />
    </div>
  );
}
