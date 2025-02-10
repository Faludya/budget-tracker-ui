import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { FiPhone, FiMail, FiClock, FiMapPin } from "react-icons/fi";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { BsChat } from "react-icons/bs";

const StyledContactForm = styled(Paper)({
  padding: "2rem",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
});

const InfoCard = styled(Card)({
  height: "100%",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
  },
});

const SocialButton = styled(IconButton)({
  margin: "0 8px",
  color: "#1976d2",
  "&:hover": {
    backgroundColor: "rgba(25, 118, 210, 0.1)",
  },
});

const ContactUs = () => {
  const initialFormData = {
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});

  const subjects = ["General Inquiry", "Technical Support", "Business Proposal", "Feedback", "Other"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.message) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated API call
      setSnackbar({ open: true, message: "Message sent successfully!", severity: "success" });
      setFormData(initialFormData);
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to send message. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Contact Us
      </Typography>
      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={6}>
          <StyledContactForm elevation={3}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {["fullName", "email", "phone"].map((field, index) => (
                  <Grid item xs={12} key={index}>
                    <TextField
                      fullWidth
                      label={field === "phone" ? "Phone (optional)" : field.replace(/([A-Z])/g, " $1").trim()}
                      name={field}
                      type={field === "email" ? "email" : "text"}
                      value={formData[field]}
                      onChange={handleChange}
                      error={!!errors[field]}
                      helperText={errors[field]}
                      required={field !== "phone"}
                    />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    error={!!errors.subject}
                    helperText={errors.subject}
                    required
                  >
                    {subjects.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    error={!!errors.message}
                    helperText={errors.message}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Send Message"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </StyledContactForm>
        </Grid>

        {/* Company Info */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {[
              { icon: FiMapPin, text: "123 Business Ave, NY 10001, USA" },
              { icon: FiPhone, text: "+1 (555) 123-4567" },
              { icon: FiMail, text: "contact@company.com" },
              { icon: FiClock, text: "Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM" },
            ].map((info, index) => (
              <Grid item xs={12} key={index}>
                <InfoCard>
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <info.icon size={24} />
                    <Typography>{info.text}</Typography>
                  </CardContent>
                </InfoCard>
              </Grid>
            ))}

            {/* Social Media */}
            <Grid item xs={12}>
              <InfoCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Follow Us
                  </Typography>
                  <Box display="flex" justifyContent="center">
                    {[FaFacebook, FaTwitter, FaLinkedin, FaInstagram].map((Icon, index) => (
                      <SocialButton key={index}>
                        <Icon />
                      </SocialButton>
                    ))}
                  </Box>
                </CardContent>
              </InfoCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Chat Button */}
      <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
        <IconButton sx={{ backgroundColor: "primary.main", color: "white", "&:hover": { backgroundColor: "primary.dark" } }}>
          <BsChat size={24} />
        </IconButton>
      </Box>
    </Container>
  );
};

export default ContactUs;
