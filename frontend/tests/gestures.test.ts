import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cartFlight,
  chipAnchor,
  chipMotion,
  favoriteMotion,
  shareSlide,
  shouldFly,
  travelOf,
  type GestureKind,
} from '../src/lib/gestures';

const shelf = { left: 100, top: 400, width: 80, height: 80 };
const cart = { left: 900, top: 20, width: 24, height: 24 };

test('the cart flight arcs above both ends and shrinks onto the icon', () => {
  const plan = cartFlight(shelf, cart);
  assert.equal(plan.from.x, 140);
  assert.equal(plan.from.y, 440);
  assert.equal(plan.to.x, 912);
  assert.equal(plan.to.y, 32);
  assert.ok(plan.arc.y < plan.from.y);
  assert.ok(plan.arc.y < plan.to.y);
  assert.ok(plan.arc.x > plan.from.x && plan.arc.x < plan.to.x);
  assert.ok(plan.durationMs >= 420 && plan.durationMs <= 680);
  assert.ok(plan.endScale < 0.4);
});

test('a flight toward the left still arcs, and short hops stay inside the duration clamp', () => {
  const back = cartFlight(cart, shelf);
  assert.ok(back.arc.x < back.from.x && back.arc.x > back.to.x);
  assert.ok(back.arc.y < Math.min(back.from.y, back.to.y));

  const hop = cartFlight(
    { left: 0, top: 0, width: 10, height: 10 },
    { left: 12, top: 8, width: 10, height: 10 },
  );
  assert.equal(hop.durationMs, 420);
  assert.ok(hop.arc.y <= Math.min(hop.from.y, hop.to.y) - 28);
});

test('each catalog action travels on its own axis', () => {
  const kinds: GestureKind[] = ['cart-add', 'qty-up', 'qty-down', 'fav-on', 'fav-off', 'share', 'line-out'];
  const travels = kinds.map(travelOf);
  assert.equal(new Set(travels).size, travels.length);

  const up = chipMotion('qty-up', false);
  const down = chipMotion('qty-down', false);
  const share = chipMotion('share', false);
  const gone = chipMotion('line-out', false);
  assert.ok(up.dy < 0 && up.dx === 0);
  assert.ok(down.dy > 0 && down.dx === 0);
  assert.ok(share.dx > 0 && share.dy === 0);
  assert.ok(gone.dy > 0 && gone.dx === 0);
  assert.notEqual(up.label, down.label);
  assert.notEqual(share.label, gone.label);
  assert.ok(down.durationMs < up.durationMs);
});

test('reduced motion keeps the word and drops the travel', () => {
  for (const kind of ['qty-up', 'qty-down', 'share', 'line-out'] as const) {
    const plan = chipMotion(kind, true, kind === 'share' ? 'fail' : undefined);
    assert.equal(plan.dx, 0);
    assert.equal(plan.dy, 0);
    assert.ok(plan.label.length > 0);
    assert.ok(plan.durationMs <= 180);
  }
  assert.equal(chipMotion('share', true, 'fail').label, 'No se pudo copiar');
  assert.equal(chipMotion('share', false).label, 'Enlace copiado');

  const quiet = favoriteMotion(true, true);
  assert.equal(quiet.spatial, false);
  assert.equal(quiet.distance, 0);
  assert.equal(quiet.count, 1);

  const saved = favoriteMotion(true, false);
  const removed = favoriteMotion(false, false);
  assert.equal(saved.count, 6);
  assert.equal(removed.count, 1);
  assert.ok(saved.distance > removed.distance);
  assert.equal(saved.spatial, true);
});

test('the photo flies only when a cart target exists and motion is allowed', () => {
  assert.equal(shouldFly(false, cart), true);
  assert.equal(shouldFly(true, cart), false);
  assert.equal(shouldFly(false, null), false);
  assert.equal(shouldFly(false, { left: 0, top: 0, width: 0, height: 24 }), false);
});

test('the share chip slides inward when the control is near the right edge', () => {
  assert.equal(shareSlide(200, 1200, false), 42);
  assert.equal(shareSlide(1100, 1200, false), -42);
  assert.equal(shareSlide(1100, 1200, true), 0);
});

test('a navbar cart keeps the flying photo inside the viewport', () => {
  const view = { width: 1280, height: 900 };
  const plan = cartFlight(shelf, cart, view);
  assert.ok(plan.arc.y >= 56 && plan.arc.y <= 900 - 56);
  assert.ok(plan.arc.x >= 56 && plan.arc.x <= 1280 - 56);
  assert.ok(plan.arc.y > plan.to.y);
  assert.ok(plan.arc.y < plan.from.y);

  const low = cartFlight(
    { left: 100, top: 600, width: 80, height: 80 },
    { left: 900, top: 500, width: 24, height: 24 },
    view,
  );
  assert.ok(low.arc.y < Math.min(low.from.y, low.to.y));
  assert.ok(low.arc.y >= 56);

  const firstRow = cartFlight(
    { left: 80, top: 150, width: 160, height: 120 },
    { left: 1000, top: 24, width: 40, height: 40 },
    view,
  );
  assert.ok(firstRow.arc.y > firstRow.from.y);
  assert.ok(firstRow.arc.y > 112);
  assert.ok(firstRow.arc.y <= 900 - 56);
  assert.ok(firstRow.arc.x > firstRow.from.x && firstRow.arc.x < firstRow.to.x);
});

test('quantity and removal words sit off the product photo', () => {
  const card = { left: 80, top: 300, width: 240, height: 420 };
  const up = chipAnchor('qty-up', card);
  const gone = chipAnchor('line-out', card);
  const down = chipAnchor('qty-down', card);
  assert.equal(up.x, 200);
  assert.ok(up.y < card.top);
  assert.ok(gone.y < card.top);
  assert.ok(down.y > card.top);
  assert.ok(gone.y < up.y);
});
