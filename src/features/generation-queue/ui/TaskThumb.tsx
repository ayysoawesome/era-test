import { FileText, Image, Music, Video } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { GenType } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

const icons = {
  text: FileText,
  image: Image,
  video: Video,
  audio: Music,
};

interface TaskThumbProps {
  type: GenType;
  active?: boolean;
  compact?: boolean;
}

export function TaskThumb({ type, active, compact }: TaskThumbProps) {
  const Icon = icons[type];
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        active && !prefersReducedMotion
          ? { boxShadow: ["0 0 0 0 rgba(232,84,32,0.18)", "0 0 0 6px rgba(232,84,32,0)"] }
          : { boxShadow: "0 0 0 0 rgba(232,84,32,0)" }
      }
      transition={
        active && !prefersReducedMotion
          ? { duration: 1.8, repeat: Infinity, ease: "easeOut" }
          : { duration: 0.15 }
      }
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,var(--c-accent-soft),var(--c-bg-2))] text-[var(--c-accent-2)]",
        compact ? "size-12" : "size-14",
        active && "ring-1 ring-[rgba(232,84,32,0.35)]",
      )}
    >
      <Icon className={compact ? "size-[18px]" : "size-5"} strokeWidth={1.8} />
    </motion.div>
  );
}
