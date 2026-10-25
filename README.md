# Car Dealership Inventory System

Full-stack TDD kata: REST API (Node, TypeScript, Express, Prisma, SQLite) + React SPA (Vite, Tailwind).

## Features
- Register/login with JWT auth; roles USER and ADMIN
- Vehicle CRUD, search (make, model, category, price range), purchase and restock with atomic stock updates
- React SPA: dashboard, live search/filters, Purchase button (disabled at quantity 0), admin add/edit/delete/restock

## Tech stack
- Backend: Node.js, TypeScript, Express, Prisma (SQLite), JWT, bcryptjs, zod
- Tests: Jest, Supertest
- Frontend: React, Vite, Tailwind CSS, HTML5/CSS3

## API
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| POST | /api/vehicles | logged in |
| GET | /api/vehicles, /api/vehicles/search | logged in |
| PUT | /api/vehicles/:id | logged in |
| DELETE | /api/vehicles/:id | admin |
| POST | /api/vehicles/:id/purchase | logged in |
| POST | /api/vehicles/:id/restock | admin |

## Getting started
**Backend** (Node 20+)
```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env  (then edit values)
npx prisma db push
npm run seed:admin        # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev               # http://localhost:3000
```
**Frontend**
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 (proxies /api to :3000)
```

## Running tests
```bash
cd backend && npm test            # 73 tests; npm run test:coverage for coverage
cd frontend && npm test
```

## Design decisions
- **Roles:** `User.role` is `USER` or `ADMIN`. Registration always creates `USER`; the admin is seeded by a script using env vars.
- **Listing:** `GET /api/vehicles` returns all vehicles, including quantity 0, so the UI can show a disabled Purchase button.
- **Purchase:** optional `quantity` (default 1); decrement is atomic and returns 409 when stock is insufficient.
- **Restock:** positive integer quantity, admin only.
- **Search:** `make`, `model`, `category`, `minPrice`, `maxPrice`; case-insensitive partial match.
- **Errors:** consistent `{ "error": "message" }` shape.

## Screenshots
![Login](docs/screenshots/login.png)
![User dashboard](docs/screenshots/user_dashboard.png)
![Admin dashboard](docs/screenshots/admin_dashboard.png)

## Test report
73 backend tests, all passing; ~96% statement coverage. Full output: [docs/test-report.txt](docs/test-report.txt).
![Coverage](docs/screenshots/coverage.png)

Known gaps: some error-handler branches (malformed JSON, 500s) are untested; no frontend end-to-end tests.

## Known limitations / next steps
- POST and PUT on vehicles allow any logged-in user (the spec only requires admin for delete and restock); the UI only exposes them to admins.
- The JWT lives in localStorage (simple, but exposed to XSS); no refresh tokens.
- No pagination; the UI purchases one unit per click (the API supports a quantity).
- Not deployed.

## My AI Usage
**Tool:** Claude (claude.ai chat), used for the whole project. No other AI tools.

**How I used it:**
- Broke down the assignment and the JD into a checklist, and planned the stack and phases.
- For each backend slice, Claude drafted the failing test first, I ran it to confirm it was red, committed it, then used Claude's implementation, confirmed green and committed. Claude also suggested the atomic conditional `updateMany` for purchases, which my concurrency test verifies.
- Claude drafted the React components, API client and VehicleCard tests; I ran the tests and the production build and tested the flows by hand.
- Debugging help: [EDIT: list what you actually did, e.g. the co-author email collision, TypeScript 7 vs ts-jest]. See `docs/ai-gotchas.md` for where it got things wrong.

**Reflection:** [EDIT, 2-4 sentences in your own words, e.g. what AI sped up, what you had to catch or decide yourself (admin role design, 409 vs 400, listing sold-out vehicles), and what you'd review more deeply with more time.]

Full raw chat link: see [PROMPTS.md](PROMPTS.md).