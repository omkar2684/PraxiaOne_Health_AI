"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box, Grid, Stack, Typography, Card, CardContent,
  Chip, Alert, LinearProgress, Skeleton, Divider,
} from "@mui/material";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SpeedIcon from "@mui/icons-material/Speed";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import MedicationIcon from "@mui/icons-material/Medication";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, PolarRadiusAxis, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
} from "recharts";
import { requireAuth } from "@/lib/requireAuth";
import {
  fetchDailyReadiness, fetchSleepSummary, fetchDailyRisks,
  MOCK_DAILY_READINESS, MOCK_SLEEP_SUMMARY, MOCK_DAILY_RISKS,
  MOCK_PHYSIOLOGY, MOCK_BEHAVIOR,
} from "@/lib/dashboardApi";
import type {
  DailyReadiness, SleepSummary, DailyRiskWarning,
  PhysiologySnapshot, BehaviorSnapshot,
} from "@/types/dashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

function CardSkeleton({ height = 200 }: { height?: number }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Skeleton
      variant="rounded"
      height={height}
      sx={{
        borderRadius: 3,
        background: isDark ? alpha("#1e293b", 0.6) : alpha("#e2e8f0", 0.6),
      }}
    />
  );
}

// ── Readiness Score Card ──────────────────────────────────────
function ReadinessCard({ data }: { data: DailyReadiness }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const stateColors = {
    optimal: "#22c55e",
    good: "#3b82f6",
    moderate: "#f59e0b",
    poor: "#ef4444",
    very_poor: "#dc2626",
  };
  const stateColor = stateColors[data.recovery_state] ?? "#3b82f6";
  const stateLabel = data.recovery_state.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());

  // Autonomic balance arc (-1 to +1, center = 0)
  const balancePct = Math.round(((data.autonomic_balance + 1) / 2) * 100);

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark
          ? `linear-gradient(155deg, ${alpha("#0f172a", 0.92)}, ${alpha("#1e293b", 0.80)})`
          : `linear-gradient(155deg, ${alpha("#ffffff", 0.94)}, ${alpha("#f0f9ff", 0.85)})`,
        border: `1px solid ${alpha(stateColor, isDark ? 0.28 : 0.20)}`,
        backdropFilter: "blur(16px)",
        boxShadow: isDark
          ? `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${alpha(stateColor, 0.08)}`
          : `0 24px 70px rgba(2,6,23,0.10)`,
      }}
    >
      <Box sx={{ height: 5, background: stateColor }} />
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.5, color: stateColor, fontSize: 10 }}>
              Daily Readiness
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="baseline" mt={0.3}>
              <Typography sx={{ fontSize: 64, fontWeight: 950, lineHeight: 1, color: stateColor }}>
                {data.readiness_score}
              </Typography>
              <Typography sx={{ fontWeight: 600, opacity: 0.6, fontSize: 18 }}>/100</Typography>
            </Stack>
          </Box>
          <Chip
            label={stateLabel}
            sx={{
              fontWeight: 900,
              background: alpha(stateColor, isDark ? 0.20 : 0.14),
              color: stateColor,
              border: `1px solid ${alpha(stateColor, 0.35)}`,
              fontSize: 13,
              height: 32,
            }}
          />
        </Stack>

        <Grid container spacing={2}>
          {[
            { label: "HRV", value: `${data.hrv_ms}ms`, color: "#7c3aed" },
            { label: "Resting HR", value: `${data.resting_hr} bpm`, color: "#ef4444" },
            { label: "Stress Load", value: `${data.stress_load}/100`, color: "#f59e0b" },
            { label: "Sleep Quality", value: `${data.sleep_quality}/100`, color: "#3b82f6" },
          ].map((item) => (
            <Grid key={item.label} size={{ xs: 6, sm: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: isDark ? alpha(item.color, 0.08) : alpha(item.color, 0.06),
                  border: `1px solid ${alpha(item.color, 0.2)}`,
                  textAlign: "center",
                }}
              >
                <Typography sx={{ fontWeight: 900, color: item.color, fontSize: 18 }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.65, fontWeight: 600 }}>
                  {item.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Autonomic Balance */}
        <Box sx={{ mt: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" mb={0.8}>
            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.65 }}>
              Autonomic Balance
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: data.autonomic_balance >= 0 ? "#22c55e" : "#ef4444" }}>
              {data.autonomic_balance >= 0 ? "Parasympathetic ↑" : "Sympathetic ↑"}
            </Typography>
          </Stack>
          <Box sx={{ position: "relative", height: 8, borderRadius: 999, background: alpha(theme.palette.text.primary, 0.1), overflow: "hidden" }}>
            <motion.div
              initial={{ width: "50%" }}
              animate={{ width: `${balancePct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                height: "100%",
                borderRadius: 999,
                background: `linear-gradient(90deg, #ef4444, #22c55e)`,
              }}
            />
            {/* Center marker */}
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 2,
                background: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)",
                transform: "translateX(-50%)",
              }}
            />
          </Box>
          <Stack direction="row" justifyContent="space-between" mt={0.5}>
            <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 600 }}>Sympathetic</Typography>
            <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 600 }}>Parasympathetic</Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Sleep Summary Card ────────────────────────────────────────
