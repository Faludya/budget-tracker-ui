import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, Button, Snackbar, Alert } from "@mui/material";
import AppSelect from "../common/AppSelect";
import AppInput from "../common/AppInput";
import apiClient from "../../api/axiosConfig";

const AddCategoryLimit = ({ userId, month, onBudgetUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [manualLimit, setManualLimit] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategoryLimit = async () => {
    try {
      await apiClient.post("/userbudgets/category-limit", {
        userId,
        month: month.getMonth() + 1,
        year: month.getFullYear(),
        categoryId: selectedCategory.id,
        limit: parseFloat(manualLimit),
      });

      const response = await apiClient.get(`/userbudgets/${userId}/${month.getMonth() + 1}/${month.getFullYear()}`);
      if (onBudgetUpdate) onBudgetUpdate(response.data);

      setManualLimit("");
      setSelectedCategory(null);
      setSuccessOpen(true);
    } catch (err) {
      console.error("Error saving limit", err);
      alert("Failed to save limit.");
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Add Monthly Limit for a Category
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <AppSelect
          label="Category"
          value={selectedCategory}
          onChange={(val) => setSelectedCategory(val)}
          options={categories}
          getOptionLabel={(opt) => opt.name}
          getOptionValue={(opt) => opt.id}
          groupBy={(opt) => opt.categoryType || "Ungrouped"}
        />
        <AppInput
          label="Limit"
          type="number"
          value={manualLimit}
          onChange={(e) => setManualLimit(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleAddCategoryLimit}
          disabled={!selectedCategory || !manualLimit}
        >
          Save Limit
        </Button>
      </Stack>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: "100%" }}>
          Limit saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddCategoryLimit;
