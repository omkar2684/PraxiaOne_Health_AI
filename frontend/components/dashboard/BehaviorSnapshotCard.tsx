"use client";

import { alpha, useTheme } from "@mui/material/styles";
import {
  Box, Card, CardContent, Typography, Stack, Grid,
} from "@mui/material";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import { motion } from "framer-motion";
import type { BehaviorSnapshot } from "@/types/dashboard";

interface BehaviorSnapshotCardProps {
  data: BehaviorSnapshot;
}

interface AdherenceRingProps {
  label: string;
  value: number; // 0–100
  color: string;
  size?: number;
}

function AdherenceRing({ label, value, color, size = 90 }: AdherenceRingProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const tier = clamped >= 80 ? "great" : clamped >= 60 ? "good" : clamped >= 40 ? "moderate" : "low";
  const tierColor =
    tier === "great" ? "#22c55e" :
    tier === "good" ? "#3b82f6" :
    tier === "moderate" ? "#f59e0b" : "#ef4444";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8 }}>
      <Box sx={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}
            strokeWidth={8}
          />
          {/* Animated fill */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={tierColor}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - clamped / 100) }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            filter={`drop-shadow(0 0 4px ${tierColor}60)`}
          />
          {/* Center text */}
          <text
            x={cx}
            y={cy + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isDark ? "#f1f5f9" : "#0f172a"}
            fontSize={size * 0.20}
            fontWeight="900"
            fontFamily="Inter, ui-sans-serif"
          >
            {clamped}%
          </text>
        </svg>
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          textAlign: "center",
          opacity: 0.8,
          fontSize: 11,
          maxWidth: size,
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function BehaviorSnapshotCard({ data }: BehaviorSnapshotCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const domains = [
    { label: "Sleep", value: data.sleep_adherence, color: "#3b82f6" },
    { label: "Activity", value: data.activity_adherence, color: "#22c55e" },
    { label: "Nutrition", value: data.nutrition_adherence, color: "#f59e0b" },
    { label: "Medication", value: data.medication_adherence, color: "#7c3aed" },
    { label: "Hydration", value: data.hydration_score, color: "#0ea5e9" },
  ];

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
      <Box sx={{ height: 4, background: `linear-gradient(90deg, #22c55e, #3b82f6, #f59e0b, #7c3aed)` }} />

      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DirectionsRunIcon sx={{ color: "#22c55e", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Behavior Snapshot</Typography>
          </Stack>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              background: alpha("#22c55e", isDark ? 0.15 : 0.10),
              border: `1px solid ${alpha("#22c55e", 0.3)}`,
            }}
          >
            <Typography sx={{ fontWeight: 900, color: "#22c55e", fontSize: 14 }}>
              {data.overall_adherence}%{" "}
              <span style={{ fontWeight: 600, opacity: 0.75, fontSize: 12 }}>Overall</span>
            </Typography>
          </Box>
        </Stack>

        {/* Rings */}
        <Grid container spacing={1} justifyContent="center">
          {domains.map((d) => (
            <Grid key={d.label} size={{ xs: "auto" }}>
              <AdherenceRing label={d.label} value={d.value} color={d.color} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
