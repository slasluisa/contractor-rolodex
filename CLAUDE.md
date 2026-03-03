# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This app is built for a general contractor who needs a reliable rolodex of subcontractors. The core problem: finding and keeping good subs is hard. People leave jobs half-done, no-show, or do shoddy work — and you don't find out until it's too late. A GC's reputation depends on the people they bring onto a project.

Key domain realities this app should reflect:
- **Reliability matters more than price.** On-time percentage, completed jobs, and availability status exist because a cheap sub who ghosts you mid-job costs far more than a pricier one who finishes.
- **Specialties aren't interchangeable.** An electrician who's great at residential panel upgrades may be wrong for commercial tenant buildouts. The filtering and specialty data should help a GC match the right person to the right job.
- **Scheduling is the GC's bottleneck.** Projects have sequences — you can't drywall before rough-in electrical. The schedule view exists because a GC needs to see who's available *when they need them*, not just who's available in general.
- **Pricing has real structure.** Hourly vs per-sqft, new construction vs renovation — these aren't arbitrary. New construction is typically cheaper per-sqft because you're not working around existing systems. The pricing model should stay grounded in how real bids work.
- **Trust signals matter.** License numbers, insurance status, certifications, years of experience — a GC checks these because they're liable for their subs on a jobsite. These aren't nice-to-haves.
- **The rolodex is personal.** This isn't Yelp. It's a curated list of people a GC has worked with or vetted. Features should support that relationship-based model.

## Build & Development Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Production build to `dist/`
- `npm run lint` — Run ESLint (flat config, targets `**/*.{js,jsx}`)
- `npm run preview` — Preview production build locally

No test framework is configured.

## Architecture

Single-page React 19 app built with Vite for browsing and booking contractors. No routing library — view switching is state-driven via `selectedId` and `mobileView` in App.jsx. No external state management; all state lives in App.jsx and flows down via props.

**Component tree:**
- **App.jsx** — Root component, owns all application state (contractors, filters, search, booking, theme, mobile view). Contains filter/sort logic with chained `.filter().sort()`.
- **ContractorCard** — Sidebar list item for each contractor. Keyboard-navigable.
- **Schedule** — Main content: full contractor profile + availability calendar with bookable time slots.
- **BookingModal** — Booking confirmation dialog with dynamic pricing (hourly or per-sqft). Manages focus trapping and body scroll lock.
- **Toast** — Auto-dismissing notification (3s), uses `aria-live="polite"`.

**Data:** Mock contractor data in `src/data/contractors.js` (6 contractors). No persistence — data resets on refresh.

**Utilities:** `src/utils/format.js` — date/time formatting helpers and availability label mapping.

## Styling

CSS Variables theme system in `index.css` with light/dark/system modes. Theme applied via class on `<html>`. Component styles in `App.css`. Layout uses flexbox with a 380px fixed sidebar on desktop and state-driven mobile view toggling.

## Pricing Model

Two pricing types in contractor data: hourly (`rate` field) and per-sqft (`pricing: "per_sqft"` with `rates: { new, old }` for new vs existing construction). BookingModal handles both.

## Deployment

Vercel with SPA rewrite (`vercel.json` routes all paths to `/`).
