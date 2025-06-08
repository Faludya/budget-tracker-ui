import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, LinearProgress, useTheme } from "@mui/material";
import apiClient from "../../api/axiosConfig";
import PropTypes from "prop-types";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";

const BudgetVsActualWidget = ({ selectedDate }) => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const { preferences } = useUserPreferences();

  const fetchBudgetVsActual = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await apiClient.get("/statistics/budget-vs-actual", {
        headers: { userId },
        params: {
          month: selectedDate.month() + 1,
          year: selectedDate.year(),
        },
      });
      setData(res.data);
    } catch (error) {
      console.error("Error fetching budget vs actual data:", error);
    }
  };

  useEffect(() => {
    if (selectedDate && preferences?.preferredCurrency) {
      fetchBudgetVsActual();
    }
  }, [selectedDate, preferences?.preferredCurrency]);

  if (!data) return null;

  const percentageUsed = Math.min(data.percentageUsed, 100);

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Budget vs Actual
        </Typography>
        <Typography variant="h6" color="primary" gutterBottom>
          Spent: {data.totalSpent.toFixed(2)} / {data.totalBudgeted.toFixed(2)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percentageUsed}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.palette.grey[300],
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              backgroundColor: percentageUsed > 100 ? theme.palette.error.main : theme.palette.primary.main,
            },
          }}
        />
        <Box mt={1}>
          <Typography
            variant="caption"
            color={percentageUsed > 100 ? "error" : "text.secondary"}
          >
            {percentageUsed.toFixed(1)}% of budget used
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

BudgetVsActualWidget.propTypes = {
  selectedDate: PropTypes.object.isRequired,
};

export default BudgetVsActualWidget;
