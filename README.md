# Full-stack TODO App

A simple TODO app: React + TypeScript frontend, Express + TypeScript API, MongoDB storage, organized as an **npm workspaces** monorepo.

```
hiring-fullstack-todo/
├── client/              # React + Vite + Tailwind CSS (see its README)
├── server/              # Express + Mongoose + Zod (see its README)
├── docker-compose.yml   # local MongoDB
└── package.json         # workspaces + scripts to run everything
```

## Quick start

Requires Node.js 20+ and MongoDB running on `localhost:27017`: Homebrew, Docker (`npm run db:up`) or Atlas. See [server/README.md](server/README.md#mongodb-connection-notes).

```bash
npm install                                    
cp server/.env.example server/.env
npm run dev                                    
```

Open http://localhost:5173.

## Root scripts

| Script | What it does |
|---|---|
| `npm run dev` | Run backend and frontend together |
| `npm run dev:client` / `dev:server` | Run one side only |
| `npm run build` | Build both packages |
| `npm test` | Run the API tests (needs MongoDB running) |
| `npm run db:up` / `db:down` | Start / stop the MongoDB container |

## How it fits together

```
Browser ──► Vite dev server (:5173) ──/api proxy──► Express API (:4000) ──► MongoDB (:27017)
```

The UI calls the API only through `client/src/api/todos.ts`. The API validates every request with Zod, stores todos with Mongoose, and returns errors in one consistent shape that the UI shows to the user.

See [client/README.md](client/README.md) and [server/README.md](server/README.md) for details, design decisions and limitations.
