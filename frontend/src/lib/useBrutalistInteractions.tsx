"use client";
import { useEffect } from 'react';

export default function useBrutalistInteractions() {
  useEffect(() => {
    const selector = 'button.brutalist-shadow, a.brutalist-shadow, .glass-card.brutalist-shadow, .glass-btn.brutalist-shadow';
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));

    const down = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = 'translate(4px, 4px)';
      el.style.boxShadow = '4px 4px 0 0 #000000';
    };
    const up = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = '';
      el.style.boxShadow = '8px 8px 0 0 #000000';
    };

    els.forEach((el) => {
      el.addEventListener('mousedown', down);
      el.addEventListener('touchstart', down, { passive: true });
      el.addEventListener('mouseup', up);
      el.addEventListener('mouseleave', up);
      el.addEventListener('touchend', up);
    });

    return () => {
      els.forEach((el) => {
        el.removeEventListener('mousedown', down);
        el.removeEventListener('touchstart', down as EventListenerOrEventListenerObject);
        el.removeEventListener('mouseup', up);
        el.removeEventListener('mouseleave', up);
        el.removeEventListener('touchend', up);
      });
    };
  }, []);
}
