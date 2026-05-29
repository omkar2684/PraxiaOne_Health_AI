"use client";

import { alpha, useTheme } from "@mui/material/styles";
import {
  Box, Card, CardContent, Typography, Stack, Chip,
  LinearProgress, Divider,
} from "@mui/material";
import MedicationIcon from "@mui/icons-material/Medication";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ScienceIcon from "@mui/icons-material/Science";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ErrorIcon from "@mui/icons-material/Error";
import { motion } from "framer-motion";
import type { ClinicalSnapshot, ActiveMedication, UpcomingItem, GoalItem } from "@/types/dashboard";

const STATUS_ICONS = {
  scheduled: <ScheduleIcon sx={{ fontSize: 14 }} />,
  overdue: <ErrorIcon sx={{ fontSize: 14, color: "#ef4444" }} />,
  completed: <CheckCircleIcon sx={{ fontSize: 14, color: "#22c55e" }} />,
};

const GOAL_COLORS = {
  on_track: "#22c55e",
  at_risk: "#f59e0b",
  achieved: "#7c3aed",
};

function MedRow({ med }: { med: ActiveMedication }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const color =
    med.adherence_percent >= 85 ? "#22c55e" :
    med.adherence_percent >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          background: isDark ? alpha("#ffffff", 0.03) : alpha("#000", 0.02),
          border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05)}`,
          mb: 1,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 14 }}>{med.name}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              {med.dose} · {med.frequency}
            </Typography>
          </Box>
          <Chip
            label={`${med.adherence_percent}%`}
            size="small"
            sx={{
              fontWeight: 900,
              background: alpha(color, 0.15),
              color,
              border: `1px solid ${alpha(color, 0.3)}`,
              fontSize: 12,
            }}
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={med.adherence_percent}
          sx={{
            height: 5,
            borderRadius: 999,
            background: alpha(color, 0.12),
            "& .MuiLinearProgress-bar": {
              background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
              borderRadius: 999,
            },
          }}
        />
        {med.next_dose && (
          <Typography variant="caption" sx={{ mt: 0.5, display: "block", opacity: 0.6 }}>
            Next dose: {med.next_dose}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}

function UpcomingRow({ item }: { item: UpcomingItem }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dateStr = new Date(item.date).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  return (
    <Stack
      direction="row"
      spacing={1.2}
      alignItems="center"
      sx={{
        py: 1,
        borderBottom: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04)}`,
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Box sx={{ color: item.status === "overdue" ? "#ef4444" : theme.palette.text.secondary }}>
        {STATUS_ICONS[item.status]}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{item.name}</Typography>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>{item.type}</Typography>
      </Box>
      <Chip
        label={dateStr}
        size="small"
        sx={{ fontWeight: 700, fontSize: 11, background: alpha(theme.palette.primary.main, 0.10) }}
      />
    </Stack>
  );
}

interface ClinicalCareCardProps {
  data: ClinicalSnapshot;
}

export default function ClinicalCareCard({ data }: ClinicalCareCardProps) {
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
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${theme.palette.primary.main}, #7c3aed)` }} />
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <MedicationIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
          <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Clinical Care Plan</Typography>
          <Box sx={{ ml: "auto" }}>
            <Chip
              label={`${data.overall_adherence_percent}% Adherence`}
              size="small"
              sx={{
                fontWeight: 900,
                background: alpha("#22c55e", isDark ? 0.18 : 0.12),
                color: "#22c55e",
                border: `1px solid ${alpha("#22c55e", 0.3)}`,
              }}
            />
          </Box>
        </Stack>

        {/* Medications */}
        <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1, display: "block", mb: 1 }}>
          Active Medications
        </Typography>
        {data.active_medications.map((m) => <MedRow key={m.id} med={m} />)}

        <Divider sx={{ my: 2, opacity: 0.12 }} />

        {/* Upcoming Labs */}
        {data.upcoming_labs.length > 0 && (
          <>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <ScienceIcon sx={{ fontSize: 16, opacity: 0.6 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1 }}>
                Upcoming Labs
              </Typography>
            </Stack>
            {data.upcoming_labs.map((l) => <UpcomingRow key={l.id} item={l} />)}
          </>
        )}

        {/* Upcoming Appointments */}
        {data.upcoming_appointments.length > 0 && (
          <>
            <Stack direction="row" spacing={1} alignItems="center" mt={1.5} mb={1}>
              <CalendarMonthIcon sx={{ fontSize: 16, opacity: 0.6 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1 }}>
                Appointments
              </Typography>
            </Stack>
            {data.upcoming_appointments.map((a) => <UpcomingRow key={a.id} item={a} />)}
          </>
        )}

        <Divider sx={{ my: 2, opacity: 0.12 }} />

        {/* Target Goals */}
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          <TrackChangesIcon sx={{ fontSize: 16, opacity: 0.6 }} />
          <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1 }}>
            Target Goals
          </Typography>
        </Stack>
        {data.target_goals.map((g) => {
          const color = GOAL_COLORS[g.trend] ?? "#22c55e";
          return (
            <Box key={g.id} sx={{ mb: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{g.label}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color }}>
                  {g.current} → {g.target} {g.unit}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={g.progress_percent}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  background: alpha(color, 0.12),
                  "& .MuiLinearProgress-bar": {
                    background: color,
                    borderRadius: 999,
                  },
                }}
              />
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}
