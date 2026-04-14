"use client";

import * as React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme, alpha } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export type ThemeName = "light" | "dark" | "aurora";

export const ThemeCtx = React.createContext<{
  themeName: ThemeName;
  setThemeName: (t: ThemeName) => void;
}>({
  themeName: "dark",
  setThemeName: () => { },
});

const THEME_KEY = "praxia-theme";

function buildTheme(themeName: ThemeName) {
  const isDark = themeName !== "light";

  const primary = themeName === "aurora" ? "#22c55e" : "#0ea5e9";
  const secondary = themeName === "aurora" ? "#14b8a6" : "#6366f1";

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: { main: primary },
      secondary: { main: secondary },
      background: isDark
        ? {
          default: "#020617",
          paper: alpha("#0b1220", 0.92),
        }
        : {
          default: "#f6f7fb",
          paper: "#ffffff",
        },
    },
    shape: { borderRadius: 0 },
    typography: {
      fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
      fontSize: 17,
      h1: { fontWeight: 950, fontSize: "3.2rem" },
      h2: { fontWeight: 950, fontSize: "2.6rem" },
      h3: { fontWeight: 950, fontSize: "2.2rem" },
      h4: { fontWeight: 950, fontSize: "1.9rem" },
      h5: { fontWeight: 950, fontSize: "1.6rem" },
      h6: { fontWeight: 950, fontSize: "1.35rem" },
      body1: { fontSize: "1.2rem" },
      body2: { fontSize: "1.1rem" },
      caption: { fontSize: "0.95rem" },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
    },
  });
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = React.useState<ThemeName>("dark");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as ThemeName | null;
      if (saved === "light" || saved === "dark" || saved === "aurora") {
        setThemeNameState(saved);
      }
    } catch { }
  }, []);

  const setThemeName = (t: ThemeName) => {
    setThemeNameState(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch { }
  };

  const theme = React.useMemo(() => buildTheme(themeName), [themeName]);

  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeCtx.Provider value={{ themeName, setThemeName }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeCtx.Provider>
    </AppRouterCacheProvider>
  );
}
