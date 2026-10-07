// La plantilla descargada debe volver a entrar igual. Ejecutar con:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {
  CSV_DELIMITER,
  CSV_HEADERS,
  TEMPLATE_ROWS,
  buildCatalogCsv,
  buildTemplateCsv,
  parseCatalogRows,
  parseNumber,
} from '../src/lib/catalogCsv.ts';

function read(csv: string) {
  // Mismas opciones que usa el panel al leer el archivo.
  return Papa.parse<Record<string, unknown>>(csv, { header: true, delimiter: CSV_DELIMITER, skipEmptyLines: true }).data;
}

test('la plantilla usa punto y coma y los encabezados acordados', () => {
  const firstLine = buildTemplateCsv().replace(/^\uFEFF/, '').split('\r\n')[0];
  assert.equal(firstLine, 'id;name;price;category;subcategory;image;unit;labels;description;providerPrice;stock;warehouseStock');
  assert.equal(firstLine, CSV_HEADERS.join(';'));
});

test('plantilla descargada y vuelta a subir: entra igual que salió', () => {
  const parsed = parseCatalogRows(read(buildTemplateCsv()));
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.wrongDelimiter, false);
  assert.equal(parsed.rows.length, TEMPLATE_ROWS.length);
  assert.deepEqual(parsed.rows[0], TEMPLATE_ROWS[0]);
  assert.equal(parsed.rows[1].providerPrice, 1.1);
  assert.equal(parsed.rows[1].labels, undefined);
});

test('textos con punto y coma, comillas y saltos de línea sobreviven', () => {
  const tricky = [{ ...TEMPLATE_ROWS[0], id: 'X-1', name: 'Queso "Paisa"; 500 g', description: 'Línea 1\nLínea 2' }];
  const parsed = parseCatalogRows(read(buildCatalogCsv(tricky)));
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.rows[0].name, 'Queso "Paisa"; 500 g');
  assert.equal(parsed.rows[0].description, 'Línea 1\nLínea 2');
});

test('un CSV separado por comas se detecta y no se carga a medias', () => {
  const commaCsv = 'id,name,price,category\np1,Tomates,3.49,frutas-vegetales\n';
  const parsed = parseCatalogRows(read(commaCsv));
  assert.equal(parsed.wrongDelimiter, true);
  assert.equal(parsed.rows.length, 0);
});

test('decimales con coma (Excel en español) y encabezados en español', () => {
  const csv = 'ID;Nombre;Precio;Categoría;Costo;Tienda;Depósito\nP9;Harina PAN;1,85;viveres;1,20;40;200\n';
  const parsed = parseCatalogRows(read(csv));
  assert.deepEqual(parsed.errors, []);
  assert.deepEqual(
    [parsed.rows[0].id, parsed.rows[0].price, parsed.rows[0].providerPrice, parsed.rows[0].stock, parsed.rows[0].warehouseStock],
    ['P9', 1.85, 1.2, 40, 200],
  );
  assert.equal(parseNumber('1.234,50'), 1234.5);
  assert.equal(parseNumber('1,234.50'), 1234.5);
  assert.equal(parseNumber(''), undefined);
});

test('filas inválidas se reportan con su número y no pasan', () => {
  const csv = 'id;name;price\nA1;;2\nA2;Arroz;0\nA2;Arroz repetido;3\n;Sin id;4\n';
  const parsed = parseCatalogRows(read(csv));
  assert.equal(parsed.errors.length, 4);
  assert.ok(parsed.errors[0].includes('Fila 2'));
  assert.ok(parsed.errors.some(e => e.includes('repetido')));
});
