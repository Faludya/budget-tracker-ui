import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  useTheme,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import apiClient from "../../api/axiosConfig";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";

const MonthlyExpensesChart = () => {
  const theme = useTheme();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { preferences } = useUserPreferences();

  const fetchChartData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      setLoading(true);
      const res = await apiClient.get("/statistics/monthly-expenses", {
        headers: { userId },
      });
      setChartData(res.data);
    } catch (error) {
      console.error("Error fetching monthly chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (preferences?.preferredCurrency) {
      fetchChartData();
    }
  }, [preferences?.preferredCurrency]);

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Monthly Expenses
        </Typography>

        {loading ? (
          <Box height={300} display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip />
              <Bar
                dataKey="amount"
                fill={theme.palette.primary.main}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyExpensesChart;
