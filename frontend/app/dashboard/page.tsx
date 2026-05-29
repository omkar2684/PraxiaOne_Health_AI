"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box, Grid, Stack, Typography, Card, CardContent,
  Skeleton, Tabs, Tab, Chip, useMediaQuery,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BiotechIcon from "@mui/icons-material/Biotech";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useRouter } from "next/navigation";
import { requireAuth } from "@/lib/requireAuth";
import { motion, AnimatePresence } from "framer-motion";

// Dashboard components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HealthScoreGauge from "@/components/dashboard/HealthScoreGauge";
import BiomarkerSnapshotCard from "@/components/dashboard/BiomarkerSnapshotCard";
import PhysiologySnapshotCard from "@/components/dashboard/PhysiologySnapshotCard";
import BehaviorSnapshotCard from "@/components/dashboard/BehaviorSnapshotCard";
import ClinicalCareCard from "@/components/dashboard/ClinicalCareCard";
import AIInsightCard from "@/components/dashboard/AIInsightCard";
import RecommendedActionsPanel from "@/components/dashboard/RecommendedActionsPanel";

// API
import {
  fetchHealthScore, fetchBiomarkers, fetchPhysiology,
  fetchBehavior, fetchClinical, fetchInsights,
  fetchRecommendations, fetchRiskFlags,
  MOCK_HEALTH_SCORE, MOCK_BIOMARKERS, MOCK_PHYSIOLOGY,
  MOCK_BEHAVIOR, MOCK_CLINICAL, MOCK_INSIGHTS,
  MOCK_RECOMMENDATIONS, MOCK_RISK_FLAGS,
} from "@/lib/dashboardApi";
import type {
  HealthScore, BiomarkerSnapshot, PhysiologySnapshot,
  BehaviorSnapshot, ClinicalSnapshot, AIInsight,
  AIRecommendation, RiskFlag,
} from "@/types/dashboard";

// ── Skeleton helpers ──────────────────────────────────────────
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

// ── Navigation Tab Config ─────────────────────────────────────
const NAV_TABS = [
  { label: "Home", icon: <HomeIcon sx={{ fontSize: 18 }} />, path: "/dashboard" },
  { label: "Biology", icon: <BiotechIcon sx={{ fontSize: 18 }} />, path: "/dashboard/daily" },
  { label: "Physiology", icon: <FavoriteIcon sx={{ fontSize: 18 }} />, path: "/vitals" },
  { label: "Behavior", icon: <DirectionsRunIcon sx={{ fontSize: 18 }} />, path: "/track" },
  { label: "AI", icon: <AutoAwesomeIcon sx={{ fontSize: 18 }} />, path: "/dashboard/ai-summary" },
  { label: "Profile", icon: <AccountCircleIcon sx={{ fontSize: 18 }} />, path: "/profile" },
];

