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

The ignored root `.env` contains the Atlas connection URI and a generated session secret. `MONGODB_DB_NAME=tracklab_dev` selects TrackLab's separate development database, even if the reused URI names another database. No migration, deletion or overwrite of another application's database is required. Keep credentials out of Git, chat, browser code, and `VITE_` variables.

The current development configuration uses persistent Atlas storage and explicitly permits in-process API request counters without Redis. Business quotas, accounts, sessions, and saved builds live in MongoDB. Request counters reset on API restart; persisted business quota history does not. Production rejects this development rate-limit fallback.

See [Atlas configuration](docs/development/mongodb-atlas.md) for connection setup and troubleshooting.

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

- `apps/web`: React, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind, SVG and lazy-loaded React Three Fiber.
- `apps/api`: Express, Mongoose, backend sessions, CSRF, compatibility validation, quotas, account management and garage APIs.
- `packages/domain`: shared schemas, configuration types, compatibility rules and disclosures.
- `packages/domain/src/visual.ts`: shared measurement-based assembly anchors, bounds and procedural asset registry. Original schematic GLBs remain under `apps/web/public/models` as historical assets.
- `tests`: domain, API, renderer, asset, configuration, pricing and browser checks.
- `docs`: development instructions and design reference.

## Current development status

Implemented flows include the illustrative 2D/3D workspace, session authentication, guest allowances, compatibility checks, private garage CRUD, publishing limits, JSON export, and a basic administrative catalog editor. Accounts, saved builds, sessions and business quotas are connected to the dedicated Atlas development database.

The catalog includes source-reviewed **Cinelli Vigorelli** and **Dosnoventa 02 LA, 03 DET and 01 BCN** size variants, alongside clearly identified original demo components. Previews use independent measurement-based geometry and approximate colors; authentic manufacturer models and finish graphics are unavailable. Vigorelli Steel remains a research draft pending compatible seating and further geometry review. See [official sources and rendering limits](docs/development/frameset-sources.md). Pricing remains disabled.

This is not a completed public release. Remaining work includes manufacturer catalog verification, expanded component categories and assets, richer administration, accessibility/responsive polish, production Redis configuration, SMTP delivery testing, PWA verification, and deployment validation. The Redis adapter's atomic behavior has been verified with two independent clients in GitHub CI. Hosting manifests are preparatory files only; **do not apply them while development and release review are pending**.

Verified phases and important tasks are committed and pushed incrementally. See the [development roadmap and push workflow](docs/development/roadmap.md).
