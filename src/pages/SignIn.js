import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  FormLabel,
  FormControl,
  Link,
  TextField,
  Typography,
  Stack,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ForgotPassword from "../components/ForgotPassword";
import AppTheme from "../shared-theme/AppTheme";
import GoogleIcon from "../components/CustomIcons";
import SitemarkIcon from "../components/SitemarkIcon";
import CircularProgress from "@mui/material/CircularProgress";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  marginTop: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start", // top-align
  minHeight: "100vh",
  paddingTop: theme.spacing(6), // move card higher up
  paddingBottom: theme.spacing(4),
  position: "relative",
  zIndex: 0,
  backgroundImage:
    "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  ...theme.applyStyles("dark", {
    backgroundImage:
      "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
  }),
}));


export default function SignIn(props) {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear errors on change
  };

  const validateInputs = () => {
    let newErrors = {};
    if (!credentials.email || !/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!credentials.password || credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, credentials)
      const { token, userId } = response.data;

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", userId);
        setSnackbar({ open: true, message: "Login successful!", severity: "success" });

        setTimeout(() => {
          navigate("/budget-tracker");
          window.location.reload(); // Ensure UI updates (Navbar, Protected Routes)
        }, 1000);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Invalid credentials. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.REACT_APP_API_BASE_URL?.replace("/api", "");
    const returnUrl = `${window.location.origin}/google-auth`;

    window.location.href = `${backendUrl}/api/users/login-google?returnUrl=${encodeURIComponent(returnUrl)}`;
  };


  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer>
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            Sign in
          </Typography>

          {/* ✅ Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={!!errors.email}
                helperText={errors.email}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                required
                fullWidth
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={!!errors.password}
                helperText={errors.password}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                onChange={handleChange}
              />
            </FormControl>

            <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
            <ForgotPassword open={open} handleClose={handleClose} />

            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign in"}
            </Button>

            <Link component="button" type="button" onClick={handleClickOpen} variant="body2" sx={{ alignSelf: "center" }}>
              Forgot your password?
            </Link>
          </Box>

          {/* ✅ Divider + Google Login */}
          <Divider>or</Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogleLogin}>
              Sign in with Google
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" variant="body2" sx={{ alignSelf: "center" }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AppTheme>
  );
}
