"use client";
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { products as initialProducts } from '@/data/mockDb';

export default function CatalogInitializer() {
  const { products, setProducts, fetchRates } = useStore();

  useEffect(() => {
    // Fetch live currency exchange rates from BCV API
    fetchRates();

    const currentProducts = [...products];
    let hasChanges = false;

    initialProducts.forEach((ip) => {
      const exists = currentProducts.some((p) => p.id === ip.id);
      if (!exists) {
        currentProducts.push(ip);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setProducts(currentProducts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
