import { cn } from '@/shared/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div
      className={cn(
        'h-1.25 w-full overflow-hidden rounded-full bg-[var(--c-bg-3)]',
        className,
      )}
    >
      <div
        className='h-full rounded-full bg-linear-to-r from-[var(--c-accent)] to-[var(--c-accent-2)] transition-[width] duration-500 ease-out'
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
