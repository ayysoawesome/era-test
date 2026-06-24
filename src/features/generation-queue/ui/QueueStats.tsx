import type { QueueStats as QueueStatsValue } from "../model/selectors";

const items = [
  { key: "queued", label: "В очереди", dot: "bg-[var(--c-fg-mute)]" },
  { key: "running", label: "Идёт", dot: "bg-[var(--c-accent)]" },
  { key: "done", label: "Готово", dot: "bg-emerald-400" },
  { key: "failed", label: "Ошибка", dot: "bg-red-400" },
] as const;

interface QueueStatsProps {
  stats: QueueStatsValue;
}

export function QueueStats({ stats }: QueueStatsProps) {
  return (
    <section className="grid w-full grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3" aria-label="Сводка очереди">
      {items.map((item) => (
        <div key={item.key} className="flex min-h-[82px] flex-col gap-1.5 rounded-[16px] border border-border bg-card p-3.5 md:min-h-[93px] md:px-[18px] md:py-4">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${item.dot}`} />
            <span className="text-[13px] text-muted-foreground">{item.label}</span>
          </div>
          <span className="font-mono text-2xl font-bold leading-none text-foreground md:text-[28px]">
            {stats[item.key]}
          </span>
        </div>
      ))}
    </section>
  );
}
