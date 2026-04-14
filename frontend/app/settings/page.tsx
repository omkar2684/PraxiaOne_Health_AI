"use client";

import { useEffect, useMemo, useState, useContext } from "react";
import Link from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { ThemeCtx, ThemeName } from "../providers";
import { apiFetch, logout } from "@/lib/api";
import {
  Box, Card, CardContent, Typography, Stack, Chip, Button, Divider, Grid, TextField,
  InputAdornment, Switch, FormControlLabel, Snackbar, Alert, Paper, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import {
  Settings as SettingsIcon, Mail, Phone, Person, Security, Notifications,
  Save, Restore, CheckCircle, WarningAmber, VerifiedUser, ArrowForward,
  PhotoCamera, ExpandMore, MedicalInformation, PictureAsPdf, ExitToApp, SwitchAccount, DeleteForever
} from "@mui/icons-material";
import { uploadProfilePicture } from "@/lib/api";

type SettingsModel = {
  email: string; phone: string; displayName: string; username: string; patient_id: string;
  age: string; height_cm: string; weight_kg: string; diet_preference: string;
  allergies: string; notes: string; conditions: string;
  notificationsEmail: boolean; notificationsSMS: boolean; themeMode: "system" | "light" | "dark"; marketing: boolean;
};

const STORAGE_KEY = "praxiaone_settings_v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export default function SettingsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const pageBg = useMemo(() => {
    const p = theme.palette.primary.main; const s = theme.palette.secondary.main; const ok = theme.palette.success.main;
    if (isDark) return `radial-gradient(1200px 650px at 15% 0%, ${alpha(p, 0.18)}, transparent 60%), radial-gradient(900px 520px at 85% 20%, ${alpha(s, 0.18)}, transparent 55%), radial-gradient(900px 520px at 50% 110%, ${alpha(ok, 0.10)}, transparent 55%), linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`;
    return `radial-gradient(1100px 520px at 12% 0%, ${alpha(p, 0.12)}, transparent 60%), radial-gradient(900px 480px at 90% 10%, ${alpha(s, 0.12)}, transparent 60%), linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`;
  }, [theme, isDark]);

  const glassCardSx = useMemo(() => ({
    borderRadius: 0, overflow: "hidden", border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.08)}`,
    boxShadow: isDark ? "0 22px 90px rgba(0,0,0,0.45)" : "0 16px 60px rgba(15,23,42,0.10)",
    background: isDark ? `linear-gradient(180deg, ${alpha("#0f172a", 0.70)}, ${alpha("#020617", 0.60)})` : `linear-gradient(135deg, ${alpha("#ffffff", 0.82)}, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.04)})`,
    backdropFilter: "blur(14px)",
  }), [theme, isDark]);

  const heroSx = useMemo(() => ({
    ...glassCardSx, position: "relative" as const, mb: 3,
    background: isDark ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.20)}, ${alpha(theme.palette.secondary.main, 0.16)}, ${alpha("#020617", 0.78)})` : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.secondary.main, 0.10)}, ${alpha("#ffffff", 0.80)})`,
  }), [glassCardSx, theme, isDark]);

  const paperSx = useMemo(() => ({
    p: 2, borderRadius: 0, border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.14 : 0.08)}`,
    background: isDark ? alpha("#0b1228", 0.42) : alpha("#ffffff", 0.72),
    boxShadow: isDark ? "0 14px 55px rgba(0,0,0,0.35)" : "0 10px 40px rgba(15,23,42,0.06)",
  }), [theme, isDark]);

  const stickySx = useMemo(() => ({
    ...glassCardSx, position: "sticky" as const, top: 18,
  }), [glassCardSx]);

  const textPrimary = isDark ? alpha("#F8FAFC", 0.96) : theme.palette.text.primary;
  const textSecondary = isDark ? alpha("#E2E8F0", 0.72) : theme.palette.text.secondary;

  const { themeName, setThemeName } = useContext(ThemeCtx);

  const [form, setForm] = useState<SettingsModel>({
    email: "", username: "", patient_id: "", phone: "", displayName: "", age: "", height_cm: "",
    weight_kg: "", diet_preference: "Vegetarian", allergies: "", notes: "", conditions: "",
    notificationsEmail: true, notificationsSMS: false, themeMode: "dark", marketing: false,
  });

  const [toast, setToast] = useState<{ open: boolean; msg: string; type: "success" | "info" | "warning" | "error" }>({ open: false, msg: "", type: "success" });
  const [dirty, setDirty] = useState(false);
  const [initialAuth, setInitialAuth] = useState({ username: "", email: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);
  const [switchModalOpen, setSwitchModalOpen] = useState(false);

  const [expanded, setExpanded] = useState<string | false>('panel1');
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]; setProfileImage(file); setProfilePreview(URL.createObjectURL(file));
      try {
        await uploadProfilePicture(file);
        setToast({ open: true, msg: "Profile picture uploaded successfully.", type: "success" });
      } catch(err) { setToast({ open: true, msg: "Failed to upload profile picture.", type: "error" }); }
    }
  };

  useEffect(() => {
    // Load saved multi-accounts from local storage
    const accs = localStorage.getItem("praxia_saved_accounts");
    if(accs) setSavedAccounts(safeParse<any[]>(accs) || []);

    const saved = safeParse<SettingsModel>(localStorage.getItem(STORAGE_KEY));
    if (saved) setForm((p) => ({ ...p, ...saved }));
    else setForm(p => ({ ...p, themeMode: themeName as any }));

    apiFetch<any>("/user/settings/", { method: "GET" }).then((resp) => {
      const p = resp.profile || {};
      const m = resp.medical || {};
      setForm((prev) => ({
        ...prev,
        displayName: p.full_name || prev.displayName,
        phone: p.phone_number || prev.phone,
        age: p.age ? String(p.age) : prev.age,
        height_cm: p.height_cm ? String(p.height_cm) : prev.height_cm,
        weight_kg: p.weight_kg ? String(p.weight_kg) : prev.weight_kg,
        diet_preference: p.diet_preference || prev.diet_preference,
        allergies: p.allergies || m.allergies_list || prev.allergies,
        notes: p.notes || prev.notes,
        conditions: m.conditions || prev.conditions,
        email: p.email || prev.email,
        username: p.username || prev.username,
        patient_id: p.patient_id || prev.patient_id,
      }));
      if (p.profile_picture) setProfilePreview(p.profile_picture);
      setInitialAuth({ username: p.username || "", email: p.email || "" });
    }).catch(() => {});
  }, [themeName]);

  const completeness = useMemo(() => {
    const fields = [Boolean(form.displayName?.trim()), Boolean(form.email?.trim()), Boolean(form.phone?.trim()), true];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [form]);
  const status = useMemo(() => {
    if (completeness >= 80) return { label: "Profile settings: Complete", ok: true };
    if (completeness >= 50) return { label: "Profile settings: Partial", ok: false };
    return { label: "Profile settings: Minimal", ok: false };
  }, [completeness]);

  const onChange = <K extends keyof SettingsModel>(key: K, value: SettingsModel[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    if (key === "themeMode") setThemeName(value as ThemeName);
  };

  const handleSaveClick = () => {
    if (form.email !== initialAuth.email && form.email) setConfirmOpen(true);
    else proceedSave();
  };

  const proceedSave = async () => {
    setConfirmOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      const ageNum = form.age.trim() === "" ? null : Number(form.age);
      const hNum = form.height_cm.trim() === "" ? null : Number(form.height_cm);
      const wNum = form.weight_kg.trim() === "" ? null : Number(form.weight_kg);

      await apiFetch("/user/settings/", {
        method: "PATCH",
        body: JSON.stringify({
          profile: {
            full_name: form.displayName, phone_number: form.phone,
            age: Number.isFinite(ageNum) ? ageNum : null,
            height_cm: Number.isFinite(hNum) ? hNum : null, weight_kg: Number.isFinite(wNum) ? wNum : null,
            diet_preference: form.diet_preference, allergies: form.allergies, notes: form.notes,
          },
          medical: {
            conditions: form.conditions,
            allergies_list: form.allergies,
          }
        }),
      });

      setInitialAuth({ username: form.username, email: form.email });
      setDirty(false);
      setToast({ open: true, msg: "Settings saved ✅", type: "success" });
    } catch {
      setToast({ open: true, msg: "Could not save to server.", type: "error" });
    }
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) return setToast({ open: true, msg: "Password must be at least 6 chars.", type: "error" });
    try {
      await apiFetch("/change-password/", { method: "POST", body: JSON.stringify({ new_password: newPassword }) });
      setToast({ open: true, msg: "Password updated successfully ✅", type: "success" });
      setNewPassword("");
    } catch { setToast({ open: true, msg: "Failed to update password.", type: "error" }); }
  };

  // Auth Functions
  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) await apiFetch("/auth/logout/", { method: "POST", body: JSON.stringify({ refresh }) });
    } catch(e) { console.error(e) }
    logout();
    window.location.href = "/login";
  };

  const handleSwitchAccountSelect = (acc: any) => {
    localStorage.setItem("access", acc.access);
    if(acc.refresh) localStorage.setItem("refresh", acc.refresh);
    localStorage.setItem("praxia_username", acc.username);
    window.location.href = "/dashboard";
  };

  const handleDeleteAccount = async () => {
    try {
      await apiFetch("/auth/delete-account/", { method: "POST" });
      setDeleteConfirmOpen(false);
      logout();
      window.location.href = "/register";
    } catch {
      setToast({ open: true, msg: "Error deleting account.", type: "error" });
    }
  };

  const handleDownloadPDF = async (type: string) => {
    try {
      setToast({ open: true, msg: `Generating ${type} PDF...`, type: "info" });
      const blob = await apiFetch<Blob>(`/generate-pdf/?type=${type}`, { method: "GET", parseAs: "blob" }, true);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.error(e);
      setToast({ open: true, msg: "Failed to load PDF", type: "error" });
    }
  };

  const reset = () => {
    const saved = safeParse<SettingsModel>(localStorage.getItem(STORAGE_KEY));
    if (saved) { setForm((p) => ({ ...p, ...saved })); setThemeName(saved.themeMode as ThemeName); setToast({ open: true, msg: "Reverted.", type: "info" }); }
    setDirty(false);
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 24px)", px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, background: pageBg }}>
      {/* HERO */}
      <Card sx={heroSx}>
        <CardContent sx={{ position: "relative", py: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8, flexWrap: "wrap" }}>
                <Chip icon={<SettingsIcon sx={{ fontSize: 18 }} />} label="Settings" size="small" />
                <Chip icon={status.ok ? <CheckCircle sx={{ fontSize: 18 }} /> : <WarningAmber sx={{ fontSize: 18 }} />} label={status.label} size="small" />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.8, color: textPrimary }}>Account & Preferences</Typography>
            </Box>

            <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
              <Button size="small" variant="outlined" startIcon={<Restore />} onClick={reset} sx={{ borderRadius: 0, fontWeight: 950 }}>Revert</Button>
              <Button size="small" variant="contained" color="success" startIcon={<Save />} onClick={handleSaveClick} sx={{ borderRadius: 0, fontWeight: 950 }}>Save</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* LEFT Accordions */}
        <Grid size={{ xs: 12, lg: 8 }}>
          
          <Accordion expanded={expanded === 'panel1'} onChange={handleAccordionChange('panel1')} sx={{ background: isDark ? alpha("#000000", 0.4) : '#fff', borderRadius: 0 }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 3, py: 1 }}>
              <Person sx={{ mr: 2, color: theme.palette.primary.main }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Profile & Contact Details</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Box display="flex" justifyContent="center" mb={3}>
                <Box position="relative">
                  <Avatar src={profilePreview} sx={{ width: 100, height: 100 }} />
                  <IconButton color="primary" component="label" sx={{ position: "absolute", bottom: -5, right: -15, backgroundColor: "background.paper", "&:hover":{backgroundColor: "background.paper"} }}>
                    <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                    <PhotoCamera />
                  </IconButton>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Display name" value={form.displayName} onChange={(e) => onChange("displayName", e.target.value)} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth disabled label="Username" value={form.username} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email" value={form.email} onChange={(e) => onChange("email", e.target.value)} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Phone" value={form.phone} onChange={(e) => onChange("phone", e.target.value)} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Age" value={form.age} onChange={(e) => onChange("age", e.target.value)} /></Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" spacing={2}>
                    <TextField fullWidth label="Height (cm)" value={form.height_cm} onChange={(e) => onChange("height_cm", e.target.value)} />
                    <TextField fullWidth label="Weight (kg)" value={form.weight_kg} onChange={(e) => onChange("weight_kg", e.target.value)} />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField select fullWidth label="Diet Preference" value={form.diet_preference} onChange={(e) => onChange("diet_preference", e.target.value)} SelectProps={{ native: true }}>
                    <option value="Vegetarian">Vegetarian</option><option value="Non-Veg">Non-Veg</option><option value="Vegan">Vegan</option>
                  </TextField>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'panel2'} onChange={handleAccordionChange('panel2')} sx={{ background: isDark ? alpha("#000000", 0.4) : '#fff', borderRadius: 0, mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 3, py: 1 }}>
              <MedicalInformation sx={{ mr: 2, color: theme.palette.error.main }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Medical Information</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}><TextField fullWidth label="Allergies" value={form.allergies} onChange={(e) => onChange("allergies", e.target.value)} placeholder="e.g. Peanuts, Dust..." /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={2} label="Conditions" value={form.conditions} onChange={(e) => onChange("conditions", e.target.value)} placeholder="Pre-existing conditions..." /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={2} label="General Notes" value={form.notes} onChange={(e) => onChange("notes", e.target.value)} /></Grid>
                <Grid size={{ xs: 12 }}>
                   <Button variant="outlined" color="primary" startIcon={<PictureAsPdf />} onClick={() => handleDownloadPDF('medical')} sx={{ mt: 1 }}>Download Medical PDF</Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'panel3'} onChange={handleAccordionChange('panel3')} sx={{ background: isDark ? alpha("#000000", 0.4) : '#fff', borderRadius: 0, mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 3, py: 1 }}>
              <Security sx={{ mr: 2, color: theme.palette.success.main }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Account Management & Security</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>Update your password below.</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <TextField fullWidth size="small" type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Button variant="contained" onClick={updatePassword} sx={{ whiteSpace: 'nowrap', borderRadius: 0 }}>Update Password</Button>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography color="textSecondary" sx={{ mb: 1, fontWeight: 'bold' }}>Session Controls</Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" color="primary" startIcon={<SwitchAccount />} onClick={() => setSwitchModalOpen(true)}>Switch Account</Button>
                <Button variant="outlined" color="warning" startIcon={<ExitToApp />} onClick={handleLogout}>Logout</Button>
                <Button variant="outlined" color="error" startIcon={<DeleteForever />} onClick={() => setDeleteConfirmOpen(true)}>Delete Account</Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'panel4'} onChange={handleAccordionChange('panel4')} sx={{ background: isDark ? alpha("#000000", 0.4) : '#fff', borderRadius: 0, mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 3, py: 1 }}>
              <Notifications sx={{ mr: 2, color: theme.palette.info.main }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Notifications & Preferences</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Stack spacing={2}>
                 <FormControlLabel control={<Switch checked={form.notificationsEmail} onChange={(e) => onChange("notificationsEmail", e.target.checked)} />} label="Email reminders" />
                 <FormControlLabel control={<Switch checked={form.notificationsSMS} onChange={(e) => onChange("notificationsSMS", e.target.checked)} />} label="SMS reminders" />
                 <FormControlLabel control={<Switch checked={form.marketing} onChange={(e) => onChange("marketing", e.target.checked)} />} label="Marketing Updates" />
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* RIGHT */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={stickySx}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={1.2}>
                <Paper elevation={0} sx={{ ...paperSx }}>
                  <Typography sx={{ fontWeight: 950 }}>Data & Privacy</Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>Review your data sharing approvals.</Typography>
                  <Button component={Link} href="/consent" variant="outlined" endIcon={<ArrowForward />} sx={{ borderRadius: 0 }}>Go to Consent</Button>
                </Paper>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Button fullWidth onClick={handleSaveClick} variant="contained" color="success" startIcon={<Save />} sx={{ borderRadius: 0, py: 1.1, fontWeight: 950 }}>
                Save settings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Switch Account Modal */}
      <Dialog open={switchModalOpen} onClose={() => setSwitchModalOpen(false)}>
         <DialogTitle>Switch Account</DialogTitle>
         <DialogContent sx={{ minWidth: 300 }}>
            {savedAccounts.length === 0 && <Typography color="textSecondary">No other saved accounts.</Typography>}
            <List>
               {savedAccounts.map((acc, idx) => (
                  <ListItem button key={idx} onClick={() => handleSwitchAccountSelect(acc)}>
                     <ListItemIcon><Person /></ListItemIcon>
                     <ListItemText primary={acc.username} secondary={acc.email} />
                  </ListItem>
               ))}
               <ListItem button onClick={() => { logout(); window.location.href = '/login'; }}>
                  <ListItemIcon><ExitToApp color="primary" /></ListItemIcon>
                  <ListItemText primary="Add New Account" />
               </ListItem>
            </List>
         </DialogContent>
         <DialogActions>
            <Button onClick={() => setSwitchModalOpen(false)}>Cancel</Button>
         </DialogActions>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Permanent Action</DialogTitle>
        <DialogContent><Typography>Are you sure you want to permanently delete your account and all associated health data?</Typography></DialogContent>
        <DialogActions>
           <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
           <Button color="error" variant="contained" onClick={handleDeleteAccount}>Yes, Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={2400} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.type as any} variant="filled" sx={{ borderRadius: 0 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
