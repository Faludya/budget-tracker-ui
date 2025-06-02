import React from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import * as Icons from "@mui/icons-material";

const AppIconPicker = ({ value, onChange, label = "Icon" }) => {
  const iconOptions = [
    "Home",
    "Fastfood",
    "ShoppingCart",
    "CarRental",
    "Category",
    "Work",
    "Pets",
    "FitnessCenter",
    "HealthAndSafety",
  ];

  return (
    <Autocomplete
      options={iconOptions}
      value={value || ""}
      onChange={(event, newValue) => onChange(newValue)}
      getOptionLabel={(option) => option}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{ display: "flex", alignItems: "center", p: 1.2 }}
        >
          {React.createElement(Icons[option] || Icons.Category, {
            fontSize: "small",
            sx: { mr: 1 },
          })}
          <Typography variant="body2">{option}</Typography>
        </Box>
      )}
      renderInput={(params) => <TextField {...params} label={label} />}
      sx={{
        mt: 2,
        "& .MuiAutocomplete-listbox": {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "8px",
        },
      }}
    />
  );
};

export default AppIconPicker;
