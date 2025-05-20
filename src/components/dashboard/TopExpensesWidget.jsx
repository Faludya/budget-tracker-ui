import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  Paper,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { Category } from "@mui/icons-material";
import apiClient from "../../api/axiosConfig";

const TopExpensesWidget = ({ selectedDate }) => {
  const [topExpenses, setTopExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchTopExpenses = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const month = selectedDate?.month?.() + 1;
        const year = selectedDate?.year?.();

        const res = await apiClient.get("/statistics/top-categories", {
          headers: { userId },
          params: { month, year },
        });

        setTopExpenses(res.data || []);
      } catch (err) {
        console.error("Failed to fetch top expenses", err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate?.isValid?.()) {
      fetchTopExpenses();
    }
  }, [selectedDate]);

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minHeight: 260 }}>
      <Typography variant="h6" gutterBottom>
        Top Expense Categories
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress size={24} />
        </Box>
      ) : topExpenses.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No expense data for this month.
        </Typography>
      ) : (
        <Stack spacing={2} mt={2}>
          {topExpenses.map((item) => (
            <Box key={item.category}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Category fontSize="small" />
                  <Typography variant="body2">{item.category}</Typography>
                </Stack>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color="text.secondary"
                >
                  {item.amount.toFixed(2)} ({item.percentage.toFixed(1)}%)
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={item.percentage}
                sx={{
                  mt: 1,
                  height: 6,
                  borderRadius: 5,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[800]
                      : theme.palette.grey[300],
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.primary.light
                        : theme.palette.primary.main,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default TopExpensesWidget;
