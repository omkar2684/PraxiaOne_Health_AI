"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box, Grid, Stack, Typography, Card, CardContent,
  Chip, Divider, LinearProgress, Skeleton, Tooltip,
  Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import LinkIcon from "@mui/icons-material/Link";
import HubIcon from "@mui/icons-material/Hub";
import TimelineIcon from "@mui/icons-material/Timeline";
import BoltIcon from "@mui/icons-material/Bolt";
import VerifiedIcon from "@mui/icons-material/Verified";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip as RTooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid,
  ReferenceLine,
} from "recharts";
import { requireAuth } from "@/lib/requireAuth";
import { fetchAISummary, MOCK_AI_SUMMARY } from "@/lib/dashboardApi";
import type {
  AISummary, AISummarySection, RelationshipInsight,
  PredictedOutcome, AIRecommendation,
} from "@/types/dashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RecommendedActionsPanel from "@/components/dashboard/RecommendedActionsPanel";

function CardSkeleton({ height = 200 }: { height?: number }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Skeleton
      variant="rounded"
      height={height}
      sx={{ borderRadius: 3, background: isDark ? alpha("#1e293b", 0.6) : alpha("#e2e8f0", 0.6) }}
    />
  );
}

// ── Typewriter Text ───────────────────────────────────────────
function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return <>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0 }}>|</span></>;
}

