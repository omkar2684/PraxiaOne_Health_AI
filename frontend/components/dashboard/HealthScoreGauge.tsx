"use client";

import { useMemo } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Typography, Chip, Stack } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import { motion } from "framer-motion";
import type { HealthScore } from "@/types/dashboard";

interface HealthScoreGaugeProps {
  data: HealthScore;
  size?: number;
}

const RISK_COLORS: Record<string, string> = {
  low: "#22c55e",
  moderate: "#f59e0b",
  high: "#ef4444",
  critical: "#dc2626",
};

const RISK_LABELS: Record<string, string> = {
  low: "Low Risk",
  moderate: "Moderate Risk",
  high: "High Risk",
  critical: "Critical Risk",
};

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToXY(cx, cy, r, startDeg);
  const end = polarToXY(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function HealthScoreGauge({ data, size = 220 }: HealthScoreGaugeProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const clampedScore = Math.max(0, Math.min(100, data.score));
  const riskColor = RISK_COLORS[data.risk_level] ?? "#22c55e";

  // Arc from -135° to +135° = 270° total range
  const startDeg = -135;
  const totalDeg = 270;
  const fillDeg = startDeg + (clampedScore / 100) * totalDeg;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const trackPath = describeArc(cx, cy, r, startDeg, startDeg + totalDeg);
  const fillPath = describeArc(cx, cy, r, startDeg, fillDeg);

  const strokeWidth = size * 0.065;
  const trackColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  const TrendIcon =
    data.trend === "improving" ? TrendingUpIcon :
    data.trend === "declining" ? TrendingDownIcon : RemoveIcon;
  const trendColor =
    data.trend === "improving" ? "#22c55e" :
    data.trend === "declining" ? "#ef4444" : "#94a3b8";

  const confidencePct = useMemo(() => Math.round(data.confidence * 100), [data.confidence]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
      {/* SVG Gauge */}
      <Box sx={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ overflow: "visible" }}>
          {/* Glow filter */}
          <defs>
            <filter id="gauge-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={theme.palette.primary.main} />
              <stop offset="100%" stopColor={riskColor} />
            </linearGradient>
          </defs>

          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Animated fill arc */}
          <motion.path
            d={fillPath}
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#gauge-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />

          {/* Center score */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isDark ? "#f1f5f9" : "#0f172a"}
            fontSize={size * 0.19}
            fontWeight="900"
            fontFamily="Inter, ui-sans-serif"
          >
            {clampedScore}
          </text>
          <text
            x={cx}
            y={cy + size * 0.1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isDark ? "rgba(241,245,249,0.55)" : "rgba(15,23,42,0.5)"}
            fontSize={size * 0.072}
            fontFamily="Inter, ui-sans-serif"
          >
            / 100
          </text>
        </svg>
      </Box>

      {/* Labels */}
      <Stack spacing={0.8} alignItems="center">
        {/* Risk Level */}
        <Chip
          label={RISK_LABELS[data.risk_level]}
          size="small"
          sx={{
            fontWeight: 800,
            background: alpha(riskColor, isDark ? 0.22 : 0.14),
            color: riskColor,
            border: `1px solid ${alpha(riskColor, 0.35)}`,
            fontSize: 12,
          }}
        />

        {/* Trend */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
          <Typography variant="caption" sx={{ color: trendColor, fontWeight: 700 }}>
            {data.trend_percentage > 0 ? "+" : ""}{data.trend_percentage.toFixed(1)}%{" "}
            <span style={{ opacity: 0.7, fontWeight: 500 }}>vs last period</span>
          </Typography>
        </Stack>

        {/* Confidence */}
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 600 }}>
          AI Confidence: {confidencePct}%
        </Typography>
      </Stack>
    </Box>
  );
}
