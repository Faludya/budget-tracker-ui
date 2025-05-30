import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import dayjs from "dayjs";
import apiClient from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

const BudgetTemplateSelection = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await apiClient.get("/budget-templates");
        setTemplates(res.data);
      } catch (err) {
        console.error("Error fetching templates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const template = templates.find((t) => t.id === selectedId);

      const newBudget = {
        userId,
        month: `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`,
        budgetItems: template.items.map((item) => ({
          categoryType: item.categoryType,
          percentage: item.percentage,
        })),
      };

      await apiClient.post("/user-budgets", newBudget);
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error saving budget:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Choose a Budget Template</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Select Template</InputLabel>
            <Select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              label="Select Template"
            >
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedId && (
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6">Breakdown</Typography>
              {templates
                .find((t) => t.id === selectedId)
                ?.items.map((item, idx) => (
                  <Typography key={idx}>
                    {item.categoryType}: {item.percentage}%
                  </Typography>
                ))}
            </Paper>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/budget-tracker")}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!selectedId || saving}
              sx={{
                "&.Mui-disabled": {
                  backgroundColor: "#e0e0e0",
                  color: "#9e9e9e",
                  boxShadow: "none",
                  cursor: "not-allowed",
                },
              }}
            >
              {saving ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Apply Template"}
            </Button>
          </Stack>
        </Stack>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Budget created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetTemplateSelection;
