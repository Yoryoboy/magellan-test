# Feature: Notion token security + database migration

## Problem

The app talks to the Notion API directly from the browser. `VITE_NOTION_API_KEY` is
inlined into the client bundle at build time, so anyone who loads the deployed site can
extract the token and read or write the whole database. This is the root cause of the
"nobody knows who owns access" situation.

Compounding it: the current database lives in a Notion workspace the owner does not
control ("Irazu Technology"), and its integration ("Magellan Test") is workspace-owned.
The token still works, so access cannot be assumed revoked.

## Goals

1. The Notion token never reaches the browser.
2. A new Notion database, an exact schema clone, in a workspace the owner controls.
3. Migration is cheap: swapping the database is changing one variable.

## Non-goals

- Rewriting the data model or results storage format.
- Moving off Notion.
- `VITE_ADMIN_PASSWORD` exposure (same class of bug, tracked as follow-up C5).

## Context / evidence

- Integration `Magellan Test` is workspace-owned, workspace `Irazu Technology`
  (bot id `3b1c5055-...`). Current token verified live: HTTP 200 on `/databases/:id`.
- **`created_by` for the old database is `32fd872b-594c-8197-b13e-00025e4a56b6`, which does
  not appear in the integration's visible user list.** The creator is an Irazu
  owner/admin whose content is not shared with the integration. Access cannot be
  determined through the API — which is the reason to migrate, not a detail.
- The workspace has **three** bot integrations: `Notion MCP`, `MCP`, `Magellan Test`.
  Three integrations means three independently issued tokens.
- **The configured Notion MCP is dead but loaded.** `~/.pi/agent/mcp.json` is a legacy
  path the pi-mcp-adapter no longer reads, so the gateway reports 0/0 servers. That file
  holds a plaintext `NOTION_TOKEN` for integration `MCP`, also in workspace
  `Irazu Technology`. Fixing the path would *re-enable* an over-privileged integration —
  the broken state is currently protective.
- That `MCP` token has broad workspace reach: the workspace root page `Home`, a `Users`
  database, a `CCI Accounts` database, dozens of people pages, and internal audit docs.
  Enumeration was stopped once the reach was established.
- Token hygiene: `mcp.json` is mode `644` (world-readable) while `auth.json` is `600`.
  The `MCP` token appears in **13 local files**, including
  `Work/irazu/apps/danella-wrapper-api/.env` and the same path in `irazu-react-stack`.
  Verified NOT leaked to git: those `.env` files are gitignored (`.gitignore:16`) and the
  token appears in no commit in either repo. Local exposure only.
- The project's own `Magellan Test` token appears in exactly one file
  (`magellan-test/.env`) — clean locally, but it is the one exposed to the internet
  through the deployed bundle.
- Frontend calls `/api/notion` → Notion API. Dev: Vite proxy (`vite.config.ts`).
  Prod: `[[redirects]]` in `netlify.toml`. Both exist only to work around Notion's CORS.
- Netlify Edge Functions replace both: the browser calls its own origin, so CORS
  stops being a problem instead of being worked around.
- Verified in Netlify docs: default dir `netlify/edge-functions`; handler is
  `export default (request, context) => Response` with `export const config = { path }`.
  Env vars are readable inside edge functions and are not shipped to the browser.
  **Env vars declared in `netlify.toml` are NOT available to edge functions** — the
  scope must include Functions and the value must be set in the Netlify UI/CLI/API.
  Values are frozen at deploy time, so a token change requires a redeploy.
- `Netlify.env.get()` may be undefined under `netlify dev` (ReferenceError); `process.env`
  works there. Guard: `globalThis.Netlify?.env?.get("X") ?? process.env.X`.
- Chosen over Supabase: already deployed, no new vendor, no free-tier pausing.
  Netlify free plan includes 1M edge function invocations/month.

## Required Notion schema (exact clone)

Property names are referenced as string literals in code — they must match character
for character, including case and spaces.

| Property | Type | Config |
|---|---|---|
| `Candidate` | title | the only title property |
| `Candidate ID` | rich_text | |
| `Email` | email | |
| `Status` | select | `test in progress` (yellow), `test approved` (green), `test failed` (red) |
| `Score` | number | format `number` |
| `Percentage` | number | format `number` |
| `Test Taken` | checkbox | |
| `Start Date` | date | |
| `Completion Date` | date | |

Not a property: per-question detail is written as page **blocks** (paragraphs, divider,
and a JSON `code` block parsed by `fetchResults()`). Handled automatically.

## Tasks

### Phase A — Code and infra (owner: implementation)

