import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import { styled } from '@mui/material/styles';
import image1 from "../assets/finance.jpg";
import image2 from "../assets/category.jpg";
import image3 from "../assets/app.jpg";
import image4 from "../assets/export.jpg";
import hero_landing from "../assets/hero_landing.jpg";
import AOS from 'aos';
import 'aos/dist/aos.css';

const features = [
  {
    img: image1,
    title: 'Visualize Your Spending',
    description: 'Get a clear picture of where your money goes each month with interactive charts and summaries.',
  },
  {
    img: image2,
    title: 'Set Budgets by Category',
    description: 'Assign monthly limits to your categories and monitor your progress to stay on track.',
  },
  {
    img: image3,
    title: 'Track in Real-Time',
    description: 'Add expenses on the go and get instant feedback on your spending behavior.',
  },
  {
    img: image4,
    title: 'Export & Analyze',
    description: 'Export your transactions to CSV and gain deeper insights into your financial habits.',
  },
];

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
}));

export default function LandingPage() {
  React.useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          py: { xs: 6, sm: 8 },
          backgroundImage: `url(${hero_landing})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'black',
          textAlign: 'center',
          borderRadius: 2,
        }}
        data-aos="fade-up"
      >
        <Typography variant="h2" gutterBottom>
          Take Control of Your Finances
        </Typography>
        <Typography variant="h6" paragraph>
          Track expenses, set smart budgets, and visualize your progress—all in one app.
        </Typography>
        <Button variant="contained" size="large" color="primary" sx={{ mt: 2 }}>
          Start Budgeting
        </Button>
      </Box>

      {/* Features Section */}
      <Box sx={{ mt: 2, px: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" align="center" gutterBottom data-aos="fade-up">
          Why Choose Our Budget Tracker?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, i) => (
            <Grid item xs={12} sm={6} md={3} key={i} data-aos="fade-up" data-aos-delay={i * 100}>
              <StyledCard variant="outlined">
                <CardMedia
                  component="img"
                  image={feature.img}
                  alt={feature.title}
                  sx={{
                    width: "100%",
                    height: 160,
                    objectFit: "contain",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#fdfdfd",
                    p: 1,
                  }}
                />
                <StyledCardContent>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </StyledCardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Final Call to Action */}
      <Box
        sx={{
          mt: 6,
          px: 4,
          py: 6,
          textAlign: 'center',
          backgroundColor: 'grey.100',
          borderRadius: 2,
        }}
        data-aos="fade-up"
      >
        <Typography variant="h5" gutterBottom>
          More Than Just a Budget Tracker
        </Typography>
        <Typography variant="body2" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
          Empower your financial journey with smarter insights, consistent progress, and helpful tips along the way.
        </Typography>

        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <InsightsIcon color="primary" fontSize="large" />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                Smart Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                See patterns in your spending and make informed decisions.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <AutoGraphIcon color="secondary" fontSize="large" />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                Growth Tracking
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                Visualize how your financial habits improve over time.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <LightbulbIcon color="warning" fontSize="large" />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                Budgeting Tips
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                Get helpful advice to stay on track and motivated.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

    </Box>
  );
}
