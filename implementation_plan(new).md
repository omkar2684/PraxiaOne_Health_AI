# Praxia5 — Module 1: Home Dashboard (Screens 1.1, 1.2, 1.3)

## Overview

Build the full **Module 1 Home Dashboard** for the Praxia5 platform as a Next.js frontend, replacing/enhancing the existing `/dashboard` page and creating two new sub-screens: **Daily Health Snapshot** (`/dashboard/daily`) and **AI Health Summary** (`/dashboard/ai-summary`). All code will slot into the existing Next.js + MUI architecture under `frontend/`.

---

## Architecture Decisions

> [!IMPORTANT]
> The existing stack is **Next.js + MUI v7 + framer-motion + recharts + lottie-react**. No new dependencies are needed — all screens use these existing packages. Data is fetched via the existing `apiFetch` utility, with graceful mock-data fallback when the API is unavailable (as the backend is still being wired up for some endpoints).

> [!NOTE]
> The three screens will live at:
> - **Screen 1.1**: `/dashboard` (replacing `frontend/app/dashboard/page.tsx`)
> - **Screen 1.2**: `/dashboard/daily` (new: `frontend/app/dashboard/daily/page.tsx`)
> - **Screen 1.3**: `/dashboard/ai-summary` (new: `frontend/app/dashboard/ai-summary/page.tsx`)
> 
> Shared sub-components go in `frontend/components/dashboard/` (new directory).

---

## Proposed Changes

### Shared Types & Utilities

#### [NEW] `frontend/types/dashboard.ts`
- TypeScript interfaces for all dashboard data: `HealthScore`, `BiomarkerSnapshot`, `PhysiologySnapshot`, `BehaviorSnapshot`, `ClinicalSnapshot`, `AIInsight`, `RecommendedAction`, `DailyReadiness`, `AISummary`, `AIResponse` (the AI contract from the master prompt).

#### [NEW] `frontend/lib/dashboardApi.ts`
- Thin service layer wrapping `apiFetch` for all dashboard endpoints:
  - `/api/v1/dashboard/summary`, `/api/v1/dashboard/health-score`, `/api/v1/dashboard/risks`, `/api/v1/dashboard/insights`, `/api/v1/dashboard/recommendations`
  - `/api/v1/daily/readiness`, `/api/v1/daily/sleep`, `/api/v1/daily/physiology`, `/api/v1/daily/actions`
  - `/api/v1/ai/summary`, `/api/v1/ai/insights`, `/api/v1/ai/predictions`, `/api/v1/ai/recommendations`
- Returns typed mock data when API returns 404/500 (graceful degradation pattern used throughout the existing codebase).

---

### Shared Dashboard Components

#### [NEW] `frontend/components/dashboard/HealthScoreGauge.tsx`
- Circular gauge visualization of 0–100 health score using SVG arc
- Animated fill via framer-motion, color-coded by risk tier (green/amber/red)
- Shows trend arrow, improvement %, confidence level badge

#### [NEW] `frontend/components/dashboard/BiomarkerSnapshotCard.tsx`
- Grid of biomarker chips (A1C, LDL, CRP, Fasting Glucose, etc.)
- Color-coded by in-range / borderline / out-of-range
- Trend arrows (up/down/flat), lab freshness date
- "Lab refresh recommended" warning if data > 180 days old

#### [NEW] `frontend/components/dashboard/PhysiologySnapshotCard.tsx`
- Wearable vitals: HRV, Resting HR, SpO2, Sleep Score, Recovery Score, Stress Load
- Mini sparkline charts using recharts `LineChart` (inline, tiny)
- "Data may be incomplete" banner if last sync > 24h

#### [NEW] `frontend/components/dashboard/BehaviorSnapshotCard.tsx`
- Adherence rings (sleep, activity, nutrition, medication, hydration)
- Radial progress using SVG circles, animated
- Color spectrum per adherence tier

#### [NEW] `frontend/components/dashboard/ClinicalCareCard.tsx`
- Active medications with adherence %
- Upcoming labs / appointments chips
- Target goals progress bars

#### [NEW] `frontend/components/dashboard/AIInsightCard.tsx`
- Glassmorphic card with animated gradient border
- Displays top positive/negative trends + relationship insight
- Confidence score badge + "Why this matters" expandable section
- Source citations list

