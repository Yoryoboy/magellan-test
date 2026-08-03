# Magellan Written Test

A React single-page application for administering written tests. Candidates enter a supervisor-provided ID, take the test, and see their results immediately. All data is stored in a Notion database — no backend server required.

## Quick path

1. `pnpm install`
2. Copy `.env.example` to `.env` and fill in the Notion integration token and database ID.
3. `pnpm dev` → open http://localhost:5173
4. `pnpm build` for a production build (output in `dist/`)

## How the test flow works

1. **Supervisor setup** — pre-create a candidate page in the Notion database with a unique **Candidate ID**.
2. **ID verification** — the candidate enters their ID; the app queries Notion to validate it.
   - ID valid and not taken → continue to registration.
   - ID already taken → redirected straight to the results page.
3. **Quiz** — answers are saved to `localStorage` on every change, so a reload doesn't lose progress.
4. **Submission** — the score, percentage, status, and per-question breakdown are written to the candidate's Notion page.
5. **View results** — the completion modal shows a **View My Results** button that opens the results page immediately (score, percentage, and a question-by-question breakdown with a "failed first" sort option).
6. **End session** — a button on the quiz header wipes all `localStorage` progress and returns to the start, ready for a new ID.

## Notion integration

The app talks directly to the Notion API from the browser. During development the Vite dev server proxies `/api/notion` → `https://api.notion.com/v1` because Notion blocks cross-origin browser requests.

### Database: "Magellan Pre-test"

| Property | Type | Notes |
|----------|------|-------|
| Candidate | title | Candidate full name (written at test start) |
| Candidate ID | rich text | Supervisor-provided unique ID |
| Email | email | Collected at registration |
| Status | select | See status values below |
| Score | number | Raw points earned |
| Percentage | number | Rounded percentage |
| Test Taken | checkbox | True once submitted — blocks re-entry |
| Start Date / Completion Date | date | Timestamps of the test lifecycle |

### Status values

| Status | Meaning |
|--------|---------|
| `test in progress` | Candidate started the test |
| `test approved` | Percentage ≥ 80 |
| `test failed` | Percentage < 80 |

### Results storage

Each candidate page stores the results as blocks: a human-readable summary plus a JSON code block that the results page parses. Note two Notion API limits that the submission code handles:

- **2,000 characters** per rich-text element → long content is chunked.
- **100 blocks** per append request → the results payload stays under the limit.

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_NOTION_API_KEY` | Notion integration token (create it at https://www.notion.so/my-integrations) |
| `VITE_NOTION_DATABASE_ID` | ID of the "Magellan Pre-test" database (from the database URL) |

## Tech stack

- **React 19 + TypeScript** — UI
- **Vite 6** — build tool and dev proxy
- **Tailwind CSS 4** — styling
- **Axios** — Notion API client

## Project structure

```
├── public/                  # Static assets (favicon)
├── src/
│   ├── api/                 # Notion API layer (verification, submission, results)
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Rules, ID verification, registration, quiz, results
│   ├── questions/           # Test questions data
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Score calculation, localStorage helpers
│   ├── App.tsx              # Routing and session state
│   └── main.tsx             # Application entry point
├── index.html
├── vite.config.ts           # Dev proxy for /api/notion
└── package.json
```

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start the dev server (with Notion proxy) |
| `pnpm build` | Type-check (`tsc -b`) and build to `dist/` |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview the production build locally |

## Future enhancements

- **Production deployment**: Notion blocks browser CORS, so production needs Netlify rewrites or a small server-side proxy (pending).
- **Candidate ID randomization**: IDs are currently sequential (MAG-001 style); make them non-deterministic.
- Timed tests, question randomization, analytics, and authentication.

## License

MIT. Created by Jorge Díaz — [GitHub Profile](https://github.com/Yoryoboy)
