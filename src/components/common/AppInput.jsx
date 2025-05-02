import React from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";

const AppInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  icon = null,
  ...props
}) => {
  return (
    <Box>
      {label && (
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 500,
            fontSize: "0.9rem",
            color: "#444",
            mb: 0.5,
            ml: 0.5,
          }}
        >
          {label}
        </Typography>
      )}
      <TextField
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        fullWidth
        variant="outlined"
        InputProps={{
          startAdornment: icon ? (
            <InputAdornment position="start">{icon}</InputAdornment>
          ) : undefined,
        }}
        inputProps={{
          style: {
            fontSize: "1rem",
            padding: "14px",
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
          },
        }}
        {...props}
      />
    </Box>
  );
};

export default AppInput;
