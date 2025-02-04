import React from "react";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <AppBar position="static" color="primary">
      <Container>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Budget Tracker
          </Typography>
          <Button color="inherit" component={Link} to="/signin">
            Sign In
          </Button>
          <Button color="inherit" component={Link} to="/signup">
            Sign Up
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
