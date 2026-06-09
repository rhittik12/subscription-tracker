"use client";
import { useEffect } from 'react';

export default function useBrutalistInteractions() {
  useEffect(() => {
    const selector = 'button.brutalist-shadow, a.brutalist-shadow, .glass-card.brutalist-shadow, .glass-btn.brutalist-shadow';

    const getTarget = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLElement>(selector);
    };

    const down = (e: Event) => {
      const el = getTarget(e);
      if (!el) return;
      el.style.transform = 'translate(4px, 4px)';
      el.style.boxShadow = '4px 4px 0 0 #000000';
    };

    const up = (e: Event) => {
      const el = getTarget(e);
      if (!el) return;
      el.style.transform = '';
      el.style.boxShadow = '';
    };

    const leave = (e: PointerEvent) => {
      const el = getTarget(e);
      if (!el || el.contains(e.relatedTarget as Node | null)) return;
      el.style.transform = '';
      el.style.boxShadow = '';
    };

    document.addEventListener('pointerdown', down);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    document.addEventListener('pointerout', leave);

    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      document.removeEventListener('pointerout', leave);
    };
  }, []);
}
