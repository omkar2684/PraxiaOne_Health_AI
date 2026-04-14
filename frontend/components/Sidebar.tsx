"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Dashboard,
  Favorite,
  Storage,
  Watch,
  Medication,
  Psychology,
  Settings,
  Help,
  AccountCircle,
  MonitorHeart,
  Shield,
  MoreVert
} from "@mui/icons-material";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton
} from "@mui/material";

const items = [
  ["Home", "/", <Home key="home" />],
  ["Dashboard", "/dashboard", <Dashboard key="dash" />],
  ["Profile", "/profile", <Favorite key="fav" />],
  ["Vitals", "/vitals", <MonitorHeart key="vit" />],
  ["Data", "/data", <Storage key="str" />],
  ["AI Chat", "/health-ai", <Psychology key="psy" />],
  ["Wearables", "/wearables", <Watch key="wear" />],
  ["Medications", "/medications", <Medication key="med" />],
  ["Consent", "/consent", <Shield key="cons" />],
  ["Support", "/support", <Help key="sup" />],
  ["Settings", "/settings", <Settings key="set" />],
] as const;

export default function Sidebar({ isExpanded, setIsExpanded }: { isExpanded: boolean, setIsExpanded: (v: boolean) => void }) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const hovered = isExpanded || isHovered;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: hovered ? 260 : 70,
        height: "100vh",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        background: `linear-gradient(135deg, #222b3c, #1a202c)`, // Dark blue/grey slate
        boxShadow: hovered ? "8px 0 32px rgba(0,0,0,0.35)" : "none",
        zIndex: 1001,
        color: "#ffffff",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
        overflowX: "hidden", // Important for width transition
      }}
    >
      <Box sx={{ py: 2, px: 1, minWidth: 260, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <IconButton 
          onClick={() => setIsExpanded(!isExpanded)} 
          sx={{ color: "white", mx: 1 }}
        >
          <MoreVert />
        </IconButton>
        <Typography
          variant="overline"
          sx={{
            letterSpacing: 2,
            fontWeight: 900,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s ease",
            whiteSpace: "nowrap",
            ml: 1
          }}
        >
          PRAXIAONE
        </Typography>
      </Box>

      {/* Navigation List */}
      <List sx={{ py: 0, flex: 1, px: 1, overflowY: "auto", minWidth: 260 }}>
        {items.map(([label, href, icon]) => {
          const isActive = pathname === href || (pathname.startsWith(href) && href !== "/");
          return (
            <ListItemButton
              key={label}
              component={Link}
              href={href}
              sx={{
                mb: 1,
                borderRadius: 2,
                minHeight: 48,
                justifyContent: hovered ? "initial" : "center",
                px: 2,
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
                background: isActive ? "linear-gradient(90deg, #179ebf, #1db5ce)" : "transparent",
                boxShadow: isActive ? "0 4px 12px rgba(29, 181, 206, 0.3)" : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: isActive ? "linear-gradient(90deg, #179ebf, #1db5ce)" : "rgba(255,255,255,0.06)",
                },
                "& .MuiListItemIcon-root": {
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
                  minWidth: 0,
                  mr: hovered ? 2 : "auto",
                  justifyContent: "center",
                },
              }}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 15,
                    letterSpacing: "0.2px",
                    opacity: hovered ? 1 : 0,
                    transition: "opacity 0.2s ease",
                    whiteSpace: "nowrap"
                  },
                }}
                sx={{ display: hovered ? "block" : "none" }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Bottom Icons Area */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          alignItems: "center",
          opacity: 0.5,
          minWidth: 260,
          overflow: "hidden"
        }}
      >
        <AccountCircle fontSize="small" sx={{ ml: 1 }} />
        <Typography
          variant="caption"
          sx={{
            whiteSpace: "nowrap",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s ease"
          }}
        >
          Clinician Workspace
        </Typography>
      </Box>
    </Box>
  );
}
