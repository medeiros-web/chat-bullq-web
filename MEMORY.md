# MEMORY.md

Operational notes and decisions for this project, kept separate from [CLAUDE.md](CLAUDE.md) (which covers code conventions). Update this file as infrastructure/decisions change; don't let it go stale.

## Live environments

| Target | URL | Status |
|---|---|---|
| Vercel | https://chat-bullq-web.vercel.app | Live, production alias |
| VPS (Portainer/Swarm) | https://wmm.chatatender.ia.br | Live |
| Backend API (shared by both) | https://wmmapi.chatatender.ia.br/api/v1 | Live |

Both frontends share one backend/database — there is only one set of user accounts and one Postgres instance behind `wmmapi.chatatender.ia.br`.

## Infrastructure

- VPS managed via Portainer at `portainer.chatatender.ia.br`, Docker Swarm endpoint id `1`.
- The app's Swarm stack is named `chat-bullq` (stack id `20`), composed of `postgres`, `api`, `web` services, routed by Traefik using `Host()` rules (must be backtick-quoted or the router silently fails — see [CLAUDE.md](CLAUDE.md)).
- Images are published to `ghcr.io/medeiros-web/chat-bullq-web` and `ghcr.io/medeiros-web/chat-bullq-api`.
- This local working copy is **not** a git repository (no `.git`), even though `.github/workflows/docker.yml` exists and expects to build/push on `main`/`master` push. Until it's connected to the GitHub remote, image updates for the VPS must be built and pushed manually from a machine with Docker.

## Decisions / history

- **2026-06-20** — Confirmed `wmm.chatatender.ia.br` (not the earlier-floated `chatbulq.chatatender.ia.br`) as the canonical VPS domain; the existing Traefik/Portainer stack already used `wmm`/`wmmapi`, so kept it rather than renaming.
- **2026-06-20** — Found and fixed a pre-existing bug in the `chat-bullq` stack's Traefik labels: `Host(wmm.chatatender.ia.br)` was missing backticks, so the router never matched and both domains served Traefik's default 404 even though the containers were healthy. Fixed by quoting the host rule and redeploying with `pullImage: true`.
- **2026-06-20** — Deployed both targets with current `main`-equivalent local code (Vercel via `vercel --prod`; VPS via manual `docker build` + `docker push` + Portainer stack update, since no git remote is wired up yet).

## Credentials

Do **not** store plaintext credentials in this file or anywhere in the repo. Admin/Portainer/registry credentials shared in chat during setup should be rotated into a password manager and out of conversation history. The application admin account (`medeirosassessor.adv@gmail.com`, role `OWNER` on org "Medeiros Assessoria") already exists in the shared backend — works for both deployment targets since they share one API/database.
