# StayFinder Architecture

StayFinder is a full-stack TypeScript travel booking app built with Next.js App Router, React, Prisma, SQLite, Zod, TanStack Query, MUI, and Leaflet.

The app is organized around a small set of product flows:

- Discover stays through a searchable list and map.
- View stay details, reviews, and existing booked dates.
- Submit reviews.
- Create bookings.

## Application Layers

The codebase separates UI, transport, orchestration, domain rules, and data access.

| Layer | Responsibility | Examples |
|---|---|---|
| UI components | Render screens and collect user input. | `components/filter-bar.tsx`, `components/stay-card.tsx`, `components/booking-widget.tsx` |
| Client hooks | Coordinate client state, URL state, and API calls. | `lib/hooks/use-stays-search.ts`, `lib/hooks/use-booking.ts`, `lib/hooks/use-reviews.ts` |
| API routes | Parse HTTP requests, call managers, and return responses. | `app/api/stays/route.ts`, `app/api/bookings/route.ts` |
| Schemas | Validate request and response contracts. | `lib/schemas/stay.ts`, `lib/schemas/booking.ts`, `lib/schemas/review.ts` |
| Managers | Coordinate use cases across data access and domain logic. | `lib/managers/stay-manager.ts`, `lib/managers/booking-manager.ts` |
| Engines | Hold pure domain logic. | `lib/engines/booking.ts`, `lib/engines/reviews.ts` |
| Data access | Encapsulate Prisma queries. | `lib/data/stays.ts`, `lib/data/bookings.ts`, `lib/data/reviews.ts` |
| Persistence | Store local application data. | `prisma/schema.prisma`, SQLite |

## API Surface

| Method | Endpoint | Responsibility |
|---|---|---|
| `GET` | `/api/stays` | Search and list stays |
| `GET` | `/api/stays/:id` | Fetch stay details |
| `GET` | `/api/stays/:id/reviews` | List reviews |
| `POST` | `/api/stays/:id/reviews` | Submit a review |
| `POST` | `/api/bookings` | Create a booking |

## Data Model

The Prisma schema models three main records:

- `Stay`: property metadata, location, capacity, pricing, amenities, and images.
- `Booking`: confirmed stays with check-in/check-out dates, guest count, status, and idempotency key.
- `Review`: user-submitted rating and review content for a stay.

The seed script creates local synthetic stays, reviews, and bookings so the app can run without external services.

## Frontend Flow

The discovery page is rendered under `/stays`. It combines:

- `FilterBar` for search and filter controls.
- `useStaysSearch` for URL state and data fetching.
- `StayCard` for list results.
- `StayMap` for geographic display and map-bound filtering.

The stay details page is rendered under `/stays/:id`. It combines stay metadata, booked date information, reviews, and the booking widget.

## Backend Flow

API routes are thin transport handlers. They convert incoming requests into plain values, delegate to managers, and format HTTP responses.

Managers coordinate the application use cases:

- Stay search builds Prisma filters, applies availability exclusions, and enriches results with review metadata.
- Booking creation validates the request, checks stay capacity, checks overlapping bookings, calculates nights, and persists the booking.
- Review creation validates and sanitizes review content before writing it.

Data access modules own Prisma queries so transport and UI code do not need to know database details.

## Validation

Zod schemas in `lib/schemas` define request contracts for stays, bookings, and reviews. API routes and managers use these schemas to reject invalid input before domain logic or persistence.

## Availability Semantics

Bookings represent atomic stay reservations. A stay is unavailable for a requested date range when an existing confirmed booking overlaps that range:

```text
existing.checkIn < requested.checkOut
existing.checkOut > requested.checkIn
```

This overlap rule is used by the booking flow and stay search availability filtering.

## Testing

The repo includes Vitest tests for domain behavior and Playwright tests for user flows.

Common verification commands:

```bash
npm test
npm run test:e2e
npm run lint
npx tsc --noEmit
```

## Local Constraints

This is a local seeded app. It uses SQLite, synthetic seed data, mocked user identity, and mocked payment behavior. External authentication, real payment processing, and production deployment concerns are outside the current app surface.