#### [NEW] `frontend/components/dashboard/RecommendedActionsPanel.tsx`
- Ranked intervention list with impact score bars
- Adherence urgency chips (Critical / High / Medium)
- Expected improvement percentage

#### [NEW] `frontend/components/dashboard/DashboardHeader.tsx`
- Logo + greeting ("Good morning, [name]") + current date/time
- Notification icon with badge + profile avatar shortcut
- Sticky header effect on scroll

---

### Screen 1.1 — Home Overview Dashboard

#### [MODIFY] `frontend/app/dashboard/page.tsx`
- **Complete rewrite** with all 9 SRS sections (A through I)
- Section A: `DashboardHeader` with real-time clock
- Section B: `HealthScoreGauge` + trend direction + risk level
- Section C: `BiomarkerSnapshotCard`
- Section D: `PhysiologySnapshotCard` (wearable vitals)
- Section E: `BehaviorSnapshotCard` (adherence rings)
- Section F: `ClinicalCareCard`
- Section G: `AIInsightCard` (top insights)
- Section H: `RecommendedActionsPanel`
- Section I: Bottom navigation tabs (Home / Biology / Physiology / Behavior / AI / Profile)
- Full skeleton loading states while API fetches
- Dynamic refresh logic per data source type

---

### Screen 1.2 — Daily Health Snapshot

#### [NEW] `frontend/app/dashboard/daily/page.tsx`
- Section A: Readiness Score card (large score + recovery state + autonomic balance ring)
- Section B: Sleep Summary (total sleep, stages breakdown as stacked bar, sleep debt indicator)
- Section C: Physiological State (HRV, Resting HR, Respiration, SpO2, Skin Temp) using recharts RadarChart
- Section D: Daily Risk Warnings (alert-style banners for elevated stress / poor recovery / abnormal HR / elevated glucose variability)
- Section E: Daily Priorities (top 5 goal cards with progress indicators)
- Section F: Adherence Status (medication / supplement / care-plan / exercise completion checkboxes with animation)

---

### Screen 1.3 — AI Health Summary

#### [NEW] `frontend/app/dashboard/ai-summary/page.tsx`
- Section A: AI Executive Summary (streaming-style text render using framer-motion typewriter effect, risk/trajectory badges, confidence score)
- Section B: What Improved (green-themed cards for improved biomarkers / physiology / behaviors)
- Section C: What Worsened (amber/red-themed warning cards)
- Section D: Relationship Intelligence (network visualization using recharts scatter or custom SVG, showing strongest correlations with evidence strength)
- Section E: Predicted Outcomes (timeline chart showing expected biomarker/recovery trajectory)
- Section F: Recommended Focus Areas (priority action cards with impact scores)
- Every insight has: "Why it matters" + data contributors + confidence score + evidence strength (per SRS explainability requirement)
- Full AI Response Contract rendering: `response`, `confidence`, `sources`, `graph_context`, `recommendations`, `risk_flags`, `human_review_required`

---

### Sidebar Update

#### [MODIFY] `frontend/components/Sidebar.tsx`
- Add "Daily Snapshot" `/dashboard/daily` and "AI Summary" `/dashboard/ai-summary` to nav items
- Group under expandable "Home Dashboard" section

---

## Validation Rules (per SRS)

| Rule | Implementation |
|------|---------------|
| Health Score 0–100 | Clamped in `HealthScoreGauge` |
| Lab data > 180 days | `BiomarkerSnapshotCard` warns |
| Wearable sync > 24h | `PhysiologySnapshotCard` warns |
| AI confidence score | Shown on every AI card |
| Human override capability | "Override" button on all AI recommendations |
| HIPAA-aware | No PHI logged to console/analytics |
| WCAG 2.1 | aria-labels, color-blind safe palette, semantic HTML |

---

## Verification Plan

### Automated
- TypeScript compilation: `npm run build` in `frontend/`
- ESLint: `npm run lint`

### Manual
- Visually verify all 9 dashboard sections on `/dashboard`
- Check skeleton loading states (simulate slow network)
- Verify "Lab refresh recommended" and "Data may be incomplete" banners appear
- Test dark/light mode toggle compatibility
- Verify responsive layout on mobile viewport (375px)
- Confirm navigation to `/dashboard/daily` and `/dashboard/ai-summary`
