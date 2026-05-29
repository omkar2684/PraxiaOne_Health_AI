// ============================================================
// Praxia5 — Module 1 Dashboard TypeScript Types
// ============================================================

// ── AI Response Contract (master prompt §9) ─────────────────
export interface AIResponse {
  response: string;
  confidence: number; // 0.0–1.0
  sources: AISource[];
  graph_context: GraphContext[];
  recommendations: AIRecommendation[];
  risk_flags: RiskFlag[];
  human_review_required: boolean;
}

export interface AISource {
  id: string;
  title: string;
  type: "clinical_guideline" | "lab_result" | "wearable" | "medication" | "care_plan";
  reference?: string;
  date?: string;
}

export interface GraphContext {
  entity: string;
  relationship: string;
  target: string;
  evidence_strength: number; // 0.0–1.0
}

export interface AIRecommendation {
  id: string;
  action: string;
  rationale: string;
  impact_score: number; // 0.0–1.0
  urgency: "critical" | "high" | "medium" | "low";
  expected_improvement: string;
  category: "medication" | "lifestyle" | "lab" | "appointment" | "nutrition" | "activity";
}

export interface RiskFlag {
  id: string;
  label: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  data_source: string;
}

// ── Health Score ─────────────────────────────────────────────
export interface HealthScore {
  score: number; // 0–100 (clamped)
  trend: "improving" | "stable" | "declining";
  trend_percentage: number;
  risk_level: "low" | "moderate" | "high" | "critical";
  confidence: number; // 0.0–1.0
  last_calculated: string; // ISO timestamp
  contributors: HealthScoreContributor[];
}

export interface HealthScoreContributor {
  domain: "biomarkers" | "physiology" | "adherence" | "recovery" | "risks";
  weight: number; // 0–100 percent contribution
  score: number; // domain sub-score 0–100
  trend: "up" | "down" | "flat";
}

// ── Biomarker Snapshot ───────────────────────────────────────
export interface BiomarkerSnapshot {
  total_biomarkers: number;
  out_of_range: number;
  borderline: number;
  in_range: number;
  lab_date: string; // ISO date
  lab_freshness_days: number;
  items: BiomarkerItem[];
}

export interface BiomarkerItem {
  id: string;
  name: string;
  value: number;
  unit: string;
  reference_low: number;
  reference_high: number;
  status: "in_range" | "borderline" | "high" | "low" | "critical";
  trend: "up" | "down" | "flat";
  trend_percentage?: number;
  category: "metabolic" | "lipid" | "inflammatory" | "hormonal" | "renal" | "hepatic" | "hematology";
}

// ── Physiology Snapshot (Wearables) ──────────────────────────
export interface PhysiologySnapshot {
  last_sync: string; // ISO timestamp
  sync_age_hours: number;
  hrv_ms: number;
  hrv_trend: "up" | "down" | "flat";
  resting_hr: number;
  resting_hr_trend: "up" | "down" | "flat";
  sleep_score: number; // 0–100
  recovery_score: number; // 0–100
  stress_load: number; // 0–100
  spo2_percent: number;
  respiration_rate: number;
  skin_temp_celsius: number;
  sparklines: Record<string, number[]>; // e.g. { hrv: [45,47,52,...], resting_hr: [...] }
}

// ── Behavior Snapshot ────────────────────────────────────────
export interface BehaviorSnapshot {
  sleep_adherence: number; // 0–100
  activity_adherence: number;
  nutrition_adherence: number;
  medication_adherence: number;
  hydration_score: number;
  overall_adherence: number;
  date: string;
}

// ── Clinical Care Plan Snapshot ──────────────────────────────
export interface ClinicalSnapshot {
  active_medications: ActiveMedication[];
  overall_adherence_percent: number;
  upcoming_labs: UpcomingItem[];
  upcoming_appointments: UpcomingItem[];
  target_goals: GoalItem[];
}

export interface ActiveMedication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  adherence_percent: number;
  next_dose?: string;
}

export interface UpcomingItem {
  id: string;
  name: string;
  date: string;
  type: string;
  status: "scheduled" | "overdue" | "completed";
}

export interface GoalItem {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  progress_percent: number;
  trend: "on_track" | "at_risk" | "achieved";
}

// ── AI Insights ───────────────────────────────────────────────
export interface AIInsight {
  id: string;
  type: "positive" | "negative" | "relationship" | "recommendation";
  headline: string;
  explanation: string;
  why_it_matters: string;
  data_contributors: string[];
  confidence: number;
  evidence_strength: "strong" | "moderate" | "preliminary";
  sources: AISource[];
}

// ── Daily Readiness ──────────────────────────────────────────
export interface DailyReadiness {
  date: string;
  readiness_score: number; // 0–100
  recovery_state: "optimal" | "good" | "moderate" | "poor" | "very_poor";
  stress_load: number;
  autonomic_balance: number; // positive = parasympathetic dominance
  hrv_ms: number;
  resting_hr: number;
  sleep_quality: number;
}

// ── Sleep Summary ────────────────────────────────────────────
export interface SleepSummary {
  date: string;
  total_hours: number;
  sleep_debt_hours: number;
  consistency_score: number; // 0–100
  quality_score: number; // 0–100
  stages: SleepStage[];
  bedtime: string;
  wake_time: string;
}

export interface SleepStage {
  stage: "awake" | "light" | "deep" | "rem";
  minutes: number;
  percentage: number;
  color: string;
}

// ── Daily Risk Warnings ──────────────────────────────────────
export interface DailyRiskWarning {
  id: string;
  type: "elevated_stress" | "poor_recovery" | "abnormal_hr" | "glucose_variability" | "missed_medication" | "low_hrv";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  action?: string;
}

// ── AI Summary (Screen 1.3) ──────────────────────────────────
export interface AISummary {
  generated_at: string;
  overall_interpretation: string;
  current_trajectory: "improving" | "stable" | "declining";
  risk_assessment: string;
  improvement_assessment: string;
  confidence: number;
  what_improved: AISummarySection[];
  what_worsened: AISummarySection[];
  relationship_insights: RelationshipInsight[];
  predicted_outcomes: PredictedOutcome[];
  recommended_focus: AIRecommendation[];
  ai_contract: AIResponse;
}

export interface AISummarySection {
  domain: string;
  label: string;
  details: string;
  magnitude: "significant" | "moderate" | "slight";
  data_source: string;
  confidence: number;
}

export interface RelationshipInsight {
  id: string;
  from_entity: string;
  to_entity: string;
  relationship_type: string;
  evidence: string;
  lag_days?: number;
  strength: number; // 0.0–1.0
  pattern: "consistent" | "adaptive" | "emerging";
}

export interface PredictedOutcome {
  id: string;
  domain: string;
  metric: string;
  current_value: string;
  predicted_value: string;
  timeframe: string;
  direction: "improve" | "worsen" | "stable";
  confidence: number;
  risk_trajectory: "decreasing" | "stable" | "increasing";
}

// ── Dashboard Summary (aggregated for Screen 1.1) ───────────
export interface DashboardSummary {
  health_score: HealthScore;
  biomarkers: BiomarkerSnapshot;
  physiology: PhysiologySnapshot;
  behavior: BehaviorSnapshot;
  clinical: ClinicalSnapshot;
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  risk_flags: RiskFlag[];
  user_name: string;
  last_updated: string;
}

// ── Standard API Response Envelope (master prompt §10) ──────
export interface APIEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  metadata: Record<string, unknown>;
}
