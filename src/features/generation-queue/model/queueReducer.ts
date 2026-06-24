import type { GenerationTask, TaskStatus } from "@/entities/generation-task";

export const MAX_CONCURRENT = 2;

export interface QueueState {
  tasks: GenerationTask[];
}

export type QueueAction =
  | { type: "set-tasks"; tasks: GenerationTask[]; now: number }
  | { type: "start-next-queued"; now: number }
  | { type: "progress"; id: string; amount: number; now: number }
  | { type: "fail"; id: string; error: string; now: number }
  | { type: "cancel"; id: string; now: number }
  | { type: "retry"; id: string; now: number }
  | { type: "delete"; id: string }
  | { type: "clear-done" };

function normalizeQueuedPositions(tasks: GenerationTask[]): GenerationTask[] {
  let queuedIndex = 0;
  return tasks.map((task) => {
    if (task.status !== "queued") return { ...task, queuePosition: undefined };
    queuedIndex += 1;
    return { ...task, queuePosition: queuedIndex };
  });
}

function setTaskStatus(
  task: GenerationTask,
  status: TaskStatus,
  now: number,
  patch: Partial<GenerationTask> = {},
): GenerationTask {
  return {
    ...task,
    ...patch,
    status,
    updatedAt: now,
  };
}

function startNextQueuedTasks(tasks: GenerationTask[], now: number): GenerationTask[] {
  const runningCount = tasks.filter((task) => task.status === "running").length;
  const availableSlots = Math.max(0, MAX_CONCURRENT - runningCount);
  if (availableSlots === 0) return normalizeQueuedPositions(tasks);

  const nextIds = new Set(
    [...tasks]
      .filter((task) => task.status === "queued")
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, availableSlots)
      .map((task) => task.id),
  );

  return normalizeQueuedPositions(
    tasks.map((task) => {
      if (!nextIds.has(task.id)) return task;
      return setTaskStatus(task, "running", now, {
        progress: Math.max(1, task.progress),
        error: undefined,
        etaSeconds: task.etaSeconds || 60,
      });
    }),
  );
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "set-tasks":
      return { tasks: normalizeQueuedPositions(action.tasks) };
    case "start-next-queued":
      return { tasks: startNextQueuedTasks(state.tasks, action.now) };
    case "progress": {
      const tasks = state.tasks.map((task) => {
        if (task.id !== action.id || task.status !== "running") return task;
        const progress = Math.min(100, Math.round(task.progress + action.amount));
        if (progress >= 100) {
          return setTaskStatus(task, "done", action.now, {
            progress: 100,
            etaSeconds: 0,
            resultLabel: task.resultLabel ?? "Результат готов",
          });
        }
        return { ...task, progress, updatedAt: action.now };
      });
      return { tasks: normalizeQueuedPositions(tasks) };
    }
    case "fail":
      return {
        tasks: normalizeQueuedPositions(
          state.tasks.map((task) =>
            task.id === action.id && task.status === "running"
              ? setTaskStatus(task, "failed", action.now, { error: action.error, etaSeconds: 0 })
              : task,
          ),
        ),
      };
    case "cancel":
      return {
        tasks: normalizeQueuedPositions(
          state.tasks.map((task) =>
            task.id === action.id && (task.status === "running" || task.status === "queued")
              ? setTaskStatus(task, "canceled", action.now, { etaSeconds: 0 })
              : task,
          ),
        ),
      };
    case "retry":
      return {
        tasks: normalizeQueuedPositions(
          state.tasks.map((task) =>
            task.id === action.id && (task.status === "failed" || task.status === "canceled")
              ? setTaskStatus(task, "queued", action.now, {
                  progress: 0,
                  error: undefined,
                  etaSeconds: task.type === "video" ? 140 : task.type === "audio" ? 110 : 50,
                })
              : task,
          ),
        ),
      };
    case "delete":
      return { tasks: normalizeQueuedPositions(state.tasks.filter((task) => task.id !== action.id)) };
    case "clear-done":
      return { tasks: normalizeQueuedPositions(state.tasks.filter((task) => task.status !== "done")) };
    default:
      return state;
  }
}
