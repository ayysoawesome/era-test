import type { GenerationTask } from "@/entities/generation-task";

interface QueueSnapshot {
  tasks?: GenerationTask[];
}

interface ResolveInitialQueueTasksParams {
  rawSnapshot: string | null;
  seedTasks: GenerationTask[];
  now: number;
  failureRate: number;
  randomValue: number;
}

interface ResolveInitialQueueTasksResult {
  tasks: GenerationTask[];
  loadError: string | null;
}

const LOAD_ERROR_TEXT =
  "Не удалось загрузить очередь генераций";

function restoreRunningAsQueued(
  tasks: GenerationTask[],
  now: number,
): GenerationTask[] {
  return tasks.map((task) =>
    task.status === "running"
      ? {
          ...task,
          status: "queued",
          updatedAt: now,
          queuePosition: undefined,
        }
      : task,
  );
}

export function serializeQueueSnapshot(tasks: GenerationTask[]): string {
  return JSON.stringify({ tasks });
}

export function restoreQueueSnapshot(
  rawSnapshot: string | null,
  now: number,
): GenerationTask[] | null {
  if (!rawSnapshot) return null;

  try {
    const parsed = JSON.parse(rawSnapshot) as QueueSnapshot;
    if (!Array.isArray(parsed.tasks)) return null;
    return restoreRunningAsQueued(parsed.tasks, now);
  } catch {
    return null;
  }
}

export function resolveInitialQueueTasks({
  rawSnapshot,
  seedTasks,
  now,
  failureRate,
  randomValue,
}: ResolveInitialQueueTasksParams): ResolveInitialQueueTasksResult {
  const storedTasks = restoreQueueSnapshot(rawSnapshot, now);
  if (storedTasks) {
    return { tasks: storedTasks, loadError: null };
  }

  if (randomValue < failureRate) {
    return { tasks: [], loadError: LOAD_ERROR_TEXT };
  }

  return { tasks: seedTasks, loadError: null };
}
