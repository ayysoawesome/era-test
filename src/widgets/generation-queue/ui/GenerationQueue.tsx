import { Button } from '@/shared/ui/button';
import { AnimatePresence } from 'framer-motion';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  QueueStats,
  QueueToolbar,
  TaskCard,
  TaskRow,
  useQueue,
} from '@/features/generation-queue';

export function GenerationQueue() {
  const {
    tasks,
    visibleTasks,
    stats,
    filters,
    isLoading,
    loadError,
    setStatusFilter,
    setTypeFilter,
    setSort,
    setQuery,
    cancelTask,
    retryTask,
    deleteTask,
    clearDone,
    reload,
  } = useQueue();

  const hasFilters =
    filters.status !== 'all' ||
    filters.type !== 'all' ||
    filters.query.trim().length > 0;

  return (
    <div className='min-h-[calc(100dvh-var(--header-height,64px))] bg-background'>
      <div className='mx-auto flex w-full max-w-280 flex-col gap-6 px-4 py-6 md:px-8 md:py-10 xl:px-0'>
        <header className='flex gap-4 items-center justify-between'>
          <div>
            <h1 className='text-[26px] font-bold leading-none tracking-[-0.52px] text-foreground md:text-[30px] md:tracking-[-0.6px]'>
              Очередь генераций
            </h1>
            <p className='mt-2 text-sm text-muted-foreground md:text-[15px]'>
              Все ваши задачи в реальном времени
            </p>
          </div>
          <Button
            variant='outline'
            onClick={clearDone}
            disabled={stats.done === 0}
            className='w-fit text-(--c-fg-dim) hidden sm:flex'
          >
            Очистить готовые
          </Button>
        </header>

        <QueueStats stats={stats} />

        <QueueToolbar
          status={filters.status}
          type={filters.type}
          sort={filters.sort}
          query={filters.query}
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
          onSortChange={setSort}
          onQueryChange={setQuery}
        />

        {isLoading ? (
          <LoadingState />
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={reload} />
        ) : visibleTasks.length === 0 ? (
          <EmptyState
            filtered={hasFilters || tasks.length > 0}
            onResetFilters={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              setQuery('');
            }}
          />
        ) : (
          <>
            <section
              className='hidden w-full flex-col gap-2.5 lg:flex'
              aria-label='Список задач генерации'
            >
              <AnimatePresence initial={false}>
                {visibleTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onCancel={() => cancelTask(task.id)}
                    onRetry={() => retryTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </AnimatePresence>
            </section>
            <section
              className='flex w-full flex-col gap-2.5 lg:hidden'
              aria-label='Список задач генерации'
            >
              <AnimatePresence initial={false}>
                {visibleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onCancel={() => cancelTask(task.id)}
                    onRetry={() => retryTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </AnimatePresence>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