// ── Main Dashboard ────────────────────────────────────────────
export default function HomeDashboardPage() {
  requireAuth();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Data state
  const [healthScore, setHealthScore] = useState<HealthScore>(MOCK_HEALTH_SCORE);
  const [biomarkers, setBiomarkers] = useState<BiomarkerSnapshot>(MOCK_BIOMARKERS);
  const [physiology, setPhysiology] = useState<PhysiologySnapshot>(MOCK_PHYSIOLOGY);
  const [behavior, setBehavior] = useState<BehaviorSnapshot>(MOCK_BEHAVIOR);
  const [clinical, setClinical] = useState<ClinicalSnapshot>(MOCK_CLINICAL);
  const [insights, setInsights] = useState<AIInsight[]>(MOCK_INSIGHTS);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(MOCK_RECOMMENDATIONS);
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>(MOCK_RISK_FLAGS);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const loadAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [hs, bm, phy, beh, clin, ins, recs, risks] = await Promise.allSettled([
        fetchHealthScore(),
        fetchBiomarkers(),
        fetchPhysiology(),
        fetchBehavior(),
        fetchClinical(),
        fetchInsights(),
        fetchRecommendations(),
        fetchRiskFlags(),
      ]);

      if (hs.status === "fulfilled") setHealthScore(hs.value);
      if (bm.status === "fulfilled") setBiomarkers(bm.value);
      if (phy.status === "fulfilled") setPhysiology(phy.value);
      if (beh.status === "fulfilled") setBehavior(beh.value);
      if (clin.status === "fulfilled") setClinical(clin.value);
      if (ins.status === "fulfilled") setInsights(ins.value);
      if (recs.status === "fulfilled") setRecommendations(recs.value);
      if (risks.status === "fulfilled") setRiskFlags(risks.value);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const pageBg = useMemo(() => {
    const p = theme.palette.primary.main;
    const s = theme.palette.secondary.main;
    return isDark
      ? `radial-gradient(1100px 600px at 10% 0%, ${alpha(p, 0.16)}, transparent 55%),` +
        `radial-gradient(800px 500px at 90% 15%, ${alpha(s, 0.14)}, transparent 50%),` +
        `radial-gradient(600px 400px at 50% 100%, ${alpha("#7c3aed", 0.10)}, transparent 50%),` +
        theme.palette.background.default
      : `radial-gradient(1100px 600px at 10% 0%, ${alpha(p, 0.09)}, transparent 55%),` +
        `radial-gradient(800px 500px at 90% 15%, ${alpha(s, 0.07)}, transparent 50%),` +
        theme.palette.background.default;
  }, [theme, isDark]);

  const criticalRisks = riskFlags.filter((r) => r.severity === "critical" || r.severity === "high");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: pageBg,
        pb: isMobile ? 10 : 4,
      }}
    >
      {/* ── Section A: Header ──────────────────────────── */}
      <DashboardHeader
        notificationCount={criticalRisks.length}
        onRefresh={loadAll}
        isRefreshing={isRefreshing}
      />

      <Box sx={{ mt: 2.5 }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 4 }}><CardSkeleton height={320} /></Grid>
                <Grid size={{ xs: 12, lg: 8 }}><CardSkeleton height={320} /></Grid>
                <Grid size={{ xs: 12 }}><CardSkeleton height={260} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><CardSkeleton height={240} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><CardSkeleton height={240} /></Grid>
                <Grid size={{ xs: 12, lg: 7 }}><CardSkeleton height={300} /></Grid>
                <Grid size={{ xs: 12, lg: 5 }}><CardSkeleton height={300} /></Grid>
              </Grid>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={3}>
                {/* ── Section B: Health Score Card ───────── */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      height: "100%",
                      minHeight: 340,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isDark
                        ? `linear-gradient(155deg, ${alpha("#0f172a", 0.9)}, ${alpha("#1e293b", 0.8)})`
                        : `linear-gradient(155deg, ${alpha("#ffffff", 0.94)}, ${alpha("#f0f9ff", 0.85)})`,
                      border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.2 : 0.14)}`,
                      backdropFilter: "blur(16px)",
                      boxShadow: isDark
                        ? `0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}`
                        : `0 24px 70px rgba(2,6,23,0.10)`,
                    }}
                  >
                    <CardContent sx={{ p: 3, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Typography
                        variant="overline"
                        sx={{
                          fontWeight: 900,
                          letterSpacing: 2,
                          color: theme.palette.primary.main,
                          fontSize: 10,
                          mb: 1,
                        }}
                      >
                        Health Score
                      </Typography>
                      <HealthScoreGauge data={healthScore} size={isMobile ? 180 : 210} />

                      {/* Contributor Pills */}
                      <Box sx={{ mt: 2, width: "100%" }}>
                        <Typography variant="caption" sx={{ opacity: 0.55, fontWeight: 700, display: "block", mb: 1 }}>
                          Score Breakdown
                        </Typography>
                        <Stack spacing={0.7}>
                          {healthScore.contributors.map((c) => (
                            <Stack key={c.domain} direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.75, textTransform: "capitalize" }}>
                                {c.domain}
                              </Typography>
                              <Stack direction="row" spacing={0.8} alignItems="center">
                                <Box
                                  sx={{
                                    width: 50,
                                    height: 4,
                                    borderRadius: 999,
                                    background: alpha(theme.palette.text.primary, 0.1),
                                    overflow: "hidden",
                                  }}
                                >
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${c.score}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    style={{
                                      height: "100%",
                                      background: c.score >= 70 ? "#22c55e" : c.score >= 50 ? "#f59e0b" : "#ef4444",
                                      borderRadius: 999,
                                    }}
                                  />
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 800, minWidth: 28 }}>
                                  {c.score}
                                </Typography>
                              </Stack>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* ── Section G: AI Priority Insights ────── */}
                <Grid size={{ xs: 12, sm: 6, lg: 5 }}>
                  <AIInsightCard insights={insights} />
                </Grid>

                {/* ── Section H: Recommended Actions ──────── */}
                <Grid size={{ xs: 12, lg: 4 }}>
                  <RecommendedActionsPanel
                    recommendations={recommendations.slice(0, 3)}
                    onOverride={(id) => console.info("[Audit] User overrode recommendation:", id)}
                  />
                </Grid>

                {/* ── Section D: Physiology Snapshot ──────── */}
                <Grid size={{ xs: 12 }}>
                  <PhysiologySnapshotCard data={physiology} />
                </Grid>

                {/* ── Section C: Biomarker Snapshot ───────── */}
                <Grid size={{ xs: 12, lg: 8 }}>
                  <BiomarkerSnapshotCard data={biomarkers} />
                </Grid>

                {/* ── Section F: Clinical Care Plan ───────── */}
                <Grid size={{ xs: 12, lg: 4 }}>
                  <ClinicalCareCard data={clinical} />
                </Grid>

                {/* ── Section E: Behavior Snapshot ────────── */}
                <Grid size={{ xs: 12 }}>
                  <BehaviorSnapshotCard data={behavior} />
                </Grid>

                {/* Quick Nav Buttons */}
                <Grid size={{ xs: 12 }}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      background: isDark
                        ? alpha("#0f172a", 0.7)
                        : alpha("#ffffff", 0.8),
                      border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05)}`,
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {[
                          { label: "View Daily Snapshot", path: "/dashboard/daily", color: theme.palette.primary.main },
                          { label: "AI Health Summary", path: "/dashboard/ai-summary", color: "#7c3aed" },
                          { label: "Upload Lab Results", path: "/upload", color: "#22c55e" },
                          { label: "Manage Medications", path: "/medications", color: "#f59e0b" },
                          { label: "Connect Wearable", path: "/wearables", color: "#0ea5e9" },
                        ].map((btn) => (
                          <Chip
                            key={btn.path}
                            label={btn.label}
                            onClick={() => router.push(btn.path)}
                            sx={{
                              fontWeight: 800,
                              fontSize: 12,
                              cursor: "pointer",
                              background: alpha(btn.color, isDark ? 0.16 : 0.10),
                              color: btn.color,
                              border: `1px solid ${alpha(btn.color, 0.3)}`,
                              "&:hover": {
                                background: alpha(btn.color, isDark ? 0.25 : 0.18),
                                transform: "translateY(-1px)",
                              },
                              transition: "all 0.2s",
                            }}
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* ── Section I: Bottom Navigation (Mobile) ──── */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            background: isDark
              ? alpha("#0f172a", 0.94)
              : alpha("#ffffff", 0.95),
            borderTop: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.12 : 0.08)}`,
            backdropFilter: "blur(20px)",
            boxShadow: "0 -8px 30px rgba(0,0,0,0.12)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => {
              setActiveTab(v);
              router.push(NAV_TABS[v].path);
            }}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                minWidth: 0,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "none",
                py: 1.2,
                gap: 0.5,
                flexDirection: "column",
              },
              "& .MuiTabs-indicator": {
                top: 0,
                bottom: "auto",
                height: 3,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: "0 0 3px 3px",
              },
            }}
          >
            {NAV_TABS.map((tab) => (
              <Tab
                key={tab.path}
                icon={tab.icon}
                label={tab.label}
                aria-label={`Navigate to ${tab.label}`}
              />
            ))}
          </Tabs>
        </Box>
      )}
    </Box>
  );
}
