// 📁 components/BudgetChart.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, Stack } from "@mui/material";

// Updated colors to match dark-on-light theme
const COLORS = ["#4e73df", "#1cc88a", "#f6c23e", "#e74a3b", "#36b9cc", "#858796"];

const BudgetChart = ({ items = [] }) => {
  const chartData = items.map((item, index) => ({
    name: item.categoryType || `Type ${index + 1}`,
    value: item.limit || item.amount || 0,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Budget Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} LEI`} />
        </PieChart>
      </ResponsiveContainer>

      <Typography variant="body2" align="center" mt={1} color="textSecondary">
        Total Budget: {total} LEI
      </Typography>

      <Stack direction="column" spacing={1} mt={2}>
        {chartData.map((entry, index) => (
          <Stack key={entry.name} direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: 0.5,
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />
            <Typography variant="body2">
              {entry.name}: {entry.value} LEI ({((entry.value / total) * 100).toFixed(1)}%)
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default BudgetChart;
