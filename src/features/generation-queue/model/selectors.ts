import type { GenerationTask, GenType, TaskStatus } from "@/entities/generation-task";

export type StatusFilter = TaskStatus | "all";
export type TypeFilter = GenType | "all";
export type QueueSort = "newest" | "oldest" | "progress";

export interface QueueViewFilters {
  status: StatusFilter;
  type: TypeFilter;
  sort: QueueSort;
  query: string;
}

export interface QueueStats {
  queued: number;
  running: number;
  done: number;
  failed: number;
  canceled: number;
  active: number;
}

export function getQueueStats(tasksOrState: GenerationTask[] | { tasks: GenerationTask[] }): QueueStats {
  const tasks = Array.isArray(tasksOrState) ? tasksOrState : tasksOrState.tasks;
  const stats: QueueStats = {
    queued: 0,
    running: 0,
    done: 0,
    failed: 0,
    canceled: 0,
    active: 0,
  };

  for (const task of tasks) {
    stats[task.status] += 1;
    if (task.status === "queued" || task.status === "running") stats.active += 1;
  }

  return stats;
}

export function getActiveTasks(tasks: GenerationTask[]): GenerationTask[] {
  return [...tasks]
    .filter((task) => task.status === "running" || task.status === "queued")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "running" ? -1 : 1;
      return a.createdAt - b.createdAt;
    });
}

export function getAverageActiveProgress(tasks: GenerationTask[]): number {
  const activeTasks = getActiveTasks(tasks);
  if (activeTasks.length === 0) return 0;
  const total = activeTasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(total / activeTasks.length);
}

export function getVisibleTasks(tasks: GenerationTask[], filters: QueueViewFilters): GenerationTask[] {
  const query = filters.query.trim().toLocaleLowerCase("ru-RU");

  return [...tasks]
    .filter((task) => filters.status === "all" || task.status === filters.status)
    .filter((task) => filters.type === "all" || task.type === filters.type)
    .filter((task) => {
      if (!query) return true;
      return `${task.prompt} ${task.modelName}`.toLocaleLowerCase("ru-RU").includes(query);
    })
    .sort((a, b) => {
      if (filters.sort === "oldest") return a.createdAt - b.createdAt;
      if (filters.sort === "progress") return b.progress - a.progress;
      return b.createdAt - a.createdAt;
    });
}
