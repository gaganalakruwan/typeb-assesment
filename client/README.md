# client

React UI for the TODO app, built with **React 19**, **TypeScript**, **Vite** and **Tailwind CSS v4**.

## Setup and run

Requires Node.js 20+. The API (`server/`) must be running for data to load.

```bash
# from the repo root
npm install
npm run dev:client        
# http://localhost:5173
```

Or run frontend and backend together with `npm run dev` from the root.

Other scripts (run inside `client/`):

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Lint with oxlint |

### Connecting to the API

In development, Vite proxies `/api/*` to `http://localhost:4000` (see `vite.config.ts`), so no CORS setup is needed. To use a backend on another origin, set `VITE_API_URL`, for example `VITE_API_URL=https://api.example.com`.

## Features

- Two-column layout: the form takes 40% of the width and the list 60% (stacked on phones)
- List, create, edit (inline), complete and delete todos
- Optional due date with a date picker (defaults to today for new todos)
- Search todos by title or description (case-insensitive)
- Filter the list by due date: *All*, *Today*, or any date (combines with search)
- Pagination: 5 todos per page, with a "1–5 of 14" counter
- List rows show only the title; click a title to expand its description and due date
- Completed todos are struck through and faded
- Confirmation dialogs before deleting and before marking as done (Esc, backdrop click or Cancel to dismiss)
- **Optimistic updates**: toggle, edit and delete update the UI instantly; if the request fails, only that item is rolled back and an error is shown
- Form validation (title required, length limits, character counter)
- Loading skeletons, an empty state, and a dismissible error banner with *Retry*
- Subtle animations for new items and dialogs

## Project structure

```
src/
├── api/
│   ├── client.ts           # axios instance: base URL, timeout, error interceptor
│   └── todos.ts            # one function per todo endpoint, built on the client
├── hooks/useTodos.ts       # list state, loading/error, optimistic updates with rollback
├── components/
│   ├── TodoForm.tsx        # create + edit form with validation (reused for both)
│   ├── TodoList.tsx        # search, date filter, paging + loading / empty / list states
│   ├── Pagination.tsx      # Prev / page numbers (with … gaps) / Next
│   ├── TodoItem.tsx        # expandable row: checkbox, inline edit, delete, confirmations
│   └── ConfirmDialog.tsx   # animated, accessible modal (danger / success tones)
├── lib/date.ts             # today() and formatDate() for "YYYY-MM-DD" due dates
├── types/todo.ts           # Todo type shared by the app
├── App.tsx                 # page layout and error banner
└── index.css               # Tailwind import and custom animations
```

## Design decisions

- **Separate API layer**: components never make HTTP calls. `api/client.ts` configures axios once (base URL, timeout, and an interceptor that turns failures into readable messages), and `api/todos.ts` holds the endpoint calls, so adding another resource means adding one small file.
- **Custom hook instead of a data library**: the app has one resource, so a small `useTodos` hook keeps the optimistic-update logic visible and easy to follow.
- **Per-item rollback**: on failure, only the affected todo is restored rather than replacing the whole list, so other in-flight changes aren't lost.
- **Create is not optimistic**: a new todo needs its id from the server; the form shows "Saving…" instead, and keeps the text if the request fails.

## Assumptions and limitations

- No authentication or multiple users.
- No offline support: changes need the server to be reachable.
- Search, the date filter and pagination run in the browser over the full list, which the API returns in one response. That keeps the API as the assignment specifies and makes filtering instant, but for thousands of todos it should move to the server (e.g. `GET /api/todos?search=&date=&page=`).
- The date filter matches one exact due date (no ranges).
- Unchecking a done todo doesn't ask for confirmation (low risk and easy to redo).
- Validation limits (title ≤ 100, description ≤ 500) are duplicated from the backend and must be kept in sync.
