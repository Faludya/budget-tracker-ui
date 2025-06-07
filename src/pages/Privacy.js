import * as React from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import ShareIcon from '@mui/icons-material/Share';
import EmailIcon from '@mui/icons-material/Email';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Confetti from 'react-confetti';

const sections = [
  {
    title: 'Information We Collect',
    icon: <InfoIcon fontSize="large" />,
    content: `We may collect personal information that you voluntarily provide to us, such as your name, email address, and transaction details when using our services.`,
  },
  {
    title: 'How We Use Your Information',
    icon: <EmailIcon fontSize="large" />,
    content: `We use your information to:
      • Provide and maintain our services
      • Improve user experience
      • Communicate with you about updates
      • Ensure data security and compliance`,
  },
  {
    title: 'Sharing of Your Information',
    icon: <ShareIcon fontSize="large" />,
    content: `We do not sell your personal data. We may share information with service providers who help us operate and maintain the application, under strict confidentiality agreements.`,
  },
  {
    title: 'Data Security',
    icon: <SecurityIcon fontSize="large" />,
    content: `We implement industry-standard measures to protect your personal information against unauthorized access, alteration, or destruction.`,
  },
  {
    title: 'Your Choices',
    icon: <AccountCircleIcon fontSize="large" />,
    content: `You may review, update, or delete your account information at any time from within the app. If you have questions or need help, please contact our support team.`,
  },
];

export default function PrivacyPolicy() {
  const [confettiActive, setConfettiActive] = React.useState(false);
  const [clickCount, setClickCount] = React.useState(0);

  const handleTitleClick = () => {
    const next = clickCount + 1;
    setClickCount(next);

    if (next >= 5) {
      setConfettiActive(true);
      setTimeout(() => {
        setConfettiActive(false);
        setClickCount(0);
      }, 5000);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {confettiActive && <Confetti numberOfPieces={400} recycle={true} />}
      <Tooltip title="Click me five times 👀" arrow>
        <Typography
          variant="h3"
          gutterBottom
          sx={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={handleTitleClick}
        >
          Privacy Policy
        </Typography>
      </Tooltip>

      <Typography variant="body1" paragraph>
        Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Budget Tracker application.
      </Typography>

      <Grid container spacing={4}>
        {sections.map((section, index) => (
          <Grid item xs={12} key={index}>
            <Card
              variant="outlined"
              sx={{
                transition: "transform 0.2s ease-in-out",
                '&:hover': {
                  transform: 'scale(1.01)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.2)',
                        color: 'primary.main',
                      },
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography variant="h5">{section.title}</Typography>
                </Box>
                <Typography variant="body1" component="pre" whiteSpace="pre-wrap">
                  {section.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
