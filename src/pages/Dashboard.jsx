import React, { useState, useEffect, useMemo } from "react";
import { Typography, Box, Stack } from "@mui/material";
import dayjs from "dayjs";
import SummaryWidget from "../components/dashboard/SummaryWidget";
import TopExpensesWidget from "../components/dashboard/TopExpensesWidget";
import MonthlyExpensesChart from "../components/dashboard/MonthlyExpensesChart";
import BudgetVsActualWidget from "../components/dashboard/BudgetVsActualWidget";
import BudgetUsageByCategoryChart from "../components/dashboard/BudgetUsageByCategoryChart";
import OverspentCategoriesCard from "../components/dashboard/OverspentCategoriesCard";
import BudgetHealthSummary from "../components/dashboard/BudgetHealthSummary";
import CurrencyHistoryWidget from "../components/dashboard/CurrencyHistoryWidget";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AppDatePicker from "../components/common/AppDatePicker";
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
    }
  };

  const allWidgets = useMemo(() => [
    { id: "summary", component: <SummaryWidget selectedDate={selectedDate} /> },
    { id: "top-expenses", component: <TopExpensesWidget selectedDate={selectedDate} /> },
    { id: "monthly-expenses", component: <MonthlyExpensesChart selectedDate={selectedDate} /> },
    { id: "budget-vs-actual", component: <BudgetVsActualWidget selectedDate={selectedDate} /> },
    { id: "budget-usage", component: <BudgetUsageByCategoryChart selectedDate={selectedDate} /> },
    { id: "overspent", component: <OverspentCategoriesCard selectedDate={selectedDate} /> },
    { id: "currency-history", component: <CurrencyHistoryWidget /> },
    { id: "health", component: <BudgetHealthSummary selectedDate={selectedDate} /> },
  ], [selectedDate]);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await apiClient.get("/dashboard-layout", {
          headers: { userId: localStorage.getItem("userId") },
        });

        setUserLayout({ widgetOrder: res.data });
      } catch (err) {
          console.error("[CurrencyHistoryWidget] Fetch failed:", err.response?.data || err.message);
      } finally {
        setLoadingLayout(false);
      }
    };

    fetchLayout();
  }, []);


  const isLayoutReady = userLayout?.widgetOrder?.length > 0;

  if (loadingLayout || !isLayoutReady) {
    return <Typography>Loading layout...</Typography>;
  }

  console.log("📥 Dashboard ready. Passing to layout:", {
    initialOrder: userLayout.widgetOrder,
    allWidgets: allWidgets.map(w => w.id),
  });

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
        key={userLayout.widgetOrder.join('-')}
        widgets={allWidgets}
        initialOrder={userLayout.widgetOrder}
        onOrderChange={handleOrderChange}
      />
    </Box>
  );
};

export default Dashboard;