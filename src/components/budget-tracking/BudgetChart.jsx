import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Typography } from "@mui/material";

const COLORS = [
  "#5C80BC", // Cool blue
  "#96C5B0", // Gentle teal
  "#F7A072", // Soft coral
  "#9AD0EC", // Sky blue
  "#B8E0D2", // Mint aqua
  "#FFC97C", // Warm muted yellow
  "#A29DDC", // Lavender gray
  "#D4A5A5", // Rose quartz
];



const BudgetChart = ({ items }) => {
  if (!items || items.length === 0) return null;

  // Only include category-specific limits (not group-level totals)
  const relevantItems = items.filter((item) => item.categoryId == null);

  // Group by categoryType (aka budget group)
  const groupedData = Object.entries(
    relevantItems.reduce((acc, item) => {
      const key = item.categoryType || "Uncategorized";
      if (!acc[key]) acc[key] = 0;
      acc[key] += item.limit;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const total = groupedData.reduce((sum, entry) => sum + entry.value, 0);

  const chartData = groupedData.map((entry) => ({
    ...entry,
    percentage: (entry.value / total) * 100,
  }));

  return (
    <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" gap={4}>
      <ResponsiveContainer width={300} height={220}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            labelLine={false}
            label={({ name, percent }) =>
              `${name.length > 12 ? name.substring(0, 12) + "…" : name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} LEI`} />
        </PieChart>
      </ResponsiveContainer>

      <Box>
        <Typography variant="subtitle1" fontWeight="bold" textAlign="left">
          Total Budget: {total.toFixed(2)} LEI
        </Typography>
        <ul style={{ listStyle: "none", padding: 0, margin: "10px 0", textAlign: "left" }}>
          {chartData.map((entry, index) => (
            <li key={index} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  backgroundColor: COLORS[index % COLORS.length],
                  borderRadius: "50%",
                }}
              />
              <span>
                {entry.name}: {entry.value.toFixed(2)} LEI ({entry.percentage.toFixed(1)}%)
              </span>
            </li>
          ))}
        </ul>
      </Box>
    </Box>
  );
};

export default BudgetChart;
