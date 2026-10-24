# Car Dealership Inventory System

Full-stack TDD kata: REST API (Node, TypeScript, Express, Prisma, SQLite) + React SPA (Vite, Tailwind).

## Features
_TODO_

## Tech stack
- Backend: Node.js, TypeScript, Express, Prisma (SQLite), JWT, bcryptjs, zod
- Tests: Jest, Supertest
- Frontend: React, Vite, Tailwind CSS, HTML5/CSS3

## Getting started
_TODO: backend setup, frontend setup_

## Running tests
_TODO_

## Design decisions
- **Roles:** `User.role` is `USER` or `ADMIN`. Registration always creates `USER`; the admin is seeded by a script using env vars.
- **Listing:** `GET /api/vehicles` returns all vehicles, including quantity 0, so the UI can show a disabled Purchase button.
- **Purchase:** optional `quantity` (default 1); decrement is atomic and returns 409 when stock is insufficient.
- **Restock:** positive integer quantity, admin only.
- **Search:** `make`, `model`, `category`, `minPrice`, `maxPrice`; case-insensitive partial match.
- **Errors:** consistent `{ "error": "message" }` shape.

## Screenshots
_TODO_

## Test report
_TODO_

## My AI Usage
_TODO: tools used, how I used them, reflection_