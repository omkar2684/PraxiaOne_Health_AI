"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Divider,
  Alert,
  Avatar,
  IconButton
} from "@mui/material";

import Lottie from "lottie-react";
import signupAnimation from "@/public/animations/signup-security.json";
import { PhotoCamera } from "@mui/icons-material";

import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";

import { register, login, socialLogin, uploadProfilePicture } from "@/lib/api";

import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "app_id"; // Facebook SDK crashes without a numeric-ish string sometimes

function SignupForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [allergies, setAllergies] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const onSignup = async () => {
    const u = username.trim();
    const e = email.trim();
    const p = password;

    setErr("");
    if (!u) return setErr("Please enter a username.");
    if (u.includes(" ")) return setErr("Usernames cannot contain spaces. Use only letters, numbers, and @/./+/-/_ characters.");
    if (!e || !e.includes("@")) return setErr("Please enter a valid email address.");
    if (!p || p.length < 6) return setErr("Password must be at least 6 characters.");

    setLoading(true);

    try {
      await register({
        username: u,
        email: e,
        password: p,
        full_name: fullName,
        phone_number: phoneNumber,
        allergies: allergies,
        age: age ? parseInt(age) : null,
        gender
      });

      if (typeof window !== "undefined") {
        const keys = ["praxiaone_consent_state_v1", "praxiaone_wearables_state_v1", "praxiaone_support_drafts_v1"];
        keys.forEach(k => window.localStorage.removeItem(k));
      }

      await login(u, p);

      if (profileImage) {
        try {
          await uploadProfilePicture(profileImage);
        } catch (imgE) {
          console.error("Profile picture upload failed", imgE);
        }
      }

      router.push("/consent");
    } catch (e: any) {
      setErr(e.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        await socialLogin("Google", tokenResponse.access_token);
        router.push("/consent");
      } catch(error) {
        setErr("Google provider auth failed on server.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setErr("Could not retrieve Google OAuth token.")
  });

  const responseFacebook = async (response: any) => {
    if (response.accessToken) {
      try {
        setLoading(true);
        await socialLogin("Facebook", response.accessToken, response.email, response.name);
        router.push("/consent");
      } catch(e) {
        setErr("Facebook provider auth failed on server.");
      } finally {
        setLoading(false);
      }
    } else {
      setErr("Could not retrieve Facebook OAuth token.");
    }
  };

  return (
    <Box sx={{ minHeight: "80vh", display: "grid", placeItems: "center", p: 2 }} suppressHydrationWarning>
      <Stack spacing={3} alignItems="center" sx={{ width: "100%", maxWidth: 440 }}>
        {/* ANIMATION */}
        <Box sx={{ width: "100%", maxWidth: 320, borderRadius: 0, background: "linear-gradient(180deg, rgba(14,165,233,0.10), rgba(20,184,166,0.08))", boxShadow: "0 25px 80px rgba(2,6,23,0.08)", p: 2, display: "grid", placeItems: "center" }}>
          <Lottie animationData={signupAnimation} loop autoplay style={{ height: 220 }} />
        </Box>

        {/* CARD */}
        <Card sx={{ width: "100%", borderRadius: 0, boxShadow: "0 30px 90px rgba(2,6,23,0.10)" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Create your account</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Join PraxiaOne and take control of your wellness data.</Typography>

            {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

            <Box component="form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="center" mb={2}>
                  <Box position="relative">
                    <Avatar src={profilePreview} sx={{ width: 80, height: 80 }} />
                    <IconButton color="primary" aria-label="upload picture" component="label" sx={{ position: "absolute", bottom: -10, right: -10, backgroundColor: "background.paper", "&:hover":{backgroundColor: "background.paper"} }}>
                      <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                      <PhotoCamera />
                    </IconButton>
                  </Box>
                </Box>

                <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth autoComplete="off" />
                <TextField label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} fullWidth autoComplete="off" />
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth autoComplete="email" />
                <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth autoComplete="off" />
                <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth autoComplete="new-password" />

                <Stack direction="row" spacing={2}>
                  <TextField label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} fullWidth autoComplete="off" />
                  <TextField select label="Gender" value={gender} onChange={(e) => setGender(e.target.value)} fullWidth SelectProps={{ native: true }} autoComplete="off">
                    <option value=""></option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </TextField>
                </Stack>
                <TextField label="Allergies (if any)" value={allergies} onChange={(e) => setAllergies(e.target.value)} fullWidth autoComplete="off" />

                <Button variant="contained" color="success" onClick={onSignup} disabled={loading} sx={{ borderRadius: 0, fontWeight: 900, py: 1.2 }}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }}>or continue with</Divider>

            {/* SOCIAL LOGIN */}
            <Stack spacing={1.5}>
              <Button variant="outlined" startIcon={<GoogleIcon />} sx={{ borderRadius: 0, fontWeight: 700 }} onClick={() => loginGoogle()} disabled={loading}>
                Continue with Google
              </Button>
              <FacebookLogin
                appId={FACEBOOK_APP_ID}
                callback={responseFacebook}
                render={(renderProps: any) => (
                  <Button variant="outlined" startIcon={<FacebookIcon />} sx={{ borderRadius: 0, fontWeight: 700 }} onClick={renderProps.onClick} disabled={renderProps.disabled || loading}>
                    Continue with Facebook
                  </Button>
                )}
              />
            </Stack>

             {GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID" && (
                <Alert severity="warning" sx={{ mt: 3, fontSize: "12px" }}>
                   Google & Facebook Social Login require API keys in your .env variables to work.
                </Alert>
             )}

            <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
              Already have an account?{" "}
              <span style={{ color: "#0ea5e9", cursor: "pointer", fontWeight: 700 }} onClick={() => router.push("/login")}>
                Log in
              </span>
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

export default function SignupPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SignupForm />
    </GoogleOAuthProvider>
  )
}
