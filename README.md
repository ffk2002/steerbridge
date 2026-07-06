# StayFinder

StayFinder is a seeded full-stack TypeScript travel booking app. It includes stay discovery, stay detail pages, reviews, and a basic booking flow.

The app is built with Next.js, React, Prisma, SQLite, Zod, TanStack Query, MUI, and Leaflet.

## Assessment

Candidate instructions are in `docs/full-stack-assessment.md`. Submission notes should be completed in `docs/SUBMISSION.md`.

## Prerequisites

- Node.js 22
- npm

## Quick Start

```bash
npm run start:local
```

Open [http://localhost:3000](http://localhost:3000).

`start:local` installs dependencies, runs database migrations, seeds the local SQLite database, and starts the development server.

## Documentation

See `docs/ARCHITECTURE.md` for an overview of the application structure and stack boundaries.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router, React 19 |
| Database | Prisma, SQLite |
| Validation | Zod |
| Data fetching | TanStack Query |
| UI | MUI, Emotion |
| Maps | React Leaflet, Leaflet |
| Testing | Vitest, Playwright |

## API Surface

| Method | Endpoint | Responsibility |
|---|---|---|
| `GET` | `/api/stays` | Search and list stays |
| `GET` | `/api/stays/:id` | Fetch stay details |
| `GET` | `/api/stays/:id/reviews` | List reviews |
| `POST` | `/api/stays/:id/reviews` | Submit a review |
| `POST` | `/api/bookings` | Create a booking |

## Key Pages

- `/` - Landing page
- `/stays` - Stay discovery page with list and map views
- `/stays/:id` - Stay details page with reviews and booking controls

## Development

```bash
# Run dev server
npm run dev

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests (optional)
npx playwright install
npm run test:e2e

# Database commands
npm run db:seed
npm run db:migrate
npm run db:reset

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## Project Structure

```text
app/                    # Next.js App Router pages and API routes
components/             # Shared React components
lib/
  schemas/              # Zod schemas and API contracts
  hooks/                # Client orchestration hooks
  managers/             # Use-case orchestration
  engines/              # Pure domain logic
  data/                 # Prisma data access
  db.ts                 # Prisma client setup
prisma/                 # Prisma schema and seed data
e2e/                    # Playwright tests
__tests__/              # Vitest tests
docs/                   # Project documentation
```

## License

This project is licensed under the MIT License. See `LICENSE` for details.