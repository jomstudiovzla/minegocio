// Almacén: conteo físico y ajustes. Ejecutar con:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import { COUNT_DELIMITER, applyAdjustment, buildCountSheet, compareCount, parseCountRows } from '../src/lib/stockCount.ts';

const catalog = [
  { id: 'PRD-001', name: 'Harina PAN', stock: 12, warehouseStock: 100 },
  { id: 'PRD-002', name: 'Arroz', stock: 5, warehouseStock: 0 },
  { id: 'PRD-003', name: 'Aceite; 1 L', stock: 0, warehouseStock: 40 },
];

function read(csv: string) {
  return Papa.parse<Record<string, unknown>>(csv, { header: true, delimiter: COUNT_DELIMITER, skipEmptyLines: true }).data;
}

test('la hoja de conteo descargada, sin tocar, no produce ninguna diferencia', () => {
  const parsed = parseCountRows(read(buildCountSheet(catalog)));
  assert.deepEqual(parsed.errors, []);
  const result = compareCount(catalog, parsed.rows);
  assert.equal(result.differences.length, 0);
  assert.equal(result.matching, 3);
  assert.equal(result.notCounted, 0);
});

test('un conteo distinto muestra la diferencia antes de aplicar nada', () => {
  const result = compareCount(catalog, [
    { id: 'PRD-001', stock: 10, warehouseStock: 100 }, // faltan 2 en tienda
    { id: 'PRD-002', stock: 5, warehouseStock: 0 },    // coincide
    { id: 'ZZZ-999', stock: 3 },                       // no existe en la página
  ]);
  assert.equal(result.matching, 1);
  assert.deepEqual(result.unknownIds, ['ZZZ-999']);
  assert.equal(result.notCounted, 1); // PRD-003 no vino en el archivo y no se toca
  assert.equal(result.differences.length, 1);
  assert.deepEqual(
    [result.differences[0].id, result.differences[0].deltaStock, result.differences[0].deltaWarehouse],
    ['PRD-001', -2, 0],
  );
});

test('archivo del sistema de facturación: columnas codigo;existencia, sin depósito', () => {
  const parsed = parseCountRows(read('Codigo;Descripcion;Existencia\nPRD-002;Arroz;9\nPRD-003;Aceite;0\n'));
  assert.deepEqual(parsed.errors, []);
  const result = compareCount(catalog, parsed.rows);
  // El depósito no viene en el archivo: se conserva el de la página.
  const arroz = result.differences.find(d => d.id === 'PRD-002')!;
  assert.deepEqual([arroz.countedStock, arroz.countedWarehouse, arroz.deltaStock], [9, 0, 4]);
  assert.equal(result.differences.find(d => d.id === 'PRD-003'), undefined);
});

test('filas sin código, repetidas o sin cantidad se rechazan con su número', () => {
  const parsed = parseCountRows(read('id;stock\n;4\nA;3\nA;5\nB;\n'));
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.errors.length, 3);
  assert.ok(parsed.errors[0].includes('Fila 2'));
});

test('ajustes: entrada suma, venta y merma restan, conteo fija el número', () => {
  const p = { stock: 10, warehouseStock: 50 };
  assert.deepEqual(applyAdjustment(p, 'entrada', 'deposito', 24), { stock: 10, warehouseStock: 74, deltaStock: 0, deltaWarehouse: 24 });
  assert.deepEqual(applyAdjustment(p, 'venta_tienda', 'tienda', 3), { stock: 7, warehouseStock: 50, deltaStock: -3, deltaWarehouse: 0 });
  assert.deepEqual(applyAdjustment(p, 'merma', 'tienda', 10), { stock: 0, warehouseStock: 50, deltaStock: -10, deltaWarehouse: 0 });
  assert.deepEqual(applyAdjustment(p, 'conteo', 'tienda', 8), { stock: 8, warehouseStock: 50, deltaStock: -2, deltaWarehouse: 0 });
  assert.deepEqual(applyAdjustment(p, 'conteo', 'tienda', 0), { stock: 0, warehouseStock: 50, deltaStock: -10, deltaWarehouse: 0 });
});

test('ajustes: nunca dejan el stock en negativo ni aceptan cantidades raras', () => {
  const p = { stock: 2, warehouseStock: 0 };
  assert.equal(applyAdjustment(p, 'venta_tienda', 'tienda', 3), null);
  assert.equal(applyAdjustment(p, 'merma', 'deposito', 1), null);
  assert.equal(applyAdjustment(p, 'entrada', 'tienda', 0), null);
  assert.equal(applyAdjustment(p, 'entrada', 'tienda', -5), null);
  assert.equal(applyAdjustment(p, 'entrada', 'tienda', 1.5), null);
});
