# Ada Course Finder — Find Your Path

A QR-triggered quiz tool that matches Year 10-11 students to Ada Manchester
courses and T-Levels based on their interests and working style, built as
part of the DTP (Digital Technology Project) university module.

Students scan a QR code (on a poster, leaflet, or open evening stand),
answer a short quiz with no account required, and get a personalised set of
course matches with plain-language reasoning. They can then generate a
parent-friendly summary card to share via WhatsApp or a link.

## Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL, EU region) with row-level security
- **Hosting:** Vercel
- **AI:** Google Gemini 2.5 Flash-Lite (server-side only, fact-locked
  prompts) for parent card generation
- **Email (optional opt-in):** Resend
- **QR generation:** qrcode.react

See the project's Technical Report for the full architecture, decision
rationale, and system design (ERD, UML, API design, SOLID review).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase/Gemini/Resend keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint with ESLint
- `npm run format` — format with Prettier
- `npm run format:check` — check formatting without writing changes

## Project structure

```
src/
  app/            Routes (App Router), including /q (quiz) and /api/*
  components/     Reusable UI components
  config/         Versioned quiz content/config (see Risk R8)
  lib/
    scoring/      Scoring engine (matches answers to courses)
    supabase/     Supabase client + data access
    ai/           Gemini prompt construction (fact-locked, server-side only)
  types/          Shared TypeScript types
```

## Status

This project is being built in phases tracked via GitHub Issues and
Milestones in this repository. See the Issues tab for current progress.
