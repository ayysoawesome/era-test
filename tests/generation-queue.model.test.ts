import test from "node:test";
import assert from "node:assert/strict";
import type { GenerationTask } from "../src/entities/generation-task";
import {
  MAX_CONCURRENT,
  getQueueStats,
  getVisibleTasks,
  queueReducer,
  resolveInitialQueueTasks,
  restoreQueueSnapshot,
  serializeQueueSnapshot,
} from "../src/features/generation-queue";

const baseTime = Date.parse("2026-06-24T10:00:00.000Z");

function task(
  id: string,
  status: GenerationTask["status"],
  createdOffset: number,
  progress = 0,
): GenerationTask {
  return {
    id,
    type: id.startsWith("v") ? "video" : "text",
    status,
    prompt: `Prompt ${id}`,
    modelName: id.startsWith("v") ? "Kling 2.5 Turbo" : "GPT-4o",
    credits: 10,
    createdAt: baseTime + createdOffset,
    updatedAt: baseTime + createdOffset,
    progress,
    etaSeconds: 60,
  };
}

test("startNextQueuedTasks respects MAX_CONCURRENT and FIFO order", () => {
  const initial = {
    tasks: [
      task("r1", "running", 0, 40),
      task("q1", "queued", 1),
      task("q2", "queued", 2),
      task("q3", "queued", 3),
    ],
  };

  const state = queueReducer(initial, {
    type: "start-next-queued",
    now: baseTime + 10,
  });

  const running = state.tasks.filter((item) => item.status === "running");
  assert.equal(running.length, MAX_CONCURRENT);
  assert.deepEqual(running.map((item) => item.id), ["r1", "q1"]);
  assert.equal(state.tasks.find((item) => item.id === "q2")?.status, "queued");
});

test("task progress reaches done at 100 percent", () => {
  const initial = { tasks: [task("r1", "running", 0, 96)] };

  const state = queueReducer(initial, {
    type: "progress",
    id: "r1",
    amount: 12,
    now: baseTime + 500,
  });

  assert.equal(state.tasks[0]?.status, "done");
  assert.equal(state.tasks[0]?.progress, 100);
});

test("cancel, retry, stats, filtering, sorting and search are deterministic", () => {
  const initial = {
    tasks: [
      task("q1", "queued", 1),
      task("f1", "failed", 2),
      task("d1", "done", 3, 100),
    ],
  };

  const canceled = queueReducer(initial, {
    type: "cancel",
    id: "q1",
    now: baseTime + 10,
  });
  assert.equal(canceled.tasks.find((item) => item.id === "q1")?.status, "canceled");

  const retried = queueReducer(canceled, {
    type: "retry",
    id: "f1",
    now: baseTime + 20,
  });
  assert.equal(retried.tasks.find((item) => item.id === "f1")?.status, "queued");
  assert.equal(retried.tasks.find((item) => item.id === "f1")?.progress, 0);

  assert.deepEqual(getQueueStats(retried), {
    queued: 1,
    running: 0,
    done: 1,
    failed: 0,
    canceled: 1,
    active: 1,
  });

  const visible = getVisibleTasks(retried.tasks, {
    status: "all",
    type: "all",
    sort: "newest",
    query: "prompt",
  });

  assert.deepEqual(visible.map((item) => item.id), ["d1", "f1", "q1"]);
});

test("queue snapshot restores persisted tasks after page reload", () => {
  const storedTasks = [
    task("r1", "running", 0, 42),
    task("q1", "queued", 1),
    task("d1", "done", 2, 100),
    task("f1", "failed", 3),
  ];

  const restored = restoreQueueSnapshot(
    serializeQueueSnapshot(storedTasks),
    baseTime + 1000,
  );

  assert.equal(restored.length, storedTasks.length);
  assert.equal(restored.find((item) => item.id === "r1")?.status, "queued");
  assert.equal(restored.find((item) => item.id === "r1")?.progress, 42);
  assert.equal(restored.find((item) => item.id === "d1")?.status, "done");
  assert.equal(restored.find((item) => item.id === "f1")?.status, "failed");
});

test("persisted queue has priority over simulated initial load failure", () => {
  const storedTasks = [
    task("r1", "running", 0, 42),
    task("q1", "queued", 1),
  ];

  const result = resolveInitialQueueTasks({
    rawSnapshot: serializeQueueSnapshot(storedTasks),
    seedTasks: [task("seed", "queued", 2)],
    now: baseTime + 1000,
    failureRate: 1,
    randomValue: 0,
  });

  assert.equal(result.loadError, null);
  assert.deepEqual(result.tasks.map((item) => item.id), ["r1", "q1"]);
  assert.equal(result.tasks[0]?.status, "queued");
});

test("missing queue snapshot initializes seed tasks", () => {
  const seedTasks = [task("seed", "queued", 2)];

  const result = resolveInitialQueueTasks({
    rawSnapshot: null,
    seedTasks,
    now: baseTime + 1000,
    failureRate: 0,
    randomValue: 1,
  });

  assert.equal(result.loadError, null);
  assert.deepEqual(result.tasks.map((item) => item.id), ["seed"]);
});
