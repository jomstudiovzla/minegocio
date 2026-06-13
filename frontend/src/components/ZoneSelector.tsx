"use client";
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { zones } from '@/data/mockDb';
import { MapPin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ZoneSelector() {
  const { zone, setZone } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (zone !== 'San Luis El Cafetal') {
      setZone('San Luis El Cafetal');
    }
  }, [zone, setZone]);

  return null;
}
