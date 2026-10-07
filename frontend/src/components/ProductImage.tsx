"use client";
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  /** Agranda un poco la foto al pasar el cursor (tarjetas del catálogo). */
  zoom?: boolean;
  /** Aparece con una transición (ficha del producto). */
  fadeIn?: boolean;
  /** Tamaño del aviso cuando no hay foto. */
  size?: 'sm' | 'md';
}

/**
 * Foto de producto que no se rompe: si el archivo no existe muestra un aviso
 * neutro en vez del ícono de imagen rota del navegador. Revisa también las
 * fotos que fallaron antes de que React tomara control de la página.
 */
export default function ProductImage({ src, alt, className = '', zoom = false, fadeIn = false, size = 'md' }: ProductImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && src && img.complete && img.naturalWidth === 0) setFailedSrc(src);
  }, [src]);

  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={`${alt} (foto no disponible)`}
        className="z-10 flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400"
      >
        <ImageOff size={size === 'sm' ? 16 : 28} aria-hidden="true" />
        {size === 'md' && <span className="text-xs font-medium">Foto no disponible</span>}
      </div>
    );
  }

  return (
    <motion.img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(src)}
      whileHover={zoom ? { scale: 1.05 } : undefined}
      transition={zoom ? { duration: 0.3 } : undefined}
      initial={fadeIn ? { scale: 0.9, opacity: 0 } : false}
      animate={fadeIn ? { scale: 1, opacity: 1 } : undefined}
    />
  );
}
