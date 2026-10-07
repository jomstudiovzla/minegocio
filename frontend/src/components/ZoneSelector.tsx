"use client";
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { normalizeZone } from '@/lib/commerce';

/**
 * Mantiene una zona válida en el estado. La zona se elige en el checkout y se
 * guarda con el pedido; aquí solo se corrige un valor viejo o desconocido.
 */
export default function ZoneSelector() {
  const zone = useStore(state => state.zone);
  const setZone = useStore(state => state.setZone);

  useEffect(() => {
    const valid = normalizeZone(zone);
    if (zone !== valid) setZone(valid);
  }, [zone, setZone]);

  return null;
}
