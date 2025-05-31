import React from "react";
import { Box, Typography, Stack } from "@mui/material";

const BudgetBreakdown = ({ items, currencySymbol = "LEI" }) => {
  return (
    <Box p={2} border="1px solid #ccc" borderRadius={2}>
      <Typography variant="h6">Budget Breakdown</Typography>
      <Stack spacing={1} mt={2}>
        {items.map((item, index) => (
          <Typography key={index}>
            {item.categoryType || "Category"}: {item.percentage ? `${item.percentage}% → ` : ""}
            {item.limit ?? item.amount} {currencySymbol}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};

export default BudgetBreakdown;
