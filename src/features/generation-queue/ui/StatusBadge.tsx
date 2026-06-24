import type { TaskStatus } from '@/entities/generation-task';
import { cn } from '@/shared/lib/utils';

const labels: Record<TaskStatus, string> = {
  queued: 'В очереди',
  running: 'Идёт',
  done: 'Готово',
  failed: 'Ошибка',
  canceled: 'Отменено',
};

const styles: Record<TaskStatus, string> = {
  queued: 'bg-secondary text-muted-foreground',
  running: 'bg-[var(--c-accent-soft)] text-[var(--c-accent-2)]',
  done: 'bg-emerald-500/15 text-emerald-300',
  failed: 'bg-red-500/15 text-red-300',
  canceled: 'bg-secondary text-[var(--c-fg-low)]',
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6.5 items-center rounded-sm px-2.5 text-xs font-medium',
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
