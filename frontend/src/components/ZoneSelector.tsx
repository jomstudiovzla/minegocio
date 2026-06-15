"use client";
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function ZoneSelector() {
  const { zone, setZone } = useStore();

  useEffect(() => {
    if (zone !== 'San Luis El Cafetal') {
      setZone('San Luis El Cafetal');
    }
  }, [zone, setZone]);

  return null;
}
