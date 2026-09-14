import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { warehouseImages } from '@/lib/warehouseImages';

type GalleryState = {
  key: string;
  index: number;
  previous: number;
  direction: 'left' | 'right' | null;
  offset: number;
  failed: number[];
  resolved: Record<number, string>;
};
const TRANSITION_MS = 240;
const initialState = (key: string): GalleryState => ({ key, index: 0, previous: 0, direction: null, offset: 0, failed: [], resolved: {} });

// Store URLs, not decoded Image objects. The browser owns the actual cache.
const preloaded = new Set<string>();
function preload(url: string) {
  if (preloaded.has(url)) return;
  preloaded.add(url);
  if (preloaded.size > 128) preloaded.delete(preloaded.values().next().value);
  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = 'low';
  image.onerror = () => { preloaded.delete(url); };
  image.src = url;
}

export function useWarehouseGallery(id: number, images: string[], fallbacks: (string | null)[], shouldPreload: boolean) {
  const frames = useMemo(() => warehouseImages(images, fallbacks), [images, fallbacks]);
  const key = JSON.stringify([id, frames]);
  const [stored, setState] = useState(() => initialState(key));
  // Route reuse/photo edits must not inherit the previous warehouse's failures.
  const state = stored.key === key ? stored : initialState(key);
  if (stored.key !== key) setState(state);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), [key]);
  const valid = frames.map((_, i) => i).filter(i => !state.failed.includes(i));
  const source = (i: number) => state.resolved[i] ?? frames[i]?.primary;

  const select = (index: number, direction: 'left' | 'right' = index > state.index ? 'left' : 'right', offset = 0) => {
    if (!valid.includes(index) || index === state.index || state.direction) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setState(previous => ({ ...previous, previous: previous.index, index, direction: reducedMotion ? null : direction, offset }));
    clearTimeout(timer.current);
    if (!reducedMotion) timer.current = setTimeout(() => setState(previous => previous.key === key ? { ...previous, direction: null, offset: 0 } : previous), TRANSITION_MS);
  };
  const move = (delta: 1 | -1, offset = 0) => {
    if (valid.length < 2) return;
    const position = valid.indexOf(state.index);
    select(valid[(position + delta + valid.length) % valid.length], delta === 1 ? 'left' : 'right', offset);
  };
  const loaded = (index: number, url: string) => setState(previous => {
    if (previous.key !== key || previous.resolved[index] === url) return previous;
    return { ...previous, resolved: { ...previous.resolved, [index]: url } };
  });
  const failed = (index: number) => setState(previous => {
    if (previous.key !== key || previous.failed.includes(index)) return previous;
    const rejected = [...previous.failed, index];
    const remaining = frames.map((_, i) => i).filter(i => !rejected.includes(i));
    // A failed neighbour preview is removed without moving the selected photo.
    if (index !== previous.index) return { ...previous, failed: rejected };
    return { ...previous, failed: rejected, index: remaining.find(i => i > index) ?? remaining[0] ?? 0, direction: null, offset: 0 };
  });

  const position = valid.indexOf(state.index);
  // Warm only the next photo, after the visible photo succeeds. Card callers
  // enable this on interaction; the detail gallery enables it while visible.
  const nextSource = valid.length > 1 ? source(valid[(position + 1) % valid.length]) : undefined;
  const currentLoaded = !!state.resolved[state.index];
  useEffect(() => {
    if (!shouldPreload || !currentLoaded || !nextSource) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return;
    preload(nextSource);
  }, [shouldPreload, currentLoaded, nextSource]);

  const transitionStyle = {
    '--gallery-start-x': `${state.offset}px`,
    '--gallery-transition-duration': `${TRANSITION_MS}ms`,
  } as CSSProperties;
  return { frames, valid, position, state, source, select, move, loaded, failed, transitionStyle };
}
