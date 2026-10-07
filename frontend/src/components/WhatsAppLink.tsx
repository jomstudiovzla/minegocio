"use client";
import type { ReactNode } from 'react';
import { useStore } from '@/store/useStore';
import { businessWhatsappLink } from '@/lib/paymentConfig';

/**
 * Botón de WhatsApp del negocio. El número sale del panel (Cobros → Datos del negocio).
 * Si todavía no hay un número real cargado no se muestra nada: mejor sin botón
 * que con un botón que escribe a un número de relleno.
 */
export default function WhatsAppLink({ text, className, children, fallback = null }: {
  text?: string;
  className?: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const config = useStore(state => state.paymentConfig);
  const href = businessWhatsappLink(config, text);
  if (!href) return <>{fallback}</>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
