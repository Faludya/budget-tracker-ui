import React, { useState } from "react";
import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { CalendarMonth } from "@mui/icons-material";
import dayjs from "dayjs";

const AppDatePicker = ({ label, value, onChange, name, views = ["year", "month", "day"], format = "DD/MM/YYYY" }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      {label && (
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 500,
            fontSize: "0.9rem",
            color: "#444",
            mb: 0.6,
            ml: 0.5,
          }}
        >
          {label}
        </Typography>
      )}
      <DatePicker
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={value ? dayjs(value) : null}
        onChange={(newVal) =>
          onChange({ target: { name , value: newVal?.isValid?.() ? newVal.toISOString() : "" } })
        }
         views={views} 
        format={format}
        slots={{
          textField: TextField,
          openPickerButton: () => null, // ✅ removes the entire button including spacing
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            variant: "outlined",
            onClick: () => setOpen(true), // 👈 open on full click
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonth fontSize="small" />
                </InputAdornment>
              ),
            },
            inputProps: {
              style: {
                fontSize: "1rem",
                padding: "14px",
              },
              // allow typing manually
            },
            sx: {
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
              "& .MuiSvgIcon-root": {
                color: "#6e6e6e",
              },
            },
          },
        }}
      />
    </Box>
  );
};

export default AppDatePicker;
