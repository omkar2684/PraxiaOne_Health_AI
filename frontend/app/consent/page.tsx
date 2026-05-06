"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  Grid,
  Switch,
  FormControlLabel,
  LinearProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import {
  Shield,
  VerifiedUser,
  Psychology,
  WarningAmber,
  InfoOutlined,
  Restore,
  Lock,
  HealthAndSafety,
  Science,
  Medication,
  Watch,
  Description,
  ArrowForward,
  CheckCircle,
} from "@mui/icons-material";

import { apiFetch } from "@/lib/api"; // ✅ uses JWT + refresh + FormData-safe apiFetch

type ConsentKey =
  | "PROFILE_BASIC"
  | "LAB_RESULTS"
  | "MEDICATIONS"
  | "WEARABLES"
  | "CARE_PLANS"
  | "AI_PROCESSING";

type ConsentItem = {
  key: ConsentKey;
  title: string;
  description: string;
  aiUse: string;
  icon: React.ReactNode;
  requiredForAI?: boolean;
  risk?: "Low" | "Medium" | "High";
};

const CONSENTS: ConsentItem[] = [
  {
    key: "PROFILE_BASIC",
    title: "Profile basics",
    description: "Name, age, height/weight, preferences.",
    aiUse: "Used to personalize recommendations and compute wellness snapshot.",
    icon: <HealthAndSafety />,
    requiredForAI: true,
    risk: "Low",
  },
  {
    key: "LAB_RESULTS",
    title: "Lab results (upload)",
    description: "PDF lab reports you upload.",
    aiUse: "Extract trends and flags (never raw data shared without consent).",
    icon: <Science />,
    risk: "High",
  },
  {
    key: "MEDICATIONS",
    title: "Medications",
    description: "Medication names, dosage, schedule.",
    aiUse: "Helps detect interactions and reminder suggestions (future module).",
    icon: <Medication />,
    risk: "High",
  },
  {
    key: "WEARABLES",
    title: "Wearables",
    description: "Steps, heart rate, sleep and activity trends.",
    aiUse: "Enables trend-based insights and safer personalization.",
    icon: <Watch />,
    risk: "Medium",
  },
  {
    key: "CARE_PLANS",
    title: "Care plans (upload)",
    description: "Plans / instructions you upload.",
    aiUse: "Aligns recommendations with your clinician’s plan (scope-limited).",
    icon: <Description />,
    risk: "Medium",
  },
  {
    key: "AI_PROCESSING",
    title: "AI processing",
    description: "Allow AI to generate insights from consented data only.",
    aiUse: "Unlocks AI Insights and Recommendations modules.",
    icon: <Psychology />,
    requiredForAI: true,
    risk: "Medium",
  },
];

const STORAGE_KEY = "praxiaone_consent_v1";

// theme-friendly tint (for the icon bubble)
function riskTint(risk?: "Low" | "Medium" | "High") {
  if (risk === "High") return "error";
  if (risk === "Medium") return "warning";
  return "success";
}

/**
 * Backend consent shape (Django):
 * {
 *   care_plan_allowed: boolean,
 *   lab_results_allowed: boolean,
 *   vitals_allowed: boolean,
 *   ai_insights_allowed: boolean,
 *   recommendations_allowed: boolean,
 *   updated_at: string
 * }
 */
type BackendConsent = {
  care_plan_allowed: boolean;
  lab_results_allowed: boolean;
  vitals_allowed: boolean;
  ai_insights_allowed: boolean;
  recommendations_allowed: boolean;
  updated_at?: string;
};

// Map UI keys <-> backend keys
function uiFromBackend(b: BackendConsent): Record<ConsentKey, boolean> {
  return {
    PROFILE_BASIC: true, // profile is available for all registered users
    LAB_RESULTS: Boolean(b.lab_results_allowed),
    MEDICATIONS: false, // not implemented in backend yet
    WEARABLES: Boolean(b.vitals_allowed), // treat wearables/vitals consent together for now
    CARE_PLANS: Boolean(b.care_plan_allowed),
    AI_PROCESSING: Boolean(b.ai_insights_allowed), // main AI switch
  };
}

function backendPatchFromUi(ui: Record<ConsentKey, boolean>): Partial<BackendConsent> {
  return {
    care_plan_allowed: ui.CARE_PLANS,
    lab_results_allowed: ui.LAB_RESULTS,
    vitals_allowed: ui.WEARABLES,
    ai_insights_allowed: ui.AI_PROCESSING,
    recommendations_allowed: ui.AI_PROCESSING, // reasonable default: recommendations follow AI switch
  };
}

