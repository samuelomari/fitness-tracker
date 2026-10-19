# Project Plan: Login Fixes, SQLite Database Storage, and New Features

## Milestone 1: Backend Environment & SQLite Database Setup
- [x] Install required backend dependencies into virtual environment (`.venv`)
- [x] Initialize SQLite database (`fittrack.db`) and run `seed.py` with demo users
- [x] Verify backend server boots and responds on `/api/health` and `/api/auth/login`

## Milestone 2: Login System Enhancements & Fixes
- [x] Wrap login inputs in standard `<form onSubmit=...>` so "Enter" submits
- [x] Add 1-click Quick Login demo buttons (`Demo User`, `Admin`)
- [x] Add Show/Hide password toggle
- [x] Add robust error handling (display actual server error messages / connection issues)
- [x] Add "Forgot Password?" modal with reset request flow hooked into `/api/auth/reset-request`
- [x] Add loading state and disabled buttons during authentication requests

## Milestone 3: New Feature - Dedicated Sleep & Water Tracker
- [x] Create/expand Sleep & Water tracker with visual daily progress bars, bedtime/wake-up logging, and hydration streak (`Wellness.jsx`)
- [x] Connect with `/api/track/water` and `/api/track/sleep` endpoints

## Milestone 4: New Feature - Pre-built Workout Templates & 1-Click Logging
- [x] Add Workout Templates page (`WorkoutTemplates.jsx`) for Push/Pull/Legs, Upper/Lower, 5x5 Full Body, and HIIT
- [x] Allow users to preview exercises in a routine and log an entire workout with 1 click

## Milestone 5: New Feature - Personal Records (PRs) & 1RM Calculator
- [x] Add PR tracker showing maximum weight and volume achieved per exercise (`Records.jsx`)
- [x] Add interactive One-Rep Max (1RM) calculator based on Epley formula with training intensity load percentages

## Milestone 6: New Feature - Nutrition & Macro Goals
- [x] Add daily Macronutrient targets (Protein, Carbs, Fat, and Calories)
- [x] Visual progress bars against daily targets in the Nutrition dashboard

## Milestone 7: New Feature - Fitness Reports (PDF & CSV Export)
- [x] Ensure PDF export functions smoothly via `/api/reports/fitness.pdf`
- [x] Add CSV export for workout history, nutrition logs, and weight logs (`Reports.jsx`)

## Milestone 8: End-to-End Verification & Ralph Loop
- [x] Run backend tests (`pytest` 30/30 passed)
- [x] Build frontend (`npm run build` completed with 0 errors)
- [x] Verify login flow, SQLite database persistence, and all new feature routes

