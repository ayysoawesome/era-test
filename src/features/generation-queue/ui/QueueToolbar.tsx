import { Search } from 'lucide-react';
import { Chip } from '@/shared/ui/era';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import type { GenType } from '@/entities/generation-task';
import type { QueueSort, StatusFilter, TypeFilter } from '../model/selectors';

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'queued', label: 'В очереди' },
  { value: 'running', label: 'Идёт' },
  { value: 'done', label: 'Готово' },
  { value: 'failed', label: 'Ошибка' },
];

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Все типы' },
  { value: 'text', label: 'Текст' },
  { value: 'image', label: 'Изображения' },
  { value: 'video', label: 'Видео' },
  { value: 'audio', label: 'Аудио' },
];

const sortOptions: { value: QueueSort; label: string }[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'progress', label: 'По прогрессу' },
];

interface QueueToolbarProps {
  status: StatusFilter;
  type: TypeFilter;
  sort: QueueSort;
  query: string;
  onStatusChange: (value: StatusFilter) => void;
  onTypeChange: (value: TypeFilter) => void;
  onSortChange: (value: QueueSort) => void;
  onQueryChange: (value: string) => void;
}

export function QueueToolbar({
  status,
  type,
  sort,
  query,
  onStatusChange,
  onTypeChange,
  onSortChange,
  onQueryChange,
}: QueueToolbarProps) {
  return (
    <section
      className='flex w-full flex-col gap-3 md:flex-row md:items-center'
      aria-label='Фильтры очереди'
    >
      <div className='-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0'>
        {statusOptions.map((option) => (
          <Chip
            key={option.value}
            active={status === option.value}
            onClick={() => onStatusChange(option.value)}
            className={cn(
              'h-8.5 px-3.5 text-[13px] font-medium text-nowrap',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent-2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--c-bg)]',
              status === option.value
                ? 'border-[var(--c-accent)] bg-[var(--c-accent)] text-white shadow-[0_10px_24px_-14px_rgba(232,84,32,0.75)]'
                : 'border-[rgba(255,255,255,0.07)] bg-[rgba(25,20,18,0.92)] text-[var(--c-fg-dim)] hover:border-[rgba(232,84,32,0.28)] hover:text-[var(--c-fg)]',
            )}
          >
            {option.label}
          </Chip>
        ))}
      </div>
      <div className='flex flex-col gap-2 sm:flex-row md:ml-3'>
        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as QueueSort)}
        >
          <SelectTrigger className='h-8.5 rounded-full bg-secondary text-[13px] text-(--c-fg-dim)'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={type}
          onValueChange={(value) => onTypeChange(value as GenType | 'all')}
        >
          <SelectTrigger className='h-[34px] rounded-full bg-secondary text-[13px] text-(--c-fg-dim)'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <label className='relative min-w-0 w-full sm:w-[240px] lg:w-[260px]'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder='Поиск по промпту'
            aria-label='Поиск по промпту'
            className='h-8.5 w-full rounded-full bg-secondary pl-9 pr-3 text-[13px] placeholder:text-[var(--c-fg-dim)]'
          />
        </label>
      </div>
    </section>
  );
}
