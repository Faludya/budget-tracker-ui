import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Blog from "./pages/Blogs";
import Privacy from './pages/Privacy';
import ContactUs from "./pages/ContactUs"
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Navbar from "./components/Navbar"; 

import BudgetTracker from "./pages/BudgetTracker";

import Footer from "./components/Footer"; // Keep Footer global if needed
import AppTheme from "./shared-theme/AppTheme"; // Ensure it's correctly imported
import Container from "@mui/material/Container";

function App() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Router>
        <Navbar /> {/* Navbar is always visible */}
        
        {/* Main Content - Adjust marginTop to prevent overlap */}
        <Container
          maxWidth="lg"
          component="main"
          sx={{
            marginTop: "80px", // Adjust based on navbar height
            paddingBottom: "50px", // Ensure spacing from the footer
          }}
        >
          <Routes>
            <Route path="/" element={<Blog />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/budget-tracker" element={<BudgetTracker />} />
          </Routes>
        </Container>

        <Footer /> {/* Footer stays at the bottom */}
      </Router>
    </AppTheme>
  );
}
export default App;

//Execution policies
//Set-ExecutionPolicy Unrestricted -Scope Process
