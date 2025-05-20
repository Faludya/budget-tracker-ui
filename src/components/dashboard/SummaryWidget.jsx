import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Paper,
  Stack,
} from "@mui/material";
import {
  TrendingDown,
  TrendingUp,
} from "@mui/icons-material";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import apiClient from "../../api/axiosConfig";

ChartJS.register(ArcElement, Tooltip, Legend);

const SummaryWidget = ({ selectedDate }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const month = selectedDate.month() + 1;
        const year = selectedDate.year();

        const response = await apiClient.get("/statistics/summary", {
          headers: { userId },
          params: { month, year },
        });

        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchSummary();
    }
  }, [selectedDate]); // ✅ Re-fetch when date changes

  if (loading || !summary) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={220}>
        <CircularProgress />
      </Box>
    );
  }

  const net = summary.totalIncome - summary.totalExpense;

  const pastelColors = theme.palette.mode === "dark"
    ? ["#78C9A6", "#E48584"]
    : ["#A3D9B1", "#F7A9A8"];

  const chartData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [summary.totalIncome, summary.totalExpense],
        backgroundColor: pastelColors,
        borderColor: ["#7DBB8A", "#E98684"],
        borderWidth: 1,
        hoverOffset: 8,
      },
    ],
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        maxWidth: 340,
        mx: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        This Month's Summary
      </Typography>

      <Box position="relative" display="flex" justifyContent="center" alignItems="center" height={180} mb={2}>
        <Doughnut
          data={chartData}
          options={{
            cutout: "70%",
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.label}: ${ctx.raw.toFixed(2)}`,
                },
              },
            },
          }}
        />
        <Box
          position="absolute"
          textAlign="center"
          sx={{ pointerEvents: "none" }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            color={net >= 0 ? "success.main" : "error.main"}
          >
            {net.toFixed(2)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Net
          </Typography>
        </Box>
      </Box>

      <Stack spacing={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingUp color="success" />
          <Typography variant="body2">
            <strong>Income:</strong> {summary.totalIncome.toFixed(2)}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingDown color="error" />
          <Typography variant="body2">
            <strong>Expenses:</strong> {summary.totalExpense.toFixed(2)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default SummaryWidget;
