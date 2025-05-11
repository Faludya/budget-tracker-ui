import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import Blog from "./pages/Blogs";
import Privacy from './pages/Privacy';
import ContactUs from "./pages/ContactUs"
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./pages/ProtectedRoute";
import BudgetTracker from "./pages/BudgetTracker";
import Categories from "./pages/Categories";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";

import Footer from "./components/Footer"; // Keep Footer global if needed
import AppTheme from "./shared-theme/AppTheme"; // Ensure it's correctly imported
import Container from "@mui/material/Container";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Router>
        <Box
          display="flex"
          flexDirection="column"
          minHeight="100vh"   // 🔥 THIS is what makes the footer stick to the bottom
        >
          <Navbar />

          <Box component="main" flex="1">
            <Container
              maxWidth="lg"
              component="main"
              sx={{
                marginTop: "100px",       // spacing under navbar
                paddingBottom: "50px",   // spacing above footer
              }}
            >
              <Routes>
                <Route path="/" element={<Blog />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/google-auth" element={<GoogleAuthCallback />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/contactus" element={<ContactUs />} />
                <Route element={<ProtectedRoute />}>
                <Route path="/budget-tracker" element={<BudgetTracker />} />
                <Route path="/categories" element={<Categories />} />
                </Route>
              </Routes>
            </Container>
          </Box>

          <Footer />
        </Box>
      </Router>
    </AppTheme>
    </LocalizationProvider>
  );
}

export default App;

//Execution policies
//Set-ExecutionPolicy Unrestricted -Scope Process
