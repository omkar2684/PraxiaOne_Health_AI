"use client";

import { alpha, useTheme } from "@mui/material/styles";
import {
  Box, Card, CardContent, Typography, Stack, Chip, Alert, Grid,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WatchIcon from "@mui/icons-material/Watch";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import {
  LineChart, Line, ResponsiveContainer, Tooltip as RTooltip,
} from "recharts";
import { motion } from "framer-motion";
import type { PhysiologySnapshot } from "@/types/dashboard";

interface PhysiologySnapshotCardProps {
  data: PhysiologySnapshot;
}

interface VitalMetricProps {
  label: string;
  value: string | number;
  unit: string;
  trend?: "up" | "down" | "flat";
  trendGoodDirection?: "up" | "down"; // which direction is "good"
  sparkData?: number[];
  color: string;
}

function VitalMetric({ label, value, unit, trend, trendGoodDirection, sparkData, color }: VitalMetricProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const isGood = trend ? (
    (trendGoodDirection === "up" && trend === "up") ||
    (trendGoodDirection === "down" && trend === "down")
  ) : undefined;
  const trendColor = isGood === undefined ? color : (isGood ? "#22c55e" : "#ef4444");
  const TrendIcon = trend === "up" ? TrendingUpIcon : trend === "down" ? TrendingDownIcon : null;

  const chartData = sparkData?.map((v, i) => ({ i, v })) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          p: 1.8,
          borderRadius: 2.5,
          border: `1px solid ${alpha(color, isDark ? 0.25 : 0.2)}`,
          background: isDark
            ? alpha(color, 0.07)
            : alpha(color, 0.05),
          height: "100%",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.65, fontSize: 11 }}>
              {label}
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: 22, lineHeight: 1.1, color }}>
              {value}
              <span style={{ fontSize: 12, marginLeft: 3, fontWeight: 600, opacity: 0.7 }}>
                {unit}
              </span>
            </Typography>
          </Box>
          {TrendIcon && (
            <TrendIcon sx={{ fontSize: 18, color: trendColor, mt: 0.3 }} />
          )}
        </Stack>

        {/* Sparkline */}
        {sparkData && sparkData.length > 1 && (
          <Box sx={{ mt: 1, height: 36 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={1000}
                />
                <RTooltip
                  contentStyle={{
                    background: isDark ? "#1e293b" : "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(val: number | undefined) => [`${val ?? 0} ${unit}`, label] as [string, string]}
                  labelFormatter={() => ""}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </motion.div>
  );
}

export default function PhysiologySnapshotCard({ data }: PhysiologySnapshotCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isSyncStale = data.sync_age_hours > 24;

  const syncTime = new Date(data.last_sync).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  const vitals: VitalMetricProps[] = [
    {
      label: "HRV",
      value: data.hrv_ms,
      unit: "ms",
      trend: data.hrv_trend,
      trendGoodDirection: "up",
      sparkData: data.sparklines?.hrv,
      color: "#7c3aed",
    },
    {
      label: "Resting HR",
      value: data.resting_hr,
      unit: "bpm",
      trend: data.resting_hr_trend,
      trendGoodDirection: "down",
      sparkData: data.sparklines?.resting_hr,
      color: "#ef4444",
    },
    {
      label: "Sleep Score",
      value: data.sleep_score,
      unit: "/100",
      sparkData: data.sparklines?.sleep_score,
      color: "#3b82f6",
    },
    {
      label: "Recovery",
      value: data.recovery_score,
      unit: "/100",
      sparkData: data.sparklines?.recovery_score,
      color: "#22c55e",
    },
    {
      label: "Stress Load",
      value: data.stress_load,
      unit: "/100",
      sparkData: data.sparklines?.stress_load,
      color: "#f59e0b",
    },
    {
      label: "SpO₂",
      value: data.spo2_percent.toFixed(1),
      unit: "%",
      color: "#0ea5e9",
    },
    {
      label: "Respiration",
      value: data.respiration_rate.toFixed(1),
      unit: "br/min",
      color: "#14b8a6",
    },
    {
      label: "Skin Temp",
      value: data.skin_temp_celsius.toFixed(1),
      unit: "°C",
      color: "#f97316",
    },
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
      <Box sx={{ height: 4, background: `linear-gradient(90deg, #7c3aed, #3b82f6, #22c55e)` }} />

      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FavoriteIcon sx={{ color: "#ef4444", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Physiology Snapshot</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <WatchIcon sx={{ fontSize: 16, opacity: 0.5 }} />
            <Chip
              label={isSyncStale ? "Sync Overdue" : `Synced ${syncTime}`}
              size="small"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                background: alpha(isSyncStale ? "#ef4444" : "#22c55e", isDark ? 0.18 : 0.12),
                color: isSyncStale ? "#ef4444" : "#22c55e",
                border: `1px solid ${alpha(isSyncStale ? "#ef4444" : "#22c55e", 0.3)}`,
              }}
            />
          </Stack>
        </Stack>

        {/* Sync Warning */}
        {isSyncStale && (
          <Alert
            icon={<WifiOffIcon />}
            severity="warning"
            sx={{ mb: 2, borderRadius: 2, py: 0.5 }}
          >
            Data may be incomplete — wearable last synced over 24 hours ago
          </Alert>
        )}

        {/* Vitals Grid */}
        <Grid container spacing={1.5}>
          {vitals.map((v) => (
            <Grid key={v.label} size={{ xs: 6, sm: 4, md: 3 }}>
              <VitalMetric {...v} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
