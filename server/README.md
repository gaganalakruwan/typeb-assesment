# server

REST API for the TODO app, built with **Express 5**, **TypeScript**, **Mongoose** and **Zod**.

## Setup and run

Requires Node.js 20+ and a MongoDB instance.

```bash
# from the repo root
npm install
# start MongoDB: see "MongoDB connection notes" below
cp server/.env.example server/.env
npm run dev:server                             
# http://localhost:4000
```

Other scripts (run inside `server/`):

| Script | What it does |
|---|---|
| `npm run dev` | Start with auto-reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run the API tests (Vitest + Supertest) |

## Tests

`test/todos.test.ts` covers every endpoint plus validation, 404/400 errors, and concurrent toggles, using Supertest against the real Express app (`createApp()`).

The tests need a running MongoDB. They use a separate database, `todo-app-test` by default, which is wiped before each test and dropped at the end. Override it with `MONGODB_TEST_URI`.

```bash
npm test -w server
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port the API listens on |
| `MONGODB_URI` | `mongodb://localhost:27017/todo-app` | MongoDB connection string |
| `CORS_ORIGIN` | `http://localhost:5173` | Frontend origin allowed by CORS |

## MongoDB connection notes

Any of these works with the default `MONGODB_URI`:

**Local (Homebrew, macOS):** this is what the app was developed against.

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Local (Docker):** the root `docker-compose.yml` runs `mongo:8` on port 27017 with a named volume, so data survives restarts.

```bash
npm run db:up     
npm run db:down   
```

> **Note:** recent MongoDB images refuse to start on Linux kernels 6.19 and newer ([SERVER-121912](https://jira.mongodb.org/browse/SERVER-121912)). Some Docker VMs (e.g. recent OrbStack) use such kernels. If `docker logs todo-mongo` shows that message, use the Homebrew install or Atlas instead.

**MongoDB Atlas:** create a free cluster, add your IP under *Network Access*, then set
`MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/todo-app`.

The server exits with a clear message if it can't reach MongoDB within 5 seconds.

## API

| Method | Endpoint | Body | Success |
|---|---|---|---|
| GET | `/api/todos` | — | `200` list, newest first |
| POST | `/api/todos` | `{ title, description?, dueDate? }` | `201` created todo |
| PUT | `/api/todos/:id` | `{ title?, description?, dueDate? }` | `200` updated todo |
| PATCH | `/api/todos/:id/done` | — | `200` todo with `done` flipped |
| DELETE | `/api/todos/:id` | — | `204` no content |
| GET | `/api/health` | — | `200 { status: "ok" }` |

Every error has the same shape:

```json
{ "error": { "message": "Title is required.", "details": [{ "field": "title", "message": "Title is required." }] } }
```

| Status | When |
|---|---|
| `400` | Validation failed, malformed id, or invalid JSON |
| `404` | Todo or route not found |
| `500` | Unexpected server error (logged, details hidden) |

## Project structure

```
src/
├── index.ts               # connects to MongoDB, starts the server, graceful shutdown
├── app.ts                 # builds the Express app (no I/O, so it is easy to test)
├── config.ts              # env variables with defaults
├── models/Todo.ts         # Mongoose schema (timestamps: createdAt/updatedAt)
├── validation/todo.ts     # Zod schemas for request bodies
├── middleware/
│   ├── validate.ts        # validateBody(schema), validateId
│   └── errorHandler.ts    # HttpError, 404 handler, central error formatting
├── controllers/todos.ts   # one function per endpoint
└── routes/todos.ts        # maps URLs + middleware to controllers
```

## Design decisions

- **Validation at the edge with Zod**: request bodies are parsed before reaching controllers. Unknown fields (e.g. `done`, `_id`) are stripped, so `PUT` cannot change the done status, which belongs to the `PATCH` endpoint.
- **Atomic toggle**: `PATCH /done` flips the flag with a MongoDB update pipeline (`$not: '$done'`) in a single operation, so concurrent clicks can't race.
- **Testable app**: `app.ts` builds the Express app without connecting or listening; `index.ts` does the I/O. Tests import `createApp()` directly.
- **Express 5**: errors thrown in async handlers reach the error middleware automatically, with no `try/catch` boilerplate.
- **Due dates as calendar dates**: `dueDate` is stored as a `"YYYY-MM-DD"` string rather than a `Date`, so a task due on the 25th stays on the 25th whatever the user's or server's timezone. Impossible dates like `2026-02-30` are rejected.
- **Clearing optional fields**: sending `description: ""` or `dueDate: ""` in a `PUT` removes the field.

## Assumptions and limitations

- No authentication: all todos are shared by everyone using the API.
- No pagination: `GET /api/todos` returns all items, which is fine for a personal list.
- Limits: title 1–100 characters, description up to 500 characters (whitespace trimmed). The due date is optional.
- Tests run against a real MongoDB rather than an in-memory one, so a database must be running.
