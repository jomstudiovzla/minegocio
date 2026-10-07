/** Motion plans for catalog actions. Geometry only: the layer paints them. */

export const GESTURE_EVENT = 'mn-gesture';

/** Confident arrival. Not a bounce and not an elastic curve. */
export const ARRIVE = 'cubic-bezier(0.16, 1, 0.3, 1)';

export type GestureKind =
  | 'cart-add'
  | 'qty-up'
  | 'qty-down'
  | 'fav-on'
  | 'fav-off'
  | 'share'
  | 'line-out';

export type Travel =
  | 'arc-to-cart'
  | 'rise'
  | 'fall'
  | 'burst'
  | 'lift'
  | 'slide-right'
  | 'drop';

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface FlightPlan {
  from: Point;
  to: Point;
  arc: Point;
  durationMs: number;
  endScale: number;
}

export interface ChipPlan {
  dx: number;
  dy: number;
  durationMs: number;
  label: string;
}

export interface FavoritePlan {
  count: number;
  distance: number;
  durationMs: number;
  spatial: boolean;
}

export interface GestureDetail {
  kind: GestureKind;
  image?: string;
  note?: string;
  from?: Box;
  to?: Box;
}

const CHIP_TRAVEL = {
  'qty-up': { dx: 0, dy: -36, durationMs: 520, label: '+1' },
  'qty-down': { dx: 0, dy: 28, durationMs: 380, label: '−1' },
  share: { dx: 42, dy: 0, durationMs: 720, label: 'Enlace copiado' },
  'line-out': { dx: 0, dy: 36, durationMs: 560, label: 'Quitado' },
} as const;

const FLYER_HALF = 36;
const VIEW_PAD = 20;
const CLIPBOARD_DEADLINE_MS = 400;

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

export function boxCenter(box: Box): Point {
  return {
    x: box.left + box.width / 2,
    y: box.top + box.height / 2,
  };
}

/**
 * Photo arc from the shelf to the cart icon.
 * Without a viewport the arc clears the higher point.
 * With a viewport, a navbar cart cannot lift off-screen: the bow stays in the open band.
 */
export function cartFlight(fromBox: Box, toBox: Box, viewport?: Viewport): FlightPlan {
  const from = boxCenter(fromBox);
  const to = boxCenter(toBox);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const lift = Math.min(96, Math.max(28, distance * 0.22));
  let arcX = from.x + dx * 0.45;
  let arcY = Math.min(from.y, to.y) - lift;

  if (viewport && viewport.width > 0 && viewport.height > 0) {
    const minX = FLYER_HALF + VIEW_PAD;
    const maxX = Math.max(minX, viewport.width - FLYER_HALF - VIEW_PAD);
    const minY = FLYER_HALF + VIEW_PAD;
    const maxY = Math.max(minY, viewport.height - FLYER_HALF - VIEW_PAD);
    const navClear = 112;
    // A first-row photo has almost no sky under the navbar. A 24px gap still
    // parks the arc inside the header, so require a real band before bowing up.
    const minSky = 140;
    arcX = clamp(arcX, minX, maxX);
    if (arcY < navClear) {
      const lower = Math.max(from.y, to.y);
      const gapTop = Math.max(minY, navClear);
      const gapBottom = lower - FLYER_HALF * 2;
      if (gapBottom > gapTop + minSky) {
        const side = from.x < viewport.width / 2 ? 80 : -80;
        arcX = clamp(arcX + side, minX, maxX);
        arcY = gapTop + (gapBottom - gapTop) * 0.45;
      } else {
        const dip = Math.min(150, Math.max(100, distance * 0.18));
        arcX = clamp(from.x + dx * 0.5, minX, maxX);
        arcY = clamp(lower + dip, minY, maxY);
      }
    } else {
      arcY = clamp(arcY, minY, maxY);
    }
  }

  return {
    from,
    to,
    arc: { x: arcX, y: arcY },
    durationMs: Math.round(Math.min(680, Math.max(420, 380 + distance * 0.25))),
    endScale: 0.22,
  };
}

/** A flight needs a real cart target and permission to move across the screen. */
export function shouldFly(reduced: boolean, target: Box | null | undefined): boolean {
  return !reduced && !!target && target.width > 0 && target.height > 0;
}

