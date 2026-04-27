# How to convert this into a Next.js app with Cursor

This folder has everything you need. Open it in Cursor, then paste the prompt below into Cursor's chat (Cmd/Ctrl+L).

## What Cursor needs to know

1. The **content** lives in three JSON files: `domains.json`, `chapters.json`, `questions.json`. These are the source of truth — do not lose any content during the port.
2. The **working reference implementation** is `index.html` + `app.js` + `data.js`. Cursor should read these first to understand the data model, UI layout, behavior, and styling, then re-implement them as a Next.js app.
3. The styling in `index.html` uses CSS custom properties (`--bg`, `--primary`, etc.) and a dark theme. These should be preserved (or moved into Tailwind config — see options below).

## Copy-paste prompt for Cursor

> Read `README.md`, `index.html`, `app.js`, `domains.json`, `chapters.json`, and `questions.json` to understand this project.
>
> Then create a **Next.js 14 (App Router) + TypeScript + Tailwind CSS** version of the app in a new `nextjs-app/` subfolder. Requirements:
>
> **Project setup**
> - Use `create-next-app` defaults: TypeScript, ESLint, Tailwind, App Router, `src/` directory.
> - Move `domains.json`, `chapters.json`, `questions.json` into `src/data/` and import them with type-safe wrappers in `src/lib/content.ts` (define `Domain`, `Chapter`, `Question` interfaces).
> - Add an `id` slug-friendly format wherever needed.
>
> **Routing (App Router)**
> - `/` → redirects to `/learn`
> - `/learn` → list of domains with their chapters; tapping a chapter opens its page
> - `/learn/[chapterId]` → reads the chapter, with mark-as-read button + prev/next navigation
> - `/test` → test configurator (mode, domains, # questions, timer toggle); "Start" navigates to `/test/run`
> - `/test/run` → live test session (client component, holds session state)
> - `/test/results` → results screen with per-domain breakdown and missed-question review
> - `/score` → progress dashboard (overall + per-domain reading & test accuracy, weak-area recommendation, history, export/reset)
>
> **State / persistence**
> - Use `localStorage` (key: `sy701_state_v1`) for: `read` (chapter completion timestamps), `testHistory` (array of past tests), `questionStats` (per-question seen/correct counters), `flagged` (review markers).
> - Wrap localStorage in a `useStudyState` Zustand store (or React Context — your call) that hydrates on mount and is SSR-safe.
> - Test session state is in-memory only (lives in `/test/run` page).
>
> **UI**
> - Mobile-first; everything must work on a 375px-wide iPhone viewport.
> - Bottom-nav with three tabs: Learn / Test / Score (sticky bottom, safe-area-inset aware).
> - Dark theme by default with CSS variables (port the `:root` block from `index.html`). Add a `prefers-color-scheme: light` override too.
> - Use the same iPhone-style design language: 14–17px body, 44px tap targets, rounded corners, subtle borders, donut progress charts.
> - Render chapter markdown with `react-markdown` (or port the existing tiny markdown renderer from `app.js`'s `md()` function).
>
> **Components to extract**
> - `<DomainHeader />` — pill + title + meta + donut
> - `<ChapterListItem />` — icon (read/unread) + title + arrow
> - `<DonutChart />` — SVG donut for percentages
> - `<BarRow />` — name + bar + pct (used in Score view)
> - `<TestQuestion />` — question + 4 options + explanation
> - `<BottomNav />` — sticky tabs
> - `<StatCard />` — label + big number + sub
>
> **Tailwind config**
> - Extend `theme.colors` with the domain colors (`d1: '#3b82f6'` etc.) and the surface tokens.
> - Use the `[class~="dark"]` strategy or the CSS-variable approach from `index.html`.
>
> **Quality bar**
> - All 41 chapters must render. All 144 questions must be in the bank. Verify with a unit test.
> - The test session must shuffle answer choices per question (preserve correct-answer index — see `startTest()` in `app.js`).
> - "Recommended focus" picks the lowest-accuracy domain the user has answered questions in; falls back to least-read if no test data yet.
> - Keep `package.json` clean — only `next`, `react`, `react-dom`, `tailwindcss`, `react-markdown`, `zustand` (or context), and dev deps.
>
> Do not invent new content or change the question/explanation text. Pull everything from the JSON files verbatim.

## Notes

- The current `app.js` is ~1000 lines and self-contained — Cursor can use it as a behavioural spec without you needing to write one.
- `data.js` and the JSON files contain the same content (the JSON files were generated from `data.js`). For the Next.js port, prefer the JSON files (cleaner imports).
- The current vanilla version already works on iPhone — keep it as a reference for what "done" looks like visually.

## What you'll get

A `nextjs-app/` subfolder with a runnable Next.js app:

```bash
cd nextjs-app
npm install
npm run dev
# → open http://localhost:3000
```

Deploy to Vercel for a free, mobile-installable PWA.
