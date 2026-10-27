# TrackLab

A fixed-gear bicycle configurator in active development. The app runs locally; no frontend or backend has been deployed.

## Local development with MongoDB Atlas

Requirements: Node.js 22.12+ (Node 24 is recommended) and npm.

```sh
npm ci
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
| `npm run test:e2e` | Run browser workflows; use an isolated local test environment rather than a shared Atlas database |
| `npm run build` | Build the frontend and backend locally |

Email delivery is not configured yet. During development, verification and password-recovery links are written under `.local/mail/`, which is ignored by Git. No real email is sent without SMTP configuration.

## Structure

- `apps/web`: React, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind, SVG and lazy-loaded React Three Fiber.
- `apps/api`: Express, Mongoose, backend sessions, CSRF, compatibility validation, quotas, account management and garage APIs.
- `packages/domain`: shared schemas, configuration types, compatibility rules and disclosures.
- `apps/web/public/models`: independently authored schematic GLB parts and their asset registry.
- `tests`: domain, API, renderer, asset, configuration, pricing and browser checks.
- `docs`: development instructions and design reference.

## Current development status

Implemented flows include the illustrative 2D/3D workspace, session authentication, guest allowances, compatibility checks, private garage CRUD, publishing limits, JSON export, and a basic administrative catalog editor. Accounts, saved builds, sessions and business quotas are connected to the dedicated Atlas development database.

The selectable catalog currently contains original **demo** parts. Manufacturer publishing remains gated until product variants, specification provenance, geometry and asset permissions are reviewed. The Cinelli reference is an unpublished research draft. Demo geometry is never presented as authentic manufacturer geometry. Pricing remains disabled.

This is not a completed public release. Remaining work includes manufacturer catalog verification, expanded component categories and assets, richer administration, accessibility/responsive polish, live distributed Redis verification, SMTP delivery testing, PWA verification, and deployment validation. Hosting manifests are preparatory files only; **do not apply them while development and release review are pending**.
