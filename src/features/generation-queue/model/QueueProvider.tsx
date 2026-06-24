import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { GenerationTask } from '@/entities/generation-task';
import { generationTaskSeed } from '@/entities/generation-task';
import { createQueueEngine } from './queueEngine';
import {
  queueReducer,
  type QueueAction,
  type QueueState,
} from './queueReducer';
import {
  resolveInitialQueueTasks,
  serializeQueueSnapshot,
} from './queueStorage';
import {
  getActiveTasks,
  getAverageActiveProgress,
  getQueueStats,
  getVisibleTasks,
  type QueueSort,
  type StatusFilter,
  type TypeFilter,
} from './selectors';
import { QueueContext } from './useQueue';

const STORAGE_KEY = 'era2-generation-queue-v1';
// Dev reset: window.resetEra2Queue();
const INITIAL_LOAD_DELAY = 600;
const INITIAL_FAILURE_RATE = 0.04;

function persistTasks(tasks: GenerationTask[]) {
  window.localStorage.setItem(STORAGE_KEY, serializeQueueSnapshot(tasks));
}

declare global {
  interface Window {
    resetEra2Queue?: () => void;
  }
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatchBase] = useReducer(queueReducer, {
    tasks: [],
  } satisfies QueueState);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<QueueSort>('newest');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const tasksRef = useRef<GenerationTask[]>([]);

  const dispatch = useCallback((action: QueueAction) => {
    dispatchBase(action);
  }, []);

  useEffect(() => {
    tasksRef.current = state.tasks;
  }, [state.tasks]);

  useEffect(() => {
    window.resetEra2Queue = () => {
      window.localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    };

    return () => {
      delete window.resetEra2Queue;
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    setIsLoading(true);
    setLoadError(null);

    const timeoutId = window.setTimeout(() => {
      if (canceled) return;

      const now = Date.now();
      const initialQueue = resolveInitialQueueTasks({
        rawSnapshot: window.localStorage.getItem(STORAGE_KEY),
        seedTasks: generationTaskSeed,
        now,
        failureRate: INITIAL_FAILURE_RATE,
        randomValue: Math.random(),
      });

      if (initialQueue.loadError) {
        setLoadError(initialQueue.loadError);
        setIsLoading(false);
        return;
      }

      dispatch({
        type: 'set-tasks',
        tasks: initialQueue.tasks,
        now,
      });
      setIsLoading(false);
    }, INITIAL_LOAD_DELAY);

    return () => {
      canceled = true;
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, reloadToken]);

  useEffect(() => {
    if (isLoading || loadError) return;
    persistTasks(state.tasks);
  }, [isLoading, loadError, state.tasks]);

  useEffect(() => {
    if (isLoading || loadError) return;
    const engine = createQueueEngine(dispatch, () => tasksRef.current);
    engine.start();
    return () => engine.stop();
  }, [dispatch, isLoading, loadError]);

  const filters = useMemo(
    () => ({
      status: statusFilter,
      type: typeFilter,
      sort,
      query: deferredQuery,
    }),
    [deferredQuery, sort, statusFilter, typeFilter],
  );

  const visibleTasks = useMemo(
    () => getVisibleTasks(state.tasks, filters),
    [filters, state.tasks],
  );
  const activeTasks = useMemo(() => getActiveTasks(state.tasks), [state.tasks]);
  const stats = useMemo(() => getQueueStats(state), [state]);
  const averageActiveProgress = useMemo(
    () => getAverageActiveProgress(state.tasks),
    [state.tasks],
  );

  const value = useMemo(
    () => ({
      tasks: state.tasks,
      visibleTasks,
      activeTasks,
      stats,
      averageActiveProgress,
      filters,
      isLoading,
      loadError,
      setStatusFilter,
      setTypeFilter,
      setSort,
      setQuery,
      cancelTask: (id: string) =>
        dispatch({ type: 'cancel', id, now: Date.now() }),
      retryTask: (id: string) =>
        dispatch({ type: 'retry', id, now: Date.now() }),
      deleteTask: (id: string) => dispatch({ type: 'delete', id }),
      clearDone: () => dispatch({ type: 'clear-done' }),
      reload: () => setReloadToken((token) => token + 1),
    }),
    [
      activeTasks,
      averageActiveProgress,
      dispatch,
      filters,
      isLoading,
      loadError,
      state.tasks,
      stats,
      visibleTasks,
    ],
  );

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}
