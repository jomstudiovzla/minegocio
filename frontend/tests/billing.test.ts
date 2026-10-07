// Facturación: base e IVA con precios que ya incluyen el impuesto. Ejecutar con:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import { BILLING_DELIMITER, SALES_HEADERS, buildSalesExport, needsInvoice, normalizeInvoiceNumber, splitTax } from '../src/lib/billingExport.ts';

const order = {
  id: 'MINE-10000001',
  date: '6 de octubre de 2026',
  createdAt: Date.UTC(2026, 9, 6, 15, 0),
  status: 'Facturado',
  paymentStatus: 'aprobado',
  paymentMethod: 'pagomovil',
  reference: '9812',
  subtotal: 14.6,
  deliveryFee: 2.5,
  discount: 1,
  total: 16.1,
  paidAt: '2026-10-06T16:00:00.000Z',
  items: [
    { id: 'A', name: 'Refresco 2 L', price: 2.32, quantity: 5 }, // 11,60 al 16 %
    { id: 'B', name: 'Harina PAN', price: 1.5, quantity: 2 },    // 3,00 exento
  ],
  customerDetails: { name: 'María López', cedula: 'V-20111222' },
};

test('IVA incluido: 11,60 al 16 % son 10,00 de base y 1,60 de IVA', () => {
  assert.deepEqual(splitTax(11.6, 16), { base: 10, tax: 1.6 });
  assert.deepEqual(splitTax(3, 0), { base: 3, tax: 0 });
  assert.deepEqual(splitTax(10.8, 8), { base: 10, tax: 0.8 });
});

test('la exportación cuadra con lo cobrado y separa base e IVA', () => {
  const { csv, totals } = buildSalesExport([order], { A: 16, B: 0 });
  const rows = Papa.parse<Record<string, string>>(csv.replace(/^﻿/, ''), { header: true, delimiter: BILLING_DELIMITER, skipEmptyLines: true }).data;
  assert.deepEqual(Object.keys(rows[0]), [...SALES_HEADERS]);
  assert.equal(rows.length, 4); // 2 productos + envío + descuento
  assert.equal(rows[0].alicuota, '16%');
  assert.equal(rows[0].base, '10,00');
  assert.equal(rows[0].iva, '1,60');
  assert.equal(rows[1].alicuota, 'EXENTO');
  assert.equal(rows[2].codigo, 'ENVIO');
  assert.equal(rows[3].codigo, 'DESCUENTO');
  assert.equal(rows[3].importe, '-1,00');
  // 11,60 + 3,00 + 2,50 − 1,00 = 16,10 = total del pedido
  assert.equal(totals.gross, 16.1);
  assert.equal(totals.discounts, 1);
  assert.equal(totals.undefinedTaxLines, 0);
  // base: 10,00 + 3,00 + 2,16 (envío) ; IVA: 1,60 + 0,34
  assert.equal(totals.base, 15.16);
  assert.equal(totals.tax, 1.94);
});

test('un producto sin alícuota no recibe un IVA inventado', () => {
  const { csv, totals } = buildSalesExport([order], { A: undefined, B: 0 });
  assert.equal(totals.undefinedTaxLines, 1);
  assert.equal(totals.undefinedTaxGross, 11.6);
  assert.ok(csv.includes('SIN DEFINIR'));
});

test('por facturar = cobrado, no cancelado y sin número', () => {
  assert.equal(needsInvoice(order), true);
  assert.equal(needsInvoice({ ...order, invoice: { number: '00012345' } }), false);
  assert.equal(needsInvoice({ ...order, paymentStatus: 'en_revision' }), false);
  assert.equal(needsInvoice({ ...order, status: 'Cancelado' }), false);
});

test('número de factura: se limpia y se valida', () => {
  assert.equal(normalizeInvoiceNumber(' 00012345 '), '00012345');
  assert.equal(normalizeInvoiceNumber('a-00 123'), 'A-00123');
  assert.equal(normalizeInvoiceNumber(''), null);
  assert.equal(normalizeInvoiceNumber('factura #1'), null);
});
