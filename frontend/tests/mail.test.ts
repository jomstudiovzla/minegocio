import assert from 'node:assert/strict';
import test from 'node:test';
import { adminRequestLetter, clientProcessLetter, findStockGaps, type MailOrder } from '../src/lib/mail';

const order: MailOrder = {
  id: 'MINE-48219377',
  uid: 'uid-maria',
  status: 'Facturado',
  items: [
    { id: 'huevos', name: 'Huevos cartón x 30', quantity: 1, price: 7, unit: '1 Unidad' },
    { id: 'polar', name: 'Cerveza Polar lata', quantity: 6, price: 1, unit: '1 Unidad' },
  ],
  subtotal: 13,
  deliveryFee: 0,
  discount: 0,
  total: 13,
  paymentMethod: 'pagomovil',
  paymentStatus: 'aprobado',
  reference: '9812',
  amountBs: 812.5,
  rateUsd: 62.5,
  shippingMethod: 'delivery',
  zone: 'San Luis',
  address: 'Calle 3',
  deliveryDate: '2026-10-07',
  deliveryTime: 'tarde',
  invoice: { number: '00012345', controlNumber: '00-0012345', date: '2026-10-06' },
  customerDetails: {
    name: 'María',
    email: 'maria@ejemplo.com',
    phone: '04141234567',
    cedula: 'V-20111222',
  },
};

const catalog = [
  { id: 'huevos', name: 'Huevos cartón x 30', subcategory: 'Charcutería', stock: 10, warehouseStock: 0 },
  { id: 'polar', name: 'Cerveza Polar lata', subcategory: 'Cervezas', stock: 2, warehouseStock: 0 },
  { id: 'solera', name: 'Cerveza Solera lata', subcategory: 'Cervezas', stock: 8, warehouseStock: 0 },
  { id: 'cardenal', name: 'Cerveza Cardenal lata', subcategory: 'Cervezas', stock: 9, warehouseStock: 0 },
  { id: 'vino', name: 'Vino tinto', subcategory: 'Vinos', stock: 4, warehouseStock: 0 },
];

test('la carta del cliente lleva líneas, bolívares y número de factura', () => {
  const letter = clientProcessLetter(order, 'Pago aprobado', 'Ya lo estamos preparando.', 'maria@ejemplo.com');
  assert.equal(letter.kind, 'cliente_pedido');
  assert.equal(letter.to, 'maria@ejemplo.com');
  assert.match(letter.text, /Huevos cartón x 30 × 1/);
  assert.match(letter.text, /Bs\. 812\.50/);
  assert.match(letter.text, /Número: 00012345/);
  assert.match(letter.text, /Control: 00-0012345/);
  assert.match(letter.text, /San Luis/);
});

test('sin huecos, el almacén dice que todo está bien', () => {
  const full = {
    ...order,
    items: [{ id: 'huevos', name: 'Huevos cartón x 30', quantity: 1, price: 7 }],
  };
  const letter = adminRequestLetter(full, catalog, 'revisar', '');
  assert.equal(letter.to, 'admin@jomstudio.com');
  assert.match(letter.text, /Todo está bien/);
  assert.equal(findStockGaps(full, catalog).length, 0);
});

test('si falta stock, ofrece dos cambios de la misma subcategoría', () => {
  const gaps = findStockGaps(order, catalog);
  assert.equal(gaps.length, 1);
  assert.deepEqual(gaps[0].options, ['Cerveza Solera lata', 'Cerveza Cardenal lata']);
  const letter = adminRequestLetter(order, catalog, 'revisar', '¿pueden cambiar la polar?');
  assert.match(letter.text, /Falta esto en el almacén/);
  assert.match(letter.text, /Se puede cambiar por Cerveza Solera lata o por Cerveza Cardenal lata/);
  assert.match(letter.text, /¿pueden cambiar la polar\?/);
  assert.doesNotMatch(letter.text, /Vino tinto/);
});

test('la devolución no ofrece cambios y nombra el reembolso', () => {
  const letter = adminRequestLetter(order, catalog, 'devolucion', 'Llegó dañado');
  assert.match(letter.subject, /devolución/);
  assert.match(letter.text, /Solicita la devolución/);
  assert.match(letter.text, /reembolsado/);
  assert.match(letter.text, /Llegó dañado/);
  assert.doesNotMatch(letter.text, /Todo está bien/);
});

test('un catálogo vacío no se lee como stock cero', () => {
  const unread = adminRequestLetter(order, [], 'revisar', '');
  assert.match(unread.text, /No pude leer el catálogo/);
  assert.doesNotMatch(unread.text, /Falta esto en el almacén/);
  assert.doesNotMatch(unread.text, /Todo está bien/);
  const checked = adminRequestLetter(order, null, 'revisar', '');
  assert.match(checked.text, /Todo está bien/);
});
