"use client";
import React from 'react';
import useBrutalistInteractions from '@/lib/useBrutalistInteractions';

export default function BrutalistClientWrapper({ children }: { children: React.ReactNode }) {
  useBrutalistInteractions();
  return <>{children}</>;
}
