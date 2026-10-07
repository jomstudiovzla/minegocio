'use client';

import { Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** Fill is the state. The scale only plays after the first paint, so a saved heart does not twitch on load. */
export default function FavoriteHeart({ on, size = 16 }: { on: boolean; size?: number }) {
  const seen = useRef(false);
  const [play, setPlay] = useState<{ dir: 'in' | 'out'; n: number } | null>(null);

  useEffect(() => {
    if (!seen.current) {
      seen.current = true;
      return;
    }
    setPlay((prev) => ({ dir: on ? 'in' : 'out', n: (prev?.n ?? 0) + 1 }));
  }, [on]);

  const motionClass = play?.dir === 'in' ? 'mn-heart-in' : play?.dir === 'out' ? 'mn-heart-out' : '';

  return (
    <span key={play?.n ?? 0} className={`inline-flex ${motionClass}`}>
      <Heart size={size} className={on ? 'fill-red-500 text-red-500' : ''} />
    </span>
  );
}
