"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { alpha, useTheme } from "@mui/material/styles";
import { ThemeCtx, ThemeName } from "@/app/providers";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Tooltip,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import { getStoredUsername, isLoggedIn, logout } from "@/lib/api";

function initialsFromName(name: string) {
  const clean = (name || "").trim();
  if (!clean) return "U";
  const parts = clean.split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "U";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

export default function TopNav() {
  const router = useRouter();
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === "dark";

  const { themeName, setThemeName } = useContext(ThemeCtx);

  const [mounted, setMounted] = useState(false);
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    setMounted(true);

    const sync = () => {
      const isAuth = isLoggedIn();
      setLogged(isAuth);
      setUsername(isAuth ? getStoredUsername() : "");
    };

    sync();

    const onAuthChanged = () => sync();
    window.addEventListener("praxia-auth-changed", onAuthChanged);
    window.addEventListener("storage", onAuthChanged);

    return () => {
      window.removeEventListener("praxia-auth-changed", onAuthChanged);
      window.removeEventListener("storage", onAuthChanged);
    };
  }, []);

  const avatarText = useMemo(() => initialsFromName(username), [username]);
  const open = Boolean(anchorEl);

  const onLogout = () => {
    logout();
    setAnchorEl(null);
    router.push("/login");
  };

  const shellSx = {
    position: "relative" as const,
    zIndex: 10,
    px: { xs: 2, md: 5 },
    py: 3, // slightly taller
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "transparent",
    borderBottom: "1px solid rgba(0,0,0,0.05)"
  };

  if (!mounted) {
    return (
      <Box sx={shellSx}>
        <Box sx={{ display: "flex", gap: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={shellSx}>
      {/* Left Top Links Removed as requested */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }} />

      {/* Profile & Icons */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={themeName}
            onChange={(e) => setThemeName(e.target.value as ThemeName)}
            sx={{
              borderRadius: 0,
              fontWeight: 700,
              fontSize: 15,
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              color: isDark ? "#fff" : "#000",
              height: 32,
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            }}
          >
            <MenuItem value="light" sx={{ fontSize: 15, fontWeight: 700 }}>Light Theme</MenuItem>
            <MenuItem value="dark" sx={{ fontSize: 15, fontWeight: 700 }}>Dark Theme</MenuItem>
            <MenuItem value="aurora" sx={{ fontSize: 15, fontWeight: 700 }}>Aurora Theme</MenuItem>
          </Select>
        </FormControl>


        {!logged ? (
          <Button
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 950,
              borderRadius: 0,
              textTransform: "none",
              px: 3,
              borderColor: alpha(muiTheme.palette.text.primary, 0.15),
              color: isDark ? "#fff" : "#000",
            }}
            component={Link}
            href="/login"
          >
            Log In
          </Button>
        ) : (
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Tooltip title={username ? `Signed in as ${username}` : "Account"}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1, p: 0 }}>
                <Avatar sx={{ width: 34, height: 34, fontWeight: 900, background: "#1d9ebf", borderRadius: 0 }}>
                  {initialsFromName(username)}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 0,
                  minWidth: 160,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                }
              }}
            >
              <MenuItem disabled sx={{ fontWeight: 800, opacity: 0.9 }}>
                {username || "User"}
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={onLogout} sx={{ fontWeight: 900 }}>
                <Logout sx={{ fontSize: 18, mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
