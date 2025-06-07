import React, { useState } from "react";
import { Grid, Typography, Box, Stack } from "@mui/material";
import dayjs from "dayjs";
import SummaryWidget from "../components/dashboard/SummaryWidget";
import TopExpensesWidget from "../components/dashboard/TopExpensesWidget";
import MonthlyExpensesChart from "../components/dashboard/MonthlyExpensesChart";
import AppDatePicker from "../components/common/AppDatePicker";
import { useUserPreferences } from "../contexts/UserPreferencesContext";

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const { preferences } = useUserPreferences();
    const deriveMonthYearFormat = (userFormat) => {
        if (!userFormat) return "MMM YYYY";

        if (userFormat.startsWith("YYYY")) return "YYYY-MM";
        if (userFormat.startsWith("MM")) return "MM/YYYY";
        if (userFormat.includes("MMM")) return "MMM YYYY";

        return "MM/YYYY"; // safe fallback
    };

    const monthYearFormat = deriveMonthYearFormat(preferences?.dateFormat);

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
                        if (parsed?.isValid()) {
                            setSelectedDate(parsed);
                        }
                    }}
                    views={["year", "month"]}
                    format={monthYearFormat}
                    openTo="month"
                />
            </Stack>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <SummaryWidget selectedDate={selectedDate} />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TopExpensesWidget selectedDate={selectedDate} />
                </Grid>
                <Grid item xs={12}>
                    <MonthlyExpensesChart />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
