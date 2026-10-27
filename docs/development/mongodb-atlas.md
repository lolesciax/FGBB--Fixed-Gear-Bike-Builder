# MongoDB Atlas for local TrackLab development

TrackLab runs on this computer and connects to the existing Atlas cluster. There is no Render or Vercel deployment.

## Database selection

The private root `.env` uses:

```dotenv
MONGODB_URI=<your private Atlas Drivers URI>
MONGODB_DB_NAME=tracklab_dev
NODE_ENV=development
DEVELOPMENT_EPHEMERAL=false
DEVELOPMENT_MEMORY_RATE_LIMITS=true
```

The server, seed command, database check and persistence verification all pass `MONGODB_DB_NAME` explicitly to Mongoose. That selects `tracklab_dev` independently of another database name in the reused URI. Credentials and connection query options remain unchanged.

MongoDB creates the database and collections when data is first written. The connection check verifies transactions in a TrackLab-only probe collection; the seed command initializes application collections and indexes, then inserts missing catalog records with `$setOnInsert`.

## Atlas access

In Atlas, choose the existing cluster's **Connect → Drivers** flow and save the connection URI in `.env`, replacing its credential placeholders locally. Use a database user, rather than the Atlas website login. Configure read/write access to `tracklab_dev` and allow this computer's public IP in the Atlas network access list. See the official [connection instructions](https://www.mongodb.com/docs/atlas/driver-connection/), [database user documentation](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/), and [IP access list instructions](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/).

Keep the URI out of logs and frontend variables. Percent-encode reserved characters in the username/password according to the driver's connection-string requirements. Keep the generated session secret stable so existing local sessions remain usable after restart.

## Verification

```sh
npm run db:check
npm run seed
npm run db:verify-persistence
npm run dev
```

On 27 October 2026, the configured Atlas database passed connectivity and transaction checks. The persistence check created one temporary account and saved build through the local API, shut down the API and database client, started fresh instances, and verified that the session, saved build and creation quota history survived. The temporary account and its associated data were then deleted. No other application's database was modified.

The persistence command is guarded to run only in development against the explicitly named `tracklab_dev` database. Its email adapter sends no real messages, and cleanup targets only its randomly named fixture account.

## Development limits

MongoDB enforces business quotas transactionally. The optional development rate store keeps short-term API request counters in process memory while Redis is not configured. Production requires Redis and rejects that fallback. SMTP is also deferred; local account links are written to the ignored `.local/mail/` directory.

The automated API tests create a separate temporary MongoDB replica set and do not clear Atlas collections. Do not point destructive test fixtures at the shared development database.
