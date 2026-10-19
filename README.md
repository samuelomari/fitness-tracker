# FitTrack Pro — Fitness Tracker Web Application

Full-stack Fitness & Health Platform: **Flask (JWT) + SQLite backend** and **React + Vite + Tailwind + Chart.js frontend**.

## Features

### 🔐 Authentication & Account Management
- **Enhanced Login & Register**:
  - Proper form submission on Enter key press
  - 1-click Quick Demo login buttons (Demo User & Admin)
  - Show / Hide password visibility toggle
  - Descriptive server & network error messages
  - Password reset request modal (hooked into `/api/auth/reset-request`)
  - Bcrypt password hashing & JWT token expiration

### ⚡ Workout Routines & Templates (New)
- **Pre-built training routines**: Push Day (Hypertrophy), Pull Day (Back & Biceps), Leg Day & Core, 5x5 Full-Body Strength, and HIIT Cardio.
- **1-Click Logging**: Automatically logs all movements in the routine into your workout history and updates streak and calorie burn.

### 💧 Wellness & Recovery Tracker (New)
- **Hydration Tracking**: Visual goal progress bar, quick-add buttons (+250ml, +500ml, +750ml, +1000ml), custom amount input, and configurable daily water target.
- **Sleep Quality Tracking**: Bedtime & wake time loggers, automatic duration computation, 7-day average sleep indicators, and quality color tags.

### 🏆 Personal Records & 1RM Calculator (New)
- **Personal Records (PRs)**: Automatically aggregates all-time heaviest weight, highest volume, and estimated 1RM for each exercise logged.
- **Interactive 1RM Calculator**: Epley-formula based one-rep max estimation with training load intensity percentages (60% to 95%) for target rep ranges.

### 🥗 Nutrition & Daily Macro Goals (Enhanced)
- **Customizable Daily Macro Targets**: Set targets for Calories (kcal), Protein (g), Carbs (g), and Fat (g).
- **Visual Progress Rings/Bars**: Real-time progress bars tracking today's intake against your daily macro budget.

### 📊 Analytics & Data Export (New)
- **Print-ready PDF Fitness Report**: One-click download of profile metrics, BMI, calorie needs, active goals, and recent 15 workouts.
- **CSV Data Exports**: Export raw datasets for Workouts, Nutrition, and Weight history compatible with Excel or Google Sheets.

### 🏋️ Workouts & Exercise Library
- Searchable workout history with inline Edit and Delete.
- Comprehensive exercise library with filters for muscle group, equipment, and difficulty.

### 🎯 Goals & Gamification
- Goal creation with auto-completion progress tracking.
- Interactive community challenges and 7 auto-awarded achievement badges.
- GitHub-style workout activity heatmap.

---

## Quickstart

### 1. Backend (Flask & SQLite)
```bash
cd backend
# Create and activate virtual environment (already set up in .venv)
source .venv/bin/activate
pip install -r requirements.txt

# Initialize & seed SQLite database (creates instance/fittrack.db)
python seed.py

# Start backend server on port 5000
python run.py
```
> Demo credentials:
> - **Demo User**: `demo@fittrack.dev` / `demo1234`
> - **Admin**: `admin@fittrack.dev` / `admin123`

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev    # Starts on http://localhost:5173
```
Frontend development server proxies all `/api` requests directly to `http://localhost:5000`.

### 3. Run Automated Tests
```bash
cd backend
.venv/bin/pytest
```