export default function ConsentPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const pageBg = useMemo(() => {
    const p = theme.palette.primary.main;
    const s = theme.palette.secondary.main;
    const ok = theme.palette.success.main;

    if (isDark) {
      return (
        `radial-gradient(1200px 650px at 15% 0%, ${alpha(p, 0.18)}, transparent 60%),` +
        `radial-gradient(900px 520px at 85% 20%, ${alpha(s, 0.18)}, transparent 55%),` +
        `radial-gradient(900px 520px at 50% 110%, ${alpha(ok, 0.10)}, transparent 55%),` +
        `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`
      );
    }

    return (
      `radial-gradient(1100px 520px at 12% 0%, ${alpha(p, 0.12)}, transparent 60%),` +
      `radial-gradient(900px 480px at 90% 10%, ${alpha(s, 0.12)}, transparent 60%),` +
      `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`
    );
  }, [theme, isDark]);

  const glassCardSx = useMemo(
    () => ({
      borderRadius: 0,
      overflow: "hidden",
      border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.08)}`,
      boxShadow: isDark ? "0 22px 90px rgba(0,0,0,0.45)" : "0 16px 60px rgba(15,23,42,0.10)",
      background: isDark
        ? `linear-gradient(180deg, ${alpha("#0f172a", 0.70)}, ${alpha("#020617", 0.60)})`
        : `linear-gradient(135deg, ${alpha("#ffffff", 0.82)}, ${alpha(
            theme.palette.primary.main,
            0.05
          )}, ${alpha(theme.palette.secondary.main, 0.04)})`,
      backdropFilter: "blur(14px)",
    }),
    [theme, isDark]
  );

  const heroSx = useMemo(
    () => ({
      ...glassCardSx,
      position: "relative" as const,
      mb: 3,
      background: isDark
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.20)}, ${alpha(
            theme.palette.secondary.main,
            0.16
          )}, ${alpha("#020617", 0.78)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(
            theme.palette.secondary.main,
            0.10
          )}, ${alpha("#ffffff", 0.80)})`,
    }),
    [glassCardSx, theme, isDark]
  );

  const progressSx = useMemo(
    () => ({
      height: 10,
      borderRadius: 0,
      background: isDark ? alpha("#ffffff", 0.10) : "rgba(15,23,42,0.06)",
      "& .MuiLinearProgress-bar": {
        borderRadius: 0,
        background: "linear-gradient(90deg, #0ea5e9, #14b8a6)",
      },
    }),
    [isDark]
  );

  const paperRowSx = useMemo(
    () => ({
      p: 2,
      borderRadius: 0,
      border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.08)}`,
      background: isDark ? alpha("#0b1228", 0.42) : alpha("#ffffff", 0.78),
      boxShadow: isDark ? "0 14px 55px rgba(0,0,0,0.35)" : "0 10px 40px rgba(15,23,42,0.05)",
      transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
      "&:hover": { transform: "translateY(-1px)" },
    }),
    [theme, isDark]
  );

  const rightPanelSx = useMemo(
    () => ({
      ...glassCardSx,
      position: "sticky" as const,
      top: 18,
    }),
    [glassCardSx]
  );

  const textPrimary = isDark ? alpha("#F8FAFC", 0.96) : theme.palette.text.primary;
  const textSecondary = isDark ? alpha("#E2E8F0", 0.72) : theme.palette.text.secondary;

  const [consent, setConsent] = useState<Record<ConsentKey, boolean>>({
    PROFILE_BASIC: true,
    LAB_RESULTS: false,
    MEDICATIONS: false,
    WEARABLES: false,
    CARE_PLANS: false,
    AI_PROCESSING: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type: "success" | "info" | "warning" | "error";
  }>({ open: false, msg: "", type: "success" });

  // ✅ Load consent from backend first (source of truth),
  // then merge any local-only keys (like MEDICATIONS) from localStorage.
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      try {
        // If user isn't logged in, this will 401; we'll just fall back to local.
        const backend = await apiFetch<BackendConsent>("/consent/", { method: "GET" });

        const ui = uiFromBackend(backend);

        // Merge local-only / UI-only keys from localStorage
        let local: Partial<Record<ConsentKey, boolean>> = {};
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) local = JSON.parse(raw);
        } catch {}

        if (mounted) {
          setConsent((prev) => ({
            ...prev,
            ...ui, // Default backend payload
            ...local, // Use local preferences as primary source
          }));
        }
      } catch {
        // Fallback to local settings if server is unavailable
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (mounted && parsed && typeof parsed === "object") {
              setConsent((prev) => ({ ...prev, ...parsed }));
            }
          }
        } catch {
          // ignore
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ AUTO-SAVE CONTINUOUSLY (No manual save required)
  // Cross-link state so this page perfectly matches the Data Sources dashboard
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      localStorage.setItem("praxia_data_consent", JSON.stringify(consent.AI_PROCESSING));
      
      // Also sync the Data Page's underlying data connections so everything matches!
      try {
          const currentData = localStorage.getItem("praxia_data_connected");
          const dataObj = currentData ? JSON.parse(currentData) : { self: true, labs: false, care: false, wearables: false, ehr: false };
          
          dataObj.labs = consent.LAB_RESULTS;
          dataObj.care = consent.CARE_PLANS;
          dataObj.wearables = consent.WEARABLES;
          
          localStorage.setItem("praxia_data_connected", JSON.stringify(dataObj));
      } catch(e) {}
    }
  }, [consent, loading]);

  const coverage = useMemo(() => {
    const total = CONSENTS.length;
    const on = CONSENTS.filter((c) => consent[c.key]).length;
    return Math.round((on / total) * 100);
  }, [consent]);

  const aiReady = useMemo(() => {
    // AI-ready requires AI_PROCESSING + PROFILE_BASIC at minimum
    return consent.AI_PROCESSING && consent.PROFILE_BASIC;
  }, [consent]);

  const riskScore = useMemo(() => {
    // simple score: High=3, Medium=2, Low=1 (only for enabled)
    const weight = (r?: "Low" | "Medium" | "High") =>
      r === "High" ? 3 : r === "Medium" ? 2 : 1;
    let s = 0;
    CONSENTS.forEach((c) => {
      if (consent[c.key]) s += weight(c.risk);
    });
    const max = CONSENTS.reduce((acc, c) => acc + weight(c.risk), 0);
    return Math.round((s / max) * 100);
  }, [consent]);

  const summaryLabel = useMemo(() => {
    if (coverage >= 70) return "Consent: Strong";
    if (coverage >= 40) return "Consent: Partial";
    return "Consent: Minimal";
  }, [coverage]);

  const toggle = (key: ConsentKey) => {
    setConsent((prev) => {
      const next = { ...prev, [key]: !prev[key] };

      if (key === "PROFILE_BASIC" && prev.PROFILE_BASIC && prev.AI_PROCESSING) {
        setToast({
          open: true,
          msg: "Turning off Profile basics will reduce AI quality and may disable AI-ready state.",
          type: "warning",
        });
      }

      if (key === "AI_PROCESSING" && prev.AI_PROCESSING) {
        setToast({
          open: true,
          msg: "AI processing disabled. AI Insights will be locked until you enable it again.",
          type: "info",
        });
      }

      return next;
    });
  };

  // ✅ Save to backend (PATCH /api/consent/) + also save UI-only toggles in localStorage
  const save = async () => {
    setSaving(true);
    try {
      // Persist UI-only consent flags locally for this browser session
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));

      // backend patch for linked keys
      const patch = backendPatchFromUi(consent);
      await apiFetch<BackendConsent>("/consent/", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });

      setToast({ open: true, msg: "Consent saved ✅", type: "success" });
    } catch (e: any) {
      setToast({
        open: true,
        msg:
          typeof e?.message === "string"
            ? e.message
            : "Could not save consent. Are you logged in?",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    const baseline: Record<ConsentKey, boolean> = {
      PROFILE_BASIC: true,
      LAB_RESULTS: false,
      MEDICATIONS: false,
      WEARABLES: false,
      CARE_PLANS: false,
      AI_PROCESSING: false,
    };
    setConsent(baseline);
    setToast({ open: true, msg: "Reset to minimal consent.", type: "info" });
  };

  const enableRecommended = () => {
    setConsent((prev) => ({
      ...prev,
      PROFILE_BASIC: true,
      WEARABLES: true,
      CARE_PLANS: true,
      AI_PROCESSING: true,
    }));
    setToast({ open: true, msg: "Applied recommended consent set ✅", type: "success" });
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 24px)",
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        background: pageBg,
        animation: "fadeIn .35s ease-out",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "translateY(0px)" },
        },
      }}
    >
      {/* HERO */}
      <Card sx={heroSx}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: isDark
              ? `radial-gradient(760px 240px at 18% 38%, ${alpha(
                  theme.palette.primary.main,
                  0.22
                )}, transparent 60%),
                 radial-gradient(680px 240px at 82% 30%, ${alpha(
                   theme.palette.secondary.main,
                   0.20
                 )}, transparent 55%)`
              : `radial-gradient(760px 240px at 18% 38%, ${alpha(
                  theme.palette.primary.main,
                  0.18
                )}, transparent 60%),
                 radial-gradient(680px 240px at 82% 30%, ${alpha(
                   theme.palette.secondary.main,
                   0.14
                 )}, transparent 55%)`,
          }}
        />

        <CardContent sx={{ position: "relative", py: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
                sx={{ mb: 1.5, flexWrap: "wrap" }}
              >
                <Chip
                  icon={<Shield sx={{ fontSize: 18 }} />}
                  label="Consent & Privacy"
                  size="small"
                  sx={{
                    fontWeight: 950,
                    borderRadius: 0,
                    background: isDark
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.12),
                    border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.16 : 0.1)}`,
                    color: isDark ? alpha("#E2E8F0", 0.9) : theme.palette.text.primary,
                  }}
                />
                <Chip
                  icon={<Lock sx={{ fontSize: 18 }} />}
                  label="User-controlled"
                  size="small"
                  sx={{
                    fontWeight: 950,
                    borderRadius: 0,
                    background: isDark ? alpha("#0b1228", 0.45) : alpha("#ffffff", 0.74),
                    border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.16 : 0.1)}`,
                    color: isDark ? alpha("#E2E8F0", 0.9) : theme.palette.text.primary,
                  }}
                />
                <Chip
                  icon={
                    aiReady ? <CheckCircle sx={{ fontSize: 18, color: "inherit" }} /> : <WarningAmber sx={{ fontSize: 18 }} />
                  }
                  label={aiReady ? "AI Ready" : "AI Locked"}
                  sx={{
                    fontWeight: 950,
                    borderRadius: 0,
                    background: aiReady 
                      ? `linear-gradient(90deg, ${alpha(theme.palette.success.main, isDark ? 0.25 : 0.2)}, ${alpha(theme.palette.success.main, isDark ? 0.15 : 0.08)})`
                      : `linear-gradient(90deg, ${alpha(theme.palette.error.main, isDark ? 0.12 : 0.08)}, ${alpha(theme.palette.text.primary, 0.05)})`,
                    border: `1px solid ${aiReady ? alpha(theme.palette.success.main, 0.45) : alpha(theme.palette.error.main, 0.3)}`,
                    color: aiReady ? (isDark ? "#bbf7d0" : "#166534") : (isDark ? "#fecaca" : "#991b1b"),
                    px: 1,
                    boxShadow: aiReady ? (isDark ? `0 0 20px ${alpha(theme.palette.success.main, 0.15)}` : "none") : "none",
                  }}
                />
              </Stack>

              <Typography
                variant="h4"
                sx={{ fontWeight: 950, letterSpacing: -0.8, color: textPrimary }}
              >
                Control what AI can access
              </Typography>
              <Typography sx={{ color: textSecondary }}>
                Turn on only what you want. AI uses only consented categories.
              </Typography>
            </Box>

            <Stack spacing={1.2} sx={{ width: { xs: "100%", md: 240 } }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: textSecondary }}>
                  Consent coverage: {coverage}%
                </Typography>
                <LinearProgress variant="determinate" value={coverage} sx={progressSx} />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: textSecondary }}>
                  Data sensitivity (enabled): {riskScore}%
                </Typography>
                <LinearProgress variant="determinate" value={riskScore} sx={progressSx} />
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid size={{ xs: 12 }}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography sx={{ fontWeight: 950, color: textPrimary }}>Consent categories</Typography>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<VerifiedUser />}
                    onClick={enableRecommended}
                    sx={{ borderRadius: 0, fontWeight: 950 }}
                    disabled={loading || saving}
                  >
                    Apply Recommended
                  </Button>
                </Stack>
              </Stack>

              <Typography variant="body2" sx={{ mb: 2, color: textSecondary }}>
                Each toggle controls if that category can be used for personalization. You can change anytime.
              </Typography>

              {loading && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 900 }}>
                    Loading consent from server…
                  </Typography>
                  <LinearProgress sx={progressSx} />
                </Box>
              )}

              <Divider sx={{ mb: 2, opacity: isDark ? 0.15 : 0.55 }} />

              <Stack spacing={1.5}>
                {CONSENTS.map((c) => {
                  const enabled = consent[c.key];
                  const tint = riskTint(c.risk);
                  const tintColor =
                    tint === "error"
                      ? theme.palette.error.main
                      : tint === "warning"
                      ? theme.palette.warning.main
                      : theme.palette.success.main;

                  return (
                    <Paper
                      key={c.key}
                      elevation={0}
                      sx={{
                        ...paperRowSx,
                        borderColor: enabled
                          ? alpha(theme.palette.success.main, isDark ? 0.45 : 0.35)
                          : alpha(theme.palette.text.primary, isDark ? 0.14 : 0.08),
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ md: "center" }}
                        justifyContent="space-between"
                      >
                        <Stack direction="row" spacing={1.4} alignItems="center">
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 0,
                              display: "grid",
                              placeItems: "center",
                              background: alpha(tintColor, isDark ? 0.18 : 0.12),
                              border: `1px solid ${alpha(tintColor, isDark ? 0.22 : 0.16)}`,
                              color: isDark ? alpha("#F8FAFC", 0.95) : theme.palette.text.primary,
                            }}
                          >
                            {c.icon}
                          </Box>

                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography sx={{ fontWeight: 950, color: textPrimary }}>{c.title}</Typography>

                              {c.requiredForAI && (
                                <Chip
                                  size="small"
                                  label="Required for AI"
                                  sx={{
                                    fontWeight: 950,
                                    borderRadius: 0,
                                    background: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12),
                                    border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.1)}`,
                                    color: isDark ? alpha("#E2E8F0", 0.9) : theme.palette.text.primary,
                                  }}
                                />
                              )}

                              {c.risk && (
                                <Chip
                                  size="small"
                                  label={`Sensitivity: ${c.risk}`}
                                  sx={{
                                    fontWeight: 950,
                                    borderRadius: 0,
                                    background: alpha(tintColor, isDark ? 0.18 : 0.12),
                                    border: `1px solid ${alpha(tintColor, isDark ? 0.22 : 0.16)}`,
                                    color: isDark ? alpha("#E2E8F0", 0.9) : theme.palette.text.primary,
                                  }}
                                />
                              )}
                            </Stack>

                            <Typography variant="body2" sx={{ color: textSecondary }}>
                              {c.description}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 900,
                                color: isDark ? alpha("#E2E8F0", 0.62) : theme.palette.text.secondary,
                              }}
                            >
                              AI use: {c.aiUse}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={enabled}
                                onChange={() => toggle(c.key)}
                                color="primary"
                                disabled={loading || saving}
                              />
                            }
                            label={enabled ? "Enabled" : "Disabled"}
                            sx={{
                              userSelect: "none",
                              "& .MuiFormControlLabel-label": { fontWeight: 900, color: textPrimary },
                            }}
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>

              <Divider sx={{ my: 2.5, opacity: isDark ? 0.15 : 0.55 }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
              >
                <Typography variant="body2" sx={{ color: textSecondary }}>
                  Tip: Turn on <b>AI processing</b> + <b>Profile basics</b> to unlock AI Insights.
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    onClick={save}
                    variant="contained"
                    color="success"
                    disabled={loading || saving}
                    sx={{
                      borderRadius: 0,
                      fontWeight: 950,
                      px: 2.2,
                      boxShadow: "0 14px 30px rgba(34,197,94,0.20)",
                      "&:active": { transform: "scale(0.98)" },
                    }}
                  >
                    {saving ? "Saving..." : "Save Consent Settings"}
                  </Button>

                  <Button
                    component={Link}
                    href="/insights"
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    sx={{ borderRadius: 0, fontWeight: 950 }}
                    onClick={() => {
                      if (!aiReady) {
                        setToast({
                          open: true,
                          msg: "AI Insights is locked until you enable Profile basics + AI processing.",
                          type: "warning",
                        });
                      }
                    }}
                  >
                    Go to AI Insights
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={2400}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          severity={toast.type}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ borderRadius: 0 }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
