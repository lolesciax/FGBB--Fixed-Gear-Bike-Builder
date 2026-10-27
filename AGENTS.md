# TrackLab development rules

- Keep development local. Do not deploy, provision hosting, or publish a release unless the user explicitly authorizes deployment later.
- After each verified phase or important task, commit and push the coherent change to the existing GitHub repository. Do not combine unrelated unfinished phases or describe partial work as a finished release.
- Record implemented behavior, checks, remaining limitations and next dependencies in `docs/development/roadmap.md`.
- Never commit `.env`, `.local`, credentials, database contents, email links or browser runtime artifacts. Run `npm run check:secrets` on staged changes before each commit.
- Atlas development uses the explicit `tracklab_dev` database. Do not modify other databases in the shared cluster.
- Browser regression tests must use the isolated test server and temporary database. Do not reuse the Atlas-backed app or run destructive test cleanup against Atlas.
- Keep manufacturer models in draft until specifications, variant provenance, geometry and asset rights are reviewed. Do not invent prices, compatibility claims, asset permissions or brand affiliations.
- Preserve one canonical configuration across both viewers. Keep business quotas and authorization on the backend.
- Run checks appropriate to each change and inspect GitHub CI after a push. Report any skipped checks honestly.
