// 📁 BudgetTemplateSelection.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppSelect from "../components/common/AppSelect";
import AppInput from "../components/common/AppInput";
import apiClient from "../api/axiosConfig";
import BudgetBreakdown from "../components/budget-tracking/BudgetBreakdown";
import AddCategoryLimit from "../components/budget-tracking/AddCategoryLimit";

const BudgetTemplateSelection = () => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [appliedBudget, setAppliedBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await apiClient.get("/budget-templates");
        setTemplates(response.data);
      } catch (error) {
        console.error("Failed to fetch budget templates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId) {
      const found = templates.find((t) => t.id === selectedTemplateId);
      setSelectedTemplate(found || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedTemplateId, templates]);

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId || !monthlyIncome) {
      alert("Please select a template and enter your income.");
      return;
    }

    try {
      setLoading(true);
      const now = new Date();
      const response = await apiClient.post("/userbudgets/generate", {
        userId: localStorage.getItem("userId"),
        templateId: selectedTemplateId,
        income: parseFloat(monthlyIncome),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });

      setAppliedBudget(response.data);
    } catch (error) {
      console.error("Failed to apply budget template:", error);
    } finally {
      setLoading(false);
    }
  };

  const breakdownItems = selectedTemplate?.items?.map((item) => {
    const amount = ((item.percentage / 100) * parseFloat(monthlyIncome || "0")).toFixed(2);
    return {
      ...item,
      amount,
    };
  });

  return (
    <Box p={4} maxWidth={700} mx="auto">
      <Typography variant="h5" mb={3}>Choose a Budget Template</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={3}>
          <AppSelect
            label="Select Template"
            value={templates.find((t) => t.id === selectedTemplateId) || null}
            onChange={(val) => setSelectedTemplateId(val?.id || null)}
            options={templates}
            getOptionLabel={(opt) => opt.name}
            getOptionValue={(opt) => opt?.id ?? ""}
          />

          <AppInput
            label="Enter Monthly Income"
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
          />

          {breakdownItems?.length > 0 && !appliedBudget && (
            <BudgetBreakdown items={breakdownItems} currencySymbol="LEI" />
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/budget-tracker")}>Cancel</Button>
            <Button variant="contained" onClick={handleApplyTemplate} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Apply Template"}
            </Button>
          </Stack>

          {appliedBudget && (
            <>
              <BudgetBreakdown
                items={appliedBudget.budgetItems.map((item) => ({
                  categoryType: item.categoryType,
                  limit: item.limit,
                }))}
                currencySymbol="LEI"
              />
              <AddCategoryLimit userId={appliedBudget.userId} month={new Date(appliedBudget.month)} />
            </>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default BudgetTemplateSelection;
