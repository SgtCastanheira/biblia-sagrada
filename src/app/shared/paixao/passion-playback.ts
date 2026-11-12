import { DestroyRef, afterNextRender, inject, signal } from '@angular/core';

/** Relógio compartilhado pelos novos visuais; não representa a duração histórica. */
export function passionPlayback(viewport: () => HTMLElement | undefined, duration: () => number) {
  const progress = signal(0);
  const playing = signal(false);
  const destroy = inject(DestroyRef);
  let frame: number | null = null;
  let previous: number | null = null;
  let userPaused = false;
  let visible = false;
  let autoAllowed = false;
  let observer: IntersectionObserver | undefined;
  function pause(manual = true) {
    if (manual) userPaused = true;
    playing.set(false);
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previous = null;
  }
  function tick(time: number) {
    frame = null;
    if (!playing()) return;
    const elapsed = previous === null ? 0 : Math.min(100, time - previous);
    previous = time;
    progress.update(p => (p + elapsed / Math.max(1000, duration())) % 1);
    frame = requestAnimationFrame(tick);
  }
  function resume(manual = true) {
    if (manual) userPaused = false;
    if (playing()) return;
    playing.set(true);
    previous = null;
    frame = requestAnimationFrame(tick);
  }
  function reconcile() {
    if (document.hidden || !visible) pause(false);
    else if (autoAllowed && !userPaused) resume(false);
  }
  afterNextRender(() => {
    autoAllowed = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = viewport();
    if (target) {
      observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; reconcile(); }, { threshold: .15 });
      observer.observe(target);
    }
    document.addEventListener('visibilitychange', reconcile);
  });
  destroy.onDestroy(() => { observer?.disconnect(); document.removeEventListener('visibilitychange', reconcile); pause(false); });
  return {
    progress, playing,
    toggle: () => playing() ? pause() : resume(),
    seek: (value: number) => { pause(); progress.set(Math.max(0, Math.min(.9999, value))); },
    restart: () => { progress.set(0); resume(); },
  };
}
