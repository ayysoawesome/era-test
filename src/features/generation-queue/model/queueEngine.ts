import type { GenerationTask, GenType } from "@/entities/generation-task";
import type { QueueAction } from "./queueReducer";

type Dispatch = (action: QueueAction) => void;
type GetTasks = () => GenerationTask[];

const FAILURE_RATE = 0.15;
const FAILURE_MESSAGES = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
];

const TYPE_STEP: Record<GenType, { min: number; max: number }> = {
  text: { min: 10, max: 18 },
  image: { min: 7, max: 14 },
  audio: { min: 3, max: 7 },
  video: { min: 2, max: 5 },
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function getProgressStep(type: GenType): number {
  const range = TYPE_STEP[type];
  return randomBetween(range.min, range.max);
}

function getFailureMessage(): string {
  return FAILURE_MESSAGES[Math.floor(Math.random() * FAILURE_MESSAGES.length)] ?? FAILURE_MESSAGES[0];
}

function canFail(task: GenerationTask): boolean {
  return task.progress > 8 && task.progress < 92;
}

export function createQueueEngine(dispatch: Dispatch, getTasks: GetTasks) {
  let intervalId: number | undefined;

  function tick() {
    const now = Date.now();
    dispatch({ type: "start-next-queued", now });

    for (const task of getTasks()) {
      if (task.status !== "running") continue;

      if (canFail(task) && Math.random() < FAILURE_RATE / 20) {
        dispatch({ type: "fail", id: task.id, error: getFailureMessage(), now });
        continue;
      }

      dispatch({
        type: "progress",
        id: task.id,
        amount: getProgressStep(task.type),
        now,
      });
    }
  }

  return {
    start() {
      if (intervalId !== undefined) return;
      tick();
      intervalId = window.setInterval(tick, randomBetween(420, 680));
    },
    stop() {
      if (intervalId === undefined) return;
      window.clearInterval(intervalId);
      intervalId = undefined;
    },
  };
}
