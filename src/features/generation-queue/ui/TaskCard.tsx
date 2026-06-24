import type { GenerationTask } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { getTaskMeta } from "../lib/formatEta";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { TaskActions } from "./TaskActions";
import { TaskThumb } from "./TaskThumb";

interface TaskCardProps {
  task: GenerationTask;
  onCancel: () => void;
  onRetry: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onCancel, onRetry, onDelete }: TaskCardProps) {
  const active = task.status === "running";
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      layout
      initial={
        prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }
      }
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      transition={{
        duration: prefersReducedMotion ? 0.12 : 0.22,
        ease: "easeOut",
        layout: { duration: prefersReducedMotion ? 0 : 0.2 },
      }}
      className={cn(
        "flex flex-col gap-3 overflow-hidden rounded-[16px] border bg-card p-3.5 transition-[border-color,box-shadow,background-color]",
        active ? "border-[rgba(232,84,32,0.35)]" : "border-border",
        "hover:border-[rgba(232,84,32,0.28)] hover:shadow-[0_14px_34px_-28px_rgba(232,84,32,0.8)]",
      )}
    >
      <div className="flex items-start gap-3">
        <TaskThumb type={task.type} active={active} compact />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15px] font-medium leading-5 text-foreground">{task.prompt}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex max-w-[150px] items-center gap-1.5 rounded-full bg-secondary px-2 py-[3px] font-mono text-[12px] text-[var(--c-fg-dim)]">
              <span className="size-1.5 rounded-full bg-[var(--c-accent)]" />
              <span className="truncate">{task.modelName}</span>
            </span>
            <span className={cn("truncate", task.status === "failed" && "text-red-300")}>{getTaskMeta(task)}</span>
          </div>
        </div>
      </div>
      {active && <ProgressBar value={task.progress} />}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          {active && (
            <span className="font-mono text-[13px] font-medium text-[var(--c-accent-2)]">
              {task.progress}%
            </span>
          )}
        </div>
        <TaskActions status={task.status} onCancel={onCancel} onRetry={onRetry} onDelete={onDelete} />
      </div>
    </motion.article>
  );
}
