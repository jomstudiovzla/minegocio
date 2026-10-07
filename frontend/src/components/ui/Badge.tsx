"use client";
import React from 'react';
import { cn } from './cn';

type Tone = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'brand';

const TONES: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  brand: 'bg-mi-yellow text-mi-yellow-on',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** Etiqueta corta de estado (pagado, agotado, en revisión…). */
export default function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-bold',
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
