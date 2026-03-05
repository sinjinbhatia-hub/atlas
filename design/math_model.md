# Mathematical Model

## Overview

The system answers one question each day:

> *Given everything we know about this athlete, what training stimulus should we prescribe today to maximize long-term adaptation?*

This is a constrained optimization problem solved in five layers.

---

## Layer 1: Training Load (TRIMP)

Before modeling fitness or fatigue, every session must be reduced to a single number representing the physiological stress applied. This is called **Training Impulse (TRIMP)**.

### For lifting sports (powerlifting, strength training):

**Step 1 — Estimate 1RM using the Epley formula:**
```
1RM = weight × (1 + reps / 30)
```

**Step 2 — Compute intensity percentage:**
```
intensity% = weight / 1RM
```

**Step 3 — Compute TRIMP with intensity penalty:**
```
TRIMP = Σ (sets × reps × weight × intensity%²)
```

Squaring the intensity percentage penalizes high-intensity work more heavily, which matches real physiology. Two sessions with identical tonnage but different intensities produce different stress — this captures that.

### For non-lifting sports (basketball, golf, conditioning):

```
TRIMP = session_duration_minutes × RPE (1–10)
```

Session RPE (Rate of Perceived Exertion) is a validated sports science metric. This formula puts a basketball practice and a squat session on a common scale — the **universal load unit** that enables multi-sport modeling.

---

## Layer 2: The Banister Fitness-Fatigue Model

This is the mathematical core of Atlas. It models the body as two competing systems that both respond to training load but with different time dynamics.

### The equations (discrete form):

```
Fitness(t)  = Fitness(t-1)  × e^(−1/τ_f) + TRIMP(t)
Fatigue(t)  = Fatigue(t-1)  × e^(−1/τ_g) + TRIMP(t)
Performance(t) = k_f · Fitness(t) − k_g · Fatigue(t)
```

### Parameters:

| Parameter | Meaning | Default Value |
|---|---|---|
| τ_f | Fitness decay constant | 45 days |
| τ_g | Fatigue decay constant | 7 days |
| k_f | Fitness scaling factor | fitted to data |
| k_g | Fatigue scaling factor | fitted to data |

### Why these decay constants?

- **τ_f = 45 days**: Fitness (physiological adaptation) decays slowly. This is why you don't lose gains after one rest day.
- **τ_g = 7 days**: Fatigue decays fast. This is why you feel strong after a few days off.

The exponential decay terms are Euler approximations of a continuous first-order ODE system:
```
dFitness/dt  = −Fitness/τ_f  + w(t)
dFatigue/dt  = −Fatigue/τ_g  + w(t)
```
where w(t) is the training impulse function.

### The key insight — peaking:

After weeks of hard training, both Fitness and Fatigue are high. Fatigue masks fitness. If you reduce load for 5–7 days:
- Fatigue drops sharply (short τ_g)
- Fitness barely changes (long τ_f)
- Performance = Fitness − Fatigue **increases**

This is why peaking/tapering works — and why Atlas triggers it from data, not a calendar.

### Personalization:

Default τ values are population averages. With enough personal data (8–12 weeks), these can be fitted via nonlinear least squares regression to match the individual's actual response curve. This is the Bayesian updating upgrade path.

---

## Layer 3: Daily Readiness Score

Each morning the athlete submits a check-in. The system computes a readiness score R(t) ∈ [0, 1]:

```
R(t) = w₁·S + w₂·(1−σ) + w₃·M + w₄·N
```

### Variables:

| Variable | Meaning | Range |
|---|---|---|
| S | Sleep quality | 0–1 |
| σ | Soreness (inverted) | 0–1 |
| M | Mood / mental state | 0–1 |
| N | Nutrition quality | 0–1 |
| w₁…w₄ | Weights (sum to 1) | — |

### Default weights (equal, sport-agnostic):
```
w₁ = 0.25 (sleep)
w₂ = 0.25 (soreness)
w₃ = 0.25 (mood)
w₄ = 0.25 (nutrition)
```

### Weight personalization:

