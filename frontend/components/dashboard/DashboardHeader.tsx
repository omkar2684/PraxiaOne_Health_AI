"use client";

import { useEffect, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box, Stack, Typography, IconButton, Badge, Avatar, Chip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRouter } from "next/navigation";
import { getStoredUsername } from "@/lib/api";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  notificationCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function useTimeGreeting() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  return { greeting, dateStr, timeStr };
}

export default function DashboardHeader({
  notificationCount = 2,
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const router = useRouter();
  const { greeting, dateStr, timeStr } = useTimeGreeting();
  const username = getStoredUsername() || "User";

  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2.5,
          mb: 0.5,
          borderRadius: 3,
          background: isDark
            ? `linear-gradient(135deg, ${alpha("#0f172a", 0.85)}, ${alpha("#1e293b", 0.75)})`
            : `linear-gradient(135deg, ${alpha("#ffffff", 0.90)}, ${alpha("#f0f9ff", 0.80)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12)}`,
          backdropFilter: "blur(14px)",
          boxShadow: isDark
            ? `0 12px 50px rgba(0,0,0,0.4), inset 0 1px 0 ${alpha("#ffffff", 0.05)}`
            : `0 12px 40px rgba(2,6,23,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          {/* Left — Greeting */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.2}>
              {/* Praxia logo pulse */}
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: theme.palette.primary.main,
                  boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}` },
                    "70%": { boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0)}` },
                    "100%": { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}` },
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: theme.palette.primary.main,
                  fontSize: 10,
                }}
              >
                Praxia5 · Live
              </Typography>
            </Stack>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 950,
                background: isDark
                  ? `linear-gradient(135deg, #f1f5f9, ${alpha(theme.palette.primary.main, 0.9)})`
                  : `linear-gradient(135deg, #0f172a, ${theme.palette.primary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.2,
              }}
            >
              {greeting}, {displayName}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.6, mt: 0.3, fontWeight: 500 }}>
              {dateStr} · {timeStr}
            </Typography>
          </Box>

          {/* Right — Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label="AI Online"
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: 11,
                background: alpha("#22c55e", isDark ? 0.18 : 0.12),
                color: "#22c55e",
                border: `1px solid ${alpha("#22c55e", 0.3)}`,
                "& .MuiChip-label": { px: 1.2 },
              }}
            />

            {onRefresh && (
              <IconButton
                size="small"
                onClick={onRefresh}
                sx={{
                  color: isDark ? alpha("#e2e8f0", 0.7) : theme.palette.text.secondary,
                  animation: isRefreshing ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
                aria-label="Refresh dashboard data"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}

            <IconButton
              size="small"
              onClick={() => router.push("/notifications")}
              aria-label={`${notificationCount} notifications`}
              sx={{ color: isDark ? alpha("#e2e8f0", 0.7) : theme.palette.text.secondary }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>

            <IconButton
              size="small"
              onClick={() => router.push("/profile")}
              aria-label="Go to profile"
              sx={{ color: isDark ? alpha("#e2e8f0", 0.7) : theme.palette.text.secondary }}
            >
              <AccountCircleIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </motion.div>
  );
}
