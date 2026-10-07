"use client";
import React from 'react';
import { cn } from './cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Relleno interno. 'none' para controlarlo tú. */
  pad?: 'none' | 'sm' | 'md' | 'lg';
  /** Resalta la tarjeta con un poco más de sombra. */
  raised?: boolean;
}

const PAD = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' } as const;

/** Panel blanco estándar: mismo radio y sombra en toda la tienda. */
const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { pad = 'md', raised = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-card border border-gray-100',
        raised ? 'shadow-[var(--shadow-pop)]' : 'shadow-[var(--shadow-card)]',
        PAD[pad],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
