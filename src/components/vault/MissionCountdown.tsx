import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissionCountdownProps {
  date: string | null | undefined;
  label: string;
  className?: string;
}

export function MissionCountdown({ date, label, className }: MissionCountdownProps) {
  const days = useMemo(() => {
    if (!date) return null;
    const target = new Date(date);
    const now = new Date();
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [date]);

  if (days === null || days < 0) return null;

  const urgencyClass =
    days <= 7
      ? 'text-red-600 dark:text-red-400 font-medium'
      : days <= 21
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-muted-foreground';

  const message =
    days === 0
      ? `${label} is today`
      : days === 1
        ? `${label} is tomorrow`
        : `${label} in ${days} day${days === 1 ? '' : 's'}`;

  return (
    <div className={cn('flex items-center gap-1.5 font-serif-text text-xs', urgencyClass, className)}>
      <Clock className="h-3 w-3 flex-shrink-0" />
      <span>{message} — books ship in 5–7 business days</span>
    </div>
  );
}
