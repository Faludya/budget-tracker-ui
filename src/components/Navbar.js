import * as React from "react";
import { useNavigate } from "react-router-dom";
import { alpha, styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { Box, AppBar, Toolbar, Button, IconButton, Container, Divider, MenuItem, Drawer,} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ColorModeIconDropdown from "../shared-theme/ColorModeIconDropdown";
import Sitemark from "../components/SitemarkIcon";

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
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem("authToken"));
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
          {/* Left Section - Logo & Menu Items */}
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", px: 0 }}>
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
              {/* Show Budget Tracker only if user is logged in */}
              {isAuthenticated && (
                <Button component={Link} to="/budget-tracker" variant="text" color="info" size="small">
                  Budget Tracker
                </Button>
              )}
            </Box>
          </Box>

          {/* Right Section - Authentication & Theme Toggle */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, alignItems: "center" }}>
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

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: { top: "var(--template-frame-height, 0px)" },
              }}
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
                  <MenuItem component={Link} to="/budget-tracker" onClick={toggleDrawer(false)}>
                    Budget Tracker
                  </MenuItem>
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
      </Container>
    </AppBar>
  );
}
