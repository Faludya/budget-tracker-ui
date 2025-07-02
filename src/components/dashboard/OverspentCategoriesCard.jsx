import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import apiClient from "../../api/axiosConfig";
import PropTypes from "prop-types";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";

const OverspentCategoriesCard = ({ selectedDate }) => {
  const [overspentCategories, setOverspentCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { preferences } = useUserPreferences();

  useEffect(() => {
    const fetchOverspent = async () => {
      try {
        setIsLoading(true);
        const userId = localStorage.getItem("userId");
        const res = await apiClient.get("/statistics/overspent-categories", {
          headers: { userId },
          params: {
            month: selectedDate.month() + 1,
            year: selectedDate.year(),
          },
        });
        setOverspentCategories(res.data);
      } catch (error) {
        console.error("Error fetching overspent categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedDate && preferences?.preferredCurrency) {
      fetchOverspent();
    }
  }, [selectedDate, preferences?.preferredCurrency]);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Overspent Categories
        </Typography>

        {isLoading ? (
          <Box height={60} display="flex" alignItems="center" justifyContent="center">
            <CircularProgress size={22} />
          </Box>
        ) : overspentCategories.length === 0 ? (
          <Typography variant="body2" color="success.main">
            🎉 No overspending this month.
          </Typography>
        ) : (
          <Box
            display="flex"
            flexWrap="wrap"
            gap={1}
            rowGap={1.2}
            alignItems="flex-start"
          >
            {overspentCategories.map((name, index) => (
              <Chip
                key={index}
                label={name}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "primary.main",
                  borderColor: "primary.main",
                  backgroundColor: "rgba(33, 150, 243, 0.05)", // soft primary background
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)", // subtle shadow for elevation
                  "& .MuiChip-label": {
                    px: 1.5,
                    py: 0.25,
                  },
                }}
              />

            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

OverspentCategoriesCard.propTypes = {
  selectedDate: PropTypes.object.isRequired,
};

export default OverspentCategoriesCard;
