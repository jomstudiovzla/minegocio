/**
 * Mi Negocio — Conteo físico y existencias del sistema de facturación (puro, sin Firebase).
 *
 * Sirve para comparar lo que dice la página con lo que hay en el almacén o con
 * lo que exporta el sistema administrativo, ANTES de cambiar nada: primero se
 * muestran las diferencias y solo después el empleado decide aplicarlas.
 *
 * Sin dependencias, para poder probarse con `node --test`.
 */

export const COUNT_DELIMITER = ';';
export const COUNT_HEADERS = ['id', 'name', 'stock', 'warehouseStock'] as const;

export type MovementType = 'entrada' | 'venta_tienda' | 'merma' | 'conteo' | 'importacion';

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  entrada: 'Entrada de mercancía',
  venta_tienda: 'Venta en tienda física',
  merma: 'Merma o daño',
  conteo: 'Conteo físico',
  importacion: 'Existencias del sistema',
};

export interface CountRow {
  id: string;
  /** Unidades en tienda. undefined = el archivo no trae ese dato y no se toca. */
  stock?: number;
  /** Unidades en depósito. undefined = no se toca. */
  warehouseStock?: number;
}

export interface CountProduct {
  id: string;
  name: string;
  stock?: number;
  warehouseStock?: number;
}

export interface CountDifference {
  id: string;
  name: string;
  webStock: number;
  webWarehouse: number;
  countedStock: number;
  countedWarehouse: number;
  /** Positivo: en el almacén hay más de lo que dice la página. Negativo: hay menos. */
  deltaStock: number;
  deltaWarehouse: number;
}

export interface CountComparison {
  /** Productos cuyo número cambia. */
  differences: CountDifference[];
  /** Filas del archivo que coinciden con la página. */
  matching: number;
  /** Códigos del archivo que no existen en el catálogo de la página. */
  unknownIds: string[];
  /** Productos del catálogo que el archivo no menciona. No se tocan. */
  notCounted: number;
}

const STOCK_ALIASES = ['stock', 'tienda', 'existencia', 'existencias', 'cantidad', 'cantidad_tienda', 'disponible'];
const WAREHOUSE_ALIASES = ['warehousestock', 'warehouse_stock', 'deposito', 'depósito', 'almacen', 'almacén', 'cantidad_deposito'];
const ID_ALIASES = ['id', 'codigo', 'código', 'sku', 'id_producto', 'cod', 'referencia'];

function toUnits(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, Math.round(value)) : undefined;
  let text = String(value).trim().replace(/\s/g, '');
  if (text === '') return undefined;
  if (text.includes(',') && text.includes('.')) {
    text = text.lastIndexOf(',') > text.lastIndexOf('.') ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
  } else if (text.includes(',')) {
    text = text.replace(',', '.');
  }
  const n = Number(text);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : undefined;
}

/** Lee las filas del archivo de conteo. Acepta encabezados en español o inglés. */
export function parseCountRows(data: Record<string, unknown>[]): { rows: CountRow[]; errors: string[] } {
  const rows: CountRow[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  data.forEach((raw, i) => {
    const line = i + 2;
    const keys = Object.keys(raw);
    const pick = (aliases: string[]) => {
      const key = keys.find(k => aliases.includes(k.toLowerCase().trim().replace(/^﻿/, '')));
      return key ? raw[key] : undefined;
    };
    const id = String(pick(ID_ALIASES) ?? '').trim();
    if (!id) {
      errors.push(`Fila ${line}: falta el código del producto`);
      return;
    }
    if (seen.has(id)) {
      errors.push(`Fila ${line}: el código "${id}" está repetido`);
      return;
    }
    seen.add(id);
    const stock = toUnits(pick(STOCK_ALIASES));
    const warehouseStock = toUnits(pick(WAREHOUSE_ALIASES));
    if (stock === undefined && warehouseStock === undefined) {
      errors.push(`Fila ${line} (${id}): no trae cantidad de tienda ni de depósito`);
      return;
    }
    rows.push({ id, stock, warehouseStock });
  });

  return { rows, errors };
}

/** Compara el archivo con el catálogo. No modifica nada. */
export function compareCount(products: CountProduct[], rows: CountRow[]): CountComparison {
  const byId = new Map(products.map(p => [p.id, p]));
  const differences: CountDifference[] = [];
  const unknownIds: string[] = [];
  let matching = 0;

  for (const row of rows) {
    const product = byId.get(row.id);
    if (!product) {
      unknownIds.push(row.id);
      continue;
    }
    const webStock = product.stock || 0;
    const webWarehouse = product.warehouseStock || 0;
    const countedStock = row.stock ?? webStock;
    const countedWarehouse = row.warehouseStock ?? webWarehouse;
    if (countedStock === webStock && countedWarehouse === webWarehouse) {
      matching += 1;
      continue;
    }
    differences.push({
      id: product.id,
      name: product.name,
      webStock,
      webWarehouse,
      countedStock,
      countedWarehouse,
      deltaStock: countedStock - webStock,
      deltaWarehouse: countedWarehouse - webWarehouse,
    });
  }

  differences.sort((a, b) => Math.abs(b.deltaStock) + Math.abs(b.deltaWarehouse) - (Math.abs(a.deltaStock) + Math.abs(a.deltaWarehouse)));
  const counted = new Set(rows.map(r => r.id));
  const notCounted = products.filter(p => !counted.has(p.id)).length;
  return { differences, matching, unknownIds, notCounted };
}

function cell(value: unknown): string {
  if (value === undefined || value === null) return '';
  const text = String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Hoja para contar: lleva lo que dice la página hoy; el empleado corrige los números y la sube. */
export function buildCountSheet(products: CountProduct[]): string {
  const lines = [COUNT_HEADERS.join(COUNT_DELIMITER)];
  for (const p of [...products].sort((a, b) => a.name.localeCompare(b.name, 'es'))) {
    lines.push([p.id, p.name, p.stock || 0, p.warehouseStock || 0].map(cell).join(COUNT_DELIMITER));
  }
  return '﻿' + lines.join('\r\n') + '\r\n';
}

/**
 * Resultado de un ajuste manual. `quantity` siempre es positiva; el tipo decide el signo.
 * Devuelve null si el ajuste dejaría el stock en negativo.
 */
export function applyAdjustment(
  current: { stock?: number; warehouseStock?: number },
  type: MovementType,
  place: 'tienda' | 'deposito',
  quantity: number,
): { stock: number; warehouseStock: number; deltaStock: number; deltaWarehouse: number } | null {
  if (!Number.isFinite(quantity) || quantity < 0 || !Number.isInteger(quantity)) return null;
  const stock = current.stock || 0;
  const warehouseStock = current.warehouseStock || 0;
  const before = place === 'tienda' ? stock : warehouseStock;

  let after: number;
  if (type === 'entrada') after = before + quantity;
  else if (type === 'venta_tienda' || type === 'merma') after = before - quantity;
  else after = quantity; // conteo / importación: la cantidad ES el número nuevo

  if ((type === 'entrada' || type === 'venta_tienda' || type === 'merma') && quantity === 0) return null;
  if (after < 0) return null;

  const next = place === 'tienda' ? { stock: after, warehouseStock } : { stock, warehouseStock: after };
  return { ...next, deltaStock: next.stock - stock, deltaWarehouse: next.warehouseStock - warehouseStock };
}
