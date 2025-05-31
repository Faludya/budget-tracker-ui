// 📁 components/BudgetBreakdown.jsx
import React from "react";
import { Box, Typography, Stack, Divider } from "@mui/material";

const BudgetBreakdown = ({ items, currencySymbol = "LEI" }) => {
  const grouped = items.reduce((acc, item) => {
    const group = item.categoryType || "Uncategorized";
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <Box p={2} border="1px solid #ccc" borderRadius={2}>
      <Typography variant="h6" gutterBottom>Budget Breakdown</Typography>
      <Stack spacing={2}>
        {Object.entries(grouped).map(([categoryType, groupItems]) => {
          const subtotal = groupItems.reduce((sum, item) => sum + (item.limit ?? item.amount ?? 0), 0);
          return (
            <Box key={categoryType}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>{categoryType} — {subtotal.toFixed(2)} {currencySymbol}</Typography>
              <Stack spacing={0.5} pl={1}>
                {groupItems.map((item, idx) => (
                  <Typography variant="body2" key={idx}>
                    • {item.name ?? item.categoryType}: {(item.limit ?? item.amount ?? 0).toFixed(2)} {currencySymbol}
                  </Typography>
                ))}
              </Stack>
              <Divider sx={{ my: 1 }} />
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default BudgetBreakdown;
