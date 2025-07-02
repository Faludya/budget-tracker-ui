import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  TextField,
  Typography,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme";
import GoogleIcon from "../components/CustomIcons";
import SitemarkIcon from "../components/SitemarkIcon";
import axios from "axios";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  marginTop: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "100dvh",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignUp(props) {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = React.useState({});
  const [snackbar, setSnackbar] = React.useState({ open: false, message: "", severity: "info" });

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const validateInputs = (data) => {
    const errors = {};
    if (!data.firstName) errors.firstName = "First name is required.";
    if (!data.lastName) errors.lastName = "Last name is required.";
    if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = "Invalid email address.";
    if (!data.password || data.password.length < 6) errors.password = "Password must be at least 6 characters.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const formData = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      password: data.get("password"),
    };

    if (!validateInputs(formData)) return;

    try {
      // Register
      await axios.post(`${API_BASE_URL}/users/register`, formData);

      // Auto-login
      const responseLogin = await axios.post(`${API_BASE_URL}/users/login`, {
        email: formData.email,
        password: formData.password,
      });

      const { token, userId } = responseLogin.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", userId);
      navigate("/budget-tracker");
      window.location.reload(); // Ensure app refresh

    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Something went wrong during sign up.",
        severity: "error",
      });
    }
  };

  const handleGoogleSignup = () => {
    const backendUrl = process.env.REACT_APP_API_BASE_URL?.replace("/api", "");
    const returnUrl = `${window.location.origin}/google-auth`;
    window.location.href = `${backendUrl}/api/users/login-google?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography component="h1" variant="h4" sx={{ fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            Sign up
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {["firstName", "lastName", "email", "password"].map((field) => (
              <FormControl key={field}>
                <FormLabel htmlFor={field}>{field === "password" ? "Password" : field.replace(/^\w/, c => c.toUpperCase())}</FormLabel>
                <TextField
                  id={field}
                  name={field}
                  type={field === "password" ? "password" : "text"}
                  placeholder={field === "password" ? "••••••" : ""}
                  required
                  fullWidth
                  error={!!formErrors[field]}
                  helperText={formErrors[field]}
                />
              </FormControl>
            ))}

            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" />}
              label="I want to receive updates via email."
            />

            <Button type="submit" fullWidth variant="contained">
              Sign up
            </Button>
          </Box>

          <Divider>
            <Typography sx={{ color: "text.secondary" }}>or</Typography>
          </Divider>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={handleGoogleSignup} startIcon={<GoogleIcon />}>
              Sign up with Google
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/signin" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </SignUpContainer>
    </AppTheme>
  );
}
