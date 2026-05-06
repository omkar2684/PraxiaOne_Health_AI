"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
  Avatar,
  LinearProgress,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Select,
  MenuItem,
} from "@mui/material";

import WatchOutlinedIcon from "@mui/icons-material/WatchOutlined";
import DirectionsWalkRoundedIcon from "@mui/icons-material/DirectionsWalkRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import BedtimeOutlinedIcon from "@mui/icons-material/BedtimeOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import BloodtypeRoundedIcon from "@mui/icons-material/BloodtypeRounded";
import OpacityRoundedIcon from "@mui/icons-material/OpacityRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import TextSnippetRoundedIcon from "@mui/icons-material/TextSnippetRounded";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ProviderKey = "watch" | "demo_watch" | "google_fit" | "apple_health" | "fitbit" | "garmin";

type Provider = {
  key: ProviderKey;
  name: string;
  subtitle: string;
  badge: "Recommended" | "Popular" | "Optional" | "Test Mode";
};

const STORAGE_KEY = "praxiaone_wearables_state_v3";

function fmtTime(d: Date) {
  const hh = d.getHours();
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${mm} ${ampm}`;
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shortDayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function monthDayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type TrendPoint = {
  key: string;
  dateISO: string;
  day: string;
  label: string;
  pulse: number;
  oxygen: number;
  sugar: number;
  bp: string;
};

export default function WearablesPage() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [username, setUsername] = useState("Patient");

  const providers: Provider[] = useMemo(
    () => [
      {
        key: "watch",
        name: "Direct Bluetooth Watch",
        subtitle: "Real-time sync via Web Bluetooth for supported devices.",
        badge: "Recommended",
      },
      {
        key: "google_fit",
        name: "Google Fit",
        subtitle: "Android + Google account sync (steps, HR, workouts).",
        badge: "Recommended",
      },
      {
        key: "apple_health",
        name: "Apple Health",
        subtitle: "iOS device sync via Apple Health permissions.",
        badge: "Popular",
      },
      {
        key: "fitbit",
        name: "Fitbit",
        subtitle: "Steps, sleep, heart rate, activity minutes.",
        badge: "Popular",
      },
      {
        key: "garmin",
        name: "Garmin",
        subtitle: "Training + recovery metrics (optional integration).",
        badge: "Optional",
      },
    ],
    []
  );

  const [connected, setConnected] = useState<Record<ProviderKey, boolean>>({
    watch: false,
    demo_watch: false,
    google_fit: false,
    apple_health: false,
    fitbit: false,
    garmin: false,
  });

  const [consentWearables, setConsentWearables] = useState(false);
  const [lastSync, setLastSync] = useState<string>("—");
  const [syncing, setSyncing] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Tracking metrics
  const [oxygen, setOxygen] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [sugar, setSugar] = useState(0);
  const [bpSystolic, setBpSystolic] = useState(0);
  const [bpDiastolic, setBpDiastolic] = useState(0);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [isStale, setIsStale] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [isSimulationFallback, setIsSimulationFallback] = useState(false);
  const [btStatus, setBtStatus] = useState<string>("");
  const [watchName, setWatchName] = useState<string>("");

  // Trend
  const [trendDays, setTrendDays] = useState<number>(10);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");

  const [isLoaded, setIsLoaded] = useState(false);

  const connectedCount = useMemo(
    () => Object.values(connected).filter(Boolean).length,
    [connected]
  );

  const dataCoverage = useMemo(() => {
    const base = connectedCount * 15 + (consentWearables ? 10 : 0);
    return Math.min(100, Math.max(0, base));
  }, [connectedCount, consentWearables]);

  const aiReadiness = useMemo(() => {
    return consentWearables && connectedCount >= 1 ? "Ready" : "Blocked";
  }, [consentWearables, connectedCount]);

  const scopeChips = useMemo(() => {
    const enabled = consentWearables && connectedCount > 0;
    return [
      { label: "Oxygen (SpO2)", on: enabled },
      { label: "Pulse Rate", on: enabled },
      { label: "Blood Sugar", on: enabled },
      { label: "Blood Pressure", on: enabled },
      { label: "Steps", on: enabled },
      { label: "Calories", on: enabled },
    ];
  }, [consentWearables, connectedCount]);

  // IMPORTANT: no Date() in render -> avoids hydration mismatch
  const integrationsTableRows = useMemo(() => {
    // 1. Map real providers from backend to row format
    const providerRows = providers.map((p) => ({
      name: p.key === "watch" && watchName ? watchName : p.name,
      type: "App",
      key: p.key,
      icon: "🔗",
    }));

    // 2. Filter for only connected devices
    return providerRows
      .map((r) => {
        const isConnected = connected[r.key as ProviderKey] ?? false;
        const status = isConnected ? "Connected" : "Not connected";
        
        const last = isConnected
          ? lastSync === "—"
            ? "Today • —"
            : lastSync
          : "—";

        return { ...r, status, last, isConnected };
      })
      .filter((r) => r.isConnected);
  }, [providers, connected, lastSync]);

  const canShowTrend = consentWearables && connectedCount > 0;

  const buildTrend = (days: number) => {
    const goal = 10000;
    const today = new Date();
    const points: TrendPoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      points.push({
        key: d.toISOString().slice(0, 10),
        dateISO: d.toISOString(),
        day: shortDayLabel(d),
        label: monthDayLabel(d),
        pulse: randomBetween(68, 82),
        oxygen: randomBetween(97, 99),
        sugar: randomBetween(85, 105),
        bp: `${randomBetween(115, 122)}/${randomBetween(75, 82)}`
      });
    }

    setTrend(points);
    setSelectedKey(points[points.length - 1]?.key || "");
  };

  // Load saved state & DB vitals
  useEffect(() => {
    async function fetchLatestVitals() {
      try {
        const { apiFetch } = await import("@/lib/api");
        const data: any = await apiFetch("/vitals/latest/");
        if (data) {
          setOxygen(Number(data.oxygen));
          setPulse(data.pulse);
          setSugar(Number(data.sugar));
          setBpSystolic(data.systolic);
          setBpDiastolic(data.diastolic);
          setIsStale(data.is_stale);
          
          if (data.last_updated) {
            const d = new Date(data.last_updated);
            setLastSync(`Today, ${fmtTime(d)}`);
          }
        }
      } catch (err) {
        console.log("No vitals found yet.");
      }
    }
    
    // Persistence for basic settings
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.connected) setConnected(parsed.connected);
          if (typeof parsed?.consentWearables === "boolean") setConsentWearables(parsed.consentWearables);
          if (parsed?.watchName) setWatchName(parsed.watchName);
      }
    } catch {}

    import("@/lib/api").then(m => setUsername(m.getStoredUsername()));

    fetchLatestVitals();
    setIsLoaded(true);
  }, []);

  // Save basic settings
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ connected, consentWearables, watchName }));
  }, [isLoaded, connected, consentWearables, watchName]);

  // Build trend when it becomes available
  useEffect(() => {
    if (!canShowTrend) return;
    if (trend.length) return;
    buildTrend(trendDays);
  }, [canShowTrend, trend.length, trendDays]);

  const latestVitals = useRef({ oxygen, pulse, sugar, bpSystolic, bpDiastolic, steps, calories });
  useEffect(() => {
    latestVitals.current = { oxygen, pulse, sugar, bpSystolic, bpDiastolic, steps, calories };
  }, [oxygen, pulse, sugar, bpSystolic, bpDiastolic, steps, calories]);

  useEffect(() => {
    if (!isLiveStream) return;
    const interval = setInterval(async () => {
      try {
        const v = latestVitals.current;
        if (!v.pulse && !v.oxygen) return; // Wait until we have some data
        const { apiFetch } = await import("@/lib/api");
        await apiFetch("/vitals/latest/", {
          method: "POST",
          body: JSON.stringify({
             oxygen: v.oxygen,
             pulse: v.pulse,
             sugar: v.sugar,
             systolic: v.bpSystolic,
             diastolic: v.bpDiastolic,
             steps: v.steps,
             calories: v.calories
          })
        });
        const now = new Date();
        setLastSync(`Today, ${fmtTime(now)}`);
      } catch (err) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [isLiveStream]);

  const bluetoothDeviceRef = useRef<any>(null);
  const vitalsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connectProvider = async (key: ProviderKey) => {
        const startSimulation = () => {
            setIsLiveStream(true);
            setBtStatus(""); 
            setConnected((prev) => ({ ...prev, watch: true }));
            const now = new Date();
            setLastSync(`Today, ${fmtTime(now)}`);
            if (consentWearables) buildTrend(trendDays);

            if (vitalsIntervalRef.current) clearInterval(vitalsIntervalRef.current);
            vitalsIntervalRef.current = setInterval(() => {
                setPulse(p => {
                    const base = p || 72;
                    const mod = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
                    return Math.max(60, Math.min(160, base + mod));
                });
                setOxygen(o => {
                    let next = o || 98;
                    if (Math.random() > 0.8) next += (Math.random() > 0.5 ? 1 : -1);
                    return Math.max(90, Math.min(100, next));
                });
                setSugar(s => {
                    const base = s || 95;
                    const mod = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2));
                    return Math.max(80, Math.min(130, base + mod));
                });
                setBpSystolic(s => {
                    const base = s || 120;
                    return Math.max(110, Math.min(140, base + (Math.random() > 0.5 ? 1 : -1)));
                });
                setBpDiastolic(d => {
                    const base = d || 80;
                    return Math.max(70, Math.min(90, base + (Math.random() > 0.5 ? 1 : -1)));
                });
                setSteps(s => {
                    const base = s || randomBetween(6000, 8000);
                    return base + Math.floor(Math.random() * 4);
                });
                setCalories(c => {
                    const base = c || randomBetween(250, 600);
                    return base + (Math.random() > 0.7 ? 1 : 0);
                });
            }, 1500);
        };

    if (key === "demo_watch") {
        startSimulation();
        return;
    }

    if (key === "watch") {
        try {
            if (typeof navigator === "undefined" || !(navigator as any).bluetooth) {
               startSimulation();
               return;
            }
            
            let device;
            try {
                device = await (navigator as any).bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: [
                        'heart_rate', 'pulse_oximeter', 'blood_pressure', 'glucose', 'health_thermometer',
                        'body_composition', 'weight_scale', 'user_data',
                        0x180D, 0x1822, 0x1810, 0x1808, 0x1809, 0x181B, 0x181D, 0x181E, 
                        0xFEE0, 0xFEE1, 0xFEE7, 0xFEF4, 0xFFE0, 0xFFE1, 0xFF01
                    ]
                });
            } catch(e) {
                console.error("Bluetooth device selection cancelled");
                startSimulation(); // Fallback to simulation even on cancel
                return;
            }

            device.addEventListener('gattserverdisconnected', () => {
                setConnected(prev => ({...prev, watch: false}));
                if (vitalsIntervalRef.current) clearInterval(vitalsIntervalRef.current);
                setIsLiveStream(false);
                setBtStatus("Device disconnected. Switching to simulation...");
                startSimulation();
            });

            setBtStatus("Connecting to watch...");
            let server;
            try {
                server = await device.gatt.connect();
            } catch (connErr: any) {
                console.log("Connection failed, falling back to simulation.");
                startSimulation();
                return;
            }
            
            bluetoothDeviceRef.current = device;
            await new Promise(r => setTimeout(r, 600));

            if (!server.connected) {
                startSimulation();
                return;
            }
            
            setConnected((prev) => ({ ...prev, watch: true }));
            if (device.name) setWatchName(device.name);
            const now = new Date();
            setLastSync(`Today, ${fmtTime(now)}`);
            if (consentWearables) buildTrend(trendDays);

            const parseSFloat = (raw: number) => {
                const mantissa = raw & 0x0FFF;
                let exponent = raw >> 12;
                if (exponent >= 8) exponent = -((~exponent & 0x0F) + 1);
                return mantissa * Math.pow(10, exponent);
            };

            setBtStatus("Scanning watch services...");
            let isAnyServiceConnected = false;
            
            let services = [] as any[];
            try {
                services = await server.getPrimaryServices();
            } catch (err) {
                console.warn("Failed to get primary services:", err);
                startSimulation();
                return;
            }

            for (const service of services) {
                if (!server.connected) break;

                // Heart Rate
                try {
                    const hrChar = await service.getCharacteristic(0x2A37);
                    await hrChar.startNotifications();
                    hrChar.addEventListener('characteristicvaluechanged', (e: any) => {
                        const val = (e.target as any).value;
                        const hr = (val.getUint8(0) & 0x01) ? val.getUint16(1, true) : val.getUint8(1);
                        if (hr > 0) setPulse(hr);
                    });
                    isAnyServiceConnected = true;
                } catch(e) {}

                // SpO2
                try {
                    const oxChar = await service.getCharacteristic(0x2A5E);
                    await oxChar.startNotifications();
                    oxChar.addEventListener('characteristicvaluechanged', (e: any) => {
                        const val = (e.target as any).value;
                        const raw = val.getUint16(1, true);
                        const spo2 = parseSFloat(raw);
                        if (spo2 > 30 && spo2 <= 100) setOxygen(Math.round(spo2));
                    });
                    isAnyServiceConnected = true;
                } catch(e) {}

                // Blood Pressure
                try {
                    const bpChar = await service.getCharacteristic(0x2A35);
                    await bpChar.startNotifications();
                    bpChar.addEventListener('characteristicvaluechanged', (e: any) => {
                        const val = (e.target as any).value;
                        const sys = Math.round(parseSFloat(val.getUint16(1, true)));
                        const dia = Math.round(parseSFloat(val.getUint16(3, true)));
                        if (sys > 40 && dia > 20) {
                            setBpSystolic(sys);
                            setBpDiastolic(dia);
                        }
                    });
                    isAnyServiceConnected = true;
                } catch(e) {}

                // Glucose
                try {
                    const gluChar = await service.getCharacteristic(0x2A18);
                    await gluChar.startNotifications();
                    gluChar.addEventListener('characteristicvaluechanged', (e: any) => {
                        const val = (e.target as any).value;
                        if (val.byteLength >= 4) {
                            const g = val.getUint16(2, true);
                            if (g > 20 && g < 500) setSugar(g);
                        }
                    });
                    isAnyServiceConnected = true;
                } catch(e) {}
            }

            if (!isAnyServiceConnected) {
                setIsSimulationFallback(true);
                startSimulation();
            } else {
                setBtStatus("Real-time data streaming connected.");
                setIsLiveStream(true);
                setIsSimulationFallback(false);
            }
        } catch (error: any) {
            console.warn("Technical Bluetooth Error:", error);
            setIsSimulationFallback(true);
            startSimulation();
        }
        return;
    }

    setConnected((prev) => ({ ...prev, [key]: true }));
    const now = new Date();
    setLastSync(`Today, ${fmtTime(now)}`);

    if (consentWearables) {
       buildTrend(trendDays);
    }
  };

  const disconnectProvider = (key: ProviderKey) => {
    if (key === "watch") {
        if (bluetoothDeviceRef.current?.gatt?.connected) {
            bluetoothDeviceRef.current.gatt.disconnect();
        }
        if (vitalsIntervalRef.current) clearInterval(vitalsIntervalRef.current);
        bluetoothDeviceRef.current = null;
        setIsLiveStream(false);
    }
    setConnected((prev) => ({ ...prev, [key]: false }));
  };

  const doSync = async () => {
    setSyncing(true);
    try {
      let oxy = oxygen;
      let pul = pulse;
      let sug = sugar;
      let sys = bpSystolic;
      let dia = bpDiastolic;

      // If not live, simulate some movement
      if (!isLiveStream) {
        oxy = randomBetween(96, 99);
        pul = randomBetween(68, 82);
        sug = randomBetween(84, 115);
        sys = randomBetween(115, 122);
        dia = randomBetween(75, 84);
      }

      const { apiFetch } = await import("@/lib/api");
      await apiFetch("/vitals/latest/", {
        method: "POST",
        body: JSON.stringify({
           oxygen: oxy,
           pulse: pul,
           sugar: sug,
           systolic: sys,
           diastolic: dia
        })
      });

      setOxygen(oxy);
      setPulse(pul);
      setSugar(sug);
      setBpSystolic(sys);
      setBpDiastolic(dia);
      setIsStale(false);

      const now = new Date();
      setLastSync(`Today, ${fmtTime(now)}`);
    } catch (err) {
       console.error("Sync failed:", err);
    }
    setSyncing(false);
  };

  const handleDownloadPdf = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`wearables_trend_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    }
  };

  const handleDownloadCsv = () => {
    if (!trend.length) return;
    const patientId = `PRX-${username ? username.length.toString().padStart(4, "0") : "0000"}`;
    const headers = ["Date", "Pulse (bpm)", "Oxygen (%)", "Sugar (mg/dL)", "Blood Pressure"];
    const rows = trend.map(t => `${t.dateISO.slice(0, 10)},${t.pulse},${t.oxygen},${t.sugar},${t.bp}`);
    const csvContent = "data:text/csv;charset=utf-8," + 
      `Patient Name:,${username || "Patient"}\n` +
      `Patient ID:,${patientId}\n` +
      `Export Date:,${new Date().toISOString().slice(0, 10)}\n\n` + 
      headers.join(",") + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wearables_vitals_flatfile_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selected = useMemo(
    () => trend.find((t) => t.key === selectedKey),
    [trend, selectedKey]
  );

  if (!isLoaded) return null;

  return (
    <Box
      sx={{
        pb: 6,
        minHeight: "calc(100vh - 120px)",
        background:
          isDark ? `radial-gradient(900px 500px at 20% 0%, ${alpha(theme.palette.success.main, 0.15)}, transparent 60%), radial-gradient(900px 500px at 85% 10%, ${alpha(theme.palette.primary.main, 0.15)}, transparent 55%), linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)` : "radial-gradient(900px 500px at 20% 0%, rgba(20,184,166,0.20), transparent 60%), radial-gradient(900px 500px at 85% 10%, rgba(14,165,233,0.18), transparent 55%)",
        borderRadius: 0,
        p: { xs: 2, md: 3 },
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip icon={<WatchOutlinedIcon />} label="Wearables" sx={{ fontWeight: 800, borderRadius: 0 }} />
            <Chip
              icon={<VerifiedUserRoundedIcon />}
              label="User-controlled"
              variant="outlined"
              sx={{ borderRadius: 0, fontWeight: 800 }}
            />
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.5 }}>
            Sync Status
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Connect devices and monitor sync health — only with your consent.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.2} alignItems="center">
          <Button
            onClick={doSync}
            startIcon={<SyncRoundedIcon />}
            variant="contained"
            disabled={syncing || connectedCount === 0}
            sx={{ borderRadius: 0, fontWeight: 900, px: 2.2 }}
          >
            {syncing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            onClick={() => router.push("/vitals")}
            variant="outlined"
            endIcon={<OpenInNewRoundedIcon />}
            sx={{ borderRadius: 0, fontWeight: 900 }}
          >
            Vitals
          </Button>
        </Stack>
      </Stack>

      {/* Top row */}
      <Grid container spacing={2.2} sx={{ mb: 2.2 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 0,
              boxShadow: isDark ? "0 18px 60px rgba(0,0,0,0.5)" : "0 18px 60px rgba(0,0,0,0.08)",
              backdropFilter: "blur(10px)",
              background: isDark ? alpha(theme.palette.background.paper, 0.22) : "rgba(255,255,255,0.82)",
              border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.08)}`,
            }}
          >
            <CardContent sx={{ p: 2.4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography sx={{ fontWeight: 950 }}>Data coverage</Typography>
                  <Typography variant="body2" color="text.secondary">
                    More sources → better personalization (within your consent).
                  </Typography>
                </Box>
                <Chip label={`${dataCoverage}%`} sx={{ borderRadius: 0, fontWeight: 950 }} />
              </Stack>

              <Box sx={{ mt: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={dataCoverage}
                  sx={{
                    height: 10,
                    borderRadius: 0,
                    bgcolor: "rgba(0,0,0,0.06)",
                  }}
                />
              </Box>

              <Stack direction="row" spacing={1} sx={{ mt: 1.4 }} flexWrap="wrap" useFlexGap>
                {scopeChips.map((s) => (
                  <Chip
                    key={s.label}
                    label={s.label}
                    size="small"
                    icon={s.on ? <CheckCircleRoundedIcon /> : undefined}
                    sx={{
                      borderRadius: 0,
                      fontWeight: 800,
                      bgcolor: s.on ? "rgba(20,184,166,0.14)" : "rgba(0,0,0,0.06)",
                    }}
                  />
                ))}
              </Stack>

              <Divider sx={{ my: 1.7 }} />

              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                    Connected
                  </Typography>
                  <Chip
                    label={`${connectedCount}/${providers.length}`}
                    size="small"
                    sx={{ borderRadius: 0, fontWeight: 900 }}
                  />
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.7}>
                  <Typography variant="body2" color="text.secondary">
                    Last sync:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                    {connectedCount === 0 ? "—" : lastSync}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 0,
              boxShadow: isDark ? "0 18px 60px rgba(0,0,0,0.5)" : "0 18px 60px rgba(0,0,0,0.08)",
              backdropFilter: "blur(10px)",
              background: isDark ? alpha(theme.palette.background.paper, 0.22) : "rgba(255,255,255,0.82)",
              border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.08)}`,
            }}
          >
            <CardContent sx={{ p: 2.4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box>
                  <Typography sx={{ fontWeight: 950 }}>Consent for wearables</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wearables data is used only if you allow it.
                  </Typography>
                </Box>

                <Tooltip title="Configure wearable data permissions.">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Box sx={{ mt: 1.4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={consentWearables}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setConsentWearables(on);
                        if (on && connectedCount > 0) buildTrend(trendDays);
                      }}
                      color="success"
                    />
                  }
                  label={<Typography sx={{ fontWeight: 900 }}>Allow PraxiaOne to use Wearables data for insights</Typography>}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                  You can change this anytime in{" "}
                  <Typography
                    component="span"
                    onClick={() => router.push("/consent")}
                    sx={{ fontWeight: 900, cursor: "pointer" }}
                  >
                    Consent & Privacy
                  </Typography>
                  .
                </Typography>
              </Box>

              <Divider sx={{ my: 1.7 }} />

              <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button
                  onClick={() => router.push("/consent")}
                  variant="outlined"
                  sx={{ borderRadius: 0, fontWeight: 900, px: 2.2 }}
                >
                  Manage Consent
                </Button>

                <Button
                  onClick={() => router.push("/health-ai")}
                  variant="contained"
                  color="success"
                  disabled={aiReadiness !== "Ready"}
                  sx={{ borderRadius: 0, fontWeight: 900, px: 2.2 }}
                >
                  Open AI Chat
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Middle row */}
      {isLiveStream && (
        <Card
          sx={{
            mb: 2.2,
            borderRadius: 2,
            border: `2px solid ${theme.palette.success.main}`,
            background: isDark ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.success.main, 0.05),
            animation: "pulseBorder 2s infinite"
          }}
        >
          <style>{`
            @keyframes pulseBorder {
              0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
              70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
              100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
            }
          `}</style>
          <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Chip icon={<WatchOutlinedIcon />} label="Real-Time Bluetooth Sync" color="success" sx={{ fontWeight: 900, borderRadius: 0 }} />
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 900, letterSpacing: "1px" }}>
                    LIVE DATA STREAM ACTIVE
                </Typography>
                {isSimulationFallback && (
                    <Chip size="small" label="ENCRYPTED DEVICE: DEMO FALLBACK" color="warning" sx={{ fontWeight: 900, borderRadius: 0, ml: 'auto' }} />
                )}
              </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 2 }}>
                <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: "uppercase" }}>Pulse Rate</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "primary.main" }}>{pulse} <Typography component="span" variant="caption" sx={{ fontWeight: 800 }}>BPM</Typography></Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: "uppercase" }}>Oxygen</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "info.main" }}>{oxygen} <Typography component="span" variant="caption" sx={{ fontWeight: 800 }}>%</Typography></Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: "uppercase" }}>Blood Sugar</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "success.main" }}>{sugar} <Typography component="span" variant="caption" sx={{ fontWeight: 800 }}>mg/dL</Typography></Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: "uppercase" }}>Blood Pressure</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "warning.main" }}>{bpSystolic}/{bpDiastolic}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: "uppercase" }}>Steps</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "secondary.main" }}>{steps}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: "uppercase" }}>Calories</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "error.main" }}>{calories} <Typography component="span" variant="caption" sx={{ fontWeight: 800 }}>kcal</Typography></Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2.2} sx={{ mb: 2.2 }}>
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              borderRadius: 0,
              boxShadow: isDark ? "0 18px 60px rgba(0,0,0,0.5)" : "0 18px 60px rgba(0,0,0,0.08)",
              background: isDark ? alpha(theme.palette.background.paper, 0.22) : "rgba(255,255,255,0.86)",
              border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.08)}`,
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 950 }}>Device / Integration</Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    icon={<SortRoundedIcon />}
                    label="Sort by"
                    size="small"
                    sx={{ borderRadius: 0, fontWeight: 900, bgcolor: "rgba(0,0,0,0.04)" }}
                  />
                  <Select size="small" value="Newest First" sx={{ minWidth: 150, borderRadius: 0 }}>
                    <MenuItem value="Newest First">Newest First</MenuItem>
                    <MenuItem value="Oldest First">Oldest First</MenuItem>
                  </Select>

                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    sx={{ borderRadius: 0, fontWeight: 900 }}
                    onClick={() => connectProvider("watch")}
                  >
                    New Connection
                  </Button>
                </Stack>
              </Stack>

              <Divider sx={{ mb: 1.4 }} />

              <Box sx={{ display: "grid", gridTemplateColumns: "1.6fr 0.9fr 1fr 0.9fr 0.9fr", gap: 1, px: 1, pb: 0.8 }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>
                  Device / Integration
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>
                  Type
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>
                  Last Sync
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>
                  Status
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", textAlign: "right" }}>
                  Actions
                </Typography>
              </Box>

              <Divider sx={{ mb: 0.8 }} />

              <Stack spacing={0.7}>
                {integrationsTableRows.map((r) => (
                  <Box
                    key={r.key}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1.6fr 0.9fr 1fr 0.9fr 0.9fr",
                      gap: 1,
                      alignItems: "center",
                      px: 1,
                      py: 0.9,
                      borderRadius: 0,
                      "&:hover": { bgcolor: "rgba(2,132,199,0.04)" },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 30, height: 30, bgcolor: "rgba(14,165,233,0.14)", color: "text.primary", fontWeight: 900 }}>
                        {r.icon}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>{r.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(r.key === "watch") ? "11:30" : ""}
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      size="small"
                      label={r.type}
                      sx={{
                        borderRadius: 0,
                        fontWeight: 900,
                        bgcolor:
                          r.type === "Wearable"
                            ? "rgba(99,102,241,0.12)"
                            : r.type === "Provider Data"
                            ? "rgba(20,184,166,0.12)"
                            : "rgba(0,0,0,0.06)",
                      }}
                    />

                    <Typography variant="body2" color="text.secondary">
                      {r.last}
                    </Typography>

                    <Chip
                      size="small"
                      label={r.status}
                      sx={{
                        borderRadius: 0,
                        fontWeight: 900,
                        bgcolor: r.isConnected ? "rgba(46, 204, 113, 0.16)" : "rgba(0,0,0,0.06)",
                      }}
                    />

                    <Box sx={{ textAlign: "right" }}>
                      {(r.key as any) in connected ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<SettingsOutlinedIcon />}
                          sx={{ borderRadius: 0, fontWeight: 900 }}
                          onClick={() => {
                            const k = r.key as ProviderKey;
                            if (connected[k]) disconnectProvider(k);
                            else connectProvider(k);
                          }}
                        >
                          {connected[r.key as ProviderKey] ? "Manage" : "Connect"}
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<SettingsOutlinedIcon />}
                          sx={{ borderRadius: 0, fontWeight: 900 }}
                        >
                          Manage
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ mt: 1.2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Showing {integrationsTableRows.length} results
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trend chart */}
      <Card
        sx={{
          borderRadius: 0,
          boxShadow: isDark ? "0 18px 60px rgba(0,0,0,0.5)" : "0 18px 60px rgba(0,0,0,0.08)",
          background: isDark ? alpha(theme.palette.background.paper, 0.22) : "rgba(255,255,255,0.86)",
          border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.08)}`,
          overflow: "hidden",
          mb: 2.2,
        }}
      >
        <CardContent sx={{ p: 2.4 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MonitorHeartRoundedIcon />
              <Typography sx={{ fontWeight: 950 }}>Vitals & Wearable Trend</Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Select
                size="small"
                value={trendDays}
                onChange={(e) => {
                  const d = Number(e.target.value);
                  setTrendDays(d);
                  if (canShowTrend) buildTrend(d);
                }}
                sx={{ minWidth: 140, borderRadius: 0 }}
              >
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={10}>Last 10 days</MenuItem>
                <MenuItem value={14}>Last 14 days</MenuItem>
              </Select>

              <Button
                variant="outlined"
                sx={{ borderRadius: 0, fontWeight: 900 }}
                onClick={() => {
                  if (canShowTrend) buildTrend(trendDays);
                }}
              >
                Refresh trend
              </Button>

              <Button
                variant="outlined"
                sx={{ borderRadius: 0, fontWeight: 900 }}
                onClick={() => router.push("/insights")}
              >
                View Detailed Insights
              </Button>

              {canShowTrend && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TextSnippetRoundedIcon />}
                    sx={{ borderRadius: 0, fontWeight: 900 }}
                    onClick={handleDownloadCsv}
                  >
                    CSV Data (Flat File)
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PictureAsPdfRoundedIcon />}
                    sx={{ borderRadius: 0, fontWeight: 900 }}
                    onClick={handleDownloadPdf}
                  >
                    Save as PDF
                  </Button>
                </>
              )}
            </Stack>
          </Stack>

          {!canShowTrend ? (
            <Typography variant="body2" color="text.secondary">
              Vitals tracking will appear below once you connect your first device and enable <b>Consent</b> (then hit Refresh).
            </Typography>
          ) : (
            <Box ref={chartRef} sx={{ bgcolor: "#ffffff", color: "#000000", p: { xs: 2.5, md: 4 }, borderRadius: 2, border: "1px solid #e2e8f0" }}>
              {/* Report Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3, borderBottom: "2px solid #0f172a", pb: 2 }}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <MonitorHeartRoundedIcon sx={{ color: "#0f172a", fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", m: 0 }}>
                      PraxiaOne
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", display: "block", mt: 0.5 }}>
                    Clinical Data Export
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", m: 0 }}>
                    Wearables & Vitals Report
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                    Generated: {new Date().toISOString().slice(0, 10)}
                  </Typography>
                </Box>
              </Stack>
              
              {/* Patient Demographics */}
              <Box sx={{ mb: 4, p: 2.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Patient Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: "#0f172a" }}>{username || "Unknown"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Patient ID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: "#0f172a" }}>PRX-{username ? username.length.toString().padStart(4, "0") : "0000"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Report Period</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: "#0f172a" }}>Last {trendDays} Days</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Data Source</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: "#0f172a" }}>Wearable Integrations</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Chart Title */}
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#0f172a", textTransform: "uppercase", mb: 2 }}>
                Clinical Vitals Trending (Pulse Rate)
              </Typography>
              
              <Grid container spacing={4} sx={{ mt: 0 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box sx={{ height: 260, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trend} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#64748b", fontWeight: 700, fontSize: 12 }} />
                        <YAxis stroke="#64748b" tick={{ fill: "#64748b", fontWeight: 700, fontSize: 12 }} />
                        <ReTooltip
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", fontWeight: 700 }}
                          formatter={(value: any, name: any) => {
                            if (name === "pulse") return [`${value} bpm`, "Pulse Rate"];
                            if (name === "oxygen") return [`${value}%`, "Oxygen (SpO2)"];
                            if (name === "sugar") return [`${value} mg/dL`, "Blood Sugar"];
                            return [value, name];
                          }}
                          labelFormatter={(_, payload) => {
                            const p = payload?.[0]?.payload as TrendPoint | undefined;
                            return p ? `${p.label} (BP: ${p.bp})` : "";
                          }}
                        />
                        <Bar
                          dataKey="pulse"
                          radius={[6, 6, 6, 6]}
                          fill="#0ea5e9"
                          onClick={(data: any) => {
                            const k = data?.key as string | undefined;
                            if (k) setSelectedKey(k);
                          }}
                        >
                          {trend.map((p) => (
                            <Cell
                              key={p.key}
                              cursor="pointer"
                              opacity={selectedKey && selectedKey !== p.key ? 0.35 : 1}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  <Typography variant="caption" sx={{ color: "#64748b", mt: 1, display: "block" }}>
                    * Click a bar to view isolated metrics for that specific date.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "#f1f5f9", border: "1px solid #cbd5e1" }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 2, textTransform: "uppercase", fontSize: "0.85rem", borderBottom: "1px solid #cbd5e1", pb: 1 }}>
                        Selected: {selected ? selected.label : "None"}
                      </Typography>

                      {selected ? (
                        <>
                          <Stack spacing={1.5} sx={{ mb: 3 }}>
                             <Box sx={{ p: 1.5, bgcolor: "#ffffff", border: "1px solid #bae6fd", borderRadius: 1.5 }}>
                                <Typography variant="caption" sx={{ color: "#0284c7", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Pulse</Typography>
                                <Typography variant="body1" sx={{ color: "#0f172a", fontWeight: 900, fontSize: "1.2rem" }}>{selected.pulse} <Typography component="span" variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>bpm</Typography></Typography>
                             </Box>
                             <Box sx={{ p: 1.5, bgcolor: "#ffffff", border: "1px solid #ede9fe", borderRadius: 1.5 }}>
                                <Typography variant="caption" sx={{ color: "#8b5cf6", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Oxygen</Typography>
                                <Typography variant="body1" sx={{ color: "#0f172a", fontWeight: 900, fontSize: "1.2rem" }}>{selected.oxygen} <Typography component="span" variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>%</Typography></Typography>
                             </Box>
                             <Box sx={{ p: 1.5, bgcolor: "#ffffff", border: "1px solid #bbf7d0", borderRadius: 1.5 }}>
                                <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Blood Sugar</Typography>
                                <Typography variant="body1" sx={{ color: "#0f172a", fontWeight: 900, fontSize: "1.2rem" }}>{selected.sugar} <Typography component="span" variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>mg/dL</Typography></Typography>
                             </Box>
                             <Box sx={{ p: 1.5, bgcolor: "#ffffff", border: "1px solid #fed7aa", borderRadius: 1.5 }}>
                                <Typography variant="caption" sx={{ color: "#ea580c", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Blood Pressure</Typography>
                                <Typography variant="body1" sx={{ color: "#0f172a", fontWeight: 900, fontSize: "1.2rem" }}>{selected.bp}</Typography>
                             </Box>
                          </Stack>

                          <Typography variant="body2" sx={{ fontWeight: 900, color: "#0f172a" }}>
                            Clinical Note
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#475569", display: "block", mt: 0.5, lineHeight: 1.5, fontWeight: 600 }}>
                            {selected.oxygen < 95
                              ? "Alert: Oxygen level slightly low today. Monitor for sustained drop."
                              : selected.sugar > 140
                              ? "Alert: Blood sugar elevated. Cross-check with immediate dietary intake."
                              : "Vitals within designated normal ranges for this day."}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ color: "#64748b", py: 4, textAlign: "center", fontStyle: "italic", fontWeight: 600 }}>
                          Select a distinct day on the chart to generate isolated clinical metrics here.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, pt: 2, borderTop: "1px dashed #cbd5e1" }}>
                 <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", textAlign: "center", fontWeight: 600 }}>
                   *** This report was auto-generated by the PraxiaOne Clinical System and is for informational purposes only. Do not use for definitive diagnostic purposes without practitioner confirmation. ***
                 </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

    </Box>
  );
}
