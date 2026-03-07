import { useState, useEffect } from "react";

const API = "https://atlas-production-d795.up.railway.app";

const USER_PROFILE = {
  name: "Sinjin",
  age: null,
  height: "6'2\"",
  weight: "185lbs",
  body_composition: "lean/shredded",
  training_level: "advanced",
  training_years: "3-7",
  current_goal_block: "Strength — Pull & Press",
  goals: [
    "Weighted pull-up +175lbs (bodyweight)",
    "Bench press 315lbs",
    "Windmill dunk",
    "405lb squat",
    "Full planche",
    "Front lever"
  ],
  active_goals: ["Weighted pull-up +175lbs", "Bench press 315lbs"],
  considerations: [
    "Long levers at 6'2\" — extra torque on knees, shoulders, elbows",
    "Joint sensitivity — monitor high-stress positions",
    "Advanced lifter — needs real intensity, not coddling",
    "Feedback loop — prescription should adapt based on session feel"
  ],
  exercise_notes: {
    "Pull-Ups": "Bodyweight + added load. Track total weight (bodyweight + added). Currently working toward +175lbs.",
    "Bench Press": "Working toward 315. Long arms = wider ROM, prioritize scapular retraction.",
    "Squat": "6'2\" with long femurs. High bar or low bar both fine, but watch knee tracking.",
    "Planche": "Skill-based, not load-based. Progressive leverage work — not ready to pursue yet.",
    "Front Lever": "Skill-based. Not current priority block."
  }
};

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500&family=Barlow:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #080810;
    --bg2:      #0f0f1a;
    --bg3:      #16162a;
    --border:   #1e1e3a;
    --accent:   #00e5ff;
    --accent2:  #7b2fff;
    --green:    #00ff87;
    --red:      #ff3d5a;
    --yellow:   #ffd60a;
    --text:     #e8e8f0;
    --muted:    #5a5a7a;
    --font-display: 'Barlow Condensed', sans-serif;
    --font-mono:    'IBM Plex Mono', monospace;
    --font-body:    'Barlow', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; overflow-x: hidden; }

  .app { max-width: 1100px; margin: 0 auto; padding: 0 24px 80px; }

  .header { display: flex; align-items: center; justify-content: space-between; padding: 28px 0 24px; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
  .logo { font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: 6px; text-transform: uppercase; color: var(--accent); text-shadow: 0 0 30px rgba(0,229,255,0.3); }
  .logo span { color: var(--muted); font-weight: 300; }
  .date-badge { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 2px; }

  .nav { display: flex; gap: 4px; margin-bottom: 32px; flex-wrap: wrap; }
  .nav-btn { font-family: var(--font-display); font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 10px 20px; background: transparent; border: 1px solid var(--border); color: var(--muted); cursor: pointer; transition: all 0.15s; }
  .nav-btn:hover { border-color: var(--accent); color: var(--accent); }
  .nav-btn.active { background: var(--accent); border-color: var(--accent); color: var(--bg); }

  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  @media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

  .stat-card { background: var(--bg2); border: 1px solid var(--border); padding: 20px; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .stat-card.blue::before   { background: var(--accent); }
  .stat-card.purple::before { background: var(--accent2); }
  .stat-card.green::before  { background: var(--green); }
  .stat-card.yellow::before { background: var(--yellow); }
  .stat-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .stat-value { font-family: var(--font-display); font-size: 36px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
  .stat-card.blue   .stat-value { color: var(--accent); }
  .stat-card.purple .stat-value { color: var(--accent2); }
  .stat-card.green  .stat-value { color: var(--green); }
  .stat-card.yellow .stat-value { color: var(--yellow); }
  .stat-sub { font-family: var(--font-mono); font-size: 10px; color: var(--muted); }

  .phase-banner { background: var(--bg2); border: 1px solid var(--border); border-left: 3px solid var(--accent); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .phase-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 3px; color: var(--muted); text-transform: uppercase; }
  .phase-name { font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); }
  .phase-desc { font-size: 13px; color: var(--muted); max-width: 400px; line-height: 1.5; }

  .section-title { font-family: var(--font-display); font-size: 11px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
  .section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .checkin-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
  @media (max-width: 600px) { .checkin-grid { grid-template-columns: 1fr; } }

  .field { background: var(--bg2); border: 1px solid var(--border); padding: 16px; }
  .field-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; display: flex; justify-content: space-between; }
  .field-label span { color: var(--accent); font-size: 12px; }
  .slider { width: 100%; -webkit-appearance: none; appearance: none; height: 3px; background: var(--border); outline: none; cursor: pointer; }
  .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: var(--accent); cursor: pointer; border-radius: 0; }

  .soreness-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 24px; }
  @media (max-width: 600px) { .soreness-grid { grid-template-columns: repeat(2, 1fr); } }

  .muscle-card { background: var(--bg2); border: 1px solid var(--border); padding: 12px; cursor: pointer; transition: all 0.15s; text-align: center; }
  .muscle-card:hover { border-color: var(--accent); }
  .muscle-card.sore-low  { border-color: var(--yellow); }
  .muscle-card.sore-high { border-color: var(--red); }
  .muscle-name { font-family: var(--font-display); font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text); margin-bottom: 8px; }
  .muscle-level { font-family: var(--font-mono); font-size: 18px; font-weight: 500; }
  .muscle-card.sore-low  .muscle-level { color: var(--yellow); }
  .muscle-card.sore-high .muscle-level { color: var(--red); }
  .muscle-card:not(.sore-low):not(.sore-high) .muscle-level { color: var(--green); }

  .notes-field { width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 14px; padding: 14px 16px; resize: vertical; min-height: 80px; outline: none; margin-bottom: 20px; }
  .notes-field::placeholder { color: var(--muted); }
  .notes-field:focus { border-color: var(--accent); }

  .readiness-result { background: var(--bg3); border: 1px solid var(--border); padding: 24px; display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
  .readiness-score { font-family: var(--font-display); font-size: 64px; font-weight: 700; line-height: 1; min-width: 120px; }
  .readiness-info .status { font-family: var(--font-display); font-size: 18px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
  .readiness-info .detail { font-size: 13px; color: var(--muted); line-height: 1.6; }

  .checkin-banner { background: var(--bg2); border: 1px solid var(--border); border-left: 3px solid var(--green); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }

  .split-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 28px; }
  @media (max-width: 600px) { .split-grid { grid-template-columns: 1fr; } }

  .split-card { background: var(--bg2); border: 1px solid var(--border); padding: 20px; cursor: pointer; transition: all 0.15s; }
  .split-card:hover { border-color: var(--accent); }
  .split-card.selected { border-color: var(--accent); background: rgba(0,229,255,0.05); }
  .split-card-name { font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text); margin-bottom: 10px; }
  .split-card.selected .split-card-name { color: var(--accent); }
  .split-exercises { font-size: 12px; color: var(--muted); line-height: 1.8; }

  .exercise-picker { background: var(--bg2); border: 1px solid var(--border); padding: 20px; margin-bottom: 24px; }
  .exercise-list { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
  .exercise-toggle { display: flex; align-items: center; gap: 12px; padding: 10px 12px; cursor: pointer; border: 1px solid transparent; transition: all 0.1s; }
  .exercise-toggle:hover { background: var(--bg3); }
  .exercise-toggle.checked { border-color: var(--border); background: var(--bg3); }
  .toggle-box { width: 16px; height: 16px; border: 1px solid var(--muted); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--accent); }
  .exercise-toggle.checked .toggle-box { border-color: var(--accent); background: rgba(0,229,255,0.1); }
  .exercise-toggle-name { font-family: var(--font-body); font-size: 14px; color: var(--text); }
  .exercise-type-badge { margin-left: auto; font-family: var(--font-mono); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); padding: 2px 6px; border: 1px solid var(--border); }

  .prescription-header { background: var(--bg2); border: 1px solid var(--border); border-top: 2px solid var(--accent); padding: 20px 24px; margin-bottom: 16px; }
  .prescription-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
  .prescription-meta { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 1px; }

  .ai-coaching-block {
    background: var(--bg2);
    border: 1px solid var(--accent2);
    border-left: 3px solid var(--accent2);
    padding: 20px 24px;
    margin-bottom: 24px;
  }
  .ai-coaching-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--accent2);
    margin-bottom: 10px;
  }
  .ai-coaching-text {
    font-size: 14px;
    color: var(--text);
    line-height: 1.7;
  }
  .ai-focus-cue {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: 12px;
    letter-spacing: 1px;
  }

  .exercise-row { background: var(--bg2); border: 1px solid var(--border); border-left: 3px solid transparent; padding: 18px 20px; margin-bottom: 8px; transition: border-color 0.15s; }
  .exercise-row:hover { border-left-color: var(--accent); }
  .exercise-row.has-warning { border-left-color: var(--yellow); }
  .exercise-row-top { display: grid; grid-template-columns: 1fr auto; align-items: start; gap: 16px; }
  .ex-name { font-family: var(--font-display); font-size: 17px; font-weight: 600; letter-spacing: 1px; color: var(--text); margin-bottom: 4px; }
  .ex-prescription { font-family: var(--font-mono); font-size: 12px; color: var(--accent); margin-bottom: 6px; }
  .ex-rationale { font-size: 12px; color: var(--muted); line-height: 1.6; font-style: italic; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border); }
  .ex-warning { font-size: 11px; color: var(--yellow); margin-top: 4px; }
  .ex-1rm { text-align: right; }
  .ex-1rm-value { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--text); line-height: 1; }
  .ex-1rm-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; }

  .feedback-row {
    display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);
    align-items: center;
  }
  .feedback-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; margin-right: 4px; }
  .feedback-btn { font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; background: transparent; border: 1px solid var(--border); color: var(--muted); cursor: pointer; transition: all 0.1s; }
  .feedback-btn:hover { border-color: var(--accent); color: var(--accent); }
  .feedback-btn.selected { border-color: var(--accent); background: rgba(0,229,255,0.1); color: var(--accent); }

  .ai-loading {
    background: var(--bg2);
    border: 1px solid var(--accent2);
    padding: 32px;
    text-align: center;
    margin-bottom: 24px;
  }
  .ai-loading-text {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--accent2);
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  .btn { font-family: var(--font-display); font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; padding: 14px 32px; border: none; cursor: pointer; transition: all 0.15s; display: inline-block; }
  .btn-primary { background: var(--accent); color: var(--bg); }
  .btn-primary:hover { background: #33eeff; box-shadow: 0 0 20px rgba(0,229,255,0.3); }
  .btn-secondary { background: transparent; border: 1px solid var(--accent); color: var(--accent); }
  .btn-secondary:hover { background: rgba(0,229,255,0.1); }
  .btn-ai { background: var(--accent2); color: white; }
  .btn-ai:hover { background: #9b4fff; box-shadow: 0 0 20px rgba(123,47,255,0.3); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .bar-chart { background: var(--bg2); border: 1px solid var(--border); padding: 20px; margin-bottom: 28px; }
  .bars { display: flex; align-items: flex-end; gap: 3px; height: 80px; margin-top: 12px; }
  .bar { flex: 1; background: var(--accent); opacity: 0.6; transition: opacity 0.1s; min-height: 2px; }
  .bar:hover { opacity: 1; }

  .loading { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 2px; padding: 8px 0; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); }

  /* ── Mid-workout tracker ── */
  .workout-tracker { display: flex; flex-direction: column; gap: 16px; }

  .tracker-header { background: var(--bg2); border: 1px solid var(--border); border-top: 2px solid var(--green); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
  .tracker-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--green); }
  .tracker-meta { font-family: var(--font-mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; }

  .rest-timer { background: var(--bg3); border: 1px solid var(--accent); padding: 20px; text-align: center; margin-bottom: 8px; }
  .rest-timer-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 3px; color: var(--muted); text-transform: uppercase; margin-bottom: 8px; }
  .rest-timer-count { font-family: var(--font-display); font-size: 56px; font-weight: 700; color: var(--accent); line-height: 1; }
  .rest-timer-bar { height: 3px; background: var(--border); margin-top: 12px; }
  .rest-timer-fill { height: 3px; background: var(--accent); transition: width 1s linear; }

  .tracker-exercise { background: var(--bg2); border: 1px solid var(--border); overflow: hidden; }
  .tracker-exercise.active { border-color: var(--accent); }
  .tracker-exercise.done { border-color: var(--green); opacity: 0.6; }

  .tracker-ex-header { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
  .tracker-ex-name { font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .tracker-exercise.active .tracker-ex-name { color: var(--accent); }
  .tracker-exercise.done .tracker-ex-name { color: var(--green); }
  .tracker-ex-prescribed { font-family: var(--font-mono); font-size: 11px; color: var(--muted); margin-top: 2px; }
  .tracker-ex-status { font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px; }
  .tracker-exercise.active .tracker-ex-status { color: var(--accent); }
  .tracker-exercise.done .tracker-ex-status { color: var(--green); }

  .tracker-sets { padding: 0 20px 16px; }
  .set-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 10px 12px; background: var(--bg3); border: 1px solid var(--border); }
  .set-num { font-family: var(--font-mono); font-size: 10px; color: var(--muted); min-width: 32px; }
  .set-input { background: transparent; border: none; border-bottom: 1px solid var(--border); color: var(--text); font-family: var(--font-mono); font-size: 14px; width: 70px; padding: 2px 4px; outline: none; text-align: center; }
  .set-input:focus { border-bottom-color: var(--accent); }
  .set-divider { color: var(--muted); font-size: 12px; }
  .set-feel-btns { display: flex; gap: 4px; margin-left: auto; }
  .set-feel-btn { font-size: 16px; background: transparent; border: 1px solid var(--border); padding: 4px 8px; cursor: pointer; transition: all 0.1s; }
  .set-feel-btn:hover { border-color: var(--accent); }
  .set-feel-btn.selected-easy   { border-color: var(--green);  background: rgba(0,255,135,0.1); }
  .set-feel-btn.selected-good   { border-color: var(--accent); background: rgba(0,229,255,0.1); }
  .set-feel-btn.selected-hard   { border-color: var(--red);    background: rgba(255,61,90,0.1); }
  .set-done-btn { font-family: var(--font-mono); font-size: 10px; padding: 4px 10px; background: transparent; border: 1px solid var(--muted); color: var(--muted); cursor: pointer; white-space: nowrap; }
  .set-done-btn:hover { border-color: var(--green); color: var(--green); }
  .set-done-btn.completed { border-color: var(--green); color: var(--green); background: rgba(0,255,135,0.05); }

  .ai-adapt-box { margin: 8px 0; padding: 10px 14px; background: rgba(123,47,255,0.08); border: 1px solid var(--accent2); font-size: 13px; color: var(--text); }
  .ai-adapt-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px; color: var(--accent2); text-transform: uppercase; margin-bottom: 4px; }

  .add-set-btn { font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px; padding: 8px 16px; background: transparent; border: 1px dashed var(--border); color: var(--muted); cursor: pointer; width: 100%; text-align: center; margin-top: 4px; }
  .add-set-btn:hover { border-color: var(--accent); color: var(--accent); }

  .session-complete { background: var(--bg2); border: 1px solid var(--green); border-top: 2px solid var(--green); padding: 32px; text-align: center; }
  .session-complete-title { font-family: var(--font-display); font-size: 32px; font-weight: 700; letter-spacing: 4px; color: var(--green); margin-bottom: 8px; }
  .session-complete-sub { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 2px; }