function SleepCard({ data }: { data: SleepSummary }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const barData = data.stages.map((s) => ({
    name: s.stage.charAt(0).toUpperCase() + s.stage.slice(1),
    minutes: s.minutes,
    fill: s.color,
  }));

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark
          ? `linear-gradient(135deg, ${alpha("#0f172a", 0.88)}, ${alpha("#020617", 0.78)})`
          : `linear-gradient(135deg, ${alpha("#ffffff", 0.90)}, ${alpha("#f8fafc", 0.80)})`,
        border: `1px solid ${alpha("#3b82f6", isDark ? 0.22 : 0.15)}`,
        backdropFilter: "blur(14px)",
        boxShadow: isDark ? "0 20px 70px rgba(0,0,0,0.45)" : "0 20px 60px rgba(2,6,23,0.09)",
      }}
    >
      <Box sx={{ height: 4, background: `linear-gradient(90deg, #1d4ed8, #3b82f6, #7c3aed)` }} />
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <BedtimeIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Sleep Summary</Typography>
        </Stack>

        {/* Total & Debt */}
        <Stack direction="row" spacing={2} mb={2.5}>
          <Box sx={{ flex: 1, p: 2, borderRadius: 2, background: alpha("#3b82f6", isDark ? 0.12 : 0.08), border: `1px solid ${alpha("#3b82f6", 0.2)}`, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 950, fontSize: 28, color: "#3b82f6", lineHeight: 1 }}>
              {data.total_hours.toFixed(1)}h
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.65 }}>Total Sleep</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, borderRadius: 2, background: alpha(data.sleep_debt_hours > 1 ? "#ef4444" : "#22c55e", isDark ? 0.10 : 0.07), border: `1px solid ${alpha(data.sleep_debt_hours > 1 ? "#ef4444" : "#22c55e", 0.2)}`, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 950, fontSize: 28, color: data.sleep_debt_hours > 1 ? "#ef4444" : "#22c55e", lineHeight: 1 }}>
              {data.sleep_debt_hours > 0 ? `-${data.sleep_debt_hours.toFixed(1)}h` : "0"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.65 }}>Sleep Debt</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, borderRadius: 2, background: alpha("#7c3aed", isDark ? 0.10 : 0.07), border: `1px solid ${alpha("#7c3aed", 0.2)}`, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 950, fontSize: 28, color: "#7c3aed", lineHeight: 1 }}>
              {data.quality_score}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.65 }}>Quality Score</Typography>
          </Box>
        </Stack>

        {/* Sleep/Wake Times */}
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="caption" sx={{ opacity: 0.65, fontWeight: 600 }}>
            🌙 Bedtime: <strong>{data.bedtime}</strong>
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.65, fontWeight: 600 }}>
            ☀️ Wake: <strong>{data.wake_time}</strong>
          </Typography>
        </Stack>

        {/* Stages Bar Chart */}
        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1, display: "block", mb: 1 }}>
          Sleep Stages
        </Typography>
        <Box sx={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RTooltip
                contentStyle={{
                  background: isDark ? "#1e293b" : "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(val: number | undefined) => [`${val ?? 0} min`, ""] as [string, string]}
              />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Stage % chips */}
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.8} mt={1}>
          {data.stages.map((s) => (
            <Chip
              key={s.stage}
              label={`${s.stage.charAt(0).toUpperCase() + s.stage.slice(1)}: ${s.percentage}%`}
              size="small"
              sx={{
                fontSize: 10,
                fontWeight: 700,
                height: 20,
                background: alpha(s.color, 0.15),
                color: s.color,
                border: `1px solid ${alpha(s.color, 0.3)}`,
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Physiological State Radar ─────────────────────────────────
function PhysioRadarCard({ data }: { data: PhysiologySnapshot }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const radarData = [
    { metric: "HRV", value: Math.min(100, (data.hrv_ms / 80) * 100) },
    { metric: "SpO₂", value: data.spo2_percent },
    { metric: "Recovery", value: data.recovery_score },
    { metric: "Sleep", value: data.sleep_score },
    { metric: "Stress⁻¹", value: 100 - data.stress_load },
    { metric: "HR ✓", value: Math.max(0, 100 - Math.abs(data.resting_hr - 60)) },
  ];

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark
          ? alpha("#0f172a", 0.85)
          : alpha("#ffffff", 0.90),
        border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.10 : 0.06)}`,
        backdropFilter: "blur(14px)",
        boxShadow: isDark ? "0 20px 70px rgba(0,0,0,0.40)" : "0 20px 60px rgba(2,6,23,0.08)",
      }}
    >
      <Box sx={{ height: 4, background: `linear-gradient(90deg, #7c3aed, #ef4444, #0ea5e9)` }} />
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          <FavoriteIcon sx={{ color: "#ef4444", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Physiological State</Typography>
        </Stack>

        <Box sx={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <PolarGrid stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 11, fontWeight: 700, fill: isDark ? "#94a3b8" : "#475569" }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Today"
                dataKey="value"
                stroke={theme.palette.primary.main}
                fill={alpha(theme.palette.primary.main, 0.25)}
                strokeWidth={2}
                dot={{ fill: theme.palette.primary.main, r: 4 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        <Grid container spacing={1.2} mt={0.5}>
          {[
            { label: "SpO₂", value: `${data.spo2_percent.toFixed(1)}%`, color: "#0ea5e9" },
            { label: "Respiration", value: `${data.respiration_rate.toFixed(1)} br/min`, color: "#14b8a6" },
            { label: "Skin Temp", value: `${data.skin_temp_celsius.toFixed(1)}°C`, color: "#f97316" },
          ].map((item) => (
            <Grid key={item.label} size={{ xs: 4 }}>
              <Box sx={{ p: 1.2, borderRadius: 2, textAlign: "center", background: alpha(item.color, isDark ? 0.10 : 0.07), border: `1px solid ${alpha(item.color, 0.2)}` }}>
                <Typography sx={{ fontWeight: 900, color: item.color, fontSize: 15 }}>{item.value}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.65, fontWeight: 600 }}>{item.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

// ── Daily Risk Warnings ───────────────────────────────────────
const RISK_COLORS = {
  critical: "#dc2626",
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

function DailyRisksCard({ risks }: { risks: DailyRiskWarning[] }) {
  if (risks.length === 0) {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `1px solid ${alpha("#22c55e", 0.25)}`,
          background: alpha("#22c55e", 0.06),
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 22 }} />
        <Typography sx={{ fontWeight: 700 }}>No risk warnings today — you&apos;re on track!</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.2}>
      {risks.map((risk, i) => {
        const color = RISK_COLORS[risk.severity] ?? "#f59e0b";
        return (
          <motion.div
            key={risk.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Alert
              severity={risk.severity === "critical" || risk.severity === "high" ? "error" : "warning"}
              icon={<WarningAmberIcon />}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${alpha(color, 0.35)}`,
                background: alpha(color, 0.07),
                "& .MuiAlert-icon": { color },
              }}
              action={
                risk.action && (
                  <Chip
                    label={risk.action}
                    size="small"
                    sx={{ fontSize: 10, fontWeight: 700, cursor: "pointer", background: alpha(color, 0.15), color }}
                  />
                )
              }
            >
              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{risk.title}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>{risk.description}</Typography>
            </Alert>
          </motion.div>
        );
      })}
    </Stack>
  );
}

// ── Daily Priorities Card ─────────────────────────────────────
function DailyPrioritiesCard({ behavior }: { behavior: BehaviorSnapshot }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const goals = [
    { icon: <DirectionsRunIcon sx={{ fontSize: 18 }} />, label: "Movement Goal", value: behavior.activity_adherence, target: 100, color: "#22c55e", unit: "% achieved" },
    { icon: <BedtimeIcon sx={{ fontSize: 18 }} />, label: "Sleep Goal", value: behavior.sleep_adherence, target: 100, color: "#3b82f6", unit: "% achieved" },
    { icon: <WaterDropIcon sx={{ fontSize: 18 }} />, label: "Hydration Goal", value: behavior.hydration_score, target: 100, color: "#0ea5e9", unit: "% achieved" },
    { icon: <LocalDiningIcon sx={{ fontSize: 18 }} />, label: "Nutrition Target", value: behavior.nutrition_adherence, target: 100, color: "#f59e0b", unit: "% achieved" },
    { icon: <MedicationIcon sx={{ fontSize: 18 }} />, label: "Medications", value: behavior.medication_adherence, target: 100, color: "#7c3aed", unit: "% taken" },
  ];

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark ? alpha("#0f172a", 0.85) : alpha("#ffffff", 0.90),
        border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.10 : 0.06)}`,
        backdropFilter: "blur(14px)",
        boxShadow: isDark ? "0 20px 70px rgba(0,0,0,0.40)" : "0 20px 60px rgba(2,6,23,0.08)",
      }}
    >
      <Box sx={{ height: 4, background: `linear-gradient(90deg, #22c55e, #0ea5e9, #7c3aed)` }} />
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <BoltIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Daily Priorities</Typography>
        </Stack>

        <Stack spacing={1.5}>
          {goals.map((g, i) => (
            <motion.div
              key={g.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ color: g.color }}>{g.icon}</Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{g.label}</Typography>
                  </Stack>
                  <Typography sx={{ fontWeight: 900, color: g.color, fontSize: 13 }}>
                    {g.value}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={g.value}
                  sx={{
                    height: 7,
                    borderRadius: 999,
                    background: alpha(g.color, 0.12),
                    "& .MuiLinearProgress-bar": {
                      background: g.value >= 80
                        ? g.color
                        : `linear-gradient(90deg, ${g.color}, ${alpha(g.color, 0.6)})`,
                      borderRadius: 999,
                    },
                  }}
                />
              </Box>
            </motion.div>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Adherence Status Card ─────────────────────────────────────
function AdherenceStatusCard({ behavior }: { behavior: BehaviorSnapshot }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const items = [
    { label: "Medication Adherence", value: behavior.medication_adherence, icon: <MedicationIcon sx={{ fontSize: 18 }} />, color: "#7c3aed" },
    { label: "Exercise Completion", value: behavior.activity_adherence, icon: <FitnessCenterIcon sx={{ fontSize: 18 }} />, color: "#22c55e" },
    { label: "Care Plan Completion", value: Math.round((behavior.sleep_adherence + behavior.nutrition_adherence) / 2), icon: <TrendingUpIcon sx={{ fontSize: 18 }} />, color: "#0ea5e9" },
    { label: "Supplement Adherence", value: behavior.hydration_score, icon: <WaterDropIcon sx={{ fontSize: 18 }} />, color: "#f59e0b" },
  ];

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark ? alpha("#0f172a", 0.85) : alpha("#ffffff", 0.90),
        border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.10 : 0.06)}`,
        backdropFilter: "blur(14px)",
        boxShadow: isDark ? "0 20px 70px rgba(0,0,0,0.40)" : "0 20px 60px rgba(2,6,23,0.08)",
      }}
    >
      <Box sx={{ height: 4, background: `linear-gradient(90deg, #7c3aed, #22c55e)` }} />
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Adherence Status</Typography>
        </Stack>

        <Stack spacing={1.2}>
          {items.map((item) => {
            const done = item.value >= 80;
            return (
              <Stack key={item.label} direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: alpha(item.color, isDark ? 0.14 : 0.10),
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" justifyContent="space-between" mb={0.4}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{item.label}</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {done && <CheckCircleIcon sx={{ fontSize: 12, color: "#22c55e" }} />}
                      <Typography variant="caption" sx={{ fontWeight: 900, color: done ? "#22c55e" : item.color }}>
                        {item.value}%
                      </Typography>
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={item.value}
                    sx={{
                      height: 5,
                      borderRadius: 999,
                      background: alpha(item.color, 0.12),
                      "& .MuiLinearProgress-bar": {
                        background: item.color,
                        borderRadius: 999,
                      },
                    }}
                  />
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function DailySnapshotPage() {
  requireAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [readiness, setReadiness] = useState<DailyReadiness>(MOCK_DAILY_READINESS);
  const [sleep, setSleep] = useState<SleepSummary>(MOCK_SLEEP_SUMMARY);
  const [risks, setRisks] = useState<DailyRiskWarning[]>(MOCK_DAILY_RISKS);
  const [physiology] = useState<PhysiologySnapshot>(MOCK_PHYSIOLOGY);
  const [behavior] = useState<BehaviorSnapshot>(MOCK_BEHAVIOR);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s, ri] = await Promise.allSettled([
        fetchDailyReadiness(),
        fetchSleepSummary(),
        fetchDailyRisks(),
      ]);
      if (r.status === "fulfilled") setReadiness(r.value);
      if (s.status === "fulfilled") setSleep(s.value);
      if (ri.status === "fulfilled") setRisks(ri.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const pageBg = useMemo(() => {
    const p = theme.palette.primary.main;
    return isDark
      ? `radial-gradient(900px 500px at 20% 0%, ${alpha(p, 0.14)}, transparent 50%),` +
        `radial-gradient(700px 400px at 80% 20%, ${alpha("#7c3aed", 0.12)}, transparent 50%),` +
        theme.palette.background.default
      : `radial-gradient(900px 500px at 20% 0%, ${alpha(p, 0.08)}, transparent 50%),` +
        theme.palette.background.default;
  }, [theme, isDark]);

  return (
    <Box sx={{ minHeight: "100vh", background: pageBg, pb: 4 }}>
      <DashboardHeader
        notificationCount={risks.filter((r) => r.severity === "critical" || r.severity === "high").length}
        onRefresh={loadAll}
      />

      {/* Page Title */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2.5, mb: 2 }}>
        <SpeedIcon sx={{ color: theme.palette.primary.main, fontSize: 26 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 950 }}>Daily Health Snapshot</Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Typography>
        </Box>
      </Stack>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Grid container spacing={3}>
              {[320, 280, 280, 200, 260, 220].map((h, i) => (
                <Grid key={i} size={{ xs: 12, md: i < 2 ? 6 : i < 4 ? 6 : 12 }}>
                  <CardSkeleton height={h} />
                </Grid>
              ))}
            </Grid>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Grid container spacing={3}>
              {/* Section A — Daily Readiness */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ReadinessCard data={readiness} />
              </Grid>

              {/* Section B — Sleep Summary */}
              <Grid size={{ xs: 12, md: 6 }}>
                <SleepCard data={sleep} />
              </Grid>

              {/* Section C — Physiological State */}
              <Grid size={{ xs: 12, md: 6 }}>
                <PhysioRadarCard data={physiology} />
              </Grid>

              {/* Section D — Daily Risk Warnings */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 3, overflow: "hidden", background: isDark ? alpha("#0f172a", 0.85) : alpha("#ffffff", 0.90), border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.10 : 0.06)}`, backdropFilter: "blur(14px)", boxShadow: isDark ? "0 20px 70px rgba(0,0,0,0.40)" : "0 20px 60px rgba(2,6,23,0.08)" }}>
                  <Box sx={{ height: 4, background: `linear-gradient(90deg, #ef4444, #f59e0b)` }} />
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                      <WarningAmberIcon sx={{ color: "#ef4444", fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Daily Risk Warnings</Typography>
                      <Chip label={`${risks.length} Active`} size="small" sx={{ fontWeight: 800, fontSize: 10, background: alpha(risks.length > 0 ? "#ef4444" : "#22c55e", 0.15), color: risks.length > 0 ? "#ef4444" : "#22c55e" }} />
                    </Stack>
                    <DailyRisksCard risks={risks} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Section E — Daily Priorities */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DailyPrioritiesCard behavior={behavior} />
              </Grid>

              {/* Section F — Adherence Status */}
              <Grid size={{ xs: 12, md: 6 }}>
                <AdherenceStatusCard behavior={behavior} />
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