As session data accumulates, run a linear regression of R(t) against actual performance outcomes. The weights that best predict performance for this individual become their personalized weight vector. A powerlifter may find sleep dominates (w₁ → 0.40). A basketball player may find soreness matters more.

### Soreness is muscle-group specific:

Soreness σ is not a single number — it is a vector over muscle groups:
```
σ = {quads: 0.7, hamstrings: 0.2, chest: 0.0, back: 0.5, ...}
```

The overall σ fed into R(t) is a weighted average, but the full vector is passed to the AI layer for exercise selection (e.g. high quad soreness → skip squats, substitute Romanian deadlifts).

---

## Layer 4: Load Prescription

Given today's readiness score and the athlete's current training phase, prescribe a target load:

```
Load_target(t) = BaseLoad × R(t) × Phase(t)
```

### BaseLoad:
Rolling 7-day average of actual TRIMP values. Anchors prescription to the athlete's recent training history rather than an arbitrary constant.

### Phase multipliers:

| Phase | Multiplier | Typical Duration |
|---|---|---|
| Accumulation | 1.0–1.2 | 3 weeks |
| Intensification | 0.90–1.0 | 2 weeks |
| Peaking | 0.70–0.85 | 1 week |
| Deload | 0.40–0.50 | 1 week |

### Phase detection (automatic):

Phases are not scheduled. They are triggered by the Banister model:
- **Deload trigger**: Fatigue(t) / Fitness(t) ratio exceeds threshold (e.g. > 1.3) for 3+ consecutive days
- **Peak trigger**: Fitness curve plateaus AND cumulative fatigue is manageable AND a competition/test date is within range
- **Accumulation**: Default state when no trigger conditions are met

---

## Layer 5: Weight & Rep Back-Calculation

Given Load_target and a target exercise, solve for the weight to put on the bar:

**Step 1 — Choose rep scheme from phase:**
```
Accumulation:      4×8  or 5×5
Intensification:   5×3  or 4×4
Peaking:           3×2  or 2×1
Deload:            3×10 (light, movement focus)
```

**Step 2 — Choose target intensity % from phase:**
```
Accumulation:      70–80% of 1RM
Intensification:   80–90% of 1RM
Peaking:           90–97% of 1RM
Deload:            50–60% of 1RM
```

**Step 3 — Solve for weight:**
```
weight = Load_target / (sets × reps × intensity%²)
```

**Step 4 — Round to nearest 2.5kg (or 5lb)**

**Step 5 — Sanity check against estimated 1RM:**
```
if weight > 0.97 × 1RM: cap at 0.97 × 1RM
if weight < 0.40 × 1RM: floor at 0.40 × 1RM
```

---

## The Full Daily Loop

```
Morning check-in (sleep, soreness, mood, nutrition)
        ↓
Compute R(t) — readiness score
        ↓
Read Banister state from yesterday: Fitness(t-1), Fatigue(t-1)
        ↓
Determine current Phase(t)
        ↓
Compute Load_target = BaseLoad × R(t) × Phase(t)
        ↓
Back-calculate weights for each exercise
        ↓
AI layer receives: prescription + readiness context + muscle soreness map
AI outputs: full written session plan with coaching notes
        ↓
Athlete trains, logs each set
        ↓
Compute actual TRIMP from logged sets
        ↓
Update Banister state:
  Fitness(t)  = Fitness(t-1) × e^(−1/45) + TRIMP(t)
  Fatigue(t)  = Fatigue(t-1) × e^(−1/7)  + TRIMP(t)
        ↓
Update 1RM estimates from logged sets (Epley)
        ↓
Flag PRs, store everything
        ↓
Repeat tomorrow
```

---

## Future: Bayesian Parameter Learning

The parameters τ_f, τ_g, k_f, k_g, and the readiness weight vector w start as population averages. With 8–12 weeks of data, they can be personalized via:

- **Nonlinear least squares** — fit τ values to minimize error between predicted and actual performance
- **Linear regression** — fit readiness weights to maximize correlation with performance outcomes
- **Bayesian updating** — maintain a probability distribution over each parameter, update it after each session

This is the research contribution: **population-average models become individually-tuned models through longitudinal self-tracking.**
