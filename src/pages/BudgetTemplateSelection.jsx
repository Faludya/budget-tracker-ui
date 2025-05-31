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
import BudgetChart from "../components/budget-tracking/BudgetChart";

const BudgetTemplateSelection = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [appliedBudget, setAppliedBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const init = async () => {
  try {
    const templatesResponse = await apiClient.get("/budget-templates");
    const loadedTemplates = templatesResponse.data;
    console.log("✅ Loaded templates:", loadedTemplates);
    setTemplates(loadedTemplates);

    const budgetResponse = await apiClient.get(`/userbudgets/${userId}/${currentMonth}/${currentYear}`);
    const budget = budgetResponse.data;
    console.log("✅ Loaded budget:", budget);
    setAppliedBudget(budget);

    const estimatedIncome = budget.budgetItems.reduce((sum, item) => sum + item.limit, 0);
    setMonthlyIncome(estimatedIncome.toFixed(0));

    const matchingTemplate = loadedTemplates.find(t => {
      const templateTypes = t.items.map(i => i.categoryType).sort().join(",");
      const budgetTypes = budget.budgetItems.map(i => i.categoryType).sort().join(",");
      const match = templateTypes === budgetTypes;
      console.log(`🔍 Matching template ${t.name}?`, match);
      return match;
    });

    if (matchingTemplate) {
      console.log("🎯 Matching template found:", matchingTemplate);
      setSelectedTemplateId(matchingTemplate.id);
      setSelectedTemplate(matchingTemplate);
    } else {
      console.warn("⚠️ No matching template found");
    }

  } catch (err) {
    if (err.response?.status !== 404) {
      console.error("❌ Error loading budget or templates", err);
    }
  } finally {
    setLoading(false);
  }
};

    init();
  }, [userId, currentMonth, currentYear]);

const handleApplyTemplate = async () => {
  if (!selectedTemplateId || !monthlyIncome) {
    alert("Please select a template and enter your income.");
    return;
  }

  try {
    setLoading(true);

    // Call generate endpoint
    await apiClient.post("/userbudgets/generate", {
      userId,
      templateId: selectedTemplateId,
      income: parseFloat(monthlyIncome),
      month: currentMonth,
      year: currentYear,
    });

    // Re-fetch full hydrated budget
    const refreshed = await apiClient.get(`/userbudgets/${userId}/${currentMonth}/${currentYear}`);
    setAppliedBudget(refreshed.data);

    // Ensure template state is consistent
    const matched = templates.find(t => t.id === selectedTemplateId);
    if (matched) setSelectedTemplate(matched);

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
      amount: parseFloat(amount),
      name: item.categoryType,
      categoryType: item.categoryType
    };
  }) ?? [];

  const chartItems = appliedBudget?.budgetItems?.length > 0
    ? appliedBudget.budgetItems.map(i => ({
        name: i.categoryType,
        categoryType: i.categoryType,
        limit: i.limit
      }))
    : (selectedTemplate && monthlyIncome ? breakdownItems : []);

  return (
    <Box p={4} maxWidth={1100} mx="auto">
      <Typography variant="h5" mb={3}>Choose a Budget Template</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={4} direction={{ xs: "column", md: "row" }}>
          <Stack spacing={3} flex={1}>
            <AppSelect
              label="Select Template"
              value={selectedTemplate}
              onChange={(val) => {
                setSelectedTemplateId(val?.id || null);
                setSelectedTemplate(val);
              }}
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

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => navigate("/budget-tracker")}>Cancel</Button>
              <Button variant="contained" onClick={handleApplyTemplate} disabled={loading}>
                {loading ? <CircularProgress size={20} /> : "Apply Template"}
              </Button>
            </Stack>

            {appliedBudget && (
              <AddCategoryLimit userId={appliedBudget.userId} month={new Date(appliedBudget.month)} onBudgetUpdate={setAppliedBudget} />
            )}
          </Stack>

          <Stack flex={1} spacing={2}>
            {chartItems.length > 0 && <BudgetChart items={chartItems} />}
            {chartItems.length > 0 && <Box mt={3}><BudgetBreakdown items={chartItems} currencySymbol="LEI" /></Box>}
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default BudgetTemplateSelection;