import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
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
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Overspent Categories
        </Typography>

        {isLoading ? (
          <Box height={120} display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : overspentCategories.length === 0 ? (
          <Alert severity="success">No overspending this month. Great job! 🎉</Alert>
        ) : (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              You've exceeded your budget in {overspentCategories.length}{" "}
              {overspentCategories.length === 1 ? "category" : "categories"}.
            </Alert>
            <List dense disablePadding>
              {overspentCategories.map((name, index) => (
                <ListItem key={index}>
                  <ListItemText primary={name} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
};

OverspentCategoriesCard.propTypes = {
  selectedDate: PropTypes.object.isRequired,
};

export default OverspentCategoriesCard;
