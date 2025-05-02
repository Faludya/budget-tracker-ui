import React from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";

const AppSelect = ({
  label,
  value,
  onChange,
  options,
  getOptionLabel = (opt) => opt,
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
            mb: 1.2,
            ml: 0.5,
          }}
        >
          {label}
        </Typography>
      )}
      <TextField
        select
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
      >
        {options.map((option) => (
          <MenuItem key={option.id || option} value={option.id || option}>
            {getOptionLabel(option)}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default AppSelect;