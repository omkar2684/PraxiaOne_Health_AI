// ============================================================
// Praxia5 — Module 1 Dashboard API Service Layer
// Wraps apiFetch with typed responses + graceful mock fallback
// ============================================================

import { apiFetch } from "@/lib/api";
import type {
  DashboardSummary,
  HealthScore,
  BiomarkerSnapshot,
  PhysiologySnapshot,
  BehaviorSnapshot,
  ClinicalSnapshot,
  AIInsight,
  AIRecommendation,
  RiskFlag,
  DailyReadiness,
  SleepSummary,
  DailyRiskWarning,
  AISummary,
  APIEnvelope,
} from "@/types/dashboard";

// ── Helpers ──────────────────────────────────────────────────
async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const env = await apiFetch<APIEnvelope<T>>(path, { method: "GET" });
    return env?.data ?? fallback;
  } catch {
    try {
      const raw = await apiFetch<T>(path, { method: "GET" });
      return raw ?? fallback;
    } catch {
      return fallback;
    }
  }
}

// ── Mock Data ─────────────────────────────────────────────────

export const MOCK_HEALTH_SCORE: HealthScore = {
  score: 72,
  trend: "improving",
  trend_percentage: 4.2,
  risk_level: "moderate",
  confidence: 0.87,
  last_calculated: new Date().toISOString(),
  contributors: [
    { domain: "biomarkers", weight: 30, score: 68, trend: "up" },
    { domain: "physiology", weight: 25, score: 78, trend: "up" },
    { domain: "adherence", weight: 20, score: 82, trend: "flat" },
    { domain: "recovery", weight: 15, score: 65, trend: "up" },
    { domain: "risks", weight: 10, score: 55, trend: "down" },
  ],
};

export const MOCK_BIOMARKERS: BiomarkerSnapshot = {
  total_biomarkers: 12,
  out_of_range: 3,
  borderline: 2,
  in_range: 7,
  lab_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  lab_freshness_days: 45,
  items: [
    { id: "a1c", name: "HbA1c", value: 6.8, unit: "%", reference_low: 4.0, reference_high: 5.7, status: "high", trend: "down", trend_percentage: -2.1, category: "metabolic" },
    { id: "ldl", name: "LDL Cholesterol", value: 142, unit: "mg/dL", reference_low: 0, reference_high: 100, status: "high", trend: "down", trend_percentage: -5.3, category: "lipid" },
    { id: "crp", name: "hs-CRP", value: 2.1, unit: "mg/L", reference_low: 0, reference_high: 1.0, status: "borderline", trend: "up", trend_percentage: 8.0, category: "inflammatory" },
    { id: "glucose", name: "Fasting Glucose", value: 98, unit: "mg/dL", reference_low: 70, reference_high: 99, status: "in_range", trend: "flat", category: "metabolic" },
    { id: "hdl", name: "HDL Cholesterol", value: 52, unit: "mg/dL", reference_low: 40, reference_high: 999, status: "in_range", trend: "up", trend_percentage: 3.5, category: "lipid" },
    { id: "trig", name: "Triglycerides", value: 178, unit: "mg/dL", reference_low: 0, reference_high: 150, status: "high", trend: "down", trend_percentage: -10.2, category: "lipid" },
    { id: "tsh", name: "TSH", value: 2.4, unit: "mIU/L", reference_low: 0.4, reference_high: 4.0, status: "in_range", trend: "flat", category: "hormonal" },
    { id: "vitd", name: "Vitamin D", value: 28, unit: "ng/mL", reference_low: 30, reference_high: 100, status: "low", trend: "up", trend_percentage: 7.0, category: "hormonal" },
  ],
};

export const MOCK_PHYSIOLOGY: PhysiologySnapshot = {
  last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  sync_age_hours: 2,
  hrv_ms: 48,
  hrv_trend: "up",
  resting_hr: 62,
  resting_hr_trend: "down",
  sleep_score: 74,
  recovery_score: 68,
  stress_load: 42,
  spo2_percent: 97.4,
  respiration_rate: 14.2,
  skin_temp_celsius: 36.7,
  sparklines: {
    hrv: [40, 42, 44, 43, 46, 45, 48],
    resting_hr: [67, 65, 64, 63, 62, 63, 62],
    sleep_score: [68, 71, 69, 73, 72, 75, 74],
    recovery_score: [60, 62, 65, 64, 67, 66, 68],
    stress_load: [55, 52, 48, 50, 44, 43, 42],
  },
};

