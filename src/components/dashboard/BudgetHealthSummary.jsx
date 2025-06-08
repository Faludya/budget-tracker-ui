import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Chip,
    LinearProgress,
    Stack,
    Box,
} from "@mui/material";
import apiClient from "../../api/axiosConfig";
import PropTypes from "prop-types";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";

const BudgetHealthSummary = ({ selectedDate }) => {
    const [summary, setSummary] = useState(null);
    const { preferences } = useUserPreferences();

    const fetchSummary = async () => {
        try {
            const userId = localStorage.getItem("userId");
            const res = await apiClient.get("/statistics/budget-health-summary", {
                headers: { userId },
                params: {
                    month: selectedDate.month() + 1,
                    year: selectedDate.year(),
                },
            });
            setSummary(res.data);
        } catch (error) {
            console.error("Error fetching budget health summary:", error);
        }
    };

    useEffect(() => {
        if (selectedDate && preferences?.preferredCurrency) {
            fetchSummary();
        }
    }, [selectedDate, preferences?.preferredCurrency]); // ✅ re-fetch on currency change

    if (!summary || summary.totalCategories === 0) return null;

    const overspentCount = summary.totalCategories - summary.withinBudgetCount;
    const averageUsage = Math.min(summary.averageUsagePercent, 100);

    return (
        <Card>
            <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Budget Health Summary
                </Typography>

                <Stack direction="row" spacing={1} mb={1}>
                    <Chip
                        label={`✅ ${summary.withinBudgetCount} within budget`}
                        color="success"
                        variant="outlined"
                    />
                    <Chip
                        label={`⚠️ ${overspentCount} overspent`}
                        color="error"
                        variant="outlined"
                    />
                </Stack>

                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Average Usage: {averageUsage.toFixed(1)}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={averageUsage}
                        sx={{ height: 10, borderRadius: 5 }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

BudgetHealthSummary.propTypes = {
    selectedDate: PropTypes.object.isRequired,
};

export default BudgetHealthSummary;