`;


const MUSCLES = ["quads","hamstrings","glutes","back","chest","shoulders","biceps","triceps"];

function calcReadiness(checkin) {
  const { sleep, soreness, mood, nutrition, stress } = checkin;
  const avgSoreness = Object.values(soreness).reduce((a,b) => a+b, 0) / MUSCLES.length;
  return Math.round((0.35*sleep + 0.30*(1-avgSoreness) + 0.20*mood + 0.15*(1-stress)) * 100) / 100;
}

function getReadinessColor(r) {
  if (r >= 0.75) return "var(--green)";
  if (r >= 0.50) return "var(--yellow)";
  return "var(--red)";
}

function getReadinessStatus(r) {
  if (r >= 0.75) return { label: "HIGH — Push today", detail: "Your body is ready for full load. Today is a good day to push intensity." };
  if (r >= 0.50) return { label: "MODERATE — Train smart", detail: "Sub-optimal recovery. Hit prescribed weights but don't push beyond them." };
  return { label: "LOW — Recovery focus", detail: "Significant fatigue detected. Reduce load 20-30% and prioritize movement quality." };
}

function serverToLocalCheckin(data) {
  return {
    sleep:     data.sleep_quality ?? 0.7,
    mood:      data.mood          ?? 0.7,
    nutrition: data.nutrition     ?? 0.7,
    stress:    data.stress        ?? 0.3,
    soreness: {
      quads:       data.soreness_quads       ?? 0,
      hamstrings:  data.soreness_hamstrings  ?? 0,
      glutes:      data.soreness_glutes      ?? 0,
      back:        data.soreness_back        ?? 0,
      chest:       data.soreness_chest       ?? 0,
      shoulders:   data.soreness_shoulders   ?? 0,
      biceps:      data.soreness_biceps      ?? 0,
      triceps:     data.soreness_triceps     ?? 0,
    }
  };
}

// ── AI Prescription Engine ───────────────────────────────────────────────────
async function generateAIPrescription(exercises, checkin, serverState) {
  const readiness = calcReadiness(checkin);
  const response = await fetch(`${API}/prescribe/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exercises,
      readiness,
      soreness: checkin.soreness,
      sleep:     checkin.sleep,
      mood:      checkin.mood,
      nutrition: checkin.nutrition,
      stress:    checkin.stress,
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// placeholder to avoid unused variable warning
async function _unused(exercises, checkin, serverState) {
  const readiness = calcReadiness(checkin);
  const phase = serverState?.phase ?? "accumulation";
  const fitness = serverState?.fitness ?? 0;
  const fatigue = serverState?.fatigue ?? 0;

  const soreness_summary = Object.entries(checkin.soreness)
    .filter(([,v]) => v > 0)
    .map(([m,v]) => `${m}: ${v <= 0.4 ? "mild" : "high"}`)
    .join(", ") || "none";

  const exercise_list = exercises.map(e => {
    const note = USER_PROFILE.exercise_notes[e.name] || "";
    return `- ${e.name} (type: ${e.type}, estimated 1RM: ${e.oneRM ? e.oneRM + "lbs" : "unknown"}${note ? ", note: " + note : ""})`;
  }).join("\n");

  const prompt = `You are an elite strength and conditioning coach for ${USER_PROFILE.name}.

ATHLETE PROFILE:
- Height: ${USER_PROFILE.height}, Weight: ${USER_PROFILE.weight}, Composition: ${USER_PROFILE.body_composition}
- Training level: ${USER_PROFILE.training_level} (${USER_PROFILE.training_years} years)
- Current goal block: ${USER_PROFILE.current_goal_block}
- Active goals: ${USER_PROFILE.active_goals.join(", ")}
- Considerations: ${USER_PROFILE.considerations.join("; ")}

TODAY'S STATUS:
- Readiness score: ${readiness.toFixed(2)}/1.0 (${readiness >= 0.75 ? "HIGH" : readiness >= 0.5 ? "MODERATE" : "LOW"})
- Sleep quality: ${Math.round(checkin.sleep * 10)}/10
- Mood: ${Math.round(checkin.mood * 10)}/10
- Nutrition: ${Math.round(checkin.nutrition * 10)}/10
- Stress: ${Math.round(checkin.stress * 10)}/10
- Muscle soreness: ${soreness_summary}
- Training phase: ${phase.toUpperCase()}
- Fitness score (long-term): ${Math.round(fitness).toLocaleString()}
- Fatigue score (short-term): ${Math.round(fatigue).toLocaleString()}

TODAY'S EXERCISES:
${exercise_list}

Generate a precise, science-based prescription. Be direct and specific — this is an advanced athlete who wants real numbers, not vague suggestions. If readiness is low, reduce volume/intensity but don't skip the session unless truly warranted. Account for exercise-specific mechanics (e.g. pull-ups scale by total bodyweight + added load, not just % 1RM).

Respond ONLY with valid JSON in exactly this format, no other text:
{
  "focus_cue": "One powerful sentence — today's mental focus or coaching cue",
  "coaching_note": "2-3 sentences: context on today's session given readiness + phase + goals. If soreness affects the plan, explain why.",
  "exercises": [
    {
      "name": "exercise name",
      "sets": 4,
      "reps": "6-8",
      "load": "225lbs",
      "intensity_note": "brief load rationale (e.g. '78% 1RM, accumulation phase')",
      "cue": "one technique cue specific to this athlete"
    }
  ],
  "recovery_note": "one sentence on recovery priority if relevant, else null"
}`;

  const response = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const text = data.content.map(i => i.text || "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ checkin, onNav, serverState }) {
  const readiness = checkin ? calcReadiness(checkin) : null;
  const fitness     = serverState?.fitness     ?? null;
  const fatigue     = serverState?.fatigue     ?? null;
  const performance = serverState?.performance ?? null;
  const phase       = serverState?.phase       ?? null;
  const history = serverState ? serverState.history.slice(-28) : [];
  const maxTrimp = history.length ? Math.max(...history.map(h => h.trimp), 1) : 1;

  const phaseDescs = {
    accumulation:    "Build volume and base strength. Focus on consistent load progression across all movements.",
    intensification: "Increasing intensity. Volume drops, weight goes up. Stay focused on technique.",
    peak:            "Fatigue is clearing. Performance window is open — push for PRs this week.",
    deload:          "Recovery phase. Reduce load and let fitness consolidate. You'll come back stronger.",
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-label">Fitness Score</div>
          <div className="stat-value">{fitness ? (fitness/1000).toFixed(1)+'K' : '—'}</div>
          <div className="stat-sub">long-term adaptation</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Fatigue Score</div>
          <div className="stat-value">{fatigue ? (fatigue/1000).toFixed(1)+'K' : '—'}</div>
          <div className="stat-sub">short-term stress</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Performance</div>
          <div className="stat-value">{performance ? (performance/1000).toFixed(1)+'K' : '—'}</div>
          <div className="stat-sub">fitness − fatigue</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Readiness</div>
          <div className="stat-value" style={{color: readiness ? getReadinessColor(readiness) : 'var(--muted)'}}>
            {readiness ? readiness.toFixed(2) : "—"}
          </div>
          <div className="stat-sub">{readiness ? getReadinessStatus(readiness).label.split("—")[0].trim() : "check in first"}</div>
        </div>
      </div>

      <div className="phase-banner">
        <div>
          <div className="phase-label">Current Phase</div>
          <div className="phase-name">{phase ? phase.toUpperCase() : '—'}</div>
        </div>
        <div className="phase-desc">{phase ? phaseDescs[phase] : 'Loading...'}</div>
      </div>

      {checkin && (
        <div className="checkin-banner">
          <div style={{display:"flex", alignItems:"center", gap:"16px"}}>
            <div style={{fontFamily:"var(--font-display)", fontSize:"36px", fontWeight:700, color: getReadinessColor(readiness)}}>
              {readiness.toFixed(2)}
            </div>
            <div>
              <div style={{fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"3px", color:"var(--muted)", textTransform:"uppercase", marginBottom:"4px"}}>Today's Readiness</div>
              <div style={{fontFamily:"var(--font-display)", fontSize:"15px", fontWeight:600, letterSpacing:"1px", textTransform:"uppercase", color: getReadinessColor(readiness)}}>
                {getReadinessStatus(readiness).label}
              </div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => onNav("checkin")}>Edit</button>
        </div>
      )}

      <div className="section-title">28-Day Load History</div>
      <div className="bar-chart">
        <div style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", letterSpacing:"2px", marginBottom:"4px"}}>
          TRAINING IMPULSE (TRIMP) — LAST 28 DAYS
        </div>
        {history.length === 0 && <div className="loading">LOADING DATA...</div>}
        <div className="bars">
          {history.map((h, i) => (
            <div key={i} className="bar"
              style={{height: `${Math.max((h.trimp / maxTrimp) * 100, 2)}%`}}
              title={`${h.date}: ${h.trimp}`} />
          ))}
        </div>
      </div>

      <div style={{display:"flex", gap:"12px", flexWrap:"wrap"}}>
        {!checkin && <button className="btn btn-primary" onClick={() => onNav("checkin")}>Morning Check-in</button>}
        {checkin  && <button className="btn btn-primary" onClick={() => onNav("workout")}>Get Today's Prescription</button>}
      </div>
    </div>
  );
}

// ── CheckIn ──────────────────────────────────────────────────────────────────
function CheckIn({ onComplete, existing }) {
  const [vals, setVals] = useState(existing || {
    sleep: 0.7, mood: 0.7, nutrition: 0.7, stress: 0.3,
    soreness: Object.fromEntries(MUSCLES.map(m => [m, 0]))
  });
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const readiness = calcReadiness(vals);
  const status = getReadinessStatus(readiness);

  const setVal = (k, v) => setVals(prev => ({...prev, [k]: v}));
  const cycleSoreness = (m) => {
    const cur = vals.soreness[m];
    const next = cur === 0 ? 0.4 : cur === 0.4 ? 0.8 : 0;
    setVals(prev => ({...prev, soreness: {...prev.soreness, [m]: next}}));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleep_hours:   vals.sleep * 10,
          sleep_quality: vals.sleep,
          mood:          vals.mood,
          nutrition:     vals.nutrition,
          stress:        vals.stress,
          soreness:      vals.soreness,
          notes
        })
      });
    } catch(e) {}
    setSaving(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <div className="readiness-result">
          <div className="readiness-score" style={{color: getReadinessColor(readiness)}}>
            {readiness.toFixed(2)}
          </div>
          <div className="readiness-info">
            <div className="status" style={{color: getReadinessColor(readiness)}}>{status.label}</div>
            <div className="detail">{status.detail}</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onComplete(vals)}>
          Get Today's Prescription →
        </button>
      </div>
    );
  }

  const SliderField = ({ label, key_, val }) => (
    <div className="field">
      <div className="field-label">{label}<span>{Math.round(val * 10)}/10</span></div>
      <input type="range" className="slider" min="0" max="1" step="0.1"
        value={val} onChange={e => setVal(key_, parseFloat(e.target.value))} />
    </div>
  );

  return (
    <div>
      {existing && (
        <div style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--green)", letterSpacing:"2px", marginBottom:"20px", padding:"10px 14px", border:"1px solid var(--green)", background:"rgba(0,255,135,0.05)"}}>
          ✓ CHECK-IN LOADED FROM TODAY — EDIT AND RESUBMIT TO UPDATE
        </div>
      )}
      <div className="section-title">Daily Vitals</div>
      <div className="checkin-grid">
        <SliderField label="Sleep Quality" key_="sleep"     val={vals.sleep} />
        <SliderField label="Mood / Mental" key_="mood"      val={vals.mood} />
        <SliderField label="Nutrition"     key_="nutrition" val={vals.nutrition} />
        <SliderField label="Stress Level"  key_="stress"    val={vals.stress} />
      </div>

      <div className="section-title">Muscle Soreness — tap to cycle</div>
      <div className="soreness-grid">
        {MUSCLES.map(m => {
          const v = vals.soreness[m];
          const cls = v === 0 ? "" : v <= 0.4 ? "sore-low" : "sore-high";
          const label = v === 0 ? "FRESH" : v <= 0.4 ? "MILD" : "SORE";
          return (
            <div key={m} className={`muscle-card ${cls}`} onClick={() => cycleSoreness(m)}>
              <div className="muscle-name">{m}</div>
              <div className="muscle-level">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="section-title">Notes</div>
      <textarea className="notes-field"
        placeholder="How are you feeling? Anything worth noting..."
        value={notes} onChange={e => setNotes(e.target.value)} />

      <div style={{display:"flex", alignItems:"center", gap:"16px", flexWrap:"wrap"}}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : existing ? "Update Check-in" : "Calculate Readiness"}
        </button>
        <div style={{fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--muted)"}}>
          Live preview: <span style={{color: getReadinessColor(readiness)}}>{readiness.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ── WorkoutSelect ────────────────────────────────────────────────────────────
function WorkoutSelect({ checkin, onSelect, serverExercises }) {
  const [selected, setSelected] = useState(null);
  const [picked, setPicked] = useState({});

  const splits = serverExercises?.splits?.sinjin ?? null;
  const exerciseDb = serverExercises?.exercises ?? {};

  const handleSelect = (name) => {
    setSelected(name);
    setPicked(Object.fromEntries(splits[name].map(e => [e, true])));
  };

  const toggleEx = (name) => setPicked(prev => ({...prev, [name]: !prev[name]}));

  if (!splits) return <div className="loading">LOADING EXERCISE DATA...</div>;

  return (
    <div>
      <div className="section-title">Select Today's Split</div>
      <div className="split-grid">
        {Object.entries(splits).map(([name, exs]) => (
          <div key={name} className={`split-card ${selected === name ? 'selected' : ''}`} onClick={() => handleSelect(name)}>
            <div className="split-card-name">{name}</div>
            <div className="split-exercises">{exs.slice(0,4).join(" · ")}{exs.length > 4 && ` +${exs.length-4} more`}</div>
          </div>
        ))}
      </div>

      {selected && (
        <>
          <div className="section-title">Exercises</div>
          <div className="exercise-picker">
            <div style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", letterSpacing:"2px", marginBottom:"4px"}}>
              TAP TO TOGGLE — {Object.values(picked).filter(Boolean).length} SELECTED
            </div>
            <div className="exercise-list">
              {splits[selected].map(exName => {
                const exInfo = exerciseDb[exName] || {};
                return (
                  <div key={exName} className={`exercise-toggle ${picked[exName] ? 'checked' : ''}`} onClick={() => toggleEx(exName)}>
                    <div className="toggle-box">{picked[exName] ? "✓" : ""}</div>
                    <div className="exercise-toggle-name">{exName}</div>
                    <div className="exercise-type-badge">{exInfo.type || 'compound'}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <button className="btn btn-ai"
            disabled={Object.values(picked).filter(Boolean).length === 0}
            onClick={() => {
              const chosen = splits[selected].filter(e => picked[e]).map(e => ({
                name: e,
                type: exerciseDb[e]?.type || 'compound',
                oneRM: exerciseDb[e]?.estimated_1rm || null
              }));
              onSelect(selected, chosen);
            }}>
            Generate AI Prescription →
          </button>
        </>
      )}
    </div>
  );
}

// ── Prescription ─────────────────────────────────────────────────────────────
function Prescription({ workout, exercises, checkin, serverState, onNewDay, onStartWorkout }) {
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});

  const readiness = calcReadiness(checkin);
  const phase = serverState?.phase ?? "accumulation";

  useEffect(() => {
    generateAIPrescription(exercises, checkin, serverState)
      .then(result => {
        if (!result || !Array.isArray(result.exercises)) {
          setError(result?.error || "AI returned an unexpected response. Check Railway logs.");
        } else {
          setAiResult(result);
        }
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const setExFeedback = (exName, val) => setFeedback(prev => ({...prev, [exName]: val}));

  return (
    <div>
      <div className="prescription-header">
        <div className="prescription-title">{workout}</div>
        <div className="prescription-meta">
          {new Date().toDateString().toUpperCase()} &nbsp;·&nbsp;
          READINESS {readiness.toFixed(2)} &nbsp;·&nbsp;
          PHASE: {phase.toUpperCase()} &nbsp;·&nbsp;
          AI COACH
        </div>
      </div>

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-text">AI COACH GENERATING PRESCRIPTION...</div>
          <div style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginTop:"8px", letterSpacing:"1px"}}>
            analyzing readiness · phase · goals · soreness
          </div>
        </div>
      )}

      {error && (
        <div style={{background:"var(--bg2)", border:"1px solid var(--red)", padding:"16px 20px", marginBottom:"20px", fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--red)"}}>
          AI unavailable: {error}
        </div>
      )}

      {aiResult && (
        <>
          <div className="ai-coaching-block">
            <div className="ai-coaching-label">⬡ Atlas AI Coach</div>
            <div className="ai-focus-cue">{aiResult.focus_cue}</div>
            <div className="ai-coaching-text">{aiResult.coaching_note}</div>
            {aiResult.recovery_note && (
              <div style={{marginTop:"12px", paddingTop:"12px", borderTop:"1px solid var(--border)", fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--yellow)", letterSpacing:"1px"}}>
                ↻ {aiResult.recovery_note}
              </div>
            )}
          </div>

          <div className="section-title">Exercise Prescription</div>

          {aiResult.exercises.map((ex, i) => (
            <div key={ex.name} className="exercise-row">
              <div className="exercise-row-top">
                <div>
                  <div className="ex-name">{ex.name}</div>
                  <div className="ex-prescription">
                    {ex.sets} sets × {ex.reps} reps @ {ex.load || "bodyweight"}
                    {ex.intensity_note && <span style={{color:"var(--muted)", marginLeft:"8px"}}>— {ex.intensity_note}</span>}
                  </div>
                  {ex.cue && <div className="ex-rationale">"{ex.cue}"</div>}
                </div>
                {exercises[i]?.oneRM && (
                  <div className="ex-1rm">
                    <div className="ex-1rm-value">{exercises[i].oneRM}</div>
                    <div className="ex-1rm-label">est. 1rm</div>
                  </div>
                )}
              </div>
              <div className="feedback-row">
                <span className="feedback-label">How'd it feel?</span>
                {["Too easy", "Just right", "Too hard"].map(opt => (
                  <button key={opt}
                    className={`feedback-btn ${feedback[ex.name] === opt ? 'selected' : ''}`}
                    onClick={() => setExFeedback(ex.name, opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{marginTop:"24px", display:"flex", gap:"12px"}}>
        {aiResult && onStartWorkout && (
          <button className="btn btn-primary" onClick={() => onStartWorkout(aiResult.exercises)}>
            Start Workout →
          </button>
        )}
        <button className="btn btn-secondary" onClick={onNewDay}>New Day</button>
      </div>
    </div>
  );
}

// ── Rest Timer ───────────────────────────────────────────────────────────────
function RestTimer({ seconds, onDone }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const pct = (remaining / seconds) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="rest-timer">
      <div className="rest-timer-label">Rest Timer</div>
      <div className="rest-timer-count">{mins}:{secs.toString().padStart(2,'0')}</div>
      <div className="rest-timer-bar">
        <div className="rest-timer-fill" style={{width: `${pct}%`}} />
      </div>
      <button className="btn btn-secondary" style={{marginTop:"12px", padding:"8px 20px", fontSize:"11px"}} onClick={onDone}>
        Skip Rest
      </button>
    </div>
  );
}

// ── WorkoutTracker ────────────────────────────────────────────────────────────
function WorkoutTracker({ workout, prescription, checkin, exercises, onFinish, onNewDay }) {
  const defaultRestSeconds = 180; // 3 min default rest

  // Build initial state from prescription
  const initSets = (ex) => {
    const sets = ex.sets || 4;
    const defaultWeight = ex.load ? parseFloat(ex.load) || "" : "";
    const defaultReps   = ex.reps ? parseInt(ex.reps)   || "" : "";
    return Array.from({length: sets}, (_, i) => ({
      id:        i,
      weight:    defaultWeight,
      reps:      defaultReps,
      feel:      null,   // 'easy' | 'good' | 'hard'
      done:      false,
      aiSuggest: null,
      loading:   false,
    }));
  };

  const [exStates, setExStates] = useState(() =>
    prescription.map(ex => ({ ...ex, sets: initSets(ex), expanded: false, allDone: false }))
  );
  const [activeExIdx, setActiveExIdx] = useState(0);
  const [resting, setResting]         = useState(false);
  const [restSecs, setRestSecs]       = useState(defaultRestSeconds);
  const [sessionDone, setSessionDone] = useState(false);
  const [elapsed, setElapsed]         = useState(0);

  // Session timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2,'0')}`;
  };

  const updateSet = (exIdx, setIdx, field, value) => {
    setExStates(prev => {
      const next = prev.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        const sets = ex.sets.map((s, si) => si === setIdx ? {...s, [field]: value} : s);
        return {...ex, sets};
      });
      return next;
    });
  };

  const completeSet = async (exIdx, setIdx) => {
    const ex      = exStates[exIdx];
    const set     = ex.sets[setIdx];
    const readiness = calcReadiness(checkin);

    // Mark done
    updateSet(exIdx, setIdx, 'done', true);

    // Start rest timer
    const restTime = ex.type === 'compound' ? 180 : 90;
    setRestSecs(restTime);
    setResting(true);

    // If user rated the set, call AI adapt
    if (set.feel && set.weight && set.reps) {
      updateSet(exIdx, setIdx, 'loading', true);
      try {
        const baseEx = exercises.find(e => e.name === ex.name) || {};
        const res = await fetch(`${API}/adapt/set`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            exercise:          ex.name,
            prescribed_weight: parseFloat(ex.load) || 0,
            prescribed_reps:   parseInt(ex.reps)   || 0,
            actual_weight:     parseFloat(set.weight),
            actual_reps:       parseInt(set.reps),
            feeling:           set.feel,
            readiness,
            one_rm:            baseEx.oneRM || 0,
          })
        });
        const data = await res.json();
        if (!data.error) {
          updateSet(exIdx, setIdx, 'aiSuggest', data.next_set);
          // Pre-fill next set with AI suggestion
          if (setIdx + 1 < ex.sets.length) {
            if (data.next_weight) updateSet(exIdx, setIdx + 1, 'weight', data.next_weight);
            if (data.next_reps)   updateSet(exIdx, setIdx + 1, 'reps',   data.next_reps);
          }
        }
      } catch(e) {}
      updateSet(exIdx, setIdx, 'loading', false);
    }

    // Check if all sets done for this exercise
    const allDone = exStates[exIdx].sets.every((s, si) => si === setIdx ? true : s.done);
    if (allDone) {
      setExStates(prev => prev.map((ex, ei) => ei === exIdx ? {...ex, allDone: true} : ex));
      // Move to next exercise
      if (exIdx + 1 < exStates.length) setActiveExIdx(exIdx + 1);
      else setSessionDone(true);
    }
  };

  if (sessionDone) {
    const totalSets = exStates.reduce((acc, ex) => acc + ex.sets.filter(s => s.done).length, 0);
    return (
      <div className="session-complete">
        <div className="session-complete-title">SESSION COMPLETE</div>
        <div className="session-complete-sub" style={{marginBottom:"24px"}}>
          {workout.toUpperCase()} · {totalSets} SETS · {formatElapsed(elapsed)}
        </div>
        <button className="btn btn-primary" onClick={onNewDay}>Done</button>
      </div>
    );
  }

  return (
    <div className="workout-tracker">
      <div className="tracker-header">
        <div>
          <div className="tracker-title">{workout}</div>
          <div className="tracker-meta">
            {exStates.filter(e => e.allDone).length}/{exStates.length} exercises · {formatElapsed(elapsed)}
          </div>
        </div>
        <button className="btn btn-secondary" style={{padding:"8px 16px", fontSize:"11px"}} onClick={onNewDay}>
          End Session
        </button>
      </div>

      {resting && (
        <RestTimer seconds={restSecs} onDone={() => setResting(false)} />
      )}

      {exStates.map((ex, exIdx) => {
        const isActive = exIdx === activeExIdx;
        const isDone   = ex.allDone;
        const cls      = isDone ? "done" : isActive ? "active" : "";

        return (
          <div key={ex.name} className={`tracker-exercise ${cls}`}>
            <div className="tracker-ex-header" onClick={() => setActiveExIdx(exIdx)}>
              <div>
                <div className="tracker-ex-name">{ex.name}</div>
                <div className="tracker-ex-prescribed">
                  {ex.sets.length} sets × {ex.reps} reps @ {ex.load || "BW"}
                  {ex.intensity_note && ` — ${ex.intensity_note}`}
                </div>
              </div>
              <div className="tracker-ex-status">
                {isDone ? "✓ DONE" : isActive ? "ACTIVE" : `${ex.sets.filter(s=>s.done).length}/${ex.sets.length}`}
              </div>
            </div>

            {(isActive || isDone) && (
              <div className="tracker-sets">
                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx}>
                    <div className="set-row">
                      <div className="set-num">SET {setIdx + 1}</div>
                      <input className="set-input" type="number" placeholder="lbs"
                        value={set.weight}
                        onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)} />
                      <span className="set-divider">×</span>
                      <input className="set-input" type="number" placeholder="reps"
                        value={set.reps}
                        onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)} />
                      <div className="set-feel-btns">
                        {[["😤","easy"],["✓","good"],["😮‍💨","hard"]].map(([emoji, feel]) => (
                          <button key={feel}
                            className={`set-feel-btn ${set.feel === feel ? `selected-${feel}` : ''}`}
                            onClick={() => updateSet(exIdx, setIdx, 'feel', feel)}
                            title={feel}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <button
                        className={`set-done-btn ${set.done ? 'completed' : ''}`}
                        disabled={set.done || set.loading}
                        onClick={() => completeSet(exIdx, setIdx)}>
                        {set.loading ? "AI..." : set.done ? "✓" : "Done"}
                      </button>
                    </div>
                    {set.aiSuggest && (
                      <div className="ai-adapt-box">
                        <div className="ai-adapt-label">⬡ AI Adapt</div>
                        {set.aiSuggest}
                      </div>
                    )}
                  </div>
                ))}
                <button className="add-set-btn"
                  onClick={() => setExStates(prev => prev.map((e, ei) =>
                    ei === exIdx ? {...e, sets: [...e.sets, {id: e.sets.length, weight: ex.sets[ex.sets.length-1]?.weight || "", reps: ex.sets[ex.sets.length-1]?.reps || "", feel: null, done: false, aiSuggest: null, loading: false}]} : e
                  ))}>
                  + Add Set
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]                       = useState("dashboard");
  const [checkin, setCheckin]                 = useState(null);
  const [workout, setWorkout]                 = useState(null);
  const [exercises, setExes]                  = useState([]);
  const [prescription, setPrescription]       = useState(null);
  const [serverState, setServerState]         = useState(null);
  const [serverExercises, setServerExercises] = useState(null);
  const [loadingCheckin, setLoadingCheckin]   = useState(true);

  const loadData = () => {
    fetch(`${API}/state`).then(r => r.json()).then(setServerState).catch(() => {});
    fetch(`${API}/exercises`).then(r => r.json()).then(setServerExercises).catch(() => {});
    fetch(`${API}/checkin/today`).then(r => r.json()).then(data => {
      if (data.exists) setCheckin(serverToLocalCheckin(data.data));
      setLoadingCheckin(false);
    }).catch(() => setLoadingCheckin(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleNewDay = () => {
    setCheckin(null);
    setWorkout(null);
    setExes([]);
    setView("dashboard");
    setLoadingCheckin(true);
    loadData();
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday:'long', month:'long', day:'numeric', year:'numeric'
  });

  const handleCheckin = (data) => { setCheckin(data); setView("workout"); };
  const handleWorkout = (name, exs) => { setWorkout(name); setExes(exs); setView("prescription"); };
  const handleStartWorkout = (pres) => { setPrescription(pres); setView("train"); };

  const VIEWS  = ["dashboard","checkin","workout","prescription","train"];
  const LABELS = ["Dashboard","Check-in","Workout","Prescription","Train"];

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <div className="header">
          <div className="logo">ATL<span>A</span>S</div>
          <div className="date-badge">{today.toUpperCase()}</div>
        </div>

        <div className="nav">
          {VIEWS.map((v, i) => (
            <button key={v} className={`nav-btn ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
              {LABELS[i]}
            </button>
          ))}
        </div>

        {loadingCheckin && <div className="loading">LOADING TODAY'S DATA...</div>}

        {!loadingCheckin && view === "dashboard" && <Dashboard checkin={checkin} onNav={setView} serverState={serverState} />}
        {!loadingCheckin && view === "checkin" && <CheckIn onComplete={handleCheckin} existing={checkin} />}
        {!loadingCheckin && view === "workout" && checkin && <WorkoutSelect checkin={checkin} onSelect={handleWorkout} serverExercises={serverExercises} />}
        {!loadingCheckin && view === "workout" && !checkin && (
          <div style={{fontFamily:"var(--font-mono)", color:"var(--muted)", padding:"40px 0"}}>
            Complete your morning check-in first.
            <br/><br/>
            <button className="btn btn-primary" onClick={() => setView("checkin")}>Go to Check-in</button>
          </div>
        )}
        {!loadingCheckin && view === "prescription" && checkin && workout && (
          <Prescription workout={workout} exercises={exercises} checkin={checkin} serverState={serverState} onNewDay={handleNewDay} onStartWorkout={handleStartWorkout} />
        )}
        {!loadingCheckin && view === "train" && checkin && workout && prescription && (
          <WorkoutTracker workout={workout} prescription={prescription} checkin={checkin} exercises={exercises} onFinish={() => setView("dashboard")} onNewDay={handleNewDay} />
        )}
      </div>
    </>
  );
}