export function chipMotion(
  kind: 'qty-up' | 'qty-down' | 'share' | 'line-out',
  reduced: boolean,
  note?: string,
  shareDx?: number,
): ChipPlan {
  const base = CHIP_TRAVEL[kind];
  const label = kind === 'share' && note === 'fail' ? 'No se pudo copiar' : base.label;
  if (reduced) return { dx: 0, dy: 0, durationMs: 180, label };
  const dx = kind === 'share' && typeof shareDx === 'number' ? shareDx : base.dx;
  return { dx, dy: base.dy, durationMs: base.durationMs, label };
}

/** Keep the share chip on screen: slide left when the control sits near the right edge. */
export function shareSlide(centerX: number, viewportWidth: number, reduced: boolean): number {
  if (reduced) return 0;
  return centerX > viewportWidth - 160 ? -42 : 42;
}

/** Sit the word off the product photo. A removal and a +1 rise above; a −1 starts just under the top edge. */
export function chipAnchor(kind: 'qty-up' | 'qty-down' | 'share' | 'line-out', box: Box): Point {
  const center = boxCenter(box);
  if (kind === 'qty-down') {
    return { x: center.x, y: Math.min(box.top + box.height - 8, box.top + 36) };
  }
  if (kind === 'line-out') return { x: center.x, y: Math.max(28, box.top - 56) };
  if (kind === 'qty-up') return { x: center.x, y: Math.max(28, box.top - 20) };
  return { x: center.x, y: Math.max(28, box.top - 16) };
}

export function favoriteMotion(turningOn: boolean, reduced: boolean): FavoritePlan {
  if (reduced) return { count: 1, distance: 0, durationMs: 180, spatial: false };
  if (!turningOn) return { count: 1, distance: 36, durationMs: 420, spatial: true };
  return { count: 6, distance: 78, durationMs: 760, spatial: true };
}

export function travelOf(kind: GestureKind): Travel {
  switch (kind) {
    case 'cart-add':
      return 'arc-to-cart';
    case 'qty-up':
      return 'rise';
    case 'qty-down':
      return 'fall';
    case 'fav-on':
      return 'burst';
    case 'fav-off':
      return 'lift';
    case 'share':
      return 'slide-right';
    case 'line-out':
      return 'drop';
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function readBox(el: Element | null): Box | null {
  if (!el || typeof el.getBoundingClientRect !== 'function') return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}

export function emitGesture(detail: GestureDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<GestureDetail>(GESTURE_EVENT, { detail }));
}

export function emitCartAdd(source: Element | null, image: string): void {
  const from = readBox(source);
  if (!from || typeof document === 'undefined') return;
  const to = readBox(document.querySelector('[data-cart-target]')) ?? undefined;
  emitGesture({ kind: 'cart-add', image, from, to });
}

export function emitCartAddFromCard(source: Element, image: string): void {
  const card = source.closest('[data-product-card]');
  const photo = card?.querySelector('[data-product-photo]') ?? null;
  emitCartAdd(photo ?? source, image);
}

export function emitFavorite(source: Element | null, turningOn: boolean): void {
  const from = readBox(source);
  if (!from) return;
  emitGesture({ kind: turningOn ? 'fav-on' : 'fav-off', from });
}

function cardOrSelf(source: Element | null): Box | null {
  const card = source?.closest?.('[data-product-card]') ?? null;
  return readBox(card ?? source);
}

export function emitQty(source: Element | null, up: boolean): void {
  const from = cardOrSelf(source);
  if (!from) return;
  emitGesture({ kind: up ? 'qty-up' : 'qty-down', from });
}

export function emitLineOut(source: Element | null): void {
  const from = cardOrSelf(source);
  if (!from) return;
  emitGesture({ kind: 'line-out', from });
}

function clipboardDeadline(task: Promise<void>, ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('clipboard-timeout')), ms);
    task.then(
      () => {
        clearTimeout(timer);
        resolve();
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Same-turn fallback when the async clipboard API rejects or never settles. */
function copyWithTextarea(url: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false;
  const area = document.createElement('textarea');
  area.value = url;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '0';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.focus();
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export async function copyProductLink(productId: string, source: Element | null): Promise<void> {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const url = `${origin}/product/${encodeURIComponent(productId)}`;
  const from = readBox(source);
  let note: 'ok' | 'fail' = 'fail';
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await clipboardDeadline(navigator.clipboard.writeText(url), CLIPBOARD_DEADLINE_MS);
      note = 'ok';
    }
  } catch {
    note = 'fail';
  }
  if (note === 'fail' && copyWithTextarea(url)) note = 'ok';
  if (from) emitGesture({ kind: 'share', from, note });
}
