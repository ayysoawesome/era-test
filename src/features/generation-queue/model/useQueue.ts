import { createContext, useContext } from "react";
import type { GenerationTask } from "@/entities/generation-task";
import type { QueueStats, QueueViewFilters, StatusFilter, TypeFilter, QueueSort } from "./selectors";

export interface QueueContextValue {
  tasks: GenerationTask[];
  visibleTasks: GenerationTask[];
  activeTasks: GenerationTask[];
  stats: QueueStats;
  averageActiveProgress: number;
  filters: QueueViewFilters;
  isLoading: boolean;
  loadError: string | null;
  setStatusFilter: (status: StatusFilter) => void;
  setTypeFilter: (type: TypeFilter) => void;
  setSort: (sort: QueueSort) => void;
  setQuery: (query: string) => void;
  cancelTask: (id: string) => void;
  retryTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearDone: () => void;
  reload: () => void;
}

export const QueueContext = createContext<QueueContextValue | null>(null);

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) throw new Error("useQueue must be used inside QueueProvider");
  return context;
}
