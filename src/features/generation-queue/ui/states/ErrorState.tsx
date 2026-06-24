import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[260px] w-full flex-col items-center justify-center gap-3 rounded-[16px] border border-red-500/20 bg-card px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-[12px] bg-red-500/15 text-red-300">
        <AlertCircle className="size-5" />
      </div>
      <div>
        <h3 className="text-xl font-semibold tracking-[-0.2px] text-foreground">Ошибка загрузки</h3>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button size="sm" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}
