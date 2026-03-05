import pandas as pd
import numpy as np
import os
from datetime import date, timedelta

# ── File paths ─────────────────────────────────────────────────────
CHECKIN_FILE  = 'checkins.csv'
TRAINING_FILE = 'strong_workouts.csv'

# ── Banister parameters ────────────────────────────────────────────
TAU_FITNESS = 45
TAU_FATIGUE = 7

# ── Phase multipliers ──────────────────────────────────────────────
PHASES = {
    'accumulation':    {'multiplier': 1.1, 'intensity': 0.75, 'sets': 4, 'reps': 8},
    'intensification': {'multiplier': 0.95,'intensity': 0.85, 'sets': 4, 'reps': 5},
    'peak':            {'multiplier': 0.75,'intensity': 0.92, 'sets': 3, 'reps': 3},
    'deload':          {'multiplier': 0.45,'intensity': 0.55, 'sets': 3, 'reps': 10},
}

# ── Step 1: Rebuild Banister state from full training history ──────
def compute_banister():
    df = pd.read_csv(TRAINING_FILE)
    df['Date'] = pd.to_datetime(df['Date']).dt.date
    df = df[df['Weight'] > 0].copy()

    df['estimated_1rm'] = df['Weight'] * (1 + df['Reps'] / 30)
    df = df.sort_values('Date')
    df['max_1rm'] = df.groupby('Exercise Name')['estimated_1rm'].cummax()
    df['intensity'] = df['Weight'] / df['max_1rm']
    df['trimp_set'] = df['Weight'] * df['Reps'] * (df['intensity'] ** 2)

    daily = df.groupby('Date')['trimp_set'].sum().reset_index()
    daily.columns = ['date', 'trimp']
    daily['date'] = pd.to_datetime(daily['date'])
    daily = daily.sort_values('date')

    all_dates = pd.date_range(daily['date'].min(), date.today())
    daily = daily.set_index('date').reindex(all_dates, fill_value=0).reset_index()
    daily.columns = ['date', 'trimp']

    fitness, fatigue = 0, 0
    for _, row in daily.iterrows():
        fitness = fitness * np.exp(-1 / TAU_FITNESS) + row['trimp']
        fatigue = fatigue * np.exp(-1 / TAU_FATIGUE) + row['trimp']

    return fitness, fatigue

# ── Step 2: Get today's readiness from check-in ───────────────────
def get_readiness():
    if not os.path.exists(CHECKIN_FILE):
        print("No check-in found. Run checkin.py first.")
        return None, None

    df = pd.read_csv(CHECKIN_FILE)
    df['date'] = pd.to_datetime(df['date']).dt.date
    today = date.today()

    today_checkin = df[df['date'] == today]
    if today_checkin.empty:
        print("No check-in for today. Run checkin.py first.")
        return None, None

    row = today_checkin.iloc[-1]
    return float(row['readiness']), row

# ── Step 3: Detect current phase ──────────────────────────────────
def detect_phase(fitness, fatigue):
    ratio = fatigue / fitness if fitness > 0 else 0
    if ratio > 1.3:
        return 'deload'
    elif ratio > 1.1:
        return 'peak'
    elif ratio > 0.85:
        return 'intensification'
    else:
        return 'accumulation'

# ── Step 4: Compute base load (rolling 7 day average) ─────────────
def compute_base_load():
    df = pd.read_csv(TRAINING_FILE)
    df['Date'] = pd.to_datetime(df['Date']).dt.date
    df = df[df['Weight'] > 0].copy()
    df['estimated_1rm'] = df['Weight'] * (1 + df['Reps'] / 30)
    df = df.sort_values('Date')
    df['max_1rm'] = df.groupby('Exercise Name')['estimated_1rm'].cummax()
    df['intensity'] = df['Weight'] / df['max_1rm']
    df['trimp_set'] = df['Weight'] * df['Reps'] * (df['intensity'] ** 2)

    daily = df.groupby('Date')['trimp_set'].sum().reset_index()
    daily.columns = ['date', 'trimp']
    daily['date'] = pd.to_datetime(daily['date']).dt.date

    cutoff = date.today() - timedelta(days=7)
    recent = daily[daily['date'] >= cutoff]
    return recent['trimp'].mean() if not recent.empty else 500

# ── Step 5: Get best 1RM estimates per exercise ───────────────────
def get_1rms():
    df = pd.read_csv(TRAINING_FILE)
    df = df[df['Weight'] > 0].copy()
    df['Date'] = pd.to_datetime(df['Date']).dt.date
    df['estimated_1rm'] = df['Weight'] * (1 + df['Reps'] / 30)
    
    # Only use last 90 days for 1RM estimates
    cutoff = date.today() - timedelta(days=90)
    df_recent = df[df['Date'] >= cutoff]
    
    best = df_recent.groupby('Exercise Name')['estimated_1rm'].max()
    return best

# ── Step 6: Prescribe weight for an exercise ──────────────────────
def prescribe_weight(exercise, target_load, phase_config, one_rms):
    sets      = phase_config['sets']
    reps      = phase_config['reps']
    intensity = phase_config['intensity']

    if exercise not in one_rms.index:
        return None

    one_rm = one_rms[exercise]
    weight = one_rm * intensity

    # Round to nearest 2.5
    weight = round(weight / 2.5) * 2.5
    return {'exercise': exercise, 'sets': sets, 'reps': reps,
            'weight': weight, 'intensity_pct': round(intensity * 100)}

# ── Main ───────────────────────────────────────────────────────────
def run_prescription():
    print("\nBuilding your training state from history...")
    fitness, fatigue   = compute_banister()
    performance        = fitness - fatigue
    base_load          = compute_base_load()
    readiness, checkin = get_readiness()

    if readiness is None:
        return

    phase        = detect_phase(fitness, fatigue)
    phase_config = PHASES[phase]
    target_load  = base_load * readiness * phase_config['multiplier']
    one_rms      = get_1rms()

    # ── Default exercises (powerlifting focused for now) ──────────
    main_lifts = ['Squat (Barbell)', 'Bench Press (Barbell)', 'Deadlift (Barbell)']

    print(f"\n{'='*45}")
    print(f"  ATLAS — Training Prescription")
    print(f"  {date.today()}")
    print(f"{'='*45}")
    print(f"  Fitness Score:    {fitness:.1f}")
    print(f"  Fatigue Score:    {fatigue:.1f}")
    print(f"  Performance:      {performance:.1f}")
    print(f"  Readiness:        {readiness:.2f} / 1.0")
    print(f"  Phase:            {phase.upper()}")
    print(f"  Target Load:      {target_load:.0f}")
    print(f"\n  TODAY'S PRESCRIPTION:")
    print(f"  {'─'*35}")

    for lift in main_lifts:
        p = prescribe_weight(lift, target_load, phase_config, one_rms)
        if p:
            print(f"  {p['exercise']}")
            print(f"    {p['sets']} sets × {p['reps']} reps @ {p['weight']}lbs ({p['intensity_pct']}% 1RM)")
        else:
            print(f"  {lift} — no data yet")

    print(f"\n  Soreness flags:")
    for muscle in ['quads', 'hamstrings', 'back', 'chest', 'shoulders']:
        col = f'soreness_{muscle}'
        if col in checkin and float(checkin[col]) >= 0.6:
            print(f"    ⚠ {muscle} is sore — reduce load on related lifts")

    print(f"{'='*45}\n")

if __name__ == '__main__':
    run_prescription()

