import { Skeleton } from "@/shared/ui/skeleton";

export function LoadingState() {
  return (
    <div className="flex w-full flex-col gap-2.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="rounded-[16px] border border-border bg-card p-4">
          <div className="flex gap-4">
            <Skeleton className="size-14 rounded-[12px]" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-[5px] w-full rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
