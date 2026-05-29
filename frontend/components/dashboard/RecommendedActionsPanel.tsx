"use client";

import { alpha, useTheme } from "@mui/material/styles";
import {
  Box, Card, CardContent, Typography, Stack, Chip,
  Button, LinearProgress,
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import MedicationIcon from "@mui/icons-material/Medication";
import ScienceIcon from "@mui/icons-material/Science";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { motion } from "framer-motion";
import type { AIRecommendation } from "@/types/dashboard";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  activity: <DirectionsRunIcon sx={{ fontSize: 16 }} />,
  medication: <MedicationIcon sx={{ fontSize: 16 }} />,
  lab: <ScienceIcon sx={{ fontSize: 16 }} />,
  appointment: <CalendarMonthIcon sx={{ fontSize: 16 }} />,
  nutrition: <LocalDiningIcon sx={{ fontSize: 16 }} />,
  lifestyle: <BoltIcon sx={{ fontSize: 16 }} />,
};

const URGENCY_CONFIG = {
  critical: { color: "#dc2626", label: "Critical", bg: 0.18 },
  high: { color: "#ef4444", label: "High", bg: 0.14 },
  medium: { color: "#f59e0b", label: "Medium", bg: 0.14 },
  low: { color: "#22c55e", label: "Low", bg: 0.12 },
};

interface RecommendedActionsPanelProps {
  recommendations: AIRecommendation[];
  onOverride?: (id: string) => void;
}

export default function RecommendedActionsPanel({
  recommendations,
  onOverride,
}: RecommendedActionsPanelProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark
          ? `linear-gradient(135deg, ${alpha("#0f172a", 0.85)}, ${alpha("#020617", 0.75)})`
          : `linear-gradient(135deg, ${alpha("#ffffff", 0.88)}, ${alpha("#f8fafc", 0.75)})`,
        border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.12 : 0.07)}`,
        backdropFilter: "blur(12px)",
        boxShadow: isDark ? "0 20px 80px rgba(0,0,0,0.45)" : "0 20px 60px rgba(2,6,23,0.09)",
      }}
    >
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, #dc2626, #ef4444, #f59e0b, #22c55e)`,
        }}
      />

      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: 1.5,
              background: alpha("#f59e0b", 0.15),
              display: "flex",
            }}
          >
            <BoltIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Recommended Actions</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              AI-ranked · {recommendations.length} interventions
            </Typography>
          </Box>
        </Stack>

        {/* Action Items */}
        <Stack spacing={1.5}>
          {recommendations.map((rec, index) => {
            const urgency = URGENCY_CONFIG[rec.urgency] ?? URGENCY_CONFIG.medium;
            const impactPct = Math.round(rec.impact_score * 100);
            const categoryIcon = CATEGORY_ICONS[rec.category] ?? <BoltIcon sx={{ fontSize: 16 }} />;

            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: index * 0.1 }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: `1px solid ${alpha(urgency.color, isDark ? 0.25 : 0.18)}`,
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha(urgency.color, 0.07)}, ${alpha("#020617", 0.5)})`
                      : `linear-gradient(135deg, ${alpha(urgency.color, 0.05)}, ${alpha("#fff", 0.8)})`,
                    transition: "box-shadow 0.2s, transform 0.15s",
                    "&:hover": {
                      boxShadow: `0 8px 25px ${alpha(urgency.color, 0.18)}`,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {/* Rank & Urgency */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {/* Rank badge */}
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: `linear-gradient(135deg, ${urgency.color}, ${alpha(urgency.color, 0.7)})`,
                          flexShrink: 0,
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, fontSize: 12, color: "#fff" }}>
                          {index + 1}
                        </Typography>
                      </Box>

                      {/* Category icon */}
                      <Box sx={{ color: urgency.color }}>{categoryIcon}</Box>

                      <Chip
                        label={urgency.label}
                        size="small"
                        sx={{
                          fontSize: 10,
                          fontWeight: 800,
                          height: 20,
                          background: alpha(urgency.color, urgency.bg),
                          color: urgency.color,
                          border: `1px solid ${alpha(urgency.color, 0.3)}`,
                        }}
                      />
                    </Stack>

                    {/* Impact Score */}
                    <Chip
                      label={`${impactPct}% Impact`}
                      size="small"
                      sx={{
                        fontSize: 10,
                        fontWeight: 800,
                        height: 20,
                        background: alpha(theme.palette.text.primary, isDark ? 0.10 : 0.06),
                      }}
                    />
                  </Stack>

                  {/* Action Text */}
                  <Typography sx={{ fontWeight: 800, fontSize: 13, mb: 0.5, lineHeight: 1.3 }}>
                    {rec.action}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: "block", mb: 1 }}>
                    {rec.rationale}
                  </Typography>

                  {/* Impact bar */}
                  <Box sx={{ mb: 1 }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.4}>
                      <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 600 }}>
                        Expected Improvement
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: urgency.color }}>
                        {rec.expected_improvement}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={impactPct}
                      sx={{
                        height: 5,
                        borderRadius: 999,
                        background: alpha(urgency.color, 0.12),
                        "& .MuiLinearProgress-bar": {
                          background: urgency.color,
                          borderRadius: 999,
                        },
                      }}
                    />
                  </Box>

                  {/* Action buttons */}
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onOverride?.(rec.id)}
                      sx={{
                        fontSize: 11,
                        py: 0.4,
                        px: 1.2,
                        fontWeight: 700,
                        borderColor: alpha(theme.palette.text.primary, 0.2),
                        color: isDark ? alpha("#e2e8f0", 0.7) : theme.palette.text.secondary,
                        textTransform: "none",
                      }}
                    >
                      Override
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
                      sx={{
                        fontSize: 11,
                        py: 0.4,
                        px: 1.5,
                        fontWeight: 800,
                        background: urgency.color,
                        textTransform: "none",
                        boxShadow: `0 4px 12px ${alpha(urgency.color, 0.35)}`,
                        "&:hover": {
                          background: urgency.color,
                          opacity: 0.9,
                          boxShadow: `0 6px 18px ${alpha(urgency.color, 0.4)}`,
                        },
                      }}
                    >
                      Take Action
                    </Button>
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
