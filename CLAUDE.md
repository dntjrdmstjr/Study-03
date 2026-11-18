# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Korean 4-choice general-knowledge quiz web app (20 questions: 한국사·과학·지리·예술문화, 5 each). All UI text is Korean.

## Constraints

- Plain HTML/CSS/JavaScript only — no external libraries, CDNs, build tools, or package manager.
- Must run by double-clicking `index.html` (`file://`). Do not use ES modules, `fetch` of local files, or anything requiring a server.
- Keep to the three files: `index.html`, `style.css`, `script.js`.

## Running / testing

No build, lint, or test tooling. Open `index.html` in a browser (`start index.html` on Windows) and play through manually.

## Architecture

- `index.html` holds three `<section>` screens (`#start-screen`, `#quiz-screen`, `#result-screen`); only one is visible at a time via the `.hidden` class, toggled by `show(name)` in `script.js`.
- `script.js`:
  - `QUESTIONS` array is the single source of quiz data: `{ category, question, choices[4], answer }` where `answer` is the 0-based index into `choices`.
  - Three modes (`mode`: `all` / `category` / `speed`). `startQuiz(mode, category)` builds `quizList` (all, filtered by category, or shuffled); everything downstream iterates `quizList`, never `QUESTIONS` directly. Totals and per-category totals (`categoryTotal`) are derived from `quizList`, so nothing is hardcoded.
  - Flow: `startQuiz` → `renderQuestion` → `selectAnswer` (locks buttons, marks `.correct`/`.wrong`, shows feedback and next button) → `nextQuestion` → `showResult`. Restart calls `startQuiz(mode, selectedCategory)`; `goHome` returns to mode selection.
  - Speed mode only: `TIME_LIMIT`-second interval timer (`startTimer`/`stopTimer`; timeout calls `selectAnswer(-1)`), and a hint (`useHint`) that removes 2 wrong choices. `points` = `SPEED_POINTS` per correct answer minus `HINT_PENALTY` if a hint was used. Always `stopTimer()` when leaving a question or screen.
- `style.css` state classes used by JS: `.hidden`, `.choice`, `.correct`, `.wrong`, `.removed`, `.timer.urgent`, and `#feedback.ok` / `#feedback.no`.
