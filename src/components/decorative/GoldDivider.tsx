interface GoldDividerProps {
  className?: string;
  variant?: 'simple' | 'ornate' | 'diamond';
}

const GoldDivider = ({ className = '', variant = 'simple' }: GoldDividerProps) => {
  if (variant === 'diamond') {
    return (
      <div className={`flex items-center justify-center gap-4 ${className}`}>
        <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-gold/40" />
        <span className="text-gold text-xs">◆</span>
        <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-gold/40" />
      </div>
    );
  }

  if (variant === 'ornate') {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`}>
        <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent via-gold/30 to-gold/50" />
        <span className="text-gold/60 text-[10px] tracking-widest">✦</span>
        <span className="text-gold text-xs">◆</span>
        <span className="text-gold/60 text-[10px] tracking-widest">✦</span>
        <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent via-gold/30 to-gold/50" />
      </div>
    );
  }

  // Simple variant
  return (
    <div className={`max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent ${className}`} />
  );
};

export default GoldDivider;
