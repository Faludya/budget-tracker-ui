import * as React from 'react';
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const featureCards = [
  {
    img: 'https://picsum.photos/800/450?random=11',
    title: 'Visualize Your Spending',
    description: 'Get a clear picture of where your money goes each month with interactive charts and summaries.',
  },
  {
    img: 'https://picsum.photos/800/450?random=12',
    title: 'Set Budgets by Category',
    description: 'Assign monthly limits to your categories and monitor your progress to stay on track.',
  },
  {
    img: 'https://picsum.photos/800/450?random=13',
    title: 'Track in Real-Time',
    description: 'Add expenses on the go and get instant feedback on your spending behavior.',
  },
  {
    img: 'https://picsum.photos/800/450?random=14',
    title: 'Export & Analyze',
    description: 'Export your transactions to CSV and gain deeper insights into your financial habits.',
  },
];

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
}));

export default function LandingPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, py: 6 }}>

      {/* Hero Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h2" gutterBottom>
            Take Control of Your Finances
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Track expenses, set budgets, and reach your financial goals with ease.
          </Typography>
          <Button variant="contained" size="large">Get Started</Button>
          <Button variant="outlined" size="large" sx={{ ml: 2 }}>Try Demo</Button>
        </Box>
        <Box sx={{ flex: 1 }}>
          <img src="https://picsum.photos/600/400?grayscale" alt="Budget Tracker" style={{ width: '100%', borderRadius: '12px' }} />
        </Box>
      </Box>

      {/* Features Section */}
      <Box>
        <Typography variant="h4" gutterBottom>
          Why Choose Our Budget Tracker?
        </Typography>
        <Grid container spacing={3}>
          {featureCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StyledCard variant="outlined">
                <CardMedia
                  component="img"
                  image={card.img}
                  alt={card.title}
                  sx={{ aspectRatio: '16 / 9', borderBottom: '1px solid', borderColor: 'divider' }}
                />
                <StyledCardContent>
                  <Typography variant="h6" gutterBottom>{card.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{card.description}</Typography>
                </StyledCardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call To Action Section */}
      <Box textAlign="center" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>
          Ready to start your journey to financial freedom?
        </Typography>
        <Button variant="contained" size="large">Create Your Free Account</Button>
      </Box>

    </Box>
  );
}
