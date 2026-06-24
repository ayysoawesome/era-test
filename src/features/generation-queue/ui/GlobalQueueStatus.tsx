import { ArrowRight, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { GenerationTask } from '@/entities/generation-task';
import { cn } from '@/shared/lib/utils';
import { useLocation, useNavigate } from '@/shared/routing';
import { useQueue } from '../model/useQueue';
import { ProgressBar } from './ProgressBar';

const bottomChatInputRoutes = new Set(['/text', '/design', '/video', '/audio']);

const taskTypeLabel: Record<GenerationTask['type'], string> = {
  text: 'Генерация текста',
  image: 'Генерация изображения',
  video: 'Генерация видео',
  audio: 'Генерация аудио',
};

const taskIcon: Record<GenerationTask['type'], string> = {
  text: '◐',
  image: '◐',
  video: '▷',
  audio: '◔',
};

function formatGenerationCount(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${count} генераций`;
  if (last === 1) return `${count} генерация`;
  if (last >= 2 && last <= 4) return `${count} генерации`;
  return `${count} генераций`;
}

function TaskThumb({
  task,
  className,
}: {
  task: GenerationTask;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'grid size-7 shrink-0 place-items-center overflow-clip rounded-lg',
        'bg-linear-to-br from-[#3B1A0A] to-[#1A1614]',
        'font-mono text-xs text-(--c-accent-2)',
        className,
      )}
      aria-hidden='true'
    >
      {taskIcon[task.type]}
    </span>
  );
}

function StatusMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full text-(--c-accent-2)',
        className,
      )}
      aria-hidden='true'
    >
      <span className='font-mono text-[34px] leading-none [text-box:trim-both_cap_alphabetic]'>
        ◔
      </span>
    </span>
  );
}

function QueueTaskLine({ task }: { task: GenerationTask }) {
  const queued = task.status === 'queued';

  return (
    <div className='grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3'>
      <TaskThumb task={task} className='rounded-sm' />
      <div className='min-w-0'>
        <div className='flex min-w-0 items-center gap-2'>
          <p className='truncate text-sm leading-5 text-(--c-fg)'>
            {task.prompt}
          </p>
          {queued ? null : (
            <span className='shrink-0 font-mono text-xs leading-none text-(--c-accent-2)'>
              {task.progress}%
            </span>
          )}
        </div>
        {queued ? null : (
          <ProgressBar value={task.progress} className='mt-1.5' />
        )}
      </div>
      {queued ? (
        <span className='shrink-0 text-xs leading-4 text-(--c-fg-mute)'>
          в очереди
        </span>
      ) : null}
    </div>
  );
}

function MobileStatus({
  activeCount,
  averageProgress,
  raised,
  onOpen,
}: {
  activeCount: number;
  averageProgress: number;
  raised: boolean;
  onOpen: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type='button'
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 14, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 12, scale: 0.98 }
      }
      transition={{
        duration: prefersReducedMotion ? 0.12 : 0.22,
        ease: 'easeOut',
      }}
      onClick={onOpen}
      className={cn(
        'fixed inset-x-2 z-[120] md:hidden',
        raised
          ? 'bottom-[calc(10.75rem+env(safe-area-inset-bottom))]'
          : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]',
        'overflow-clip rounded-md border border-(--c-accent)/35',
        'bg-(--c-bg-2) text-left shadow-[0_0_28px_rgba(232,84,32,0.18),0_18px_44px_rgba(0,0,0,0.55)]',
        'transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent-2)]',
      )}
      aria-label='Открыть очередь генераций'
    >
      <div className='flex h-13.5 items-center gap-3 px-3.5'>
        <StatusMark className='size-9' />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold leading-5 text-(--c-fg)'>
            Генерации идут
          </p>
          <p className='truncate text-xs leading-4 text-(--c-fg-mute)'>
            {activeCount} активны · {averageProgress}%
          </p>
        </div>
        <ArrowRight className='size-4 shrink-0 text-(--c-accent-2)' />
      </div>
      <ProgressBar value={averageProgress} className='h-0.75 rounded-none' />
    </motion.button>
  );
}

function CollapsedStatus({
  activeCount,
  averageProgress,
  onExpand,
}: {
  activeCount: number;
  averageProgress: number;
  onExpand: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type='button'
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 8, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 8, scale: 0.98 }
      }
      transition={{
        duration: prefersReducedMotion ? 0.12 : 0.2,
        ease: 'easeOut',
      }}
      onClick={onExpand}
      className={cn(
        'hidden h-12 items-center gap-3 rounded-full border border-(--c-accent)/35',
        'bg-[rgba(25,20,18,0.96)] px-5 text-left md:inline-flex',
        'shadow-[0_0_26px_rgba(232,84,32,0.14),0_16px_42px_rgba(0,0,0,0.55)]',
        'transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent-2)',
      )}
      aria-label='Развернуть статус генераций'
    >
      <StatusMark />
      <span className='text-base font-semibold leading-none text-(--c-fg)'>
        {formatGenerationCount(activeCount)}
      </span>
      <span className='text-sm leading-none text-(--c-accent-2)'>·</span>
      <span className='font-mono text-base leading-none text-(--c-accent-2)'>
        {averageProgress}%
      </span>
    </motion.button>
  );
}

function SingleStatus({
  task,
  onOpen,
}: {
  task: GenerationTask;
  onOpen: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type='button'
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 10, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 10, scale: 0.98 }
      }
      transition={{
        duration: prefersReducedMotion ? 0.12 : 0.2,
        ease: 'easeOut',
      }}
      onClick={onOpen}
      className={cn(
        'hidden w-75 max-w-[calc(100dvw-48px)] rounded-lg border border-(--c-accent)/35',
        'bg-[rgba(25,20,18,0.96)] p-5 text-left md:block',
        'shadow-[0_0_30px_rgba(232,84,32,0.14),0_22px_60px_rgba(0,0,0,0.58)]',
        'transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent-2)',
      )}
      aria-label='Открыть очередь генераций'
    >
      <div className='flex items-center gap-4'>
        <StatusMark className='size-4.5' />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-[13px] font-semibold leading-5 text-(--c-fg)'>
            {taskTypeLabel[task.type]}
          </p>
          <p className='mt-1 truncate font-mono text-[11px] leading-2.75 text-(--c-fg-mute)'>
            {task.modelName} ·{' '}
            <span className='text-(--c-fg-mute)'>{task.progress}%</span>
          </p>
        </div>
        <ArrowRight className='mt-1 size-4 shrink-0 text-(--c-fg-mute)' />
      </div>

      <div className='mt-5 flex items-center gap-3'>
        <TaskThumb
          task={task}
          className='size-10 rounded-[10px] text-xl opacity-80'
        />
        <div className='min-w-0 w-full flex flex-col h-full gap-1'>
          <p className='line-clamp-2 text-xs text-(--c-fg-dim)'>
            {task.prompt}
          </p>
          <ProgressBar value={task.progress} className='h-1' />
        </div>
      </div>
    </motion.button>
  );
}

function MultipleStatus({
  tasks,
  activeCount,
  averageProgress,
  onOpen,
  onCollapse,
}: {
  tasks: GenerationTask[];
  activeCount: number;
  averageProgress: number;
  onOpen: () => void;
  onCollapse: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.aside
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 10, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 10, scale: 0.98 }
      }
      transition={{
        duration: prefersReducedMotion ? 0.12 : 0.2,
        ease: 'easeOut',
      }}
      className={cn(
        'hidden w-83 max-w-[calc(100dvw-48px)] overflow-clip rounded-lg',
        'border border-[rgba(232,84,32,0.46)] bg-[rgba(25,20,18,0.96)] md:block',
        'shadow-[0_0_32px_rgba(232,84,32,0.16),0_24px_64px_rgba(0,0,0,0.6)]',
      )}
      aria-label='Активные генерации'
    >
      <div className='p-4'>
        <div className='flex items-center w-full justify-between'>
          <div className='flex items-center gap-4'>
            <StatusMark className='size-4.5' />
            <button
              type='button'
              onClick={onOpen}
              className='min-w-0 flex flex-col gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent-2)'
            >
              <p className='truncate text-[13px] font-semibold leading-3.25 text-(--c-fg)'>
                Генерации идут
              </p>
              <p className='truncate text-[11px] leading-2.75 text-(--c-fg-mute)'>
                {activeCount} активны · {averageProgress}%
              </p>
            </button>
          </div>
          <button
            type='button'
            onClick={onCollapse}
            className='grid size-6 shrink-0 place-items-center rounded-full text-(--c-fg-mute) transition-colors hover:text-(--c-accent-2) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent-2)'
            aria-label='Свернуть статус генераций'
          >
            <ChevronDown className='size-3.5' />
          </button>
        </div>

        <div className='mt-4 flex flex-col gap-3'>
          {tasks.slice(0, 3).map((task) => (
            <QueueTaskLine key={task.id} task={task} />
          ))}
        </div>
      </div>

      <div className='border-t border-[rgba(255,255,255,0.06)] px-4 py-3 flex justify-center'>
        <button
          type='button'
          onClick={onOpen}
          className='mx-auto inline-flex items-center text-center gap-1.5 text-sm font-semibold leading-5 text-(--c-accent-2) transition-colors hover:text-(--c-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent-2)'
        >
          <span>Открыть очередь</span>
          <ArrowRight className='size-3.5' />
        </button>
      </div>
    </motion.aside>
  );
}

export function GlobalQueueStatus() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { activeTasks, averageActiveProgress, stats } = useQueue();
  const [collapsed, setCollapsed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const visibleTasks = useMemo(() => activeTasks.slice(0, 3), [activeTasks]);
  const hasBottomChatInput = bottomChatInputRoutes.has(pathname);

  const firstTask = activeTasks[0];
  const multiple = activeTasks.length > 1;
  const openQueue = () => navigate('/queue');
  const visible = activeTasks.length > 0;

  return (
    <>
      <AnimatePresence initial={false}>
        {visible ? (
          <MobileStatus
            key='mobile-status'
            activeCount={stats.active}
            averageProgress={averageActiveProgress}
            raised={hasBottomChatInput}
            onOpen={openQueue}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {visible ? (
          <motion.div
            key='desktop-status'
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 10, scale: 0.98 }
            }
            transition={{
              duration: prefersReducedMotion ? 0.12 : 0.2,
              ease: 'easeOut',
            }}
            className='fixed bottom-6 right-6 z-120 hidden md:block'
          >
            <AnimatePresence mode='wait' initial={false}>
              {collapsed && multiple ? (
                <CollapsedStatus
                  key='collapsed'
                  activeCount={stats.active}
                  averageProgress={averageActiveProgress}
                  onExpand={() => setCollapsed(false)}
                />
              ) : multiple ? (
                <MultipleStatus
                  key='multiple'
                  tasks={visibleTasks}
                  activeCount={stats.active}
                  averageProgress={averageActiveProgress}
                  onOpen={openQueue}
                  onCollapse={() => setCollapsed(true)}
                />
              ) : firstTask ? (
                <SingleStatus
                  key='single'
                  task={firstTask}
                  onOpen={openQueue}
                />
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
