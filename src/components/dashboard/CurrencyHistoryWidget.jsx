import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import apiClient from "../../api/axiosConfig";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";

const CurrencyHistoryWidget = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { preferences } = useUserPreferences();
    const theme = useTheme();
    
    const fetchCurrencyHistory = async () => {
        try {
            const userId = localStorage.getItem("userId");
            const res = await apiClient.get("/statistics/currency-history", {
                headers: { userId },
                params: { days: 30 },
            });
            setHistory(res.data);
        } catch (error) {
            console.error("Error fetching currency history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (preferences?.preferredCurrency) {
            fetchCurrencyHistory();
        }
    }, [preferences?.preferredCurrency]);

    return (
        <Card>
            <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    EUR to {preferences?.preferredCurrency} (30 days)
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={180}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={history}>
                            <XAxis dataKey="date" hide />
                            <YAxis domain={["auto", "auto"]} width={35} />
                            <Tooltip
                                formatter={(value) => `${value.toFixed(4)}`}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="rate"
                                stroke={theme.palette.primary.main}
                                dot={false}
                            />

                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default CurrencyHistoryWidget;
