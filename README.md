# Talibrate English Practice Lab

Phase 1 of a static English communication practice web app for employees improving conversational English, listening comprehension, grammar confidence, interview readiness, and CV-style speaking confidence.

## Phase 1 Scope

- Static React + Vite frontend
- GitHub Pages deployable
- No backend, database, authentication, OpenAI API, API keys, AI feedback, or voice recording
- Browser text-to-speech only
- Progress stored in `localStorage`
- Lesson content loaded from JSON files in `src/data`

## Content Source

The lesson database comes from the provided content pack:

- `src/data/shadowing.json`
- `src/data/sentenceBuilder.json`
- `src/data/interviewPractice.json`
- `src/data/listeningComprehension.json`

The root `content_pack_full.json` is kept as the original combined reference file.

## App Sections

- Dashboard
- Shadowing Practice
- Sentence Builder
- Interview Practice
- Listening Comprehension
- Progress
- Daily Practice

Daily Practice includes:

- 5 shadowing phrases
- 3 sentence builder drills
- 2 interview questions
- 5 listening comprehension questions

## Project Structure

```text
src/
  App.jsx
  main.jsx
  data/
  components/
    Layout.jsx
    ModuleCard.jsx
    ProgressCard.jsx
    PracticeControls.jsx
    FilterBar.jsx
  modules/
    Dashboard.jsx
    ShadowingPractice.jsx
    SentenceBuilder.jsx
    InterviewPractice.jsx
    ListeningComprehension.jsx
    Progress.jsx
    DailyPractice.jsx
  services/
    speechService.js
    progressService.js
    scoringService.js
  styles/
    main.css
```

## Local Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## GitHub Pages Deployment

Set the repository homepage/path through Vite's `base` config. This project defaults to relative asset paths, which works well for GitHub Pages project sites.

Deploy with:

```bash
npm run deploy
```

The deploy script builds the app and publishes `dist` using `gh-pages`.

## Future Phases

The app is structured so later phases can add:

- Browser speech recognition through `speechService.js`
- Backend or serverless AI feedback without changing lesson components
- CV-based practice modules
- Employee accounts, manager dashboards, and centralized analytics