export const MOCK_BEHAVIOR: BehaviorSnapshot = {
  sleep_adherence: 78,
  activity_adherence: 65,
  nutrition_adherence: 72,
  medication_adherence: 91,
  hydration_score: 60,
  overall_adherence: 73,
  date: new Date().toISOString().split("T")[0],
};

export const MOCK_CLINICAL: ClinicalSnapshot = {
  active_medications: [
    { id: "m1", name: "Metformin", dose: "500mg", frequency: "Twice daily", adherence_percent: 94, next_dose: "8:00 PM" },
    { id: "m2", name: "Atorvastatin", dose: "20mg", frequency: "Once nightly", adherence_percent: 88 },
    { id: "m3", name: "Vitamin D3", dose: "2000 IU", frequency: "Once daily", adherence_percent: 76 },
  ],
  overall_adherence_percent: 86,
  upcoming_labs: [
    { id: "l1", name: "Comprehensive Metabolic Panel", date: "2026-06-15", type: "Blood Panel", status: "scheduled" },
    { id: "l2", name: "Lipid Panel", date: "2026-06-15", type: "Blood Panel", status: "scheduled" },
  ],
  upcoming_appointments: [
    { id: "a1", name: "Dr. Patel — Endocrinology", date: "2026-06-03", type: "Specialist Visit", status: "scheduled" },
    { id: "a2", name: "Annual Wellness Exam", date: "2026-07-10", type: "Primary Care", status: "scheduled" },
  ],
  target_goals: [
    { id: "g1", label: "HbA1c Target", current: 6.8, target: 5.7, unit: "%", progress_percent: 45, trend: "on_track" },
    { id: "g2", label: "LDL Target", current: 142, target: 100, unit: "mg/dL", progress_percent: 55, trend: "on_track" },
    { id: "g3", label: "Daily Steps", current: 7200, target: 10000, unit: "steps", progress_percent: 72, trend: "at_risk" },
  ],
};

export const MOCK_INSIGHTS: AIInsight[] = [
  {
    id: "i1",
    type: "positive",
    headline: "Sleep consistency is improving your HRV by 12%",
    explanation: "Over the past 14 days, your sleep schedule variance dropped by 38 minutes, corresponding with a measurable HRV increase.",
    why_it_matters: "Higher HRV is a strong predictor of cardiovascular resilience and metabolic health.",
    data_contributors: ["Wearable sleep data", "HRV trend", "Circadian rhythm pattern"],
    confidence: 0.89,
    evidence_strength: "strong",
    sources: [{ id: "s1", title: "Sleep-HRV correlation analysis", type: "wearable" }],
  },
  {
    id: "i2",
    type: "negative",
    headline: "Elevated hs-CRP suggests persistent inflammation",
    explanation: "Your CRP has risen 8% over 30 days. Diet and stress load are likely contributors.",
    why_it_matters: "Chronic inflammation is a primary driver of cardiovascular risk and insulin resistance.",
    data_contributors: ["Lab results (hs-CRP)", "Nutrition adherence", "Stress load wearable"],
    confidence: 0.82,
    evidence_strength: "moderate",
    sources: [{ id: "s2", title: "Inflammatory biomarker panel", type: "lab_result" }],
  },
  {
    id: "i3",
    type: "relationship",
    headline: "Medication adherence is directly lowering your LDL trajectory",
    explanation: "On days with Atorvastatin adherence >90%, LDL variability decreases by 15%.",
    why_it_matters: "Consistent statin adherence is critical for achieving your lipid target.",
    data_contributors: ["Medication log", "Lipid trend", "Adherence history"],
    confidence: 0.91,
    evidence_strength: "strong",
    sources: [{ id: "s3", title: "Medication effectiveness analysis", type: "medication" }],
  },
];

export const MOCK_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "r1",
    action: "Add 20-min evening walk to reduce LDL by estimated 8%",
    rationale: "Physical activity post-dinner reduces hepatic cholesterol synthesis.",
    impact_score: 0.82,
    urgency: "high",
    expected_improvement: "LDL ↓ 8–12% over 8 weeks",
    category: "activity",
  },
  {
    id: "r2",
    action: "Increase Vitamin D3 supplementation to 4000 IU daily",
    rationale: "Current serum Vitamin D is below optimal range (28 ng/mL vs 40–60 target).",
    impact_score: 0.74,
    urgency: "medium",
    expected_improvement: "Vitamin D → 40–50 ng/mL in 6 weeks",
    category: "medication",
  },
  {
    id: "r3",
    action: "Eliminate refined carbohydrates before 6 PM",
    rationale: "Evening glucose spikes detected on wearable CGM correlate with poor next-day HRV.",
    impact_score: 0.68,
    urgency: "medium",
    expected_improvement: "Fasting glucose ↓ 5–10 mg/dL",
    category: "nutrition",
  },
];

