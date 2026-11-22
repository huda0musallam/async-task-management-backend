# TypeScript Async Task Management Backend

A small Node.js backend project written in TypeScript with ECMAScript modules (ESM). It defines typed `Task` and `User` data models and a task service with five asynchronous operations: list, get, create, update and delete. Tasks are kept in memory.

This project has **no database, no HTTP server, no API routes and no automated test suite**. The service functions are meant to be called from other code, for example routes added in a later assignment.

## Technologies

- **Node.js** runs the compiled JavaScript (developed with Node.js 24).
- **TypeScript** adds static types. Strict mode is on (`"strict": true` in `tsconfig.json`).
- **ESM (ECMAScript modules)** is the module system: `package.json` sets `"type": "module"` and `tsconfig.json` uses `"module": "NodeNext"`. Because of this, relative imports end in `.js` even in `.ts` files (for example `../types/task.js`).
- **tsx** runs TypeScript directly during development, without a build step.

## Project structure

```
typescript-backend-starter/
├── src/
│   ├── app.ts                  # Application entry point (prints a start-up message)
│   ├── services/
│   │   └── task.service.ts     # Async task operations and in-memory storage
│   └── types/
│       ├── task.ts             # Task interface
│       └── user.ts             # User interface
├── dist/                       # Compiled JavaScript, created by `npm run build` (not committed)
├── package.json                # Project metadata, npm scripts, dev dependencies
├── package-lock.json           # Exact dependency versions
├── tsconfig.json               # Strict TypeScript + ESM compiler settings
└── .gitignore                  # Excludes node_modules/, dist/ and logs
```

## Data models

Both interfaces live in `src/types/` and use named exports.

### `Task` (`src/types/task.ts`)

```ts
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}
```

### `User` (`src/types/user.ts`)

```ts
export interface User {
  id: number;
  name: string;
  email: string;
}
```

**Why they exist:** the interfaces describe the shape of the data in one place. With strict mode on, TypeScript reports missing fields, misspelled properties and wrong types at compile time, and editors can autocomplete fields. Interfaces exist only at compile time; they produce no JavaScript at runtime.

`User` is defined for upcoming work and is not used by the task service yet.

## Task service operations

All operations are in `src/services/task.service.ts`, are `async`, and are exported by name. They import `Task` with a type-only import (`import type { Task } from "../types/task.js"`).

| Function | Returns | On success | On failure |
|---|---|---|---|
| `getAllTasks()` | `Promise<Task[]>` | Resolves with all tasks (`[]` if there are none) | Does not fail |
| `getTaskById(id: number)` | `Promise<Task>` | Resolves with the matching task | Rejects with `TaskNotFoundError` |
| `createTask(title: string)` | `Promise<Task>` | Resolves with the new task: next id, trimmed title, `completed: false` | Rejects with `Error("Task title cannot be empty")` if the title is empty or only spaces |
| `updateTask(id: number, updates: Partial<Task>)` | `Promise<Task>` | Resolves with the updated task | Rejects with `TaskNotFoundError`, or with the empty-title error |
| `deleteTask(id: number)` | `Promise<Task>` | Resolves with the removed task | Rejects with `TaskNotFoundError` |

Details:

- **`updateTask`** takes `Partial<Task>`, so only the fields being changed need to be passed (for example `{ completed: true }`). Only `title` and `completed` are applied. A task's `id` never changes, even if `updates` contains one.
- **Ids** start at 1 and increase. Ids of deleted tasks are not reused.
- **Copies:** the functions return copies of stored tasks, so changing a returned object does not change the stored data.
- **`TaskNotFoundError`** is also exported. Its message names the missing id, for example `Task with id 5 was not found`.

## Async/await, Promises and error handling

- **Promises:** every service function is declared `async`, so it always returns a Promise. A Promise either *resolves* with a value (success) or *rejects* with an error (failure).
- **async/await:** callers use `await` to wait for the result, which keeps the code readable and in top-to-bottom order.
- **Error handling:** when a function hits a problem (a missing id or an empty title), it `throw`s. Inside an `async` function this rejects the Promise instead of crashing the program. Callers handle it with `try/catch`:

```ts
import { getTaskById, TaskNotFoundError } from "./services/task.service.js";

try {
  const task = await getTaskById(42);
  console.log(task.title);
} catch (error) {
  if (error instanceof TaskNotFoundError) {
    console.error(error.message); // "Task with id 42 was not found"
  } else {
    throw error;
  }
}
```

- **Why async if the data is in memory?** Reading an array is instant, but a real database would be asynchronous. Making the functions async now means code that calls them will not need to change if the storage is replaced later.

## In-memory storage

Tasks are stored in a plain array inside `task.service.ts`. **There is no database: all tasks are lost whenever the application stops or restarts**, and the id counter starts again at 1.

## Installation

Requires Node.js and npm.

```bash
npm install
```

## Available commands

| Command | What it does |
|---|---|
| `npm run dev` | Runs `src/app.ts` directly with `tsx` (no build needed) |
| `npm run typecheck` | Checks types with `tsc --noEmit` without creating output files |
| `npm run build` | Compiles `src/` to JavaScript in `dist/` with `tsc` |
| `npm start` | Runs the compiled `dist/app.js` with Node.js (run `npm run build` first) |

`src/app.ts` currently only prints `Hello from TypeScript Backend!`; it does not call the task service yet.

## AI Usage

This project was built with help from an AI coding assistant (Claude Code).

- **Implementation:** the AI wrote the first versions of the `Task` and `User` interfaces, the task service and this README, based on the assignment requirements I gave it.
- **Explanations:** the AI explained the code it wrote, including why the interfaces are needed, what each service function returns, and how Promises, async/await and errors work together.
- **Debugging and checking:** the AI ran the type checker and all four npm scripts, and it noticed that `tsc` was missing because dependencies had not been installed yet. It also checked the service with temporary scripts kept outside the project, so they are not part of this repository. Those checks are not an automated test suite.

I reviewed the code and explanations and tested the project myself. I am responsible for the final submission.
