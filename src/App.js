import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Blog from "./pages/Blogs";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer"; // Keep Footer global if needed
import AppTheme from "./shared-theme/AppTheme"; // Ensure it's correctly imported

function App() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Router>
        <Navbar /> {/* Navbar will always be shown on all pages */}
        <Routes>
          <Route path="/" element={<Blog />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
        <Footer /> {/* Footer will always be shown on all pages */}
      </Router>
    </AppTheme>
  );
}

export default App;