- [x] **A1** Create `netlify/edge-functions/notion-proxy.ts`: forward `/api/notion/*`
      to `https://api.notion.com/v1/*`, injecting `Authorization` and `Notion-Version`
      server-side. Env read via `globalThis.Netlify?.env?.get("NOTION_API_KEY") ?? globalThis.process?.env?.NOTION_API_KEY`.
      Pass through method, body, status, and response body.
- [x] **A2** Remove the `[[redirects]]` block from `netlify.toml` (replaced by the function).
- [x] **A3** `src/api/notion.ts`: dropped the client-side `Authorization` and
      `Notion-Version` headers.
- [x] **A4** `src/config.ts`: stopped reading `VITE_NOTION_API_KEY`. `NOTION_DATABASE_ID`
      stays client-side.
- [x] **A5** Documented in `.env.example` and `README.md`.
- [x] **A6** Verified: `pnpm build` PASS, `pnpm lint` PASS, token occurrences in `dist/`
      went from **1 to 0** (proved twice: by `ntn_` pattern and by grepping the literal
      secret value read from `.env`). Runtime verified on both hosts against a read-only
      `GET /users/me`: Vite dev proxy 200, Netlify edge emulation 200. Negative case:
      with the variable unset the dev server refuses to start, and the edge function
      returns a clean `500 {"error":"NOTION_API_KEY is not configured"}` **without
      attempting an upstream fetch**. Adversarial checks: a client-supplied
      `Authorization` header cannot override the injected token; no host or path escape
      is reachable through the proxy; `loadEnv(..., "")` leaks nothing to the client
      (proved by `nositebanala` admin default still being the only inlined value).
- [x] **A7** Hardened the edge function after verification flagged inherent fragility:
      bare `process` can be undefined on Deno, so a missing variable would have thrown an
      uncontrolled `ReferenceError` instead of the intended clean 500. Changed to
      `globalThis.process?.env?`. Post-change `pnpm build` and `pnpm lint` both PASS and the
      bundle still shows 0 token occurrences. **Note:** A7 post-dates the independent
      verification pass, so that one line is not covered by it.

### Phase E — Access control (OUT OF SCOPE — user decision)

The proxy removes credential *disclosure* but not *access*: it forwards any method and path
under `/api/notion/*` with the token attached and no caller authentication. Recorded here
only so the finding is not lost. **Deliberately not being fixed.**

The user's scope for this session is: keep the app working exactly as it does today and move
the database to their own workspace. This app is an internal tool used by the team, and the
exposures below are accepted consciously rather than new work:

- Anonymous callers can POST a filterless query and retrieve every candidate.
- Anonymous callers can write (create entries, patch pages) through the proxy.
- The answer key ships in the bundle (106 occurrences) and scoring runs client-side, so the
  recorded score and the `test approved` / `test failed` status are not auditable.
- `VITE_ADMIN_PASSWORD` is inlined in the bundle; the admin gate is a client-side `if`.

None of this affects the stated goal. Do not reopen it without an explicit request.

- [ ] **E5** Production edge runtime remains unverified: local emulation ran Deno 2.9.6,
      which is not the hosted runtime. Worth a look after the first deploy, since a broken
      edge function would break the app rather than merely expose it.

---

## Verification notes

- Threat model established: `correctAnswer` appears **106 times** in the built bundle
  (the full answer key ships to the candidate); `calculateScore` runs in the browser
  (`src/utils/score.ts`); `submitTestToNotion` PATCHes `Score`/`Percentage`/`Status` from
  the client and the server never recomputes. A candidate can pass with 100% either by
  reading the bundle or by PATCHing a score, with no admin password involved.
- Notion must not be used as a **secret** store for the admin credential: it puts a
  plaintext password in a workspace administered by others (the exact Irazu pattern), has
  no hashing, rate limiting, or lockout, and makes a Notion outage a login outage. Notion
  as **authorization** data (who is a supervisor, which Candidate IDs are valid) is
  legitimate, because that is configuration rather than secret material.

- The independent verifier reported HTTP 404 on the read-only database retrieve and
  concluded `.env`'s `VITE_NOTION_DATABASE_ID` was a malformed placeholder. **Refuted by
  the parent:** the value is stored double-quoted in `.env`, and the verifier extracted it
  without stripping the quotes. Shell-sourced and used directly it returns HTTP 200 with
  title `Magellan Pre-test` and 9 properties. A quoting artifact, not a data defect.
  Same quoting trap the writer hit earlier with the token itself (401 before stripping).
- The verifier also noted `VITE_NOTION_API_KEY` still appears 3 times in the untracked
  planning doc `odd/tasks/notion-token-security.md`. Expected: it is the historical record
  of what was renamed. No functional impact.

### Phase B — Notion (owner: human, cannot be delegated)

