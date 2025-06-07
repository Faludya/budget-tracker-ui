// 📁 components/CategorySelect.jsx
import React from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material";
import * as Icons from "@mui/icons-material";

const CategorySelect = ({
  label,
  value,
  onChange,
  options = [],
  icon = null,
  placeholder = "Search categories...",
  ...props
}) => {
  const getOptionLabel = (opt) => opt?.name ?? "";
  const getOptionValue = (opt) => opt?.id ?? "";

  const getGroupedOptions = () => {
    const parents = options.filter((cat) => !cat.parentCategoryId);
    const grouped = [];

    for (const parent of parents) {
      grouped.push({ ...parent, isGroupHeader: true });
      const children = options.filter((c) => c.parentCategoryId === parent.id);
      grouped.push(...children.map((c) => ({ ...c, parent })));
    }

    return grouped;
  };

  const renderOption = (props, option) => {
    const IconComponent = Icons[option.iconName] || Icons.Category;
    const isChild = !!option.parentCategoryId;

    return (
      <li {...props}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ pl: isChild ? 3 : 1 }}
        >
          <IconComponent
            fontSize="small"
            sx={{ color: option.colorHex || "inherit" }}
          />
          <Typography variant="body2" fontWeight={isChild ? 400 : 600}>
            {option.name}
          </Typography>
        </Stack>
      </li>
    );
  };

  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 0.5,
            fontWeight: 500,
            fontSize: "0.875rem",
            color: "text.primary",
          }}
        >
          {label}
        </Typography>
      )}

      <Autocomplete
        options={getGroupedOptions()}
        value={value || null}
        onChange={(event, newValue) => onChange(newValue)}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(opt, val) => getOptionValue(opt) === getOptionValue(val)}
        popupIcon={null}
        clearIcon={null}
        disableClearable
        renderOption={renderOption}
        renderInput={(params) => {
          const { InputProps, ...rest } = params;
          return (
            <TextField
              {...rest}
              fullWidth
              variant="outlined"
              placeholder={placeholder}
              InputProps={{
                ...InputProps,
                startAdornment: icon ? (
                  <InputAdornment position="start" sx={{ mr: 1.5, ml: 0.5 }}>
                    {icon}
                  </InputAdornment>
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
              }}
              {...props}
            />
          );
        }}
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 6],
                },
              },
            ],
            sx: {
              boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
              borderRadius: 2,
              border: "1px solid #ddd",
              mt: 0.5,
              backgroundColor: "#fff",
              overflow: "hidden",
            },
          },
        }}
        sx={{
          "& .MuiAutocomplete-inputRoot": {
            padding: "0px !important",
            minHeight: "40px",
            alignItems: "center",
            boxSizing: "border-box",
          },
          "& .MuiAutocomplete-option": {
            padding: "10px 14px",
            borderBottom: "1px solid #f5f5f5",
            "&:last-of-type": {
              borderBottom: "none",
            },
          },
          "& .MuiAutocomplete-endAdornment": {
            display: "none",
          },
        }}
      />
    </Box>
  );
};

export default CategorySelect;
