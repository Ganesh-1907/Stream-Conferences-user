# Stream Conferences Microsite

A responsive conference microsite for ICMLHS 2026 that helps delegates explore the event, submit abstracts, view the program, and register.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/stream-conferences-microsite/src/App.tsx` — site routes, conference content, and interactive UI behavior
- `artifacts/stream-conferences-microsite/src/index.css` — shared visual tokens, responsive styling, and motion
- `attached_assets/Content_1787425086745.docx` — supplied conference copy
- `attached_assets/Pasted--MASTER-PROMPT-Stream-Conferences-Individual-Conference_1787425076288.txt` — supplied build specification

## Architecture decisions

- The initial site is frontend-only, with structured in-file mock data and clearly marked placeholders so a CMS or API can be connected later.
- Wouter handles route-level navigation while the conference shell remains shared across pages.
- Theme preference is persisted locally and falls back to the operating system preference without a flash on initial load.

## Product

- Presents the conference identity, dates, venue, tracks, welcome message, and event milestones.
- Provides dedicated pages for abstract submission, itinerary/program, speakers, brochure, venue, sponsors, registration, guidelines, terms, FAQ, and contact.
- Includes live countdown, FAQ search and accordion, itinerary day tabs, expandable speaker bios, responsive navigation, and form success states.

## User preferences

The user wants supplied conference prompt and content shown in a polished, easy-to-scan website experience.

## Gotchas

- Event dates, venue, pricing, contact address, downloadable files, and sponsor/media logos are intentionally illustrative placeholders and should be replaced before launch.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
