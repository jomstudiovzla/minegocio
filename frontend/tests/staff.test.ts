import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  accessLevelFor,
  canOperate,
  canManageCatalog,
  canManageStaff,
  canSeeTab,
} from '../src/lib/staff.ts';

test('el dueño tiene el nivel owner aunque no haya doc de staff', () => {
  assert.equal(accessLevelFor(true, null), 'owner');
  assert.equal(accessLevelFor(true, { role: 'empleado', active: true }), 'owner');
});

test('un empleado activo toma el rol de su documento', () => {
  assert.equal(accessLevelFor(false, { role: 'empleado', active: true }), 'empleado');
  assert.equal(accessLevelFor(false, { role: 'admin', active: true }), 'admin');
});

test('sin doc, o desactivado, no hay acceso', () => {
  assert.equal(accessLevelFor(false, null), null);
  assert.equal(accessLevelFor(false, { role: 'admin', active: false }), null);
});

test('operar lo puede cualquier nivel; gestionar personal solo el dueño', () => {
  for (const lvl of ['owner', 'admin', 'empleado'] as const) assert.equal(canOperate(lvl), true);
  assert.equal(canOperate(null), false);

  assert.equal(canManageCatalog('owner'), true);
  assert.equal(canManageCatalog('admin'), true);
  assert.equal(canManageCatalog('empleado'), false);

  assert.equal(canManageStaff('owner'), true);
  assert.equal(canManageStaff('admin'), false);
  assert.equal(canManageStaff('empleado'), false);
});

test('visibilidad de pestañas por nivel', () => {
  // Empleado: tareas del día, no catálogo ni personal.
  assert.equal(canSeeTab('empleado', 'orders'), true);
  assert.equal(canSeeTab('empleado', 'billing'), true);
  assert.equal(canSeeTab('empleado', 'inventory'), false);
  assert.equal(canSeeTab('empleado', 'rates'), false);
  assert.equal(canSeeTab('empleado', 'personal'), false);

  // Encargado: todo menos personal.
  assert.equal(canSeeTab('admin', 'inventory'), true);
  assert.equal(canSeeTab('admin', 'rates'), true);
  assert.equal(canSeeTab('admin', 'personal'), false);

  // Dueño: todo.
  assert.equal(canSeeTab('owner', 'personal'), true);
  assert.equal(canSeeTab('owner', 'inventory'), true);

  // Sin acceso: nada.
  assert.equal(canSeeTab(null, 'orders'), false);
});
