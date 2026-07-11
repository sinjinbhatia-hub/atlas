# Atlas — AI Strength Coach

A full-stack AI-powered strength coaching app built for the App Store.

## Overview

Atlas is a personalized training platform that uses machine learning and coaching science to prescribe workouts, adapt training in real-time, and track long-term athletic development.

**Live:** [atlas-zeta-six.vercel.app](https://atlas-zeta-six.vercel.app)

## Features

- **AI Prescription Engine** — Claude-powered workout prescriptions using the Banister impulse-response model, RIR-based load management, and 6+ years of training history
- **Intra-workout Adaptation** — Real-time set-by-set weight adjustments based on RIR feedback
- **Banister Model** — Fitness/fatigue modeling across a 45-day fitness and 7-day fatigue time constant to determine training phase (accumulation → intensification → peak → deload)
- **Pattern Detection** — Identifies top set + backoff, straight sets, pyramid, and reverse pyramid from raw session data
- **Daily Check-in** — Readiness scoring from sleep, mood, nutrition, stress, and per-muscle soreness
- **Workout History** — Full session log, exercise progress charts, and estimated 1RM progression
- **Multi-user Auth** — Supabase authentication with row-level security
- **Import** — CSV import from Strong and other lifting apps

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite, deployed on Vercel |
| Backend | FastAPI (Python), deployed on Railway |
| Database | PostgreSQL on Supabase with RLS |
| Auth | Supabase Auth (email + Apple Sign In planned) |
| AI | Anthropic Claude (claude-sonnet-4) |

## Architecture

```
User → Vercel (React) → Railway (FastAPI) → Supabase (Postgres)
                     ↓
              Anthropic API
```

The backend handles:
- Banister model computation across full training history
- Pattern recognition from raw set data
- AI prescription generation with coaching knowledge base injection
- Per-user data isolation via JWT + RLS

## Running Locally

**Backend:**
```bash
pip install -r requirements.txt
# copy .env.example to .env and fill in your keys
cd src
uvicorn server:app --reload
```

Required environment variables (see [.env.example](.env.example)): `SUPABASE_URL` (Postgres connection string), `SUPABASE_JWT_SECRET`, `ANTHROPIC_API_KEY`.

**Frontend:**
```bash
cd atlas-frontend
npm install
npm run dev
```

## Screenshots

<!-- TODO(sinjin): drop screenshots into docs/screenshots/ and they'll render here -->
| Dashboard | Workout | Check-in |
|---|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Workout](docs/screenshots/workout.png) | ![Check-in](docs/screenshots/checkin.png) |

## Roadmap

- [ ] Apple Sign In
- [ ] Stripe subscriptions
- [ ] Capacitor iOS wrapper
- [ ] App Store submission
- [ ] Profile setup on first login
- [ ] CSV import UI

## Background

Built as an independent project exploring the intersection of strength training science, LLM-based coaching, and mobile product development.

## License

[MIT](LICENSE)