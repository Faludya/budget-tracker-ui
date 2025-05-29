import React from "react";
import { Box, Typography } from "@mui/material";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";

const AppAutoTextarea = ({
  label,
  name,
  value,
  onChange,
  maxLength = 500,
  minRows = 5,
  error,
  helperText,
}) => {
  const currentLength = value?.length || 0;

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
      <TextareaAutosize
        name={name}
        value={value}
        onChange={onChange}
        minRows={minRows}
        maxLength={maxLength}
        style={{
          width: "100%",
          fontSize: "1rem",
          lineHeight: 1.6,
          borderRadius: 6,
          padding: "14px",
          border: error ? "1px solid #d32f2f" : "1px solid #ccc",
          outlineColor: error ? "#d32f2f" : "#1976d2",
          resize: "none",
        }}
      />
      {helperText && (
        <Typography variant="caption" color={error ? "error" : "textSecondary"} sx={{ ml: 0.5 }}>
          {helperText}
        </Typography>
      )}
      <Typography
        variant="caption"
        sx={{
          mt: 0.5,
          ml: 0.5,
          display: "block",
          textAlign: "right",
          color: error ? "error.main" : "text.secondary",
        }}
      >
        {currentLength}/{maxLength}
      </Typography>
    </Box>
  );
};

export default AppAutoTextarea;
