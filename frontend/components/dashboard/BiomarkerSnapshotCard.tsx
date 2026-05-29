"use client";

import { alpha, useTheme } from "@mui/material/styles";
import {
  Box, Card, CardContent, Typography, Stack, Chip,
  Divider, Tooltip, Alert,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { motion } from "framer-motion";
import type { BiomarkerSnapshot, BiomarkerItem } from "@/types/dashboard";

const STATUS_COLORS: Record<string, string> = {
  in_range: "#22c55e",
  borderline: "#f59e0b",
  high: "#ef4444",
  low: "#3b82f6",
  critical: "#dc2626",
};

const STATUS_LABELS: Record<string, string> = {
  in_range: "Normal",
  borderline: "Borderline",
  high: "High",
  low: "Low",
  critical: "Critical",
};

function BiomarkerChip({ item }: { item: BiomarkerItem }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const color = STATUS_COLORS[item.status] ?? "#94a3b8";

  const TrendIcon =
    item.trend === "up" ? TrendingUpIcon :
    item.trend === "down" ? TrendingDownIcon : RemoveIcon;

  const trendGood =
    (item.status === "high" && item.trend === "down") ||
    (item.status === "low" && item.trend === "up") ||
    (item.status === "in_range");

  const trendColor = trendGood ? "#22c55e" : (item.status === "in_range" ? "#94a3b8" : "#ef4444");

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{item.name}</Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            Value: {item.value} {item.unit}
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            Reference: {item.reference_low}–{item.reference_high === 999 ? "∞" : item.reference_high} {item.unit}
          </Typography>
          {item.trend_percentage !== undefined && (
            <Typography variant="caption" sx={{ display: "block" }}>
              Change: {item.trend_percentage > 0 ? "+" : ""}{item.trend_percentage}% vs last
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.04 }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${alpha(color, 0.35)}`,
            background: isDark
              ? alpha(color, 0.10)
              : alpha(color, 0.07),
            cursor: "default",
            minWidth: 110,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.3}>
            <Typography variant="caption" sx={{ fontWeight: 800, color, fontSize: 11 }}>
              {STATUS_LABELS[item.status]}
            </Typography>
            <TrendIcon sx={{ fontSize: 14, color: trendColor }} />
          </Stack>
          <Typography sx={{ fontWeight: 900, fontSize: 18, lineHeight: 1 }}>
            {item.value}
            <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 2, opacity: 0.7 }}>
              {item.unit}
            </span>
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.75, fontWeight: 600 }}>
            {item.name}
          </Typography>
        </Box>
      </motion.div>
    </Tooltip>
  );
}

interface BiomarkerSnapshotCardProps {
  data: BiomarkerSnapshot;
}

export default function BiomarkerSnapshotCard({ data }: BiomarkerSnapshotCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isFreshnesWarning = data.lab_freshness_days > 180;
  const syncWarning = data.lab_freshness_days > 180;

  const labDateStr = new Date(data.lab_date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

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
      {/* Color bar */}
      <Box sx={{ height: 4, background: `linear-gradient(90deg, #3b82f6, #22c55e, #f59e0b, #ef4444)` }} />

      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ScienceIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography sx={{ fontWeight: 900, fontSize: 15 }}>Biomarker Snapshot</Typography>
          </Stack>
          <Chip
            label={`Lab: ${labDateStr}`}
            size="small"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              background: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.10),
              color: isDark ? alpha("#e2e8f0", 0.85) : theme.palette.text.secondary,
            }}
          />
        </Stack>

        {/* Freshness Warning */}
        {isFreshnesWarning && (
          <Alert
            icon={<WarningAmberIcon />}
            severity="warning"
            sx={{ mb: 2, borderRadius: 2, py: 0.5 }}
          >
            Lab refresh recommended — data is over 180 days old
          </Alert>
        )}

        {/* Summary Stats */}
        <Stack direction="row" spacing={1.5} mb={2.5}>
          {[
            { label: "Total", value: data.total_biomarkers, color: theme.palette.text.primary },
            { label: "In Range", value: data.in_range, color: "#22c55e" },
            { label: "Borderline", value: data.borderline, color: "#f59e0b" },
            { label: "Out of Range", value: data.out_of_range, color: "#ef4444" },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                flex: 1,
                p: 1.2,
                borderRadius: 2,
                background: isDark ? alpha("#ffffff", 0.04) : alpha(stat.color as string, 0.07),
                border: `1px solid ${alpha(stat.color as string, 0.18)}`,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: 20, color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ mb: 2, opacity: 0.15 }} />

        {/* Biomarker Items Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: 1.2,
          }}
        >
          {data.items.map((item) => (
            <BiomarkerChip key={item.id} item={item} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
