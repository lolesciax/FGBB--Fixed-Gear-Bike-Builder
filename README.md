# TrackLab

A fixed-gear bicycle configurator in active development. The app runs locally; no frontend or backend has been deployed.

Implementation requirements are consolidated in [the project specification](docs/PROJECT_SPEC.md). The continuation adds a [graphite/electric-blue design system](docs/DESIGN_SYSTEM.md), UI/UX acceptance in every phase, and a dedicated mobile parts sheet. See the [known issues](docs/KNOWN_ISSUES.md) for unfinished requirements; the previous green visual direction is superseded.

## Local development with MongoDB Atlas

Requirements: Node.js 22.12+ (Node 24 is recommended) and npm.

```sh
npm ci
npm run setup:development
# Configure the Atlas URI in the ignored root .env before the next command.
npm run db:check
npm run dev
```

Open **http://127.0.0.1:5180**. The API runs at `http://127.0.0.1:4000` and Vite proxies `/api` to it.

`npm run dev` waits for the API/database before starting Vite. Open the exact URL printed by the launcher (for example `http://localhost:5180` when that is your `FRONTEND_URL`) and keep the terminal open. Ctrl+C stops both servers. A lost Vite connection plus `ERR_CONNECTION_REFUSED` means the local server is no longer listening: check the terminal error, then restart. The launcher reports occupied ports instead of starting a second copy.

The ignored root `.env` contains the Atlas connection URI and a generated session secret. `MONGODB_DB_NAME=tracklab_dev` selects TrackLab's separate development database, even if the reused URI names another database. No migration, deletion or overwrite of another application's database is required. Keep credentials out of Git, chat, browser code, and `VITE_` variables.

The current development configuration uses persistent Atlas storage and explicitly permits in-process API request counters without Redis. Business quotas, accounts, sessions, and saved builds live in MongoDB. Request counters reset on API restart; persisted business quota history does not. Production rejects this development rate-limit fallback.

See [Atlas configuration](docs/development/mongodb-atlas.md) for connection setup and troubleshooting.

## Run the frontend and backend separately

Install dependencies once with `npm ci` in the repository root and configure the root `.env` as above. Then use two terminals, starting the backend first:

```sh
# Terminal 1, from the repository root
cd backend
npm start
```

```sh
# Terminal 2, from the repository root
cd frontend
npm run dev
```

In `backend/`, `npm start` and `npm run dev` both run the development API with automatic reload. The frontend prints the URL configured by `FRONTEND_URL` and proxies `/api` to the configured API port. Keep both terminals open; stopping either folder command stops only that server.

