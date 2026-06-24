export type GenType = "text" | "image" | "video" | "audio";

export type TaskStatus = "queued" | "running" | "done" | "failed" | "canceled";

export interface GenerationTask {
  id: string;
  type: GenType;
  status: TaskStatus;
  prompt: string;
  modelName: string;
  credits: number;
  createdAt: number;
  updatedAt: number;
  progress: number;
  etaSeconds: number;
  durationSeconds?: number;
  queuePosition?: number;
  error?: string;
  resultLabel?: string;
}
