import csv
import os
from datetime import date

# ── File path ──────────────────────────────────────────────────────
CHECKIN_FILE = 'checkins.csv'

# ── Helper: ask for a score between 0-10 ──────────────────────────
def ask_score(question):
    while True:
        try:
            val = float(input(f"{question} (0-10): "))
            if 0 <= val <= 10:
                return round(val / 10, 2)  # normalize to 0-1
            print("Please enter a number between 0 and 10.")
        except ValueError:
            print("Invalid input, try again.")

# ── Helper: ask for soreness per muscle group ─────────────────────
def ask_soreness():
    print("\nRate soreness per muscle group (0-10, 0 = none):")
    muscles = ['quads', 'hamstrings', 'glutes', 'back', 'chest', 'shoulders', 'biceps', 'triceps']
    soreness = {}
    for muscle in muscles:
        while True:
            try:
                val = float(input(f"  {muscle}: "))
                if 0 <= val <= 10:
                    soreness[muscle] = round(val / 10, 2)
                    break
                print("Please enter a number between 0 and 10.")
            except ValueError:
                print("Invalid input, try again.")
    return soreness

# ── Main check-in function ─────────────────────────────────────────
def run_checkin():
    today = date.today().isoformat()
    print(f"\n{'='*40}")
    print(f"  ATLAS — Daily Check-in  {today}")
    print(f"{'='*40}\n")

    sleep_hours   = float(input("How many hours did you sleep? "))
    sleep_quality = ask_score("Sleep quality")
    mood          = ask_score("Mood / mental state")
    nutrition     = ask_score("Nutrition quality yesterday")
    stress        = ask_score("Stress level (0=none, 10=very stressed)")
    soreness      = ask_soreness()
    notes         = input("\nAny notes? (injuries, sick, big exam, etc): ")

    # ── Compute overall soreness (average across groups) ──────────
    avg_soreness = round(sum(soreness.values()) / len(soreness), 2)

    # ── Compute readiness score R(t) ──────────────────────────────
    # Invert stress and soreness (higher = worse)
    readiness = round(
        0.35 * sleep_quality +
        0.30 * (1 - avg_soreness) +
        0.20 * mood +
        0.15 * (1 - stress),
        3
    )

    # ── Build row ─────────────────────────────────────────────────
    row = {
        'date':           today,
        'sleep_hours':    sleep_hours,
        'sleep_quality':  sleep_quality,
        'mood':           mood,
        'nutrition':      nutrition,
        'stress':         stress,
        'soreness_quads':      soreness['quads'],
        'soreness_hamstrings': soreness['hamstrings'],
        'soreness_glutes':     soreness['glutes'],
        'soreness_back':       soreness['back'],
        'soreness_chest':      soreness['chest'],
        'soreness_shoulders':  soreness['shoulders'],
        'soreness_biceps':     soreness['biceps'],
        'soreness_triceps':    soreness['triceps'],
        'avg_soreness':   avg_soreness,
        'readiness':      readiness,
        'notes':          notes
    }

    # ── Write to CSV ──────────────────────────────────────────────
    file_exists = os.path.exists(CHECKIN_FILE)
    with open(CHECKIN_FILE, 'a', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=row.keys())
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)

    # ── Print summary ─────────────────────────────────────────────
    print(f"\n{'='*40}")
    print(f"  Readiness Score: {readiness:.2f} / 1.0")
    if readiness >= 0.75:
        print("  Status: HIGH — push today")
    elif readiness >= 0.50:
        print("  Status: MODERATE — train smart")
    else:
        print("  Status: LOW — recovery day")
    print(f"{'='*40}\n")
    print("Check-in saved.")

# ── Run ───────────────────────────────────────────────────────────
if __name__ == '__main__':
    run_checkin()
