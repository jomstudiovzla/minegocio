"use client";
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

// Este componente solo gestiona la sincronización de tasas de cambio (BCV).
// Los productos se cargan en tiempo real desde Firebase a través de FirebaseSync.tsx
export default function CatalogInitializer() {
  const { fetchRates } = useStore();

  useEffect(() => {
    // Obtener tasas actualizadas al montar
    fetchRates();

    // Actualizar cada 5 minutos
    const ratesInterval = setInterval(() => {
      fetchRates();
    }, 5 * 60 * 1000);

    return () => clearInterval(ratesInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
