import { Inbox } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface EmptyStateProps {
  filtered: boolean;
  onResetFilters: () => void;
}

export function EmptyState({ filtered, onResetFilters }: EmptyStateProps) {
  return (
    <div className="flex min-h-[260px] w-full flex-col items-center justify-center gap-3 rounded-[16px] border border-border bg-card px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-[12px] bg-[var(--c-accent-soft)] text-[var(--c-accent-2)]">
        <Inbox className="size-5" />
      </div>
      <div>
        <h3 className="text-xl font-semibold tracking-[-0.2px] text-foreground">
          {filtered ? "Под фильтры ничего не найдено" : "Очередь пуста"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered ? "Измените статус, тип или поисковый запрос." : "Новые генерации появятся здесь после запуска."}
        </p>
      </div>
      {filtered && (
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          Сбросить фильтры
        </Button>
      )}
    </div>
  );
}
