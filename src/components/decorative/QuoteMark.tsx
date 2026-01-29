interface QuoteMarkProps {
  position: 'open' | 'close';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const QuoteMark = ({ position, className = '', size = 'md' }: QuoteMarkProps) => {
  const sizeClasses = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl',
  };

  const positionClasses = position === 'open' 
    ? '-translate-y-2' 
    : 'translate-y-2 rotate-180';

  return (
    <span 
      className={`
        font-serif leading-none select-none
        text-gold/25
        ${sizeClasses[size]}
        ${positionClasses}
        ${className}
      `}
      aria-hidden="true"
    >
      "
    </span>
  );
};

export default QuoteMark;
