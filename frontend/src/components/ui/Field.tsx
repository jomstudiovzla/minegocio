"use client";
import React, { useId } from 'react';
import { cn } from './cn';

const CONTROL =
  'w-full border border-gray-200 rounded-control px-4 py-3 bg-white transition ' +
  'focus:border-mi-blue aria-[invalid=true]:border-danger';

interface BaseProps {
  label?: string;
  /** Texto de ayuda bajo el campo. */
  hint?: string;
  /** Mensaje de error; pinta el borde y lo anuncia a lectores de pantalla. */
  error?: string;
  className?: string;
}

function Wrapper({ id, label, hint, error, children }: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-bold text-gray-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-xs font-bold text-danger">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

export interface FieldProps extends BaseProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {}

/** Campo de texto con etiqueta, ayuda y error, todo enlazado para lectores de pantalla. */
export function Field({ label, hint, error, className, id, ...rest }: FieldProps) {
  const auto = useId();
  const fid = id || auto;
  return (
    <Wrapper id={fid} label={label} hint={hint} error={error}>
      <input
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={cn(CONTROL, className)}
        {...rest}
      />
    </Wrapper>
  );
}

export interface SelectFieldProps extends BaseProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {}

/** Igual que Field pero para un desplegable. */
export function SelectField({ label, hint, error, className, id, children, ...rest }: SelectFieldProps) {
  const auto = useId();
  const fid = id || auto;
  return (
    <Wrapper id={fid} label={label} hint={hint} error={error}>
      <select
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={cn(CONTROL, className)}
        {...rest}
      >
        {children}
      </select>
    </Wrapper>
  );
}

export default Field;