export const MOCK_RISK_FLAGS: RiskFlag[] = [
  { id: "rf1", label: "LDL Above Target", severity: "high", description: "LDL at 142 mg/dL exceeds clinical target of 100 mg/dL.", data_source: "Lab Results" },
  { id: "rf2", label: "Vitamin D Deficiency", severity: "medium", description: "Serum Vitamin D at 28 ng/mL is below optimal range.", data_source: "Lab Results" },
];

// ── Daily Readiness Mock ──────────────────────────────────────
export const MOCK_DAILY_READINESS: DailyReadiness = {
  date: new Date().toISOString().split("T")[0],
  readiness_score: 71,
  recovery_state: "good",
  stress_load: 42,
  autonomic_balance: 0.35,
  hrv_ms: 48,
  resting_hr: 62,
  sleep_quality: 74,
};

export const MOCK_SLEEP_SUMMARY: SleepSummary = {
  date: new Date().toISOString().split("T")[0],
  total_hours: 7.1,
  sleep_debt_hours: 0.9,
  consistency_score: 78,
  quality_score: 74,
  stages: [
    { stage: "awake", minutes: 22, percentage: 5, color: "#ef4444" },
    { stage: "light", minutes: 148, percentage: 35, color: "#60a5fa" },
    { stage: "deep", minutes: 101, percentage: 24, color: "#1d4ed8" },
    { stage: "rem", minutes: 155, percentage: 37, color: "#7c3aed" },
  ],
  bedtime: "11:12 PM",
  wake_time: "6:17 AM",
};

export const MOCK_DAILY_RISKS: DailyRiskWarning[] = [
  { id: "dr1", type: "elevated_stress", severity: "medium", title: "Elevated Stress Load", description: "Stress index at 42/100 — consider breathing exercises.", action: "Try 5-min box breathing" },
];