// ── Section A: Executive Summary ──────────────────────────────
function ExecutiveSummaryCard({ data }: { data: AISummary }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const traj = data.current_trajectory;
  const trajColor = traj === "improving" ? "#22c55e" : traj === "declining" ? "#ef4444" : "#f59e0b";
  const TrajIcon = traj === "improving" ? TrendingUpIcon : traj === "declining" ? TrendingDownIcon : RemoveIcon;
  const confidencePct = Math.round(data.confidence * 100);

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark
          ? `linear-gradient(155deg, ${alpha("#0f172a", 0.94)}, ${alpha("#1e293b", 0.88)})`
          : `linear-gradient(155deg, ${alpha("#fafffe", 0.96)}, ${alpha("#f0f9ff", 0.88)})`,
        border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.25 : 0.18)}`,
        backdropFilter: "blur(18px)",
        boxShadow: isDark
          ? `0 28px 90px rgba(0,0,0,0.55), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.10)}`
          : `0 28px 80px rgba(2,6,23,0.10)`,
      }}
    >
      {/* Animated gradient bar */}
      <Box
        sx={{
          height: 5,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, #7c3aed, #22c55e, #ef4444)`,
          backgroundSize: "300% 100%",
          animation: "gradShift 5s ease infinite",
          "@keyframes gradShift": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
          },
        }}
      />

      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha("#7c3aed", 0.2)})`,
              display: "flex",
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 950, fontSize: 18 }}>AI Health Summary</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Med42 · DeepSeek · GraphRAG · Generated {new Date(data.generated_at).toLocaleTimeString()}
            </Typography>
          </Box>
          {data.ai_contract.human_review_required && (
            <Chip
              icon={<PersonIcon sx={{ fontSize: 14 }} />}
              label="Clinician Review Required"
              color="warning"
              size="small"
              sx={{ fontWeight: 800, fontSize: 11, ml: "auto" }}
            />
          )}
        </Stack>

        {/* Main Interpretation (typewriter) */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            background: isDark ? alpha("#ffffff", 0.04) : alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            mb: 2,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: 15, lineHeight: 1.7, color: isDark ? alpha("#f1f5f9", 0.92) : "#0f172a" }}>
            <TypewriterText text={data.overall_interpretation} />
          </Typography>
        </Box>

        {/* Trajectory / Risk / Confidence */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(trajColor, 0.25)}`, background: alpha(trajColor, isDark ? 0.10 : 0.07), textAlign: "center" }}>
              <TrajIcon sx={{ fontSize: 26, color: trajColor, mb: 0.5 }} />
              <Typography sx={{ fontWeight: 900, color: trajColor, fontSize: 14 }}>
                {traj.charAt(0).toUpperCase() + traj.slice(1)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>Current Trajectory</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha("#f59e0b", 0.25)}`, background: alpha("#f59e0b", isDark ? 0.10 : 0.07), textAlign: "center" }}>
              <WarningAmberIcon sx={{ fontSize: 26, color: "#f59e0b", mb: 0.5 }} />
              <Typography sx={{ fontWeight: 700, color: "#f59e0b", fontSize: 12, lineHeight: 1.3 }}>
                {data.risk_assessment.length > 60 ? data.risk_assessment.slice(0, 58) + "…" : data.risk_assessment}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>Risk Assessment</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`, background: alpha(theme.palette.primary.main, isDark ? 0.10 : 0.07), textAlign: "center" }}>
              <Typography sx={{ fontWeight: 950, fontSize: 32, color: theme.palette.primary.main, lineHeight: 1 }}>
                {confidencePct}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>AI Confidence</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Risk Flags */}
        {data.ai_contract.risk_flags.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.8} mt={2}>
            {data.ai_contract.risk_flags.map((flag) => {
              const fc = flag.severity === "critical" ? "#dc2626" : flag.severity === "high" ? "#ef4444" : "#f59e0b";
              return (
                <Tooltip key={flag.id} title={flag.description} arrow>
                  <Chip
                    label={flag.label}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: 11, background: alpha(fc, 0.15), color: fc, border: `1px solid ${alpha(fc, 0.35)}`, cursor: "default" }}
                  />
                </Tooltip>
              );
            })}
          </Stack>
        )}

        {/* Sources */}
        {data.ai_contract.sources.length > 0 && (
          <>
            <Divider sx={{ my: 2, opacity: 0.12 }} />
            <Stack direction="row" spacing={0.8} flexWrap="wrap" gap={0.6} alignItems="center">
              <LinkIcon sx={{ fontSize: 14, opacity: 0.5 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.55 }}>Sources:</Typography>
              {data.ai_contract.sources.map((s) => (
                <Chip key={s.id} label={s.title} size="small" sx={{ fontSize: 10, height: 20, fontWeight: 600, background: alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05) }} />
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Section B & C: What Improved / What Worsened ─────────────
function ChangeCard({ items, type }: { items: AISummarySection[]; type: "improved" | "worsened" }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isPositive = type === "improved";
  const baseColor = isPositive ? "#22c55e" : "#ef4444";

  const magnitudeColors = {
    significant: isPositive ? "#22c55e" : "#dc2626",
    moderate: isPositive ? "#3b82f6" : "#ef4444",
    slight: "#f59e0b",
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark
          ? `linear-gradient(135deg, ${alpha(baseColor, 0.08)}, ${alpha("#020617", 0.80)})`
          : `linear-gradient(135deg, ${alpha(baseColor, 0.06)}, ${alpha("#ffffff", 0.90)})`,
        border: `1px solid ${alpha(baseColor, isDark ? 0.22 : 0.18)}`,
        backdropFilter: "blur(14px)",
        boxShadow: isDark ? `0 20px 70px rgba(0,0,0,0.40)` : `0 20px 60px rgba(2,6,23,0.09)`,
        height: "100%",
      }}
    >
      <Box sx={{ height: 4, background: baseColor }} />
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          {isPositive
            ? <TrendingUpIcon sx={{ color: baseColor, fontSize: 20 }} />
            : <TrendingDownIcon sx={{ color: baseColor, fontSize: 20 }} />
          }
          <Typography sx={{ fontWeight: 900, fontSize: 15, color: baseColor }}>
            {isPositive ? "What Improved" : "What Worsened"}
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {items.map((item, i) => {
            const mColor = magnitudeColors[item.magnitude] ?? baseColor;
            const confidencePct = Math.round(item.confidence * 100);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isPositive ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Box
                  sx={{
                    p: 1.8,
                    borderRadius: 2.5,
                    background: isDark ? alpha(baseColor, 0.06) : alpha(baseColor, 0.04),
                    border: `1px solid ${alpha(baseColor, 0.15)}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.6}>
                    <Typography sx={{ fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>
                      {item.label}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Chip
                        label={item.magnitude}
                        size="small"
                        sx={{ fontSize: 9, height: 18, fontWeight: 800, background: alpha(mColor, 0.15), color: mColor }}
                      />
                    </Stack>
                  </Stack>
                  <Typography variant="caption" sx={{ display: "block", opacity: 0.8, mb: 0.8, lineHeight: 1.4 }}>
                    {item.details}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ opacity: 0.55, fontWeight: 600 }}>
                      📊 {item.data_source}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: mColor }}>
                      {confidencePct}% confidence
                    </Typography>
                  </Stack>
                </Box>
              </motion.div>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Section D: Relationship Intelligence ─────────────────────
function RelationshipIntelligenceCard({ relationships }: { relationships: RelationshipInsight[] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const scatterData = relationships.map((r, i) => ({
    x: Math.round(r.strength * 100),
    y: i + 1,
    z: r.lag_days ? r.lag_days * 8 + 60 : 60,
    label: `${r.from_entity} → ${r.to_entity}`,
    pattern: r.pattern,
  }));

  const patternColors = { consistent: "#22c55e", adaptive: "#f59e0b", emerging: "#7c3aed" };

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark ? alpha("#0f172a", 0.88) : alpha("#ffffff", 0.92),
        border: `1px solid ${alpha("#7c3aed", isDark ? 0.22 : 0.15)}`,
        backdropFilter: "blur(14px)",
        boxShadow: isDark ? "0 20px 70px rgba(0,0,0,0.40)" : "0 20px 60px rgba(2,6,23,0.09)",
      }}
    >
      <Box sx={{ height: 4, background: `linear-gradient(90deg, #7c3aed, #3b82f6, #22c55e)` }} />
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <HubIcon sx={{ color: "#7c3aed", fontSize: 20 }} />
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Relationship Intelligence</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>Neo4j GraphRAG · Correlation Analysis</Typography>
          </Box>
        </Stack>

        {/* Scatter Chart */}
        <Box sx={{ height: 180, mb: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
              <XAxis dataKey="x" name="Strength %" type="number" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: "Strength %", position: "insideBottom", offset: -2, fontSize: 10 }} />
              <YAxis dataKey="y" hide />
              <ZAxis dataKey="z" range={[40, 200]} />
              <RTooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: "none", borderRadius: 10, fontSize: 11 }}
                formatter={(val, name, props) => {
                  if (name === "Strength %") return [`${val ?? 0}%`, (props as any).payload?.label ?? ""] as [string, string];
                  return [`${val ?? 0}`, String(name)] as [string, string];
                }}
              />
              <Scatter
                data={scatterData}
                fill={theme.palette.primary.main}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Box>

        <Stack spacing={1.2}>
          {relationships.map((rel, i) => {
            const strengthPct = Math.round(rel.strength * 100);
            const pColor = patternColors[rel.pattern] ?? "#22c55e";
            return (
              <motion.div
                key={rel.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Box
                  sx={{
                    p: 1.8,
                    borderRadius: 2,
                    background: isDark ? alpha("#ffffff", 0.03) : alpha("#7c3aed", 0.04),
                    border: `1px solid ${alpha("#7c3aed", 0.12)}`,
                  }}
                >
                  {/* Entity relationship */}
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.8}>
                    <Chip label={rel.from_entity} size="small" sx={{ fontSize: 10, height: 20, fontWeight: 700, background: alpha(theme.palette.primary.main, 0.15) }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>→</Typography>
                    <Chip label={rel.relationship_type.replace(/_/g, " ")} size="small" sx={{ fontSize: 9, height: 18, fontWeight: 700, background: alpha("#7c3aed", 0.15), color: "#7c3aed" }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>→</Typography>
                    <Chip label={rel.to_entity} size="small" sx={{ fontSize: 10, height: 20, fontWeight: 700, background: alpha("#22c55e", 0.15) }} />
                  </Stack>

                  <Typography variant="caption" sx={{ display: "block", opacity: 0.75, mb: 0.8 }}>
                    {rel.evidence}
                    {rel.lag_days && ` (${rel.lag_days}-day lag)`}
                  </Typography>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <LinearProgress
                        variant="determinate"
                        value={strengthPct}
                        sx={{
                          width: 80,
                          height: 5,
                          borderRadius: 999,
                          background: alpha("#7c3aed", 0.15),
                          "& .MuiLinearProgress-bar": { background: "#7c3aed", borderRadius: 999 },
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#7c3aed" }}>
                        {strengthPct}%
                      </Typography>
                    </Stack>
                    <Chip label={rel.pattern} size="small" sx={{ fontSize: 9, height: 18, fontWeight: 800, background: alpha(pColor, 0.15), color: pColor }} />
                  </Stack>
                </Box>
              </motion.div>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Section E: Predicted Outcomes ────────────────────────────
function PredictedOutcomesCard({ outcomes }: { outcomes: PredictedOutcome[] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Build simple timeline chart data
  const chartData = outcomes.map((o, i) => ({
    name: o.metric.split(" ")[0],
    confidence: Math.round(o.confidence * 100),
    impact: o.direction === "improve" ? 80 : o.direction === "stable" ? 50 : 20,
  }));

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark ? alpha("#0f172a", 0.88) : alpha("#ffffff", 0.92),
        border: `1px solid ${alpha(theme.palette.secondary.main, isDark ? 0.22 : 0.15)}`,
        backdropFilter: "blur(14px)",
        boxShadow: isDark ? "0 20px 70px rgba(0,0,0,0.40)" : "0 20px 60px rgba(2,6,23,0.09)",
      }}
    >
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})` }} />
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <TimelineIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Predicted Outcomes</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>AI Prediction Engine · DeepSeek Validation</Typography>
          </Box>
        </Stack>

        {/* Line chart – confidence by metric */}
        <Box sx={{ height: 130, mb: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <ReferenceLine y={80} stroke={alpha("#22c55e", 0.4)} strokeDasharray="4 4" label={{ value: "High conf.", fontSize: 9 }} />
              <RTooltip
                contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: "none", borderRadius: 10, fontSize: 11 }}
                formatter={(val) => [`${val ?? 0}%`, "Confidence"] as [string, string]}
              />
              <Line type="monotone" dataKey="confidence" stroke={theme.palette.secondary.main} strokeWidth={2.5} dot={{ fill: theme.palette.secondary.main, r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Stack spacing={1.2}>
          {outcomes.map((o, i) => {
            const dirColor = o.direction === "improve" ? "#22c55e" : o.direction === "worsen" ? "#ef4444" : "#f59e0b";
            const riskColor = o.risk_trajectory === "decreasing" ? "#22c55e" : o.risk_trajectory === "increasing" ? "#ef4444" : "#f59e0b";
            const confidencePct = Math.round(o.confidence * 100);

            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Accordion
                  disableGutters
                  elevation={0}
                  sx={{
                    background: isDark ? alpha(dirColor, 0.06) : alpha(dirColor, 0.04),
                    border: `1px solid ${alpha(dirColor, 0.18)}`,
                    borderRadius: "12px !important",
                    "&:before": { display: "none" },
                    mb: 0.5,
                    overflow: "hidden",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: dirColor }} />}
                    sx={{ px: 2, py: 0.8, minHeight: "auto", "& .MuiAccordionSummary-content": { my: 0.5 } }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
                      <Typography sx={{ fontWeight: 800, fontSize: 13, flex: 1 }}>
                        {o.metric}
                      </Typography>
                      <Chip
                        label={o.direction === "improve" ? "↑ Improving" : o.direction === "worsen" ? "↓ Worsening" : "→ Stable"}
                        size="small"
                        sx={{ fontSize: 10, height: 20, fontWeight: 800, background: alpha(dirColor, 0.18), color: dirColor }}
                      />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pt: 0, pb: 1.5 }}>
                    <Grid container spacing={1.2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ opacity: 0.6, display: "block" }}>Current</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: 14 }}>{o.current_value}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ opacity: 0.6, display: "block" }}>Predicted ({o.timeframe})</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: 14, color: dirColor }}>{o.predicted_value}</Typography>
                      </Grid>
                    </Grid>
                    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                      <Chip label={`${confidencePct}% confidence`} size="small" sx={{ fontSize: 9, height: 18, fontWeight: 700, background: alpha(theme.palette.primary.main, 0.12) }} />
                      <Chip label={`Risk: ${o.risk_trajectory}`} size="small" sx={{ fontSize: 9, height: 18, fontWeight: 700, background: alpha(riskColor, 0.15), color: riskColor }} />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Section F: Recommended Focus Areas ───────────────────────
// (reusing RecommendedActionsPanel)

// ── Main Screen ───────────────────────────────────────────────
export default function AISummaryPage() {
  requireAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [summary, setSummary] = useState<AISummary>(MOCK_AI_SUMMARY);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAISummary();
      setSummary(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const pageBg = useMemo(() => {
    const p = theme.palette.primary.main;
    const s = "#7c3aed";
    return isDark
      ? `radial-gradient(1000px 550px at 15% 0%, ${alpha(p, 0.16)}, transparent 55%),` +
        `radial-gradient(700px 400px at 85% 20%, ${alpha(s, 0.14)}, transparent 50%),` +
        theme.palette.background.default
      : `radial-gradient(1000px 550px at 15% 0%, ${alpha(p, 0.08)}, transparent 55%),` +
        `radial-gradient(700px 400px at 85% 20%, ${alpha(s, 0.06)}, transparent 50%),` +
        theme.palette.background.default;
  }, [theme, isDark]);

  return (
    <Box sx={{ minHeight: "100vh", background: pageBg, pb: 4 }}>
      <DashboardHeader
        notificationCount={summary.ai_contract.risk_flags.filter((r) => r.severity === "critical" || r.severity === "high").length}
        onRefresh={loadSummary}
      />

      {/* Page Title */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2.5, mb: 2 }}>
        <Box sx={{ p: 1, borderRadius: 2, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha("#7c3aed", 0.2)})` }}>
          <AutoAwesomeIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 950 }}>AI Health Summary</Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            GraphRAG-powered · Med42 + DeepSeek · Explainable Intelligence
          </Typography>
        </Box>
        <Chip
          icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
          label="HIPAA Compliant"
          size="small"
          sx={{ ml: "auto", fontWeight: 700, fontSize: 11 }}
        />
      </Stack>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}><CardSkeleton height={300} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><CardSkeleton height={280} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><CardSkeleton height={280} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><CardSkeleton height={360} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><CardSkeleton height={360} /></Grid>
              <Grid size={{ xs: 12 }}><CardSkeleton height={240} /></Grid>
            </Grid>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Grid container spacing={3}>
              {/* Section A — AI Executive Summary */}
              <Grid size={{ xs: 12 }}>
                <ExecutiveSummaryCard data={summary} />
              </Grid>

              {/* Section B — What Improved */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ChangeCard items={summary.what_improved} type="improved" />
              </Grid>

              {/* Section C — What Worsened */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ChangeCard items={summary.what_worsened} type="worsened" />
              </Grid>

              {/* Section D — Relationship Intelligence */}
              <Grid size={{ xs: 12, md: 6 }}>
                <RelationshipIntelligenceCard relationships={summary.relationship_insights} />
              </Grid>

              {/* Section E — Predicted Outcomes */}
              <Grid size={{ xs: 12, md: 6 }}>
                <PredictedOutcomesCard outcomes={summary.predicted_outcomes} />
              </Grid>

              {/* Section F — Recommended Focus Areas */}
              <Grid size={{ xs: 12 }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                    <BoltIcon sx={{ color: "#f59e0b" }} />
                    <Typography sx={{ fontWeight: 900, fontSize: 17 }}>Recommended Focus Areas</Typography>
                  </Stack>
                  <RecommendedActionsPanel
                    recommendations={summary.recommended_focus}
                    onOverride={(id) => console.info("[Audit] AI recommendation override:", id)}
                  />
                </Box>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
