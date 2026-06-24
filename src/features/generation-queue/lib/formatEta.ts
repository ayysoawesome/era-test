import type { GenerationTask } from "@/entities/generation-task";

export function formatEta(seconds: number): string {
  if (seconds <= 0) return "готово";
  if (seconds < 60) return `≈ ${seconds} сек`;
  return `≈ ${Math.ceil(seconds / 60)} мин`;
}

export function formatCredits(value: number): string {
  return `${value} cr`;
}

export function getTaskMeta(task: GenerationTask): string {
  if (task.status === "queued") {
    return `позиция ${task.queuePosition ?? 1} в очереди · ${formatCredits(task.credits)}`;
  }

  if (task.status === "running") {
    return `${formatEta(task.etaSeconds)} · ${formatCredits(task.credits)}`;
  }

  if (task.status === "failed") {
    return task.error ?? "ошибка генерации";
  }

  if (task.status === "canceled") {
    return "отменено пользователем";
  }

  return `${task.resultLabel ?? "готово"} · ${formatCredits(task.credits)}`;
}
