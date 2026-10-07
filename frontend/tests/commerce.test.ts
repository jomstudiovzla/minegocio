// Pruebas de las reglas de negocio. Ejecutar con:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applySale,
  availableStock,
  clubProgress,
  computeDeliveryFee,
  computePaypalFee,
  computeProfit,
  computeTotals,
  effectivePaymentStatus,
  clearSampleAdminSession,
  initialStatusFor,
  isAdminEmail,
  isPaidOrder,
  isSampleAdminLogin,
  isSafeRedirect,
  readSampleAdminSession,
  writeSampleAdminSession,
  isValidDeliveryDate,
  levelForPoints,
  normalizeCedula,
  normalizePhone,
  normalizeZone,
  todayISO,
  zoneHasDelivery,
} from '../src/lib/commerce.ts';

test('club: un solo criterio 0–199 Bronce, 200–499 Plata, 500+ Oro', () => {
  assert.equal(levelForPoints(0), 'Bronce');
  assert.equal(levelForPoints(199), 'Bronce');
  assert.equal(levelForPoints(200), 'Plata');
  assert.equal(levelForPoints(499), 'Plata');
  assert.equal(levelForPoints(500), 'Oro');
  assert.equal(levelForPoints(15000), 'Oro');
});

test('club: la barra usa el mismo criterio que el nivel', () => {
  const bronce = clubProgress(150);
  assert.deepEqual([bronce.level, bronce.next, bronce.nextAt, bronce.missing], ['Bronce', 'Plata', 200, 50]);
  assert.equal(bronce.percent, 75);
  const plata = clubProgress(350);
  assert.deepEqual([plata.level, plata.next, plata.nextAt, plata.missing], ['Plata', 'Oro', 500, 150]);
  const oro = clubProgress(900);
  assert.deepEqual([oro.level, oro.next, oro.percent], ['Oro', null, 100]);
});

test('envío: 2,50 USD, gratis desde 15 USD, retiro siempre 0', () => {
  assert.equal(computeDeliveryFee(14.99, 'delivery'), 2.5);
  assert.equal(computeDeliveryFee(15, 'delivery'), 0);
  assert.equal(computeDeliveryFee(3, 'pickup'), 0);
});

test('ejemplo de la auditoría: 18 USD por Pago Móvil a tasa 62,50 = Bs. 1.125,00', () => {
  const t = computeTotals({
    items: [{ price: 18, quantity: 1 }],
    shippingMethod: 'delivery',
    paymentMethod: 'pagomovil',
    availablePoints: 0,
    usePoints: false,
    rateUsd: 62.5,
  });
  assert.equal(t.subtotal, 18);
  assert.equal(t.deliveryFee, 0);
  assert.equal(t.total, 18);
  assert.equal(t.amountBs, 1125);
  assert.equal(t.pointsEarned, 18);
});

test('PayPal sobre 18 USD: (18 + 0,30) / 0,946 − 18 = 1,34 de comisión', () => {
  // La auditoría redondeó a 1,32; la fórmula que ella misma cita da 1,34.
  assert.equal(Math.round(computePaypalFee(18) * 100) / 100, 1.34);
  assert.equal(computePaypalFee(0), 0);
  const t = computeTotals({
    items: [{ price: 18, quantity: 1 }],
    shippingMethod: 'delivery',
    paymentMethod: 'paypal',
    availablePoints: 0,
    usePoints: false,
    rateUsd: 62.5,
  });
  assert.equal(t.paypalFee, 1.34);
  assert.equal(t.total, 19.34);
  // Los puntos se ganan sobre el total base, no sobre la comisión.
  assert.equal(t.pointsEarned, 18);
});

