# BrilliantClone

An interactive, Brilliant-style learning app where you build each idea by hand instead of reading it. Every lesson goes from a worked example to a fresh, no-scaffolding problem, and an optional "teach it back" tutor checks your explanation before the final question.

Live: https://brilliantclone-30554.web.app

Courses currently cover combinatorics (counting strategies) and organic chemistry (substitution and elimination mechanisms).

## Stack

- React 19 and TypeScript, built with Vite
- React Router for routing
- Firebase Auth and Firestore for accounts and saved progress
- A Firebase Cloud Function proxies the OpenAI call for the teach-back tutor, so the API key stays server-side
- Vitest and Testing Library for unit tests, Playwright for e2e

## Running locally

Prerequisites: Node 20.19+ and npm.

```bash
npm install
npm run dev
```

The app runs at the URL Vite prints (5173 by default). With no Firebase config it starts in demo mode: every lesson is unlocked and progress is kept in the browser, so you can explore without an account.

## Environment

Accounts and saved progress need a Firebase project. Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to find it |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase console, project settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase console, project settings |
| `VITE_FIREBASE_APP_ID` | Firebase console, your web app |

Set `VITE_DISABLE_FIREBASE=1` to force demo mode even when the keys are present (the e2e suite uses this).

The teach-back tutor calls OpenAI through a Cloud Function, so there is no client key. To enable it:

```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase deploy --only functions
```

Without it, the teach-back step falls back to a written self-check against the lesson's rubric, so the lesson still works end to end.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run lint` | Run oxlint |

## Deploying

Build, then deploy hosting, functions, and Firestore rules together:

```bash
npm run build
firebase deploy
```

## Project layout

- `src/content/`: lesson and course definitions (the curriculum lives here)
- `src/components/`: lesson runner, step types, course path, and visuals
- `src/pages/`: landing, login, lesson, and course-test screens
- `functions/`: the teach-back Cloud Function
