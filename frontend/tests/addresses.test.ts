import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeText,
  validateAddress,
  upsertAddress,
  deleteAddress,
  markAsDefaultAddress,
  getDefaultAddress,
  MAX_SAVED_ADDRESSES,
  type UserAddress,
} from '../src/lib/addresses';

test('sanitiza texto: elimina etiquetas HTML y limita caracteres', () => {
  const dirty = '  <script>alert("hack")</script> Calle 4, Res. Los Pinos <b>Apto 2</b> ';
  const cleaned = sanitizeText(dirty, 100);
  assert.equal(cleaned.includes('<script>'), false);
  assert.equal(cleaned.includes('<b>'), false);
  assert.equal(cleaned, 'alert("hack") Calle 4, Res. Los Pinos Apto 2');

  const truncated = sanitizeText('1234567890', 5);
  assert.equal(truncated, '12345');
});

test('valida dirección: exige mínimo 8 caracteres y normaliza zona', () => {
  const invalid = validateAddress({ address: 'Corta' });
  assert.equal(invalid.valid, false);
  assert.match(invalid.error || '', /al menos 8 caracteres/);

  const valid = validateAddress({
    alias: 'Mi Casa',
    address: 'Urb. San Luis, Calle 3, Residencia Ávila',
    zone: 'San Luis',
    reference: 'Frente al parque',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized?.alias, 'Mi Casa');
  assert.equal(valid.sanitized?.zone, 'San Luis');
  assert.equal(valid.sanitized?.reference, 'Frente al parque');
});

test('upsertAddress: permite guardar al menos 3 direcciones y respeta el tope máximo', () => {
  let list: UserAddress[] = [];

  for (let i = 1; i <= 3; i++) {
    const res = upsertAddress(list, {
      id: `addr_${i}`,
      alias: `Dirección ${i}`,
      address: `Calle Falsa ${i}, Apto ${i}`,
      zone: 'San Luis',
      isDefault: i === 1,
    });
    assert.equal(res.success, true);
    list = res.addresses;
  }
  assert.equal(list.length, 3);

  // Agregar 4 y 5
  list = upsertAddress(list, { id: 'addr_4', alias: 'Dir 4', address: 'Calle 4, Apto 4', zone: 'El Cafetal' }).addresses;
  list = upsertAddress(list, { id: 'addr_5', alias: 'Dir 5', address: 'Calle 5, Apto 5', zone: 'El Cafetal' }).addresses;
  assert.equal(list.length, MAX_SAVED_ADDRESSES);

  // Intentar agregar una 6ta dirección debe ser rechazado
  const overflow = upsertAddress(list, {
    id: 'addr_6',
    alias: 'Dir 6',
    address: 'Calle 6, Apto 6',
    zone: 'El Cafetal',
  });
  assert.equal(overflow.success, false);
  assert.match(overflow.error || '', /máximo de 5 direcciones/);
});

test('markAsDefaultAddress y getDefaultAddress: maneja preferencia', () => {
  const list: UserAddress[] = [
    { id: '1', alias: 'Casa', address: 'Calle 1', zone: 'San Luis', isDefault: true },
    { id: '2', alias: 'Oficina', address: 'Calle 2', zone: 'El Cafetal', isDefault: false },
  ];

  const updated = markAsDefaultAddress(list, '2');
  assert.equal(updated.find(a => a.id === '1')?.isDefault, false);
  assert.equal(updated.find(a => a.id === '2')?.isDefault, true);

  const def = getDefaultAddress(updated);
  assert.equal(def?.id, '2');
});

test('deleteAddress: reasigna default si la eliminada era la preferida', () => {
  const list: UserAddress[] = [
    { id: '1', alias: 'Casa', address: 'Calle 1', zone: 'San Luis', isDefault: true },
    { id: '2', alias: 'Oficina', address: 'Calle 2', zone: 'El Cafetal', isDefault: false },
  ];

  const remaining = deleteAddress(list, '1');
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, '2');
  assert.equal(remaining[0].isDefault, true);
});
