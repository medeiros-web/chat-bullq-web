# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Next.js 16 (App Router, Turbopack) frontend for **Chat BullQ**, a multi-tenant chat/inbox SaaS (inbox, contacts, pipelines, automations, AI agents, scheduling). React 19, TypeScript, Tailwind v4, Zustand for client state, TanStack Query for server state, react-hook-form + zod for forms, socket.io-client for realtime, axios for HTTP.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build (standalone output)
- `npm run start` — run the standalone build
- `npm run lint` — ESLint

## Structure

- `src/app/` — routes. `(auth)` route group for login/register, `(dashboard)` for the authenticated app shell.
- `src/features/<feature>/` — feature-sliced modules (components, schemas, services, hooks) per domain: auth, inbox, contacts, pipelines, automations, ai-agents, scheduling, channels, settings, dashboard, causidico, xquads.
- `src/lib/api.ts` — single axios instance (`api`). Auth token + active org id are injected from `localStorage` (`access_token`, `refresh_token`, `active_org_id`) via request interceptor; 401s trigger a silent refresh-token retry, then redirect to `/login` on failure.
- `src/lib/socket.ts` — socket.io client setup.
- `src/stores/` — Zustand stores (e.g. `auth-store.ts`).
- `src/components/ui/` — shared UI primitives.

## Backend integration

- API base URL comes from `NEXT_PUBLIC_API_URL` (build-time env var baked into the Docker image), default `http://localhost:3001/api/v1` for local dev.
- Auth endpoints: `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/refresh`. Responses are wrapped as `{ data: ... }`.
- Multi-tenant: a user belongs to one or more organizations with a `role` (e.g. `OWNER`); the active org id is sent as `x-organization-id` header.

## Deployment

Two live targets, both pointing at the same backend API (`https://wmmapi.chatatender.ia.br/api/v1`):

1. **Vercel** — project `chat-bullq-web` (org `medeiros-assessoria-s-projects`), production URL `https://chat-bullq-web.vercel.app`. Deploy with `vercel --prod` (project already linked via `.vercel/`).
2. **VPS / Docker Swarm via Portainer** (`portainer.chatatender.ia.br`) — Swarm stack `chat-bullq` (stack id 20 on endpoint id 1) runs `postgres`, `api` (`ghcr.io/medeiros-web/chat-bullq-api`), and `web` (`ghcr.io/medeiros-web/chat-bullq-web`), routed via Traefik to `https://wmm.chatatender.ia.br` (web) and `https://wmmapi.chatatender.ia.br` (api). Traefik `Host()` rules require backtick-quoted domains (e.g. `` Host(`wmm.chatatender.ia.br`) ``) — a missing-backtick label previously broke routing silently (Traefik served its own 404 instead of erroring).
3. CI: `.github/workflows/docker.yml` builds and pushes `ghcr.io/medeiros-web/chat-bullq-web:latest` to GHCR on push to `main`/`master` — but this repo is not currently a git repository locally, so the image must be built and pushed manually (`docker build` + `docker push`) until git is initialized and connected to a remote that triggers the workflow.

To update the live `web` service after pushing a new image to GHCR, redeploy the Portainer stack with `pullImage: true` (`PUT /api/stacks/20?endpointId=1`) — Swarm does not automatically re-pull `:latest` on its own.

## Conventions

- No comments unless explaining non-obvious *why*.
- Components are function components using named exports (e.g. `export function LoginForm()`).
- Forms: `useForm` + `zodResolver` + a co-located `*.schema.ts`.
