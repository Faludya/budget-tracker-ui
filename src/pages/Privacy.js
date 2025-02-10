import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AppTheme from '../shared-theme/AppTheme';
import Navbar from '../components/Navbar';

export default function Privacy(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Navbar />
      <Container
        maxWidth="md"
        component="main"
        sx={{ display: 'flex', flexDirection: 'column', my: 8, gap: 4 }}
      >
        <Typography variant="h4" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1">
          Your privacy is important to us. It is Budget Tracker's policy to respect your privacy
          regarding any information we may collect from you across our website.
        </Typography>
        <Typography variant="h6">1. Information We Collect</Typography>
        <Typography variant="body1">
          We collect information that you provide directly to us, such as when you sign up for an account,
          subscribe to a newsletter, or contact us for support.
        </Typography>
        <Typography variant="h6">2. How We Use Your Information</Typography>
        <Typography variant="body1">
          We use the information we collect for various purposes, including providing and maintaining
          our services, improving user experience, and ensuring security.
        </Typography>
        <Typography variant="h6">3. Data Security</Typography>
        <Typography variant="body1">
          We take appropriate measures to protect your personal data from unauthorized access,
          disclosure, alteration, and destruction.
        </Typography>
        <Typography variant="h6">4. Contact Us</Typography>
        <Typography variant="body1">
          If you have any questions about our Privacy Policy, please contact us at support@budgettracker.com.
        </Typography>
      </Container>
    </AppTheme>
  );
}