Each folder also supports `npm run build`. To run the compiled backend, use `npm run build` then `npm run start:built` in `backend/`. The root `npm start` still runs the compiled backend. The root `npm run dev` remains the single-terminal option that starts and stops both servers together.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run setup:development` | Create a private `.env` template and random session secret; never overwrite an existing file |
| `npm run db:check` | Verify database connectivity, write permissions, and transactions |
| `npm run seed` | Initialize collections/indexes and insert missing demo catalog records without overwriting existing records |
| `npm run db:verify-persistence` | Verify an account, build, and quota survive API/database reconnection, then remove only the temporary fixture |
| `npm run typecheck` | Check TypeScript |
| `npm run lint` | Check source lint rules |
| `npm test` | Run isolated unit/integration tests; they use their own temporary MongoDB replica set |
| `npm run test:e2e` | Run browser workflows against an automatically isolated temporary database on ports 4010/5190; never reuse Atlas |
| `npm run test:pwa` | Build locally and verify online reloads, offline recovery, deferred 3D downloads and API cache exclusion |
| `npm run build` | Build the frontend and backend locally |

Email delivery is not configured yet. During development, verification and password-recovery links are written under `.local/mail/`, which is ignored by Git. No real email is sent without SMTP configuration.

## Structure

- `frontend`: React, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind, SVG and lazy-loaded React Three Fiber.
- `backend`: Express, Mongoose, backend sessions, CSRF, compatibility validation, quotas, account management and garage APIs.
- `packages/domain`: shared schemas, configuration types, compatibility rules and disclosures.
- `packages/domain/src/visual.ts`: shared measurement-based assembly anchors, bounds and procedural asset registry. Original schematic GLBs remain under `frontend/public/models` as historical assets.
- `tests`: domain, API, renderer, asset, configuration, pricing and browser checks.
- `docs`: development instructions and design reference.

```text
frontend/          React app, viewer, UI, public assets and Vite configuration
backend/           Express API, catalog, authentication and database modules
packages/domain/   Shared schemas, geometry, compatibility and SVG renderer
scripts/           Shared startup, test, asset and maintenance tooling
tests/             Shared unit/API, renderer and browser regression suites
docs/              Requirements, design references and development evidence
```

The root package, lockfile and ignored `.env` serve both applications. The folder packages provide commands that use these shared dependencies and configuration; no separate install or `.env` copy is needed. Root `npm run dev` starts the API and frontend together. `npm run dev:web` / `npm run dev:api` and `npm run build:web` / `npm run build:api` remain available for either side. Generated output belongs in `frontend/dist/` and `backend/dist/` and stays ignored by Git.

## Current development status

Implemented flows include the illustrative 2D/3D workspace, session authentication, guest allowances, compatibility checks, private garage CRUD, publishing limits, JSON export, and a basic administrative catalog editor. Accounts, saved builds, sessions and business quotas are connected to the dedicated Atlas development database.

The revised access policy provides guests 24 changes and two ten-minute 3D sessions per rolling day. Registered users have eight saved slots, three creations/day, fifteen/month, four public builds and eight combined SVG image/JSON information exports per day. Existing-build autosave is optional. Actual policy/usage comes from the API; audited administrator settings use validated bounds. See [access policy](docs/development/access-policy.md).

`npm run assets:frames` produces 39 per-variant illustrative GLB kits and provenance files from the reviewed dimensions. The viewer lazy-loads these files and uses shared anchors for attached components. See [how 3D is produced and the Blender/CAD workflow](docs/development/3d-production.md). These original models do not claim authentic brand tube profiles, graphics or finishes.

The expanded manufacturer directory covers ten brands and 30 model research targets. Five additional selectable framesets—Skream Magnum/Ranger, State 6061 Black Label v3, Wabi Prism and 8bar KRZBERG V8—have separate sourced size geometry and illustrative renderers. Tsunami SNM100, Engine11 Crit-D and Leader 735 have technical drafts; missing geometry keeps them unselectable. Other research records are not advertised as implemented models. See the [official-source review](docs/brands/source-review.md). Administrators can maintain brand/model metadata and submit permitted files to a private local review inbox.

The catalog includes source-reviewed **Cinelli Vigorelli** and **Dosnoventa 02 LA, 03 DET and 01 BCN** size variants, alongside clearly identified original demo components. Previews use independent measurement-based geometry and approximate colors; authentic manufacturer models and finish graphics are unavailable. Vigorelli Steel remains a research draft pending compatible seating and further geometry review. See [official sources and rendering limits](docs/development/frameset-sources.md). Pricing remains disabled.

This is not a completed public release. Remaining work includes manufacturer catalog verification, expanded component categories and assets, richer administration, accessibility/responsive polish, production Redis configuration, SMTP delivery testing, PWA verification, and deployment validation. The Redis adapter's atomic behavior has been verified with two independent clients in GitHub CI. Hosting manifests are preparatory files only; **do not apply them while development and release review are pending**.

Verified phases and important tasks are committed and pushed incrementally. See the [development roadmap and push workflow](docs/development/roadmap.md).

Local business quotas are temporarily disabled in this workspace with `DEVELOPMENT_DISABLE_QUOTAS=true` in the ignored `.env`. Restart `npm run dev` after changing this flag. Set it to `false` to restore the stored limits without resetting usage history. Production rejects the bypass. Sign-in, ownership, compatibility, asset review and API abuse protection still apply. See [development access](docs/development/access-policy.md).
