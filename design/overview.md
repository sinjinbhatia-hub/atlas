# Project Overview

## The Problem

Coaching in athletics operates on a fixed-schedule paradigm. A coach writes a weekly program with no knowledge of how you slept, how stressed you are, or how recovered your muscles actually are. This produces suboptimal outcomes — athletes either overtrain or undertrain relative to their actual physiological state on any given day.

Human coaches who do attempt daily adjustment cost $300–500/month and still only see you once a week. They're making decisions with incomplete information.

## The Insight

Performance on any given day is a function of:
1. Your accumulated fitness (long-term training adaptation)
2. Your accumulated fatigue (short-term training stress)
3. Your daily readiness state (sleep, nutrition, stress, soreness)

All three are measurable. If you measure them daily and model them mathematically, you can prescribe the optimal training stimulus for that specific day — not the day a coach planned for two weeks ago.

**The schedule should emerge from the data. The data should never be forced into a schedule.**

## The Solution

Atlas is a daily adaptive coaching system. Every morning the athlete checks in. The system reads their physiological state, models their current fitness and fatigue, and prescribes exactly what they should do that day — down to specific weights, sets, and reps. At the end of the session, logged performance feeds back into the model.

Over time the model personalizes to the individual athlete. Parameters that start as population averages become tuned to how *this specific person* responds to load.

## Target Users

Atlas is not just for powerlifters. The mathematical framework generalizes across any sport where training load can be quantified:

| Sport | What Gets Optimized |
|---|---|
| Powerlifting | Max strength, 1RM PRs |
| Basketball | Athletic output, power, conditioning |
| Calisthenics | Skill acquisition, strength-to-weight |
| Golf | Rotational power, mobility, consistency |
| General fitness | Body composition, health markers |

## Product Thesis

> A daily adaptive coaching system with access to real physiological data will outperform a human coach seen once a week — for every type of athlete, at any budget.

## Research Angle

The academically interesting question embedded in this project: **can you learn individual physiological parameters (fitness decay constant, fatigue decay constant, readiness weight vector) from personal longitudinal training data?**

Most Banister model implementations use population averages. Atlas uses Bayesian updating to personalize these parameters over time. This is a genuine contribution to the sports science / applied ML literature and is suitable for undergraduate research presentation.

## Roadmap

**V1 — Personal prototype**
Powerlifting/strength focus. Prove the Banister model works on personal data. Jupyter notebook + simple CLI.

**V2 — Multi-sport generalization**
Add basketball as a second sport. Design the universal load unit (Training Stress Score). Solve the load normalization problem across sports.

**V3 — Full application**
User accounts, onboarding, sport selection, full web interface. Open to other athletes.