test('puntos: máximo 350 por pedido, nunca más que el saldo ni que el subtotal', () => {
  const base = { shippingMethod: 'pickup' as const, paymentMethod: 'cash' as const, usePoints: true, rateUsd: 60 };
  const many = computeTotals({ ...base, items: [{ price: 20, quantity: 1 }], availablePoints: 900 });
  assert.equal(many.pointsUsed, 350);
  assert.equal(many.discount, 3.5);
  assert.equal(many.total, 16.5);
  assert.equal(many.pointsEarned, 16);

  const few = computeTotals({ ...base, items: [{ price: 20, quantity: 1 }], availablePoints: 120 });
  assert.equal(few.pointsUsed, 120);
  assert.equal(few.discount, 1.2);

  const cheap = computeTotals({ ...base, items: [{ price: 1.25, quantity: 1 }], availablePoints: 900 });
  assert.equal(cheap.pointsUsed, 125);
  assert.equal(cheap.discount, 1.25);
  assert.equal(cheap.total, 0);

  const off = computeTotals({ ...base, usePoints: false, items: [{ price: 20, quantity: 1 }], availablePoints: 900 });
  assert.equal(off.pointsUsed, 0);
});

test('ningún método nace Facturado', () => {
  for (const m of ['pagomovil', 'zelle', 'transferencia', 'binance', 'paypal', 'creditcard', 'cash'] as const) {
    assert.notEqual(initialStatusFor(m).status, 'Facturado', m);
    assert.notEqual(initialStatusFor(m).paymentStatus, 'aprobado', m);
  }
  assert.deepEqual(initialStatusFor('cash'), { status: 'Procesando', paymentStatus: 'contra_entrega' });
  assert.deepEqual(initialStatusFor('pagomovil'), { status: 'En revisión', paymentStatus: 'en_revision' });
  assert.deepEqual(initialStatusFor('binance'), { status: 'En revisión', paymentStatus: 'en_revision' });
  assert.deepEqual(initialStatusFor('paypal'), { status: 'En revisión', paymentStatus: 'en_revision' });
  assert.deepEqual(initialStatusFor('creditcard'), { status: 'Pendiente de pago', paymentStatus: 'pendiente' });
});

test('stock: no se vende más de lo que hay y la tienda se repone desde depósito', () => {
  assert.equal(availableStock({ stock: 3, warehouseStock: 10 }), 13);
  assert.equal(applySale({ stock: 3, warehouseStock: 10 }, 14), null);
  assert.equal(applySale({ stock: 0, warehouseStock: 0 }, 1), null);
  assert.equal(applySale({ stock: 5 }, 0), null);

  // Queda en 8: no repone.
  assert.deepEqual(applySale({ stock: 10, warehouseStock: 50 }, 2), { stock: 8, warehouseStock: 50, transfer: 0 });
  // Baja de 5: repone hasta 15.
  assert.deepEqual(applySale({ stock: 6, warehouseStock: 50 }, 3), { stock: 15, warehouseStock: 38, transfer: 12 });
  // Pide más que la tienda pero hay depósito.
  assert.deepEqual(applySale({ stock: 3, warehouseStock: 300 }, 20), { stock: 15, warehouseStock: 268, transfer: 32 });
  // Se lleva todo.
  assert.deepEqual(applySale({ stock: 3, warehouseStock: 10 }, 13), { stock: 0, warehouseStock: 0, transfer: 10 });
});

test('stock: una venta baja el total exactamente en las unidades vendidas (lo exige la regla de Firestore)', () => {
  for (const [stock, warehouseStock, qty] of [[10, 50, 2], [6, 50, 3], [3, 300, 20], [3, 10, 13], [1, 0, 1]]) {
    const moved = applySale({ stock, warehouseStock }, qty)!;
    assert.equal(moved.stock + moved.warehouseStock, stock + warehouseStock - qty);
    assert.ok(moved.stock >= 0 && moved.warehouseStock >= 0);
  }
});

test('entrega: la fecha no puede ser anterior a hoy', () => {
  const now = new Date(2026, 9, 6, 14, 30);
  assert.equal(todayISO(now), '2026-10-06');
  assert.equal(isValidDeliveryDate('2026-10-05', now), false);
  assert.equal(isValidDeliveryDate('2026-10-06', now), true);
  assert.equal(isValidDeliveryDate('2026-11-01', now), true);
  assert.equal(isValidDeliveryDate('', now), false);
  assert.equal(isValidDeliveryDate('06/10/2026', now), false);
});

test('zonas: sin reparto solo retiro', () => {
  assert.equal(zoneHasDelivery('San Luis'), true);
  assert.equal(zoneHasDelivery('El Cafetal'), true);
  assert.equal(zoneHasDelivery('Otra zona de Caracas'), false);
  assert.equal(zoneHasDelivery('Marte'), false);
  assert.equal(normalizeZone('San Luis El Cafetal'), 'San Luis'); // valor viejo guardado en el navegador
  assert.equal(normalizeZone(null), 'San Luis');
});

