// 📁 components/AppSelect.jsx
import React from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  InputAdornment,
} from "@mui/material";

const AppSelect = ({
  label,
  value,
  onChange,
  options = [],
  getOptionLabel = (opt) => opt?.toString?.() ?? "",
  getOptionValue = (opt) => opt?.id ?? "",
  groupBy = null,
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
      <Autocomplete
        options={options}
        value={value || null}
        onChange={(event, newValue) => onChange(newValue)}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, val) =>
          getOptionValue(option) === getOptionValue(val)
        }
        groupBy={groupBy ?? undefined}
        popupIcon={null} // removed icon from right
        renderInput={(params) => {
          const { InputProps, ...rest } = params;
          return (
            <TextField
              {...rest}
              fullWidth
              variant="outlined"
              placeholder="Search..."
              InputProps={{
                ...InputProps,
                endAdornment: null, // removes the box on the right
                startAdornment: icon ? (
                  <InputAdornment position="start">{icon}</InputAdornment>
                ) : InputProps.startAdornment,
                style: {
                  fontSize: "0.95rem",
                  padding: "8px 12px",
                  borderRadius: 8,
                },
              }}
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  paddingRight: "12px !important",
                },
              }}
              {...props}
            />
          );
        }}
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 4],
                },
              },
            ],
            sx: {
              backgroundColor: "white",
              border: "1px solid #ccc",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              borderRadius: 2,
              mt: 0.5,
              overflow: "hidden",
            },
          },
        }}
        sx={{
          "& .MuiAutocomplete-listbox": {
            fontSize: "0.95rem",
            padding: 0,
            backgroundColor: "#fff",
            borderRadius: 2,
            overflow: "hidden",
          },
          "& .MuiAutocomplete-option": {
            padding: "10px 14px",
            borderBottom: "1px solid #eee",
          },
          "& .MuiAutocomplete-groupLabel": {
            fontWeight: 500,
            fontSize: "0.8rem",
            color: "#999",
            backgroundColor: "#fafafa",
            padding: "6px 12px",
          },
        }}
      />
    </Box>
  );
};

export default AppSelect;