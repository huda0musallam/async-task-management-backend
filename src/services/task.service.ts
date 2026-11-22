import type { Task } from "../types/task.js";

/**
 * Thrown when no task exists with the requested id.
 */
export class TaskNotFoundError extends Error {
  constructor(id: number) {
    super(`Task with id ${id} was not found`);
    this.name = "TaskNotFoundError";
  }
}

// In-memory storage. Data is lost when the process restarts.
const tasks: Task[] = [];
let nextId = 1;

function findTaskIndex(id: number): number {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new TaskNotFoundError(id);
  }
  return index;
}

export async function getAllTasks(): Promise<Task[]> {
  // Return copies so callers cannot change the stored tasks directly.
  return tasks.map((task) => ({ ...task }));
}

export async function getTaskById(id: number): Promise<Task> {
  const index = findTaskIndex(id);
  return { ...tasks[index]! };
}

export async function createTask(title: string): Promise<Task> {
  const trimmedTitle = title.trim();
  if (trimmedTitle === "") {
    throw new Error("Task title cannot be empty");
  }

  const task: Task = {
    id: nextId++,
    title: trimmedTitle,
    completed: false,
  };
  tasks.push(task);
  return { ...task };
}

export async function updateTask(
  id: number,
  updates: Partial<Task>,
): Promise<Task> {
  const index = findTaskIndex(id);
  const existing = tasks[index]!;

  if (updates.title !== undefined && updates.title.trim() === "") {
    throw new Error("Task title cannot be empty");
  }

  const updated: Task = {
    ...existing,
    ...(updates.title !== undefined && { title: updates.title.trim() }),
    ...(updates.completed !== undefined && { completed: updates.completed }),
    // The id is never changed, even if `updates.id` is provided.
    id: existing.id,
  };

  tasks[index] = updated;
  return { ...updated };
}

export async function deleteTask(id: number): Promise<Task> {
  const index = findTaskIndex(id);
  const [removed] = tasks.splice(index, 1);
  return removed!;
}
