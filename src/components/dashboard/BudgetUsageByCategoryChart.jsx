import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  Legend,
} from "recharts";
import apiClient from "../../api/axiosConfig";
import PropTypes from "prop-types";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";

const BudgetUsageByCategoryChart = ({ selectedDate }) => {
  const theme = useTheme();
  const [chartData, setChartData] = useState([]);
  const { preferences } = useUserPreferences();

  const fetchBudgetUsage = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await apiClient.get("/statistics/budget-category-usage", {
        headers: { userId },
        params: {
          month: selectedDate.month() + 1,
          year: selectedDate.year(),
        },
      });
      setChartData(res.data);
    } catch (error) {
      console.error("Error fetching budget usage by category:", error);
    }
  };

  useEffect(() => {
    if (selectedDate && preferences?.preferredCurrency) {
      fetchBudgetUsage();
    }
  }, [selectedDate, preferences?.preferredCurrency]); // ✅ reacts to currency change

  if (!chartData.length) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Budget Usage by Category
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoryName" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip />
            <Legend />
            <Bar dataKey="limit" fill={theme.palette.primary.light} name="Limit" />
            <Bar dataKey="spent" fill={theme.palette.primary.main} name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

BudgetUsageByCategoryChart.propTypes = {
  selectedDate: PropTypes.object.isRequired,
};

export default BudgetUsageByCategoryChart;
