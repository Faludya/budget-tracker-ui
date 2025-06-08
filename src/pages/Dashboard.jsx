import React, { useState, useEffect } from "react";
import { Typography, Box, Stack } from "@mui/material";
import dayjs from "dayjs";
import SummaryWidget from "../components/dashboard/SummaryWidget";
import TopExpensesWidget from "../components/dashboard/TopExpensesWidget";
import MonthlyExpensesChart from "../components/dashboard/MonthlyExpensesChart";
import BudgetVsActualWidget from "../components/dashboard/BudgetVsActualWidget";
import BudgetUsageByCategoryChart from "../components/dashboard/BudgetUsageByCategoryChart";
import OverspentCategoriesCard from "../components/dashboard/OverspentCategoriesCard";
import BudgetHealthSummary from "../components/dashboard/BudgetHealthSummary";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AppDatePicker from "../components/common/AppDatePicker";
import { useUserPreferences } from "../contexts/UserPreferencesContext";
import apiClient from "../api/axiosConfig";
const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [userLayout, setUserLayout] = useState(null);
  const [loadingLayout, setLoadingLayout] = useState(true);

  const handleOrderChange = async (newOrder) => {
    try {
      await apiClient.post("/dashboard-layout", { widgetOrder: newOrder });
      setUserLayout((prev) => ({ ...prev, widgetOrder: newOrder }));
    } catch (err) {
      console.error("Failed to update widget order:", err);
    }
  };

  const allWidgets = [
    { id: "summary", component: <SummaryWidget selectedDate={selectedDate} /> },
    { id: "top-expenses", component: <TopExpensesWidget selectedDate={selectedDate} /> },
    { id: "monthly-expenses", component: <MonthlyExpensesChart selectedDate={selectedDate} /> },
    { id: "budget-vs-actual", component: <BudgetVsActualWidget selectedDate={selectedDate} /> },
    { id: "budget-usage", component: <BudgetUsageByCategoryChart selectedDate={selectedDate} /> },
    { id: "overspent", component: <OverspentCategoriesCard selectedDate={selectedDate} /> },
    { id: "health", component: <BudgetHealthSummary selectedDate={selectedDate} /> },
  ];

  const getOrderedWidgets = () => {
    if (!userLayout?.widgetOrder?.length) return allWidgets;
    const orderMap = new Map(allWidgets.map((w) => [w.id, w]));
    return userLayout.widgetOrder
      .map((id) => orderMap.get(id))
      .filter(Boolean);
  };

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await apiClient.get("/dashboard-layout", {
          headers: { userId: localStorage.getItem("userId") },
        });
        setUserLayout(res.data);
      } catch (err) {
        console.error("Failed to fetch layout", err);
      } finally {
        setLoadingLayout(false);
      }
    };

    fetchLayout();
  }, []);

  if (loadingLayout) return null;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" spacing={2}>
        <Typography variant="h5">Dashboard Overview</Typography>
        <AppDatePicker
          label="Select Month"
          value={selectedDate}
          onChange={(event) => {
            const rawValue = event?.target?.value;
            const parsed = dayjs(rawValue);
            if (parsed?.isValid()) setSelectedDate(parsed);
          }}
          views={["year", "month"]}
          format="MM/YYYY"
          openTo="month"
        />
      </Stack>

      <DashboardLayout
        widgets={getOrderedWidgets()}
        onOrderChange={handleOrderChange}
      />
    </Box>
  );
};

export default Dashboard;