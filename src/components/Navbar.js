import * as React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  Avatar,
  Menu,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { MonetizationOn, AccountCircle } from "@mui/icons-material";

import apiClient from "../api/axiosConfig";
import Sitemark from "./SitemarkIcon";
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

const NavButton = ({ to, label, currentPath }) => (
  <Button
    component={Link}
    to={to}
    variant="text"
    color={currentPath === to ? "primary" : "info"}
    size="small"
    sx={{
      borderBottom: currentPath === to ? "2px solid" : "2px solid transparent",
      borderRadius: 0,
      fontWeight: currentPath === to ? 600 : 400,
    }}
  >
    {label}
  </Button>
);

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    !!localStorage.getItem("authToken")
  );
  const [currencies, setCurrencies] = React.useState([]);
  const { preferences, setPreferences } = useUserPreferences();
  const { fetchTransactions } = useTransactionContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const toggleDrawer = (newOpen) => () => setOpen(newOpen);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("profilePictureUrl");
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
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Sitemark />
            </Link>
            <Box sx={{ display: { xs: "none", md: "flex" }, ml: 2 }}>
              <NavButton to="/" label="Home" currentPath={location.pathname} />
              <NavButton to="/privacy" label="Privacy" currentPath={location.pathname} />
              <NavButton to="/contactus" label="Contact" currentPath={location.pathname} />
              {isAuthenticated && (
                <>
                  <NavButton to="/budget-tracker" label="Budget Tracker" currentPath={location.pathname} />
                  <NavButton to="/dashboard" label="Dashboard" currentPath={location.pathname} />
                  <NavButton to="/categories" label="Categories" currentPath={location.pathname} />
                  <NavButton to="/budget/setup" label="Set Budget" currentPath={location.pathname} />
                </>
              )}
            </Box>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            {isAuthenticated && preferences && (
              <AppSelect
                value={currencies.find((c) => c.code === preferences?.preferredCurrency) || null}
                options={currencies}
                getOptionLabel={(opt) => `${opt.symbol} - ${opt.code}`}
                getOptionValue={(opt) => opt.code}
                onChange={(selectedCurrency) => selectedCurrency && handleCurrencyChange(selectedCurrency.code)}
                icon={<MonetizationOn fontSize="small" />}
                sx={{ minWidth: 150 }}
              />
            )}

            {isAuthenticated ? (
              <>
                <Tooltip title="Account">
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                    <Avatar
                      src={localStorage.getItem("profilePictureUrl") || undefined}
                      sx={{ width: 32, height: 32 }}
                    >
                      <AccountCircle />
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{ elevation: 2, sx: { mt: 1.5 } }}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                    User Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      handleLogout();
                    }}
                  >
                    <Button color="secondary" variant="text" fullWidth>
                      Logout
                    </Button>
                  </MenuItem>
                </Menu>
              </>
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
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
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
                    <MenuItem component={Link} to="/profile" onClick={toggleDrawer(false)}>
                      Profile
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
