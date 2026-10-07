"use client";
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

// Dirección "Abasto fresco": el amarillo es el color de la ACCIÓN principal
// (agregar, pagar, confirmar); el azul es la estructura y las acciones de apoyo.
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-mi-yellow text-mi-blue hover:brightness-95 active:scale-[0.98] shadow-[var(--shadow-card)]',
  secondary: 'bg-mi-blue text-white hover:bg-mi-blue-mid active:scale-[0.98]',
  danger: 'bg-danger text-white hover:brightness-110 active:scale-[0.98]',
  ghost: 'bg-transparent text-mi-blue hover:bg-mi-blue-low',
};

const SIZES: Record<Size, string> = {
  sm: 'text-sm px-3 py-2 gap-1.5',
  md: 'text-sm px-5 py-2.5 gap-2',
  lg: 'text-base px-6 py-3.5 gap-2',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Muestra un spinner y bloquea el botón mientras dura una acción. */
  loading?: boolean;
  /** Ocupa todo el ancho disponible. */
  block?: boolean;
}

/**
 * Botón único de la tienda. Un solo lugar define forma, color y foco, en vez de
 * 21 variantes repartidas por 23 archivos. El foco visible lo da globals.css.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, block = false, className, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-control font-bold transition',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

export default Button;
