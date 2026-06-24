import { Download, MoreHorizontal, RefreshCw, Trash2, X } from 'lucide-react';
import type { TaskStatus } from '@/entities/generation-task';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { FC, PropsWithChildren } from 'react';
import { cn } from '@/shared/lib/utils';

interface TaskActionsProps {
  status: TaskStatus;
  onCancel: () => void;
  onRetry: () => void;
  onDelete: () => void;
}

interface ActionButtonProps {
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
}

const ActionButton: FC<PropsWithChildren<ActionButtonProps>> = ({
  children,
  onClick,
  ariaLabel,
  className,
}) => {
  return (
    <Button
      variant='quiet'
      size='icon'
      className={cn(
        'size-8 rounded-sm border border-border bg-secondary text-(--c-accent-2) p-1.5 flex items-center justify-center',
        className,
      )}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span className='grid size-full place-items-center [&_svg]:size-full'>
        {children}
      </span>
    </Button>
  );
};

export function TaskActions({
  status,
  onCancel,
  onRetry,
  onDelete,
}: TaskActionsProps) {
  const canCancel = status === 'queued' || status === 'running';
  const canRetry = status === 'failed' || status === 'canceled';
  const canDownload = status === 'done';

  return (
    <div className='flex items-center gap-1.5'>
      {canCancel && (
        <ActionButton onClick={onCancel} ariaLabel='Отменить задачу'>
          <X data-icon='inline-start' />
        </ActionButton>
      )}
      {canRetry && (
        <ActionButton onClick={onRetry} ariaLabel='Повторить задачу'>
          <RefreshCw data-icon='inline-start' />
        </ActionButton>
      )}
      {canDownload && (
        <ActionButton ariaLabel='Скачать результат'>
          <Download data-icon='inline-start' />
        </ActionButton>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='quiet'
            size='icon'
            className='size-8 rounded-sm border border-border bg-secondary text-(--c-fg-mute) p-1.5 flex items-center justify-center'
            aria-label='Открыть меню'
          >
            <span className='grid size-full place-items-center [&_svg]:size-full'>
              <MoreHorizontal data-icon='inline-start' />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onDelete} className='text-destructive'>
              <Trash2 />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
