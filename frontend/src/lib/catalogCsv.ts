/**
 * Mi Negocio — CSV del catálogo.
 *
 * Una sola definición de separador y encabezados para la plantilla que se
 * descarga, la exportación y el lector. Así un archivo descargado y vuelto a
 * subir entra igual que salió.
 *
 * Sin dependencias: quien lo use le pasa las filas ya partidas por PapaParse.
 */

export const CSV_DELIMITER = ';';

export const CSV_HEADERS = [
  'id',
  'name',
  'price',
  'category',
  'subcategory',
  'image',
  'unit',
  'labels',
  'description',
  'providerPrice',
  'stock',
  'warehouseStock',
] as const;

export interface CatalogRow {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  image: string;
  unit: string;
  labels?: string[];
  description?: string;
  providerPrice?: number;
  stock?: number;
  warehouseStock?: number;
}

const ALIASES: Record<keyof CatalogRow, string[]> = {
  id: ['id', 'id_producto', 'sku'],
  name: ['name', 'nombre', 'title', 'titulo', 'título'],
  price: ['price', 'precio', 'venta', 'precio_venta'],
  category: ['category', 'categoria', 'categoría'],
  subcategory: ['subcategory', 'subcategoria', 'subcategoría'],
  image: ['image', 'imagen', 'foto', 'img'],
  unit: ['unit', 'unidad', 'medida'],
  labels: ['labels', 'etiquetas'],
  description: ['description', 'descripcion', 'descripción', 'desc'],
  providerPrice: ['providerprice', 'provider_price', 'cost', 'costo', 'precio_proveedor', 'precioproveedor'],
  stock: ['stock', 'cantidad', 'cantidad_tienda', 'tienda'],
  warehouseStock: ['warehousestock', 'warehouse_stock', 'deposito', 'depósito', 'cantidad_deposito', 'deposito_stock'],
};

/**
 * Convierte "3,49", "3.49", "1.234,50" o 3.49 en número.
 * Excel en español guarda los decimales con coma cuando el separador es punto y coma.
 */
export function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  let text = String(value).trim().replace(/[$\s]/g, '');
  if (text === '') return undefined;
  if (text.includes(',') && text.includes('.')) {
    // El último símbolo es el decimal: "1.234,50" o "1,234.50"
    text = text.lastIndexOf(',') > text.lastIndexOf('.')
      ? text.replace(/\./g, '').replace(',', '.')
      : text.replace(/,/g, '');
  } else if (text.includes(',')) {
    text = text.replace(',', '.');
  }
  const n = Number(text);
  return Number.isFinite(n) ? n : undefined;
}

function cleanText(value: unknown): string {
  return value === undefined || value === null ? '' : String(value).trim();
}

/** Lee una fila con encabezados en español o inglés y la deja tipada. */
export function mapCatalogRow(row: Record<string, unknown>): CatalogRow {
  const keys = Object.keys(row);
  const field = (name: keyof CatalogRow): unknown => {
    const match = keys.find(k => ALIASES[name].includes(k.toLowerCase().trim().replace(/^﻿/, '')));
    return match ? row[match] : undefined;
  };

  const labelsRaw = cleanText(field('labels'));
  const description = cleanText(field('description'));
  const stock = parseNumber(field('stock'));
  const warehouseStock = parseNumber(field('warehouseStock'));

  return {
    id: cleanText(field('id')),
    name: cleanText(field('name')),
    price: parseNumber(field('price')) ?? 0,
    category: cleanText(field('category')),
    subcategory: cleanText(field('subcategory')),
    image: cleanText(field('image')),
    unit: cleanText(field('unit')) || '1 Unidad',
    labels: labelsRaw ? labelsRaw.split('|').map(l => l.trim()).filter(Boolean) : undefined,
    description: description || undefined,
    providerPrice: parseNumber(field('providerPrice')),
    stock: stock === undefined ? undefined : Math.max(0, Math.round(stock)),
    warehouseStock: warehouseStock === undefined ? undefined : Math.max(0, Math.round(warehouseStock)),
  };
}

export interface ParsedCatalog {
  rows: CatalogRow[];
  errors: string[];
  /** true si el archivo no trae la columna id: casi siempre es un CSV separado por comas. */
  wrongDelimiter: boolean;
}

/** Valida las filas. No escribe nada: quien llama decide si sigue. */
export function parseCatalogRows(data: Record<string, unknown>[]): ParsedCatalog {
  const errors: string[] = [];
  const rows: CatalogRow[] = [];
  const seen = new Set<string>();

  const firstKeys = data.length ? Object.keys(data[0]) : [];
  const wrongDelimiter = firstKeys.length === 1 && firstKeys[0].includes(',');

  data.forEach((raw, i) => {
    const line = i + 2; // +1 por el encabezado, +1 porque las personas cuentan desde 1
    const row = mapCatalogRow(raw);
    if (!row.id) {
      errors.push(`Fila ${line}: falta el id`);
      return;
    }
    if (seen.has(row.id)) {
      errors.push(`Fila ${line}: el id "${row.id}" está repetido`);
      return;
    }
    seen.add(row.id);
    if (!row.name) errors.push(`Fila ${line} (${row.id}): nombre vacío`);
    if (!(row.price > 0)) errors.push(`Fila ${line} (${row.id}): precio inválido o menor/igual a 0`);
    if (row.providerPrice !== undefined && row.providerPrice < 0) errors.push(`Fila ${line} (${row.id}): costo negativo`);
    rows.push(row);
  });

  return { rows, errors, wrongDelimiter };
}

function escapeCell(value: unknown): string {
  if (value === undefined || value === null) return '';
  const text = String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Arma el CSV con los mismos encabezados y separador que espera el lector. */
export function buildCatalogCsv(rows: Partial<CatalogRow>[]): string {
  const lines = [CSV_HEADERS.join(CSV_DELIMITER)];
  for (const row of rows) {
    lines.push(
      CSV_HEADERS.map(h => {
        const value = row[h];
        if (h === 'labels') return escapeCell(Array.isArray(value) ? value.join('|') : value);
        return escapeCell(value);
      }).join(CSV_DELIMITER),
    );
  }
  // BOM para que Excel abra los acentos bien.
  return '﻿' + lines.join('\r\n') + '\r\n';
}

// Los códigos de ejemplo no coinciden con ningún producto real: subir la plantilla
// sin editar crea dos productos de muestra, no pisa nada del catálogo.
export const TEMPLATE_ROWS: CatalogRow[] = [
  {
    id: 'EJEMPLO-001',
    name: 'Tomates Perita',
    price: 3.49,
    category: 'frutas-vegetales',
    subcategory: 'Verduras y hortalizas',
    image: '/images/products/tomates_perita.png',
    unit: '1 Kg',
    labels: ['Oferta', 'Fresco'],
    description: 'Tomates frescos de calidad premium',
    providerPrice: 2.1,
    stock: 69,
    warehouseStock: 229,
  },
  {
    id: 'EJEMPLO-002',
    name: 'Lechosa',
    price: 1.75,
    category: 'frutas-vegetales',
    subcategory: 'Frutas',
    image: '/images/products/lechosa.png',
    unit: '1 Kg',
    description: 'Lechosa dulce y jugosa',
    providerPrice: 1.1,
    stock: 94,
    warehouseStock: 324,
  },
];

export function buildTemplateCsv(): string {
  return buildCatalogCsv(TEMPLATE_ROWS);
}