- [ ] **B1** Decide and create the target workspace (must be one the owner administers).
- [ ] **B2** Create an internal integration in that workspace → new token.
- [ ] **B3** Create a container page and share it with the integration.
- [ ] **B4** Create the database with the 9 properties above. Preferred: a repo-local script
      that creates it through the API with an exact payload, so the clone is deterministic
      instead of hand-typed, and the integration/page sharing is proven in the same step.
      The token is read from `.env`; it must never be pasted into the conversation.
- [ ] **B5** Hand over the new token and database id (token goes into `.env`, not chat).

### Phase C — Cutover and close

- [ ] **C1** Add `NOTION_API_KEY` (no `VITE_` prefix) in the Netlify UI, scope
      Functions; delete `VITE_NOTION_API_KEY` so it is no longer inlined at build.
- [ ] **C2** Point `VITE_NOTION_DATABASE_ID` at the new database.
- [ ] **C3** Redeploy and run an end-to-end smoke test (ID verify → quiz → submit → results).
- [ ] **C4** Revoke the old `Magellan Test` integration in Irazu, if an admin is reachable.
- [ ] **C5** Follow-up: `VITE_ADMIN_PASSWORD` is also inlined into the bundle, making the
      Admin view password public. Same class of bug, lower impact.

### Phase D — Credential hygiene (owner: human, partly non-repo)

**BLOCKING DEPENDENCY — do not revoke `MCP` yet.** That token is in active use outside
this project: `irazu/apps/danella-wrapper-api/.env` and `irazu-react-stack/apps/danella-wrapper-api/.env`
both set it as `NOTION_API_KEY`, consumed by
`src/modules/monthly-goals/infrastructure/notion-high-split-monthly-goals.client.ts`.
It resolves `NOTION_MQMS_CREDENTIALS_DATABASE_ID=7343366a-d6cf-40c6-ac4b-eb0d683c945b`,
which is the **`CCI Accounts`** database, and reads `Task Name`, `PID`, and `Password`,
filtered by the page name `Jorge Diaz`. Revoking `MCP` today breaks that module.
So the over-privileged integration is not merely "can read company pages" — it is the
key to a credential store.

Danella needs exactly one Notion resource: the `CCI Accounts` database. That is the
scoping target for its own integration.

Correct order:

1. Create a purpose-scoped integration for Danella, shared only with `CCI Accounts`.
2. Replace `NOTION_API_KEY` in both Danella `.env` files with the new token.
3. Only then revoke `MCP`.
4. Separately decide the agent MCP (if wanted at all) with its own scoped token.

- [ ] **D1** Do NOT move `~/.pi/agent/mcp.json` to `mcp-adapter.json` as-is. Decide first
      whether the Notion MCP is wanted at all; re-enabling it grants a broad Irazu token
      to the agent.
- [ ] **D2** `chmod 600 ~/.pi/agent/mcp.json` — DONE (was `644`, world-readable).
      Remaining exposure: `~/.config/opencode/opencode.json` holds the same token and is a
      live config, not a backup.
- [ ] **D3** Rescope Danella to its own integration, then revoke `MCP`. The `Magellan Test`
      integration is safe to revoke once Phase C lands. The `Notion MCP` integration may be
      orphaned — its token was not found on this machine, so it could not be verified.
- [ ] **D4** Stale tokens in logs: two further Notion tokens found only in
      `~/.pi/agent/gentle-agents/sessions/*.jsonl` already return **401 Unauthorized** —
      already revoked, no action needed. Confirmed: 4 distinct tokens exist on this machine,
      only 2 are live (`MCP`, `Magellan Test`).

## Open decisions

- Where the new Notion database lives (Phase B1) — blocks B only, not Phase A.
- The Notion MCP does NOT solve Phase B: its token is Irazu-scoped, so anything it
  creates lands in the Irazu workspace.
- **Corrected**: a per-version `trust_policy_excludes` for
  `@netlify/serverless-functions-api@2.23.0` was applied and is insufficient — the
  resolver walks versions and next demanded `2.18.0`. The dependency is transitive, so
  pinning an older `netlify-cli` does not avoid it. Provenance is absent across the whole
  `2.x` line (verified `2.0.0`, `2.10.0`, `2.18.0`, `2.21.2`, `2.22.0`, `2.23.0`), so the
  genuinely minimal correct scope is the bare package name — which exempts all 117
  versions and is broader than what was authorized. Needs a fresh decision.

## Allowed edit surfaces

```
netlify.toml
netlify/edge-functions/notion-proxy.ts
src/api/notion.ts
src/config.ts
.env.example
README.md
```

Phase D operates outside the repository (`~/.pi/agent/`, other projects' `.env` files).
Phase A must not touch those.

## Execution order

Phase A is independent of Phase B and can be built and verified against the current
token and current database. Credentials are rotated last, so the risky change lands on
an already-proven code path.