// ── AI Summary Mock ──────────────────────────────────────────
export const MOCK_AI_SUMMARY: AISummary = {
  generated_at: new Date().toISOString(),
  overall_interpretation: "Your health trajectory is showing meaningful improvement. Lipid markers are declining in response to medication adherence, while sleep-driven HRV gains indicate improved autonomic function. Key risks remain elevated LDL and mild Vitamin D insufficiency.",
  current_trajectory: "improving",
  risk_assessment: "Moderate cardiovascular risk with active mitigation in progress. No critical escalation required at this time.",
  improvement_assessment: "15% composite improvement over the last 30 days driven by medication adherence and sleep optimization.",
  confidence: 0.87,
  what_improved: [
    { domain: "physiology", label: "Heart Rate Variability", details: "HRV improved from 40ms to 48ms (+20%) over 30 days", magnitude: "significant", data_source: "Wearable", confidence: 0.91 },
    { domain: "biomarkers", label: "LDL Cholesterol", details: "LDL declined from 150 to 142 mg/dL (-5.3%)", magnitude: "moderate", data_source: "Lab Results", confidence: 0.88 },
    { domain: "adherence", label: "Medication Adherence", details: "Overall adherence improved to 86% (from 79%)", magnitude: "moderate", data_source: "Medication Log", confidence: 0.95 },
  ],
  what_worsened: [
    { domain: "biomarkers", label: "hs-CRP Inflammation", details: "CRP rose from 1.9 to 2.1 mg/L (+8%)", magnitude: "slight", data_source: "Lab Results", confidence: 0.82 },
    { domain: "adherence", label: "Activity Adherence", details: "Step goal achievement dropped to 65% this week", magnitude: "moderate", data_source: "Wearable + Activity Log", confidence: 0.89 },
  ],
  relationship_insights: [
    { id: "ri1", from_entity: "Sleep Consistency", to_entity: "HRV", relationship_type: "POSITIVELY_DRIVES", evidence: "14-day lag correlation r=0.74", lag_days: 3, strength: 0.74, pattern: "consistent" },
    { id: "ri2", from_entity: "Atorvastatin Adherence", to_entity: "LDL Cholesterol", relationship_type: "REDUCES", evidence: "Direct drug-mechanism correlation r=0.81", strength: 0.81, pattern: "consistent" },
    { id: "ri3", from_entity: "hs-CRP", to_entity: "HRV", relationship_type: "INVERSELY_LINKED", evidence: "Inflammation suppresses autonomic recovery (r=-0.62)", strength: 0.62, pattern: "adaptive" },
  ],
  predicted_outcomes: [
    { id: "po1", domain: "Biomarkers", metric: "LDL Cholesterol", current_value: "142 mg/dL", predicted_value: "118–128 mg/dL", timeframe: "8 weeks", direction: "improve", confidence: 0.79, risk_trajectory: "decreasing" },
    { id: "po2", domain: "Physiology", metric: "HRV", current_value: "48ms", predicted_value: "52–55ms", timeframe: "4 weeks", direction: "improve", confidence: 0.83, risk_trajectory: "decreasing" },
    { id: "po3", domain: "Biomarkers", metric: "Vitamin D", current_value: "28 ng/mL", predicted_value: "40–48 ng/mL", timeframe: "6 weeks (with supplementation)", direction: "improve", confidence: 0.86, risk_trajectory: "decreasing" },
  ],
  recommended_focus: MOCK_RECOMMENDATIONS,
  ai_contract: {
    response: "Based on 30 days of integrated health data, your trajectory is improving. Focus on LDL reduction and inflammation management.",
    confidence: 0.87,
    sources: [
      { id: "s1", title: "Lipid Panel — 2026-04-15", type: "lab_result" },
      { id: "s2", title: "Wearable HRV Data — 30 days", type: "wearable" },
    ],
    graph_context: [
      { entity: "Patient", relationship: "TAKES", target: "Atorvastatin", evidence_strength: 0.95 },
      { entity: "Patient", relationship: "HAS_DIAGNOSIS", target: "Hyperlipidemia", evidence_strength: 0.91 },
    ],
    recommendations: MOCK_RECOMMENDATIONS,
    risk_flags: MOCK_RISK_FLAGS,
    human_review_required: false,
  },
};

// ── API Functions ─────────────────────────────────────────────

export async function fetchHealthScore(): Promise<HealthScore> {
  return safeFetch("/api/v1/dashboard/health-score/", MOCK_HEALTH_SCORE);
}

export async function fetchBiomarkers(): Promise<BiomarkerSnapshot> {
  return safeFetch("/api/v1/dashboard/biomarkers/", MOCK_BIOMARKERS);
}

export async function fetchPhysiology(): Promise<PhysiologySnapshot> {
  return safeFetch("/api/v1/dashboard/physiology/", MOCK_PHYSIOLOGY);
}

export async function fetchBehavior(): Promise<BehaviorSnapshot> {
  return safeFetch("/api/v1/dashboard/behavior/", MOCK_BEHAVIOR);
}

export async function fetchClinical(): Promise<ClinicalSnapshot> {
  return safeFetch("/api/v1/dashboard/clinical/", MOCK_CLINICAL);
}

export async function fetchInsights(): Promise<AIInsight[]> {
  return safeFetch("/api/v1/dashboard/insights/", MOCK_INSIGHTS);
}

export async function fetchRecommendations(): Promise<AIRecommendation[]> {
  return safeFetch("/api/v1/dashboard/recommendations/", MOCK_RECOMMENDATIONS);
}

export async function fetchRiskFlags(): Promise<RiskFlag[]> {
  return safeFetch("/api/v1/dashboard/risks/", MOCK_RISK_FLAGS);
}

export async function fetchDailyReadiness(): Promise<DailyReadiness> {
  return safeFetch("/api/v1/daily/readiness/", MOCK_DAILY_READINESS);
}

export async function fetchSleepSummary(): Promise<SleepSummary> {
  return safeFetch("/api/v1/daily/sleep/", MOCK_SLEEP_SUMMARY);
}

export async function fetchDailyRisks(): Promise<DailyRiskWarning[]> {
  return safeFetch("/api/v1/daily/risks/", MOCK_DAILY_RISKS);
}

export async function fetchAISummary(): Promise<AISummary> {
  return safeFetch("/api/v1/ai/summary/", MOCK_AI_SUMMARY);
}
