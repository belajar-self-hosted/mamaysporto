# mamaysporto

Personal portfolio website built with SolidJS, Vite, Express, and PostgreSQL. The root application is deployed with Docker Compose to the self-hosted Proxmox LXC described in the deployment spec and GitHub Actions workflow. The legacy Vercel/Supabase setup is not used by the root application.

## Stack

- SolidJS and Vite frontend (`src/`)
- Express 5 API (`server/`)
- PostgreSQL 16 (`database/`)
- Docker Compose deployment (`compose.yaml`)
- Local media volume served from `/uploads`
- Separate React/TypeScript prototype in `sumur-creative/`; it is not part of the root build or deployment

The AI chat prototype is not part of the active application. SQL under `supabase/` is retained as legacy material and is not used by the Express runtime. Its write policies now fail closed when those scripts are run; this does not change policies on an already provisioned Supabase project.

## Requirements

- Node.js 22.13+ or 24+ for local development and verification
- Docker Engine with Docker Compose v2 for the full local stack

## First-time setup

1. Copy `.env.example` to `.env` and generate three independent random secrets. Use hex values so they can safely appear in the PostgreSQL connection URL:

   ```sh
   cp .env.example .env
   openssl rand -hex 32 # POSTGRES_PASSWORD
   openssl rand -hex 32 # APP_DB_PASSWORD
   openssl rand -hex 32 # JWT_SECRET
   ```

   Put each generated value into the matching variable in `.env`. Keep `.env` private and out of version control. `POSTGRES_USER` is the database bootstrap role; the application connects as the separate, limited `APP_DB_USER`.

2. Build the app image, initialize the database, apply pending migrations, and start the site:

   ```sh
   docker compose build app
   docker compose run --rm migrator
   docker compose up -d
   ```

   The PostgreSQL initialization scripts create the schema and public portfolio content on an empty data volume. The migrator then provisions the runtime DB role, grants the application's required table permissions, and applies numbered SQL files in `database/migrations/`. The initialization scripts run only when the PostgreSQL data volume is first created.

3. Create the first admin account interactively inside the running app container. The password prompt does not echo the password, and an existing email is never overwritten:

   ```sh
   docker compose exec app node scripts/create-admin.js
   ```

4. Open `http://localhost:3000` and check `http://localhost:3000/api/health`. The admin panel is available at `/#/admin`.

On an existing deployment, add `APP_DB_USER`, `APP_DB_PASSWORD`, and a strong `JWT_SECRET` to its private `.env` before deploying. Keep `POSTGRES_USER` and `POSTGRES_PASSWORD` aligned with the credentials already stored in the existing PostgreSQL volume; changing those environment values alone does not rotate a database role password. Run the migrator before starting/recreating the app. The migration step creates the limited runtime role, so the first application start will fail until it succeeds. Review existing admin accounts and rotate any credentials that came from an older seed; changing this repository does not alter existing PostgreSQL volumes or admin passwords.

## Local frontend/API development

Install the root dependencies and configure the host-side `DATABASE_URL` in `.env` to use the Compose runtime role at `localhost:5432`:

```sh
npm ci
docker compose build app
docker compose up -d postgres
docker compose run --rm migrator
npm run dev
```

The PostgreSQL port is bound to loopback only. If local port 5432 is already in use, change `POSTGRES_PORT` in `.env` and update the host-side `DATABASE_URL` to match. `npm start` also loads `.env` when present. `npm test`, `npm run lint`, and `npm run build` are the project verification commands.

## Deployment and operations

The checked-in workflow builds and deploys on the configured self-hosted runner in LXC 10018. Keep `.env` on the LXC outside the synchronized source tree. The Traefik profile currently forwards HTTP from ingress LXC 10080 (`192.168.0.80`) to the app LXC (`192.168.0.18:3000`). Restrict port 3000 at the LXC/Proxmox firewall so only the ingress gateway can reach it. The final internal hop is still HTTP; use it only on a trusted, isolated LAN or add TLS/mTLS on that hop.

`TRUSTED_PROXY_IPS` is set to the documented gateway address for Express client-IP and rate-limit handling. Keep this list to exact trusted proxy addresses; do not add public or untrusted subnets. Verify the gateway address and forwarded-header behavior after network changes.

Back up both the PostgreSQL data volume and the uploads volume. Compose limits each container's log files; CPU and memory limits have not been set because no representative LXC workload measurements are checked in. Measure peak memory/CPU before choosing limits.

## Nested prototype

`sumur-creative/` is an archived, independent Vite prototype. The deployment workflow synchronizes it to the host source directory with `rsync`, but the root Docker image does not include it and CI does not build or test it. Its dependency manifest is maintained separately and does not yet have a lockfile, so it is not a reproducible or supported build target. Its dev script binds to localhost by default; do not expose it on an untrusted network.
