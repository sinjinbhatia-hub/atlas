# Data Structures

## Entity Overview

The following entities exist in the system. Each becomes a table in the database.

```
USER ──────────────── has many ──── DAILY_CHECKIN
  │                                 BANISTER_STATE
  │                                 SESSION
  │
  └── belongs to ──── SPORT_PROFILE

SESSION ───────────── has many ──── SESSION_EXERCISE
SESSION_EXERCISE ──── has many ──── SET_LOG
```

---

## Schemas

### USER
```
id                  INTEGER     Primary key
name                TEXT
sport_profile_id    INTEGER     → SPORT_PROFILE
goal                TEXT        e.g. "increase squat 1RM", "improve vertical"
training_start_date DATE
bodyweight          REAL        Current bodyweight (kg)
created_at          DATETIME
```

---

### SPORT_PROFILE
```
id                  INTEGER     Primary key
name                TEXT        e.g. "powerlifting", "basketball", "calisthenics"
load_formula        TEXT        e.g. "tonnage", "session_rpe", "hybrid"
performance_vector  JSON        e.g. ["strength", "power", "endurance"]
readiness_weights   JSON        e.g. {"sleep": 0.35, "soreness": 0.30, "mood": 0.20, "nutrition": 0.15}
phase_structure     JSON        Defines lengths of accumulation/intensification/peak/deload
```

**Example readiness_weights by sport:**
```json
powerlifting:  {"sleep": 0.35, "soreness": 0.30, "mood": 0.20, "nutrition": 0.15}
basketball:    {"sleep": 0.30, "soreness": 0.35, "mood": 0.20, "nutrition": 0.15}
golf:          {"sleep": 0.25, "soreness": 0.20, "mood": 0.35, "nutrition": 0.20}
```

---

### DAILY_CHECKIN
```
id                  INTEGER     Primary key
user_id             INTEGER     → USER
date                DATE
sleep_quality       REAL        0.0 – 1.0
sleep_hours         REAL
soreness            JSON        Per muscle group: {"quads": 0.7, "back": 0.2, "shoulders": 0.0}
mood                REAL        0.0 – 1.0
nutrition           REAL        0.0 – 1.0
stress              REAL        0.0 – 1.0
readiness_score     REAL        Computed R(t), stored for history and regression
notes               TEXT        Free text — fed directly to AI layer
```

**Why soreness is JSON:**
A powerlifter with sore quads shouldn't squat heavy but can still bench. A single soreness number loses this information. The AI layer reads the muscle-specific map and adjusts exercise selection accordingly.

---

### BANISTER_STATE
```
id                  INTEGER     Primary key
user_id             INTEGER     → USER
date                DATE
fitness             REAL        Long-term training adaptation (ATL)
fatigue             REAL        Short-term training stress (CTL)
performance_score   REAL        fitness − fatigue
trimp               REAL        Today's training impulse (0 if rest day)
tau_fitness         REAL        Decay constant τ_f (default 45, gets personalized)
tau_fatigue         REAL        Decay constant τ_g (default 7, gets personalized)
```

**Critical design decision — append only, never overwrite:**
A new row is inserted every day. Yesterday's values are never modified. This preserves the full historical curve for visualization and for fitting personalized τ values via regression later.

---

### SESSION
```
id                  INTEGER     Primary key
user_id             INTEGER     → USER
date                DATE
session_type        TEXT        "strength" | "practice" | "conditioning" | "skill"
prescribed_load     REAL        Load_target from the model
actual_load         REAL        TRIMP computed after session is logged
phase               TEXT        "accumulation" | "intensification" | "peak" | "deload"
rpe_overall         INTEGER     1–10, how hard the whole session felt
completed           BOOLEAN
ai_notes            TEXT        What the AI recommended and why (stored for audit/review)
```

---

### SESSION_EXERCISE
```
id                      INTEGER     Primary key
session_id              INTEGER     → SESSION
exercise_name           TEXT        e.g. "squat", "bench press", "sprint", "golf swing"
exercise_type           TEXT        "barbell" | "bodyweight" | "skill" | "cardio"
target_sets             INTEGER
target_reps             INTEGER
target_weight           REAL        kg
target_intensity_pct    REAL        % of estimated 1RM
order_in_session        INTEGER
```

---

### SET_LOG
```
id                      INTEGER     Primary key
session_exercise_id     INTEGER     → SESSION_EXERCISE
set_number              INTEGER
reps_completed          INTEGER
weight_used             REAL        kg
rpe                     INTEGER     1–10, how hard this specific set felt
estimated_1rm           REAL        Computed from Epley: weight × (1 + reps/30)
is_pr                   BOOLEAN     True if estimated_1rm > previous best for this exercise
```

---

## Data Flow: A Full Day

### Morning
```
1. User submits DAILY_CHECKIN
2. readiness_score R(t) computed and stored
3. System reads yesterday's BANISTER_STATE
4. Load_target calculated: BaseLoad × R(t) × Phase(t)
5. SESSION row created
6. SESSION_EXERCISE rows created with target weights
7. AI layer receives full context, writes session plan
```

### Evening (after training)
```
1. User logs each SET_LOG for every exercise
2. estimated_1rm computed for each set via Epley
3. is_pr flagged if new estimated_1rm exceeds previous best
4. actual TRIMP computed from all SET_LOG data
5. New BANISTER_STATE row appended:
     Fitness(t)  = Fitness(t-1) × e^(−1/τ_f) + TRIMP(t)
     Fatigue(t)  = Fatigue(t-1) × e^(−1/τ_g) + TRIMP(t)
     Performance = Fitness(t) − Fatigue(t)
6. SESSION.actual_load updated
```

---

## Key Design Decisions

**1. Soreness stored as JSON per muscle group, not a single number.**
Enables the AI to make exercise-level substitutions based on which specific muscles are fatigued, not just a global "soreness level."

**2. Banister state is append-only (new row each day).**
Never overwrite previous state. This enables full curve visualization over time and provides the dataset needed to fit personalized decay constants via nonlinear regression.

**3. AI notes stored with each session.**
Every AI recommendation is recorded alongside the inputs that produced it. This creates an audit trail and allows review of why a particular prescription was made on a given day.

**4. tau values stored per Banister state row.**
As decay constants are personalized over time, storing them per-row means historical computations remain valid and you can track how your personal parameters evolve.
