import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { alpha, styled } from "@mui/material/styles";
import {
  AppBar,
  Alert,
  Toolbar,
  Box,
  Button,
  IconButton,
  Container,
  MenuItem,
  Divider,
  Drawer,
  Snackbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { MonetizationOn } from "@mui/icons-material";

import apiClient from "../api/axiosConfig";
import Sitemark from "./SitemarkIcon";
import ColorModeIconDropdown from "../shared-theme/ColorModeIconDropdown";
import AppSelect from "./common/AppSelect";
import { useUserPreferences } from "../contexts/UserPreferencesContext";
import { useTransactionContext } from "../contexts/TransactionContext";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: "8px 12px",
}));

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    !!localStorage.getItem("authToken")
  );
  const [currencies, setCurrencies] = React.useState([]);
  const { preferences, setPreferences } = useUserPreferences();
  const { fetchTransactions } = useTransactionContext();
  const selectedCurrency = currencies.find(
    (c) => c.code === preferences?.preferredCurrency
  );

  const navigate = useNavigate();
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info",
  });

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    navigate("");
    window.location.reload();
  };


  const handleCurrencyChange = async (currencyCode) => {
    const updated = { ...preferences, preferredCurrency: currencyCode };

    try {
      await apiClient.put("/userpreferences", updated, {
        headers: { userId: localStorage.getItem("userId") },
      });
      setPreferences(updated);
      fetchTransactions(); 
      setSnackbar({ open: true, message: "Currency updated!", severity: "info" });
    } catch (error) {
      console.error("Failed to update currency preference", error);
    }
  };



  React.useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await apiClient.get("/currencies");
        setCurrencies(response.data);
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
      }
    };

    fetchCurrencies();
  }, []);

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          {/* Left Section */}
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Sitemark />
            </Link>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <Button component={Link} to="/" variant="text" color="info" size="small">
                Home
              </Button>
              <Button component={Link} to="/privacy" variant="text" color="info" size="small">
                Privacy
              </Button>
              <Button component={Link} to="/contactus" variant="text" color="info" size="small">
                Contact
              </Button>
              {isAuthenticated && (
                <>
                  <Button component={Link} to="/budget-tracker" variant="text" color="info" size="small">
                    Budget Tracker
                  </Button>
                  <Button component={Link} to="/categories" variant="text" color="info" size="small">
                    Category
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            {isAuthenticated && preferences && (
              <AppSelect
  value={preferences?.preferredCurrency}
  options={currencies}
  getOptionLabel={(opt) => `${opt.symbol} - ${opt.code}`}
  getOptionValue={(opt) => opt.code}
  onChange={(selectedCurrency) => {
    if (selectedCurrency) {
      handleCurrencyChange(selectedCurrency.code);
    }
  }}
  icon={<MonetizationOn fontSize="small" />}
  sx={{ minWidth: 150 }}
/>



            )}

            {isAuthenticated ? (
              <Button color="primary" variant="contained" size="small" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Button component={Link} to="/signin" color="primary" variant="text" size="small">
                  Sign in
                </Button>
                <Button component={Link} to="/signup" color="primary" variant="contained" size="small">
                  Sign up
                </Button>
              </>
            )}
            <ColorModeIconDropdown />
          </Box>

          {/* Mobile Section */}
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{ sx: { top: "var(--template-frame-height, 0px)" } }}
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <MenuItem component={Link} to="/" onClick={toggleDrawer(false)}>Home</MenuItem>
                <MenuItem component={Link} to="/privacy" onClick={toggleDrawer(false)}>Privacy</MenuItem>
                <MenuItem component={Link} to="/contactus" onClick={toggleDrawer(false)}>Contact</MenuItem>
                {isAuthenticated && (
                  <>
                    <MenuItem component={Link} to="/budget-tracker" onClick={toggleDrawer(false)}>
                      Budget Tracker
                    </MenuItem>
                    <MenuItem component={Link} to="/categories" onClick={toggleDrawer(false)}>
                      Categories
                    </MenuItem>
                  </>
                )}
                <Divider sx={{ my: 3 }} />
                {isAuthenticated ? (
                  <MenuItem>
                    <Button color="error" variant="contained" fullWidth onClick={handleLogout}>
                      Logout
                    </Button>
                  </MenuItem>
                ) : (
                  <>
                    <MenuItem>
                      <Button component={Link} to="/signup" color="primary" variant="contained" fullWidth>
                        Sign up
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button component={Link} to="/signin" color="primary" variant="outlined" fullWidth>
                        Sign in
                      </Button>
                    </MenuItem>
                  </>
                )}
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>

      </Container>
    </AppBar>
  );
}
