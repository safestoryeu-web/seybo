# Security+ SY0-701 Study App

Mobile-first study app for the CompTIA Security+ SY0-701 certification.

## What's here

This folder contains a fully working **vanilla HTML/CSS/JS** version of the app — open `index.html` in any browser (works great on iPhone Safari) and it runs as-is, with progress saved to `localStorage`.

It also contains everything you need to **rebuild this as a Next.js app** in Cursor (or any AI-IDE) — see `CURSOR_PROMPT.md`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell + all CSS (mobile-first, dark theme, iPhone-style bottom nav) |
| `app.js` | All application logic — routing, state, Learn/Test/Score views, markdown renderer |
| `data.js` | Bundles content as a `window.SY701` global (used by `index.html`) |
| `domains.json` | The 5 SY0-701 exam domains with weights and colors |
| `chapters.json` | 41 study chapters across all domains (~254 min reading) |
| `questions.json` | 144 multiple-choice practice questions with explanations |
| `manifest.webmanifest` | PWA manifest (lets you "Add to Home Screen" on iOS) |
| `CURSOR_PROMPT.md` | Copy-paste prompt for Cursor / Claude Code to build the Next.js version |

## Content sources

Content is drawn from your `Learning_Source/` folder:

- Professor Messer's CompTIA Security+ SY0-701 Course Notes
- Andrew Ramdayal's CompTIA Security+ SY0-701 Last Minute Cram
- CompTIA SY0-701 Certification Companion
- Aligned to the official CompTIA SY0-701 exam objectives

## Coverage

| Domain | Weight | Chapters | Questions |
|--------|--------|----------|-----------|
| 1.0 General Security Concepts | 12% | 11 | 28 |
| 2.0 Threats, Vulnerabilities & Mitigations | 22% | 10 | 30 |
| 3.0 Security Architecture | 18% | 6 | 26 |
| 4.0 Security Operations | 28% | 8 | 32 |
| 5.0 Security Program Management & Oversight | 20% | 6 | 28 |
| **Total** | 100% | **41** | **144** |

## How the app works

Three sections, accessed from the bottom navigation:

1. **Learn** — domain-grouped chapters; tap one to read; "Mark as read" tracks progress; per-domain donut shows completion.
2. **Test** — pick mode (Practice with explanations / Exam mode), choose domains, set 10–90 questions, optional 90-min timer. Wrong answers are shown with explanations on the results screen.
3. **Score** — overall reading + accuracy, recommended-focus domain (your weakest), per-domain bars, recent test history, export/reset.

State lives in `localStorage` under the key `sy701_state_v1`.
