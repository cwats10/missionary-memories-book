import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const containerClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn(
        'rounded-full bg-gold/10 border border-gold/20',
        containerClasses[size]
      )}>
        <BookOpen 
          className={cn(
            'text-gold animate-pulse',
            sizeClasses[size]
          )} 
        />
      </div>
      {message && (
        <p className="font-serif-text text-muted-foreground text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
