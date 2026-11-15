# 🚀 Express API Setup Guide (server/)

How the Internflow backend is set up — the same stack and conventions as the
AlumnAI server: **Express 5 + TypeScript (ESM) + tsx (dev) + tsdown (build) +
ESLint + Prisma 7 (PostgreSQL) + Socket.IO + Zod**.

---

## 📑 Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start](#2-quick-start)
3. [npm Scripts Reference](#3-npm-scripts-reference)
4. [Why this toolchain (tsx / tsdown / ESLint)](#4-why-this-toolchain-tsx--tsdown--eslint)
5. [Project Structure](#5-project-structure)
6. [Prisma 7 (adapter pattern)](#6-prisma-7-adapter-pattern)
7. [Environment Variables](#7-environment-variables)
8. [Adding a New Domain Module](#8-adding-a-new-domain-module)
9. [Production / Deployment Notes](#9-production--deployment-notes)

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20+ (22 LTS recommended) | Prisma 7 and Express 5 require modern Node |
| npm | 10+ | Ships with Node |
| PostgreSQL | 14+ | Local Postgres, or a managed one (e.g. Neon) — just need a `DATABASE_URL` |
| Redis *(optional)* | 7+ | Only needed when you start using the caching layer (`ioredis` is pre-installed) |

---

## 2. Quick Start

From the **`server/`** folder:

```bash
# 1. Install all dependencies
npm install

# 2. Create your .env (see §7 below)
cp .env.example .env
#    → edit DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

# 3. Generate the Prisma client + run the first migration
npm run db:generate
npm run db:migrate

# 4. Start the dev server (hot reload)
npm run dev
```

You should see:

```
--------------------------------------------------
Internflow API started successfully!
URL: http://localhost:8000
MODE: development
--------------------------------------------------
```

Health check: open `http://localhost:8000` — you get a JSON health payload.
The Socket.IO server is initialized on the same port (socket endpoint: `/socket.io`).

> `npm run db:migrate` needs a reachable database. It creates the migration
> files in `prisma/migrations/` and applies your schema.

---

## 3. npm Scripts Reference

| Script | Command | What it does |
|---|---|---|
| `npm run dev` | `tsx watch src/server.ts` | Runs the API in dev mode with **hot reload** (no build step) |
| `npm run build` | `tsdown src/server.ts --format esm --clean --minify` | **Bundles** the whole server into a single minified ESM file: `dist/server.mjs` |
| `npm start` | `node dist/server.mjs` | Runs the production build |
| `npm run lint` | `eslint .` | Type-aware ESLint check |
| `npm run lint:fix` | `eslint . --fix` | Auto-fix lint issues |
| `npm run db:generate` | `prisma generate` | Regenerates the typed Prisma client after schema changes |
| `npm run db:migrate` | `prisma migrate dev` | Creates + applies a migration (dev) |
| `npm test` | — | Placeholder, wire up your test runner later |

**Typical workflow:** change `prisma/schema.prisma` → `npm run db:migrate` →
Prisma regenerates the client automatically. Restarting `npm run dev` is only
needed occasionally (tsx watch picks up source changes, not generated ones).

---

## 4. Why this toolchain (tsx / tsdown / ESLint)

### ESM-first TypeScript
`package.json` has **`"type": "module"`** and `tsconfig.json` uses
`module: ESNext` + `moduleResolution: bundler`. That gives:

- Modern `import`/`export` everywhere, top-level `await` works
- **Path alias** `@/*` → `src/*` (configured in `tsconfig.paths`) — imports look
  like `import { prisma } from '@/lib/prisma'` instead of relative `../../` chains

### tsx (dev runner)
`tsx` executes TypeScript **directly** — no `tsc` compile loop, no ts-node
config. `tsx watch` restarts on file change. It resolves the `@/*` alias from
tsconfig automatically.

### tsdown (production bundler)
Instead of shipping `src/` + `node_modules` to a server, `npm run build`
bundles **everything into one minified ESM file** (`dist/server.mjs`).
Production then runs plain `node dist/server.mjs` — fast cold start, small
Docker images, no `node_modules` bloat on the VPS. (Rollup-based, by the
Vite ecosystem — think of it as "Vite for libraries/servers".)

### ESLint (the "format" layer)
This setup has **no Prettier** — code style is enforced purely by ESLint 10 in
flat-config mode (`eslint.config.js`):

- `@eslint/js` recommended + `typescript-eslint` recommended (type-aware via
  `parserOptions.project: true`)
- `@typescript-eslint/no-explicit-any` off, `no-console` off (servers log)
- Unused vars = warn, `_`-prefixed args ignored (`_req`, `_next`)

Run `npm run lint` before committing. Generated code (`src/generated/**`),
`dist/`, and config files are excluded in the `ignores` block.

---

## 5. Project Structure

```
server/
├── prisma/
│   ├── schema.prisma          # All models (datasource URL comes from prisma.config.ts)
│   └── migrations/            # Created by `npm run db:migrate`
├── src/
│   ├── config/
│   │   └── env.ts             # ENV object, fail-closed JWT secrets
│   ├── controllers/           # Express request handlers (req → service → res)
│   ├── middlewares/
│   │   └── rateLimiter.ts     # Global rate limiter (add auth/RBAC middlewares here)
│   ├── repositories/          # Prisma queries + Redis caching
│   ├── routes/
│   │   └── index.ts           # Router registration per domain
│   ├── schema/                # Zod validation schemas
│   ├── services/              # Business logic
│   ├── lib/
│   │   ├── prisma.ts          # PrismaClient + pg driver adapter (singleton)
│   │   └── socket.ts          # Socket.IO init (extend with rooms/auth)
│   ├── generated/prisma/      # Prisma client output — GITIGNORED
│   ├── app.ts                 # Express app: middleware chain, routes, error handler
│   └── server.ts              # Entry: http server + Socket.IO + listen
├── prisma.config.ts           # Prisma 7 config (schema path, migrations, DATABASE_URL)
├── eslint.config.js           # ESLint flat config
├── tsconfig.json              # TS 6, ESM/bundler resolution, @/* alias
├── .env.example               # Template — copy to .env
└── package.json               # "type": "module", tsx/tsdown scripts
```

**Request flow (clean layering):**

```
route → middleware (auth/RBAC/zod) → controller → service → repository → prisma/redis
```

---

## 6. Prisma 7 (adapter pattern)

Prisma 7 changed how the client connects — it uses **driver adapters** instead
of a native engine. This repo's setup:

1. **`prisma.config.ts`** (repo root of `server/`) — Prisma 7's config file.
   It loads `dotenv/config` and supplies the **datasource URL from
   `DATABASE_URL`**. That's why `schema.prisma`'s `datasource` block has no
   `url = env(...)` line anymore.
2. **Schema header** — the new `prisma-client` generator outputs the client to
   a source folder:

   ```prisma
   generator client {
     provider = "prisma-client"
     output   = "../src/generated/prisma"
   }

   datasource db {
     provider = "postgresql"
   }
   ```

3. **`src/lib/prisma.ts`** — creates the client with the Postgres adapter
   (`@prisma/adapter-pg`) and exports a singleton. Import it anywhere:

   ```ts
   import { prisma } from '@/lib/prisma';
   const users = await prisma.user.findMany();
   ```

4. `src/generated/prisma/` is **gitignored** — after cloning, run
   `npm run db:generate` before building.

If you swap to a different database later, change the provider in
`schema.prisma` and pick the matching `@prisma/adapter-*` package.

---

## 7. Environment Variables

Copy `.env.example` → `.env` and fill in:

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no (default `8000`) | HTTP + Socket.IO port |
| `NODE_ENV` | no | `development` / `production` |
| `APP_NAME` | no | Shown in health check + boot log |
| `DATABASE_URL` | **yes** | Postgres connection string (`prisma migrate`, `src/lib/prisma.ts`) |
| `JWT_SECRET` | **yes in prod** | Access-token signing. In dev a warning + insecure fallback is used; in prod the server **refuses to boot** without it |
| `JWT_REFRESH_SECRET` | **yes in prod** | Refresh-token signing (same fail-closed behavior) |
| `FRONTEND_URL` | no (default `http://localhost:3000`) | CORS origin + Socket.IO CORS (cookies allowed via `credentials: true`) |
| `BACKEND_URL` | no | Used in boot log / client config |
| `REDIS_URL` | when using cache | Redis connection (ioredis) — pre-wired in ENV |

Generate secrets with `https://jwtsecrets.com/` or:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

`.env` is gitignored. For Cloudinary/Resend/Gemini-style integrations later,
add keys in `src/config/env.ts` and `.env.example` following the same pattern.

---

## 8. Adding a New Domain Module

Example: an `internships` domain. Follow the alumnai layering:

**1. Zod schema** — `src/schema/internship.schema.ts`

```ts
import { z } from 'zod';

export const createInternshipSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    company: z.string().min(1),
  }),
});
export type CreateInternshipInput = z.infer<typeof createInternshipSchema>['body'];
```

**2. Repository** — `src/repositories/internship.repository.ts`
(all Prisma access lives here)

```ts
import { prisma } from '@/lib/prisma';

export const internshipRepository = {
  findMany: () => prisma.internship.findMany(),
  create: (data: { title: string; company: string }) =>
    prisma.internship.create({ data }),
};
```

**3. Service** — `src/services/internship.service.ts`
(business logic; emits socket events if needed)

```ts
import { internshipRepository } from '@/repositories/internship.repository';
import type { CreateInternshipInput } from '@/schema/internship.schema';

export const internshipService = {
  list: () => internshipRepository.findMany(),
  create: (input: CreateInternshipInput) => internshipRepository.create(input),
};
```

**4. Controller** — `src/controllers/internship.controller.ts`

```ts
import type { Request, Response } from 'express';
import { internshipService } from '@/services/internship.service';

export const internshipController = {
  list: async (_req: Request, res: Response) => {
    const internships = await internshipService.list();
    res.status(200).json({ status: 'success', data: internships });
  },
  create: async (req: Request, res: Response) => {
    const internship = await internshipService.create(req.body);
    res.status(201).json({ status: 'success', data: internship });
  },
};
```

**5. Router** — `src/routes/internship.routes.ts`

```ts
import { Router } from 'express';
import { internshipController } from '@/controllers/internship.controller';

const router = Router();

router.get('/', internshipController.list);
router.post('/', internshipController.create);

export default router;
```

**6. Register** — `src/routes/index.ts`

```ts
import { Router } from 'express';
import internshipRoutes from './internship.routes';

const router = Router();
router.use('/internships', internshipRoutes);

export default router;
```

Now `GET/POST http://localhost:8000/api/internships` works — version your
routes the alumnai way (`/api/internships/v1/...`) once endpoints stabilize.
Don't forget the matching `model Internship` in `prisma/schema.prisma` +
`npm run db:migrate`.

---

## 9. Production / Deployment Notes

- **Build:** `npm run build` → single file `dist/server.mjs` → run with
  `npm start` (`node dist/server.mjs`). Put it behind **nginx** as a reverse
  proxy; `app.ts` already sets `trust proxy = 1` so rate limiting sees real
  client IPs.
- **Docker:** the alumnai repo ships a multi-stage `server/Dockerfile`
  (build stage with tsdown → runtime stage with just `node` + `dist`). Copy
  that pattern when you're ready to containerize.
- **Cookies/JWT:** the auth flow uses `httpOnly` secure cookies
  (`cookie-parser` is installed); keep `credentials: true` in CORS and set
  `secure` cookies in production.
- **Env:** in production, `NODE_ENV=production` makes missing
  `JWT_SECRET`/`JWT_REFRESH_SECRET` a hard boot failure — by design.
