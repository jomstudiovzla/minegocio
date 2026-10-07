'use client';

import { Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  ARRIVE,
  GESTURE_EVENT,
  cartFlight,
  chipAnchor,
  chipMotion,
  favoriteMotion,
  prefersReducedMotion,
  shareSlide,
  shouldFly,
  type Box,
  type GestureDetail,
  type GestureKind,
} from '@/lib/gestures';

interface LiveGesture {
  id: number;
  kind: GestureKind;
  image?: string;
  note?: string;
  from: Box;
  to?: Box;
}

let nextId = 1;

function nudgeCart(mode: 'land' | 'plus' | 'lighter') {
  const icon = document.querySelector<HTMLElement>('[data-cart-icon]');
  if (!icon) return;
  const reduced = prefersReducedMotion();
  if (reduced || mode === 'lighter') {
    icon.animate(
      [{ opacity: 1 }, { opacity: 0.4 }, { opacity: 1 }],
      { duration: mode === 'lighter' ? 220 : 180, easing: ARRIVE },
    );
    return;
  }
  const peak = mode === 'land' ? 1.28 : 1.12;
  icon.animate(
    [
      { transform: 'scale(1)' },
      { transform: `scale(${peak})`, offset: 0.45 },
      { transform: 'scale(1)' },
    ],
    { duration: mode === 'land' ? 280 : 200, easing: ARRIVE },
  );
}

function CartFlyer({ item, onDone }: { item: LiveGesture; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const fly = shouldFly(reduced, item.to);
    let anim: Animation;
    let duration = 280;
    if (fly && item.to) {
      const plan = cartFlight(item.from, item.to, {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      duration = plan.durationMs;
      anim = el.animate(
        [
          {
            transform: `translate(${plan.from.x}px, ${plan.from.y}px) translate(-50%, -50%) scale(1)`,
            opacity: 1,
          },
          {
            transform: `translate(${plan.arc.x}px, ${plan.arc.y}px) translate(-50%, -50%) scale(0.9)`,
            opacity: 1,
            offset: 0.42,
          },
          {
            transform: `translate(${plan.arc.x}px, ${plan.arc.y}px) translate(-50%, -50%) scale(0.9)`,
            opacity: 1,
            offset: 0.72,
          },
          {
            transform: `translate(${plan.to.x}px, ${plan.to.y}px) translate(-50%, -50%) scale(${plan.endScale})`,
            opacity: 0.15,
          },
        ],
        // Linear keeps the hold on the clock. ARRIVE finishes the path early.
        { duration: plan.durationMs, easing: 'linear', fill: 'forwards' },
      );
    } else {
      const from = item.from;
      const x = from.left + from.width / 2;
      const y = from.top + from.height / 2;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      anim = el.animate(
        [{ opacity: 0.15 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }],
        { duration: 280, easing: ARRIVE, fill: 'forwards' },
      );
    }
    anim.onfinish = () => {
      nudgeCart('land');
      done.current();
    };
    const timer = window.setTimeout(() => done.current(), duration + 80);
    return () => {
      anim.cancel();
      window.clearTimeout(timer);
    };
  }, [item]);

  const x = item.from.left + item.from.width / 2;
  const y = item.from.top + item.from.height / 2;

  return (
    <div
      ref={ref}
      className="absolute left-0 top-0 h-[4.5rem] w-[4.5rem] overflow-hidden rounded-2xl border-2 border-[#F8B808] bg-white shadow-[0_10px_18px_rgba(0,27,98,0.22)]"
      style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }}
    >
      {item.image ? (
        <img src={item.image} alt="" className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-lg font-black text-[#001b62]">+</span>
      )}
    </div>
  );
}

function ActionChip({ item, onDone }: { item: LiveGesture; onDone: () => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  const kind = item.kind as 'qty-up' | 'qty-down' | 'share' | 'line-out';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const anchor = chipAnchor(kind, item.from);
    const shareDx = shareSlide(anchor.x, window.innerWidth, reduced);
    const plan = chipMotion(kind, reduced, item.note, shareDx);
    const anim = el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.92)', opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.16 },
        {
          transform: `translate(calc(-50% + ${plan.dx * 0.35}px), calc(-50% + ${plan.dy * 0.35}px)) scale(1)`,
          opacity: 1,
          offset: 0.68,
        },
        {
          transform: `translate(calc(-50% + ${plan.dx}px), calc(-50% + ${plan.dy}px)) scale(1)`,
          opacity: 0,
        },
      ],
      { duration: plan.durationMs, easing: 'linear', fill: 'forwards' },
    );
    if (kind === 'qty-up') nudgeCart('plus');
    if (kind === 'line-out') nudgeCart('lighter');
    anim.onfinish = () => done.current();
    const timer = window.setTimeout(() => done.current(), plan.durationMs + 80);
    return () => {
      anim.cancel();
      window.clearTimeout(timer);
    };
  }, [item.from.left, item.from.width, item.note, kind]);

  const plan = chipMotion(kind, false, item.note);
  const anchor = chipAnchor(kind, item.from);
  const tone =
    kind === 'qty-up'
      ? 'bg-[#F8B808] text-[#001b62]'
      : kind === 'qty-down'
        ? 'bg-[#dce1ff] text-[#001b62]'
        : kind === 'share'
          ? item.note === 'fail'
            ? 'bg-[#7a5900] text-white'
            : 'bg-[#001b62] text-white'
          : 'bg-[#9f1239] text-white';

  return (
    <span
      ref={ref}
      className={`absolute left-0 top-0 whitespace-nowrap rounded-full border-2 border-[#001b62] px-3.5 py-2 text-base font-black shadow-[0_12px_22px_rgba(0,27,98,0.35)] ${tone}`}
      style={{ left: anchor.x, top: anchor.y }}
    >
      {plan.label}
    </span>
  );
}

