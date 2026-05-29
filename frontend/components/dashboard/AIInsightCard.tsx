"use client";

import { useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box, Card, CardContent, Typography, Stack, Chip,
  Collapse, Button, Divider,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import HubIcon from "@mui/icons-material/Hub";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LinkIcon from "@mui/icons-material/Link";
import { motion, AnimatePresence } from "framer-motion";
import type { AIInsight } from "@/types/dashboard";

const TYPE_CONFIG = {
  positive: { color: "#22c55e", icon: TrendingUpIcon, label: "Positive Trend" },
  negative: { color: "#ef4444", icon: TrendingDownIcon, label: "Risk Signal" },
  relationship: { color: "#7c3aed", icon: HubIcon, label: "Relationship Intelligence" },
  recommendation: { color: "#0ea5e9", icon: AutoAwesomeIcon, label: "AI Recommendation" },
};

const EVIDENCE_COLORS = {
  strong: "#22c55e",
  moderate: "#f59e0b",
  preliminary: "#94a3b8",
};

interface AIInsightCardProps {
  insights: AIInsight[];
}

function InsightItem({ insight, index }: { insight: AIInsight; index: number }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [expanded, setExpanded] = useState(false);

  const config = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.positive;
  const IconComp = config.icon;
  const evidenceColor = EVIDENCE_COLORS[insight.evidence_strength] ?? "#94a3b8";
  const confidencePct = Math.round(insight.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Box
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${alpha(config.color, isDark ? 0.28 : 0.22)}`,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(config.color, 0.08)}, ${alpha("#020617", 0.6)})`
            : `linear-gradient(135deg, ${alpha(config.color, 0.06)}, ${alpha("#fff", 0.8)})`,
          overflow: "hidden",
          mb: 1.5,
          transition: "box-shadow 0.2s",
          "&:hover": {
            boxShadow: `0 8px 30px ${alpha(config.color, 0.2)}`,
          },
        }}
      >
        {/* Accent line */}
        <Box sx={{ height: 3, background: config.color, opacity: 0.8 }} />

        <Box sx={{ p: 1.8 }}>
          {/* Top row */}
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Box
              sx={{
                p: 0.8,
                borderRadius: 1.5,
                background: alpha(config.color, 0.15),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                mt: 0.2,
              }}
            >
              <IconComp sx={{ fontSize: 16, color: config.color }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, mb: 0.5 }}>
                {insight.headline}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.75, lineHeight: 1.4 }}>
                {insight.explanation}
              </Typography>
            </Box>
          </Stack>

          {/* Badges */}
          <Stack direction="row" spacing={1} mt={1.2} flexWrap="wrap">
            <Chip
              label={config.label}
              size="small"
              sx={{
                fontSize: 10,
                fontWeight: 700,
                background: alpha(config.color, 0.15),
                color: config.color,
                height: 22,
              }}
            />
            <Chip
              label={`Evidence: ${insight.evidence_strength}`}
              size="small"
              sx={{
                fontSize: 10,
                fontWeight: 700,
                background: alpha(evidenceColor, 0.13),
                color: evidenceColor,
                height: 22,
              }}
            />
            <Chip
              label={`${confidencePct}% Confidence`}
              size="small"
              sx={{
                fontSize: 10,
                fontWeight: 700,
                background: alpha(theme.palette.text.primary, isDark ? 0.10 : 0.06),
                height: 22,
              }}
            />
          </Stack>

          {/* Expandable: Why it matters */}
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{
              mt: 1,
              fontSize: 11,
              fontWeight: 700,
              color: config.color,
              textTransform: "none",
              p: 0,
              "&:hover": { background: "transparent", opacity: 0.8 },
            }}
          >
            Why it matters
          </Button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 2,
                    background: isDark ? alpha("#ffffff", 0.04) : alpha(config.color, 0.05),
                    border: `1px solid ${alpha(config.color, 0.15)}`,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.8 }}>
                    {insight.why_it_matters}
                  </Typography>

                  {insight.data_contributors.length > 0 && (
                    <>
                      <Typography variant="caption" sx={{ opacity: 0.6, display: "block", fontWeight: 600, mb: 0.5 }}>
                        Data Sources Used:
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {insight.data_contributors.map((d, i) => (
                          <Chip
                            key={i}
                            icon={<LinkIcon sx={{ fontSize: "10px !important" }} />}
                            label={d}
                            size="small"
                            sx={{
                              fontSize: 9,
                              height: 20,
                              fontWeight: 600,
                              background: alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05),
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </motion.div>
  );
}

export default function AIInsightCard({ insights }: AIInsightCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: isDark
          ? `linear-gradient(135deg, ${alpha("#0f172a", 0.92)}, ${alpha("#020617", 0.80)})`
          : `linear-gradient(135deg, ${alpha("#fafffe", 0.92)}, ${alpha("#f0f9ff", 0.80)})`,
        border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.15)}`,
        backdropFilter: "blur(16px)",
        boxShadow: isDark
          ? `0 20px 80px rgba(0,0,0,0.5), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`
          : `0 20px 60px rgba(2,6,23,0.10)`,
      }}
    >
      {/* Animated gradient bar */}
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, #7c3aed, #22c55e, #ef4444)`,
          backgroundSize: "300% 100%",
          animation: "gradientShift 4s ease infinite",
          "@keyframes gradientShift": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
          },
        }}
      />

      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha("#7c3aed", 0.2)})`,
              display: "flex",
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 15 }}>AI Priority Insights</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              GraphRAG · {insights.length} active signals
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2, opacity: 0.12 }} />

        {/* Insight Items */}
        {insights.map((insight, i) => (
          <InsightItem key={insight.id} insight={insight} index={i} />
        ))}
      </CardContent>
    </Card>
  );
}
