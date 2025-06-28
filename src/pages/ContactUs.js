import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  MenuItem,
  Paper,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Tooltip,
  Stack,
  Modal,
} from "@mui/material";
import { styled } from "@mui/system";
import { FiPhone, FiMail, FiClock, FiMapPin } from "react-icons/fi";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import Confetti from "react-confetti";
import Typewriter from "typewriter-effect";
import emailjs from "emailjs-com";

import AppInput from "../components/common/AppInput";
import AppMultilineInput from "../components/common/AppAutoTextarea";

const StyledCard = styled(Card)({
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
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
  const [confetti, setConfetti] = useState(false);
  const [errors, setErrors] = useState({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);

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
      await emailjs.send("service_gnssehg","template_xsrgmvr", formData, "b4GqAAaJbntVTM349" );
      await emailjs.send("service_gnssehg","template_4b42tdm", formData, "b4GqAAaJbntVTM349" );

      setConfetti(true);
      setSuccessModalOpen(true);
      setFormData(initialFormData);
      setTimeout(() => setConfetti(false), 8000);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container maxWidth="lg" sx={{ py: 8, position: "relative" }}>
      {confetti && <Confetti numberOfPieces={300} recycle={false} />}

      <Typography variant="h3" align="center" gutterBottom sx={{ minHeight: 60 }}>
        <Typewriter
          options={{
            strings: ["Say Hello 👋", "Got Feedback? 💡", "Let’s Talk 🧠"],
            autoStart: true,
            loop: true,
            pauseFor: 2500,
            delay: 50,
            deleteSpeed: 20,
          }}
        />
      </Typography>

      <Box display={{ xs: "block", md: "flex" }} gap={6} mt={4}>
        {/* Form Section */}
        <Paper sx={{ p: 4, borderRadius: 3, flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <AppInput
                label="Full name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
              />
              <AppInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
              <AppInput
                label="Phone (optional)"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <AppInput
                label="Subject"
                name="subject"
                select
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
              </AppInput>
              <AppMultilineInput
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                error={!!errors.message}
                helperText={errors.message}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  background: "linear-gradient(to right, #000428, #004e92)",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(to right, #004e92, #000428)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Send 🚀"}
              </Button>
            </Stack>
          </form>
        </Paper>

        {/* Info Section */}
        <Box flex={1} display="flex" flexDirection="column" gap={3}>
          {[
            { icon: FiMapPin, text: "123 Business Ave, NY 10001, USA" },
            { icon: FiPhone, text: "+1 (555) 123-4567" },
            { icon: FiMail, text: "contact@company.com" },
            { icon: FiClock, text: "Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM" },
          ].map((info, i) => (
            <StyledCard key={i}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <info.icon size={22} />
                <Typography>{info.text}</Typography>
              </CardContent>
            </StyledCard>
          ))}

          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Follow Us
              </Typography>
              <Box display="flex" justifyContent="center">
                {[FaFacebook, FaTwitter, FaLinkedin, FaInstagram].map((Icon, i) => (
                  <IconButton key={i} color="primary">
                    <Icon />
                  </IconButton>
                ))}
              </Box>
            </CardContent>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Box
                component="iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.937867290409!2d-74.00594168459207!3d40.712775779331944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316ff3bbcb%3A0xeca8f853d97c2d7a!2s123%20Business%20Ave%2C%20New%20York%2C%20NY%2010001%2C%20USA!5e0!3m2!1sen!2sus!4v1629380817664!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: 8 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

            </CardContent>
          </StyledCard>
        </Box>
      </Box>

      <Tooltip title="We read every message. Even the weird ones. 👵️ " arrow>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 4,
            textAlign: "center",
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          P.S. We use tech magic to handle your messages ✨
        </Typography>
      </Tooltip>

      <Modal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
            width: 300,
          }}
        >
          <Typography id="success-modal-title" variant="h6" gutterBottom>
            🎉 Message Sent!
          </Typography>
          <Typography id="success-modal-description" sx={{ mb: 2 }}>
            Thanks for getting in touch — we’ll get back to you soon.
          </Typography>
          <Button
            onClick={() => setSuccessModalOpen(false)}
            variant="contained"
            fullWidth
          >
            Close
          </Button>
        </Box>
      </Modal>

    </Container>
  );
};

export default ContactUs;