test('registro: cédula V-/E-/J- y teléfono de 11 dígitos', () => {
  assert.equal(normalizeCedula('V-20111222'), 'V-20111222');
  assert.equal(normalizeCedula('v20111222'), 'V-20111222');
  assert.equal(normalizeCedula('J-12345678-9'), 'J-12345678-9');
  assert.equal(normalizeCedula('E 8.123.456'), 'E-8123456');
  assert.equal(normalizeCedula('20111222'), null);
  assert.equal(normalizeCedula('X-123'), null);

  assert.equal(normalizePhone('0414-5550101'), '04145550101');
  assert.equal(normalizePhone('+58 414 555 0101'), '04145550101');
  assert.equal(normalizePhone('4145550101'), '04145550101');
  assert.equal(normalizePhone('555-0101'), null);
});

test('login: solo se obedecen redirecciones internas', () => {
  assert.equal(isSafeRedirect('/checkout'), true);
  assert.equal(isSafeRedirect('https://malo.example'), false);
  assert.equal(isSafeRedirect('//malo.example'), false);
  assert.equal(isSafeRedirect(null), false);
});

test('admin: un solo correo', () => {
  assert.equal(isAdminEmail('JomStudioVzla@Gmail.com '), true);
  assert.equal(isAdminEmail('maria@correo.com'), false);
  assert.equal(isAdminEmail(null), false);
});

test('muestra: solo el usuario admin y la clave admin abren la sesión local', () => {
  assert.equal(isSampleAdminLogin('admin', 'admin'), true);
  assert.equal(isSampleAdminLogin(' Admin ', 'admin'), true);
  assert.equal(isSampleAdminLogin('ADMIN', 'admin'), true);
  assert.equal(isSampleAdminLogin('admin', 'Admin'), false);
  assert.equal(isSampleAdminLogin('admin', 'admin '), false);
  assert.equal(isSampleAdminLogin('admin@jomstudio.com', 'admin'), false);
  assert.equal(isSampleAdminLogin('otro', 'admin'), false);
});

test('muestra: la sesión local se guarda y se borra en este navegador', () => {
  const store = new Map<string, string>();
  const previous = globalThis.sessionStorage;
  globalThis.sessionStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  } as Storage;
  try {
    assert.equal(readSampleAdminSession(), false);
    writeSampleAdminSession();
    assert.equal(readSampleAdminSession(), true);
    clearSampleAdminSession();
    assert.equal(readSampleAdminSession(), false);
  } finally {
    globalThis.sessionStorage = previous;
  }
});

test('estadísticas: la ganancia sale del costo real, no de un 35 % fijo', () => {
  const r = computeProfit(
    [
      { id: 'a', price: 3.49, quantity: 10 }, // costo 2.10 → gana 13.90
      { id: 'b', price: 5, quantity: 2 },     // sin costo: no se inventa
    ],
    { a: 2.1, b: undefined },
  );
  assert.equal(r.revenue, 44.9);
  assert.equal(r.cost, 21);
  assert.equal(r.profit, 13.9);
  assert.equal(r.revenueWithoutCost, 10);
  assert.equal(r.linesWithoutCost, 1);
});

test('pedidos viejos sin paymentStatus se interpretan por su estado', () => {
  assert.equal(effectivePaymentStatus({ status: 'En revisión', paymentMethod: 'pagomovil' }), 'en_revision');
  assert.equal(effectivePaymentStatus({ status: 'Facturado', paymentMethod: 'zelle' }), 'aprobado');
  assert.equal(effectivePaymentStatus({ status: 'Procesando', paymentMethod: 'cash' }), 'contra_entrega');
  assert.equal(isPaidOrder({ status: 'Procesando', paymentMethod: 'cash' }), false);
  assert.equal(isPaidOrder({ status: 'Entregado', paymentStatus: 'aprobado', paymentMethod: 'cash' }), true);
  assert.equal(isPaidOrder({ status: 'Cancelado', paymentStatus: 'aprobado', paymentMethod: 'cash' }), false);
});
