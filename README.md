# FitTrack Pro — Fitness Tracker Web Application

Full-stack MVP: **Flask (JWT) + SQLite/Postgres backend** and **React + Vite + Tailwind + Chart.js frontend**.

## Features (MVP implemented)
- **Auth**: register, login/logout, profile management, password-reset stub (JWT), bcrypt hashing
- **Dashboard**: total workouts, calories, current weight, active goals, weekly progress, streak, charts
- **Workouts**: add / edit / delete (exercise, sets, reps, weight, duration, calories, date)
- **Goals**: create, update progress (auto-completes at 100%), delete
- **Progress**: weight history, calories-by-day charts, workout streak
- **Nutrition**: log meals (calories/protein/carbs/fat) + daily totals
- **Water**: log intake, 3L goal bar
- **Sleep & weight** API + weight logging UI
- **Admin**: view/suspend/delete users, stats (totals, popular exercises)
- **UX**: dark/light mode, responsive Tailwind layout

## Quickstart

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed.py        # creates demo + admin users, sample data
python run.py         # http://localhost:5000 (health: /api/health)
```
Demo logins: `demo@fittrack.dev / demo1234`, admin: `admin@fittrack.dev / admin123`.

Env vars (optional): `SECRET_KEY`, `JWT_SECRET_KEY`, `DATABASE_URL` (defaults to SQLite `fittrack.db`).

### Frontend
```bash
cd frontend
npm install
npm run dev           # http://localhost:5173 (proxies /api to :5000)
```

## API overview
- POST `/api/auth/register`, `/api/auth/login` (JWT)
- GET `/api/auth/me`, PUT `/api/auth/profile` (BMI + calorie needs)
- CRUD `/api/workouts`, `/api/goals`
- GET `/api/dashboard/summary` (stats + charts)
- GET/POST `/api/track/nutrition`, `/water`, `/sleep`, `/weight`
- GET `/api/admin/users`, `/api/admin/stats` (admin JWT only)