function HeartBurst({ item, onDone }: { item: LiveGesture; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  const turningOn = item.kind === 'fav-on';

  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const plan = favoriteMotion(turningOn, prefersReducedMotion());
    const bits = Array.from(host.querySelectorAll<HTMLElement>('[data-bit]'));
    const anims = bits.map((bit, index) => {
      const angle = turningOn
        ? (index / Math.max(bits.length, 1)) * Math.PI * 2 - Math.PI / 2
        : -Math.PI / 2;
      const dx = plan.spatial ? Math.cos(angle) * plan.distance : 0;
      const dy = plan.spatial ? Math.sin(angle) * plan.distance : 0;
      return bit.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`,
            opacity: 1,
            offset: 0.28,
          },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`,
            opacity: 1,
            offset: 0.72,
          },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.8)`,
            opacity: 0,
          },
        ],
        { duration: plan.durationMs, easing: 'linear', fill: 'forwards' },
      );
    });
    const ring = host.querySelector<HTMLElement>('[data-ring]');
    if (ring && plan.spatial) {
      anims.push(ring.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0.9 },
          { transform: 'translate(-50%, -50%) scale(1.8)', opacity: 0 },
        ],
        { duration: plan.durationMs, easing: 'linear', fill: 'forwards' },
      ));
    }
    const last = anims[anims.length - 1];
    if (!last) {
      done.current();
      return;
    }
    last.onfinish = () => done.current();
    const timer = window.setTimeout(() => done.current(), plan.durationMs + 80);
    return () => {
      anims.forEach((anim) => anim.cancel());
      window.clearTimeout(timer);
    };
  }, [turningOn]);

  const plan = favoriteMotion(turningOn, prefersReducedMotion());
  const x = item.from.left + item.from.width / 2;
  const y = item.from.top + item.from.height / 2;

  return (
    <div ref={root}>
      {plan.spatial && turningOn && (
        <span
          data-ring=""
          className="absolute left-0 top-0 h-16 w-16 rounded-full border-4 border-[#F8B808]"
          style={{ left: x, top: y }}
        />
      )}
      {Array.from({ length: plan.count }, (_, index) => (
        <span
          key={index}
          data-bit=""
          className="absolute left-0 top-0"
          style={{ left: x, top: y }}
        >
          <span className={`flex items-center justify-center rounded-full shadow-[0_8px_16px_rgba(159,18,57,0.45)] ${turningOn ? 'h-9 w-9 bg-[#e11d48]' : 'h-8 w-8 bg-white'}`}>
            <Heart
              size={turningOn ? 18 : 16}
              className={turningOn ? 'fill-white text-white' : 'text-[#64748b]'}
            />
          </span>
        </span>
      ))}
    </div>
  );
}

function GesturePiece({ item, onDone }: { item: LiveGesture; onDone: () => void }) {
  if (item.kind === 'cart-add') return <CartFlyer item={item} onDone={onDone} />;
  if (item.kind === 'fav-on' || item.kind === 'fav-off') return <HeartBurst item={item} onDone={onDone} />;
  return <ActionChip item={item} onDone={onDone} />;
}

export default function GestureLayer() {
  const [items, setItems] = useState<LiveGesture[]>([]);

  useEffect(() => {
    const onGesture = (event: Event) => {
      const detail = (event as CustomEvent<GestureDetail>).detail;
      if (!detail?.from || !detail.kind) return;
      const id = nextId++;
      const live: LiveGesture = {
        id,
        kind: detail.kind,
        image: detail.image,
        note: detail.note,
        from: detail.from,
        to: detail.to,
      };
      setItems((current) => {
        const next = [...current, live];
        return next.length > 12 ? next.slice(next.length - 12) : next;
      });
    };
    window.addEventListener(GESTURE_EVENT, onGesture);
    return () => window.removeEventListener(GESTURE_EVENT, onGesture);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-visible" aria-hidden="true">
      {items.map((item) => (
        <GesturePiece key={item.id} item={item} onDone={() => setItems((current) => current.filter((row) => row.id !== item.id))} />
      ))}
    </div>
  );
}
