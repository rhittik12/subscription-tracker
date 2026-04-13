import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'indigo' | 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'none';
  hover?: boolean;
}

const glowColors = {
  indigo: 'bg-white/20',
  violet: 'bg-violet-500/15',
  blue: 'bg-white/15',
  emerald: 'bg-emerald-500/15',
  amber: 'bg-amber-500/15',
  rose: 'bg-rose-500/15',
  none: '',
};

export function GlassCard({
  children,
  className,
  glowColor = 'none',
  hover = true,
}: GlassCardProps) {
  return (
    <div className={cn('relative', className)}>
      {glowColor !== 'none' && (
        <div
          className={cn(
            'glow -inset-4',
            glowColors[glowColor]
          )}
        />
      )}
      <div
        className={cn(
          'glass-card glass-reflection rounded-2xl relative z-10',
          hover && 'hover:scale-[1.01]'
        )}
      >
        {children}
      </div>
    </div>
  );
}
