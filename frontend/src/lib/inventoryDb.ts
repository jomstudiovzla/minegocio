/**
 * Mi Negocio — Inventario.
 *
 * Hay UN solo inventario: la colección `products` (stock de tienda,
 * `warehouseStock` de depósito y `providerPrice` de costo). Es lo que vende el
 * checkout y lo que edita el panel. La colección aparte `inventory` que este
 * archivo manejaba antes ya no se usa: tener dos inventarios hacía que el
 * panel y la tienda mostraran cifras distintas.
 *
 * Aquí quedan solo cálculos sobre esos productos, sin escribir en la base.
 */
import { availableStock } from './commerce';

export interface InventoryProduct {
  id: string;
  name: string;
  price: number;
  providerPrice?: number;
  stock?: number;
  warehouseStock?: number;
}

/** Por debajo de esto, la tienda repone sola desde depósito (ver applySale). */
export const LOW_STOCK_THRESHOLD = 5;

export interface InventorySummary {
  /** Unidades en tienda + depósito. */
  totalUnits: number;
  /** Lo que costó lo que hay (solo productos con costo cargado). */
  valueAtCost: number;
  /** Lo que se cobraría si se vendiera todo al precio actual. */
  valueAtPrice: number;
  /** Sin unidades ni en tienda ni en depósito. */
  outOfStock: InventoryProduct[];
  /** Quedan pocas unidades en total y ya no hay depósito que reponga. */
  lowStock: InventoryProduct[];
  /** Sin costo de proveedor: no entran en el cálculo de ganancia. */
  withoutCost: InventoryProduct[];
}

export function summarizeInventory(products: InventoryProduct[]): InventorySummary {
  const summary: InventorySummary = {
    totalUnits: 0,
    valueAtCost: 0,
    valueAtPrice: 0,
    outOfStock: [],
    lowStock: [],
    withoutCost: [],
  };
  for (const p of products) {
    const units = availableStock(p);
    summary.totalUnits += units;
    summary.valueAtPrice += units * (p.price || 0);
    if (p.providerPrice && p.providerPrice > 0) summary.valueAtCost += units * p.providerPrice;
    else summary.withoutCost.push(p);
    if (units === 0) summary.outOfStock.push(p);
    else if (units < LOW_STOCK_THRESHOLD) summary.lowStock.push(p);
  }
  summary.valueAtCost = Math.round(summary.valueAtCost * 100) / 100;
  summary.valueAtPrice = Math.round(summary.valueAtPrice * 100) / 100;
  return summary;
}

/** Margen sobre el precio de venta, en porcentaje. null si no hay costo cargado. */
export function marginPercent(p: Pick<InventoryProduct, 'price' | 'providerPrice'>): number | null {
  if (!p.providerPrice || p.providerPrice <= 0 || !(p.price > 0)) return null;
  return ((p.price - p.providerPrice) / p.price) * 100;
}
