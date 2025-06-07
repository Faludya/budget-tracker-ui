import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Stack,
  Card,
  Button,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import {
  Email,
  Phone,
  Home,
  CalendarToday,
  AccountCircle,
  GTranslate,
  MonetizationOn,
} from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import { Player } from "@lottiefiles/react-lottie-player";
import userProfileAnimation from "../assets/user_profile_animation.json";
import AppInput from "../components/common/AppInput";
import AppDatePicker from "../components/common/AppDatePicker";
import AppSelect from "../components/common/AppSelect";
import { useUserContext } from "../contexts/UserContext";
import dayjs from "dayjs";
import apiClient from "../api/axiosConfig";

const UserProfilePage = () => {
  const {
    user,
    preferences,
    updateUser,
    updatePreferences,
  } = useUserContext();

  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState(null);
  const [prefData, setPrefData] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editingImage, setEditingImage] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  useEffect(() => {
    if (user) setFormData(user);
    if (preferences) setPrefData(preferences);
  }, [user, preferences]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await apiClient.get("/currencies");
        setCurrencies(response.data);
      } catch (err) {
        console.error("Failed to fetch currencies:", err);
      }
    };
    fetchCurrencies();
  }, []);

  const handleTabChange = (event, newValue) => setTab(newValue);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrefChange = (field, value) => {
    setPrefData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date) => {
    const formatted =
      date && dayjs(date).isValid() ? new Date(date).toISOString() : null;
    setFormData((prev) => ({ ...prev, dateOfBirth: formatted }));
  };

  const handleSave = async () => {
    try {
      if (formData) await updateUser(formData);
      if (prefData) {
        await updatePreferences(prefData);
        localStorage.setItem("mui-theme", prefData.theme);
        localStorage.setItem("mui-mode", prefData.theme);
      }
      setSnackbar({
        open: true,
        message: "Changes saved successfully!",
        severity: "success",
      });
      setTimeout(() => window.location.reload(), 300);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to save changes.",
        severity: "error",
      });
    }
  };

  if (!formData || !prefData) return null;

  return (
    <Box p={4}>
      <Typography variant="h6" gutterBottom>
        User Profile
      </Typography>

      <Card
        variant="outlined"
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "background.paper",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ position: "relative", width: 90, height: 90 }}>
            <Avatar
              src={formData.profilePictureUrl}
              alt="Profile"
              sx={{ width: 80, height: 80 }}
            />
            <IconButton
              size="small"
              onClick={() => {
                setEditingImage(true);
                setTempImageUrl(formData.profilePictureUrl || "");
              }}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                p: "4px",
                boxShadow: 1,
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <EditIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </IconButton>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {formData.firstName} {formData.lastName}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Email fontSize="small" />
              <Typography variant="body2">{formData.email}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Phone fontSize="small" />
              <Typography variant="body2">{formData.phoneNumber}</Typography>
            </Stack>
            {formData.googleId && (
              <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                <GTranslate fontSize="small" color="primary" />
                <Typography variant="body2" color="primary">
                  Google Account
                </Typography>
              </Stack>
            )}
          </Box>
        </Box>

        {editingImage && (
          <Box mt={2}>
            <Stack spacing={1}>
              <AppInput
                label="Profile Picture URL"
                value={tempImageUrl}
                onChange={(e) => setTempImageUrl(e.target.value)}
              />
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" size="small" onClick={() => setEditingImage(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      profilePictureUrl: tempImageUrl,
                    }));
                    setEditingImage(false);
                  }}
                >
                  Save
                </Button>
              </Box>
            </Stack>
          </Box>
        )}
      </Card>


      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Personal Information" />
        <Tab label="User Preferences" />
      </Tabs>

      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4}>
        <Box flex={1}>
          {tab === 0 && (
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <AppInput
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleUserChange}
                  icon={<AccountCircle />}
                />
                <AppInput
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleUserChange}
                  icon={<AccountCircle />}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <AppInput
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleUserChange}
                  icon={<Phone />}
                />
                <AppDatePicker
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleDateChange}
                  format={preferences?.dateFormat}
                  icon={<CalendarToday />}
                />
              </Stack>
              <AppInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleUserChange}
                icon={<Home />}
              />
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              <AppSelect
                label="Preferred Currency"
                value={
                  currencies.find((c) => c.code === prefData.preferredCurrency) || null
                }
                options={currencies}
                getOptionLabel={(opt) =>
                  opt.symbol ? `${opt.symbol} - ${opt.code}` : opt.code
                }
                getOptionValue={(opt) => opt.code}
                onChange={(val) => handlePrefChange("preferredCurrency", val?.code)}
                icon={<MonetizationOn fontSize="small" />}
              />

              <AppSelect
                label="Theme"
                value={{ id: prefData.theme }}
                options={[{ id: "system" }, { id: "light" }, { id: "dark" }]}
                getOptionLabel={(opt) => opt.id.charAt(0).toUpperCase() + opt.id.slice(1)}
                getOptionValue={(opt) => opt.id}
                onChange={(val) => handlePrefChange("theme", val?.id)}
              />

              <AppSelect
                label="Date Format"
                value={{ id: prefData.dateFormat }}
                options={[
                  { id: "DD/MM/YYYY" },
                  { id: "MM/DD/YYYY" },
                  { id: "YYYY-MM-DD" },
                  { id: "D MMM YYYY" },
                  { id: "MMM D, YYYY" },
                  { id: "dddd, MMM D" },
                ]}
                getOptionLabel={(opt) => opt.id}
                getOptionValue={(opt) => opt.id}
                onChange={(val) => handlePrefChange("dateFormat", val?.id)}
              />
            </Stack>
          )}

          <Button variant="contained" sx={{ mt: 3 }} onClick={handleSave}>
            Save Changes
          </Button>
        </Box>

        <Box width={{ xs: "100%", md: 300 }}>
          <Player
            autoplay
            loop
            src={userProfileAnimation}
            style={{ height: "200px", width: "200px" }}
          />
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfilePage;
