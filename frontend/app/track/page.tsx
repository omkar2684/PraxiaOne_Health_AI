"use client";

import { useEffect, useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Box, Card, CardContent, Grid, Typography, Stack, Button, Chip,
  LinearProgress, IconButton, Divider, CircularProgress, Alert, Snackbar
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ScienceIcon from "@mui/icons-material/Science";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import CakeIcon from "@mui/icons-material/Cake";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BedtimeIcon from "@mui/icons-material/Bedtime";

import { apiFetch } from "@/lib/api";
import { requireAuth } from "@/lib/requireAuth";

// Map strings to icons
const getIcon = (name: string, color: any) => {
  switch (name) {
    case "directions_walk": return <DirectionsWalkIcon color={color} />;
    case "cake": return <CakeIcon color={color} />;
    case "water_drop": return <WaterDropIcon color={color} />;
    case "fitness_center": return <FitnessCenterIcon color={color} />;
    case "trending_up": return <TrendingUpIcon color={color} />;
    case "trending_flat": return <TrendingFlatIcon color={color} />;
    case "bedtime": return <BedtimeIcon color={color} />;
    case "event": default: return <DateRangeIcon color={color} />;
  }
};

export default function TrackProgressPage() {
  requireAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const handleAction = (msg: string) => {
    setToast(msg);
  };

  const handleUpdateStatus = (actionId: number, status: string, status_color: string) => {
    setData((prev: any) => {
      const newActions = prev.actions.map((act: any) => 
        act.id === actionId ? { ...act, status, status_color } : act
      );
      
      const completed = newActions.filter((a: any) => a.status === "On Track").length;
      const partial = newActions.filter((a: any) => a.status === "Partial").length;
      const not_started = newActions.filter((a: any) => a.status === "Not Started").length;
      const total = newActions.length;
      const progress_percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const newSummary = {
        completed,
        partial,
        not_started,
        total,
        progress_percent
      };

      return { ...prev, actions: newActions, weekly_summary: newSummary };
    });
    setToast(`Marked as ${status}`);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const result = await apiFetch("/track-progress/");
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load progress data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const surfaceCard = {
    borderRadius: 0,
    border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.08)}`,
    boxShadow: isDark ? "0 28px 110px rgba(0,0,0,0.55)" : "0 24px 80px rgba(2,6,23,0.10)",
    background: isDark
      ? `linear-gradient(180deg, ${alpha("#0f172a", 0.8)}, ${alpha("#020617", 0.72)})`
      : `linear-gradient(180deg, ${alpha("#ffffff", 0.82)}, ${alpha("#ffffff", 0.58)})`,
    backdropFilter: "blur(12px)",
  };

  const pageBg = isDark
    ? `radial-gradient(1200px 650px at 15% 0%, ${alpha(theme.palette.primary.main, 0.18)}, transparent 60%),
       radial-gradient(900px 520px at 85% 20%, ${alpha(theme.palette.secondary.main, 0.18)}, transparent 55%),
       linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`
    : `radial-gradient(1200px 650px at 15% 0%, ${alpha(theme.palette.primary.main, 0.1)}, transparent 60%),
       radial-gradient(900px 520px at 85% 20%, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 55%),
       linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, minHeight: "calc(100vh - 64px)", background: pageBg }}>
      {/* Header */}
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "flex-end" }} sx={{ mb: 3 }} spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 950 }}>Progress & Follow-Through</Typography>
          <Typography sx={{ color: isDark ? alpha("#E2E8F0", 0.72) : theme.palette.text.secondary }}>
            Track your actions. Improve your health.
          </Typography>
        </Box>
        <Stack direction="row" spacing={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DateRangeIcon color="action" />
            <Box>
              <Typography variant="caption" color="textSecondary" display="block">Week 2 of Plan</Typography>
              <Typography variant="body2" fontWeight={700}>May 6 – May 12</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <ScienceIcon color="primary" />
            <Box>
              <Typography variant="caption" color="textSecondary" display="block">Next Lab Check</Typography>
              <Typography variant="body2" fontWeight={700} color="primary.main">{data.re_test.days_left} days</Typography>
            </Box>
          </Stack>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Section 1: Weekly Summary */}
          <Card sx={{ ...surfaceCard, mb: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack direction={{ xs: "column", md: "row" }} alignItems="center" justifyContent="space-between" spacing={3}>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    You completed <span style={{ fontSize: 26, color: theme.palette.text.primary, fontWeight: 900 }}>{data.weekly_summary.completed}</span> of {data.weekly_summary.total} actions this week
                  </Typography>
                  <Box sx={{ width: 220, height: 24, background: alpha(theme.palette.text.primary, 0.08), borderRadius: 1.5, position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ width: `${data.weekly_summary.progress_percent}%`, height: '100%', background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" fontWeight={800} color="white">{data.weekly_summary.progress_percent}%</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Stack direction="row" spacing={{ xs: 2, sm: 4 }} alignItems="center">
                  <Box textAlign="center">
                    <CheckCircleOutlineIcon color="success" sx={{ fontSize: 28, mb: 0.5 }} />
                    <Typography variant="caption" display="block" color="textSecondary" fontWeight={600}>Completed</Typography>
                    <Typography variant="h5" fontWeight={800} color="success.main">{data.weekly_summary.completed}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ opacity: 0.5, my: 1 }} />
                  <Box textAlign="center">
                    <RemoveCircleOutlineIcon color="warning" sx={{ fontSize: 28, mb: 0.5 }} />
                    <Typography variant="caption" display="block" color="textSecondary" fontWeight={600}>Partial</Typography>
                    <Typography variant="h5" fontWeight={800} color="warning.main">{data.weekly_summary.partial}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ opacity: 0.5, my: 1 }} />
                  <Box textAlign="center">
                    <CancelOutlinedIcon color="error" sx={{ fontSize: 28, mb: 0.5 }} />
                    <Typography variant="caption" display="block" color="textSecondary" fontWeight={600}>Not Started</Typography>
                    <Typography variant="h5" fontWeight={800} color="error.main">{data.weekly_summary.not_started}</Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Section 2: Action Tracker */}
          <Card sx={{ ...surfaceCard, height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Your Action Tracker</Typography>
              <Stack spacing={0} divider={<Divider sx={{ my: 2 }} />}>
                
                {data.actions.map((action: any) => (
                  <Stack key={action.id} direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <IconButton size="small"><ChevronRightIcon /></IconButton>
                      <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: alpha(action.color_hex, 0.1) }}>
                        {getIcon(action.icon, action.status_color)}
                      </Box>
                      <Box>
                        <Typography fontWeight={700}>{action.title}</Typography>
                        <Typography variant="body2" color="textSecondary">{action.subtext}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Chip label={action.status} color={action.status_color as any} size="small" sx={{ borderRadius: 1, fontWeight: 700 }} />
                      
                      {action.is_actionable ? (
                        <Button variant="contained" color="primary" sx={{ borderRadius: 1, fontWeight: 700 }} onClick={() => handleAction("Opening scheduler...")}>
                          Schedule Now
                        </Button>
                      ) : (
                        <Stack direction="row" spacing={1}>
                          <IconButton color="success" onClick={() => handleUpdateStatus(action.id, "On Track", "success")}><CheckCircleOutlineIcon /></IconButton>
                          <IconButton color="warning" onClick={() => handleUpdateStatus(action.id, "Partial", "warning")}><RemoveCircleOutlineIcon /></IconButton>
                          <IconButton color="error" onClick={() => handleUpdateStatus(action.id, "Not Started", "error")}><CancelOutlinedIcon /></IconButton>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
              <Button variant="text" sx={{ mt: 2, fontWeight: 700 }} onClick={() => handleAction("Loading history...")}>View All Actions & History</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          {/* Section 3: AI Behavior Insight */}
          <Card sx={{ ...surfaceCard, mb: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <AutoAwesomeIcon color="primary" />
                <Typography variant="h6" fontWeight={800}>What We’re Seeing</Typography>
              </Stack>
              <Stack spacing={2.5}>
                {data.insights.map((insight: any, i: number) => (
                  <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
                    {getIcon(insight.icon, insight.color)}
                    <Box>
                      <Typography variant="body2" dangerouslySetInnerHTML={{ __html: insight.text.replace(/(\d+%)/g, `<strong style="color: ${theme.palette.success.main}">$1</strong>`) }} />
                      {insight.subtext && <Typography variant="caption" color="textSecondary">{insight.subtext}</Typography>}
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Section 4: Outcome Projection */}
          <Card sx={{ ...surfaceCard, mb: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <ScienceIcon color="primary" />
                <Typography variant="h6" fontWeight={800}>If you stay on track</Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                <TrendingUpIcon color="success" fontSize="large" />
                <Box>
                  <Typography variant="body2" fontWeight={700} dangerouslySetInnerHTML={{ __html: data.projection.text.replace(/glucose levels/gi, `<span style="color: ${theme.palette.success.main}">glucose levels</span>`) }} />
                  <Typography variant="caption" color="textSecondary">{data.projection.subtext}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Section 5: Re-Test Trigger */}
          <Card sx={{ ...surfaceCard, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
            <CardContent>
              <Stack spacing={2} alignItems="flex-start">
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <ScienceIcon color="primary" />
                    <Typography variant="h6" fontWeight={800} color="primary.main">Next Step: Re-Test</Typography>
                  </Stack>
                  <Typography variant="body2" dangerouslySetInnerHTML={{ __html: data.re_test.text.replace(/(\d+ days)/, "<strong>\$1</strong>") }} />
                </Box>
                <Button variant="contained" color="primary" fullWidth sx={{ py: 1.5, borderRadius: 1, fontWeight: 800 }} onClick={() => handleAction("Redirecting to LabCorp scheduling...")}>
                  Book Follow-Up Test →
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
