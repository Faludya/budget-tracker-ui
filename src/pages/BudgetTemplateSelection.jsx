import React, { useEffect, useState, useMemo } from "react";
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
import BudgetChart from "../components/budget-tracking/BudgetChart";
import AddCategoryLimit from "../components/budget-tracking/AddCategoryLimit";

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
        setTemplates(loadedTemplates);

        const budgetResponse = await apiClient.get(
          `/userbudgets/${userId}/${currentMonth}/${currentYear}`
        );
        const budget = budgetResponse.data;
        setAppliedBudget(budget);

        const estimatedIncome = budget.budgetItems.reduce(
          (sum, item) => sum + item.limit,
          0
        );
        setMonthlyIncome(Number(estimatedIncome || 0).toFixed(0));

        const matchingTemplate = loadedTemplates.find((t) => {
          const templateGroups = t.items.map((ti) => ti.categoryType).sort();

          const budgetGroups = budget.budgetItems
            .filter((bi) => bi.categoryId == null && bi.categoryType !== "Uncategorized")
            .map((bi) => bi.categoryType)
            .sort();

          return JSON.stringify(templateGroups) === JSON.stringify(budgetGroups);
        });

        if (matchingTemplate) {
          setSelectedTemplateId(matchingTemplate.id);
          setSelectedTemplate(matchingTemplate);
        }

      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Error loading budget or templates", err);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [userId, currentMonth, currentYear]);

useEffect(() => {
  if (!templates.length || !selectedTemplateId) return;

  const found = templates.find((t) => t.id === selectedTemplateId);
  if (found) setSelectedTemplate(found);
}, [selectedTemplateId, templates]);


  const handleApplyTemplate = async () => {
    if (!selectedTemplateId || !monthlyIncome) {
      alert("Please select a template and enter your income.");
      return;
    }

    try {
      setLoading(true);

      await apiClient.post("/userbudgets/generate", {
        userId,
        templateId: selectedTemplateId,
        income: parseFloat(monthlyIncome),
        month: currentMonth,
        year: currentYear,
      });

      const refreshed = await apiClient.get(
        `/userbudgets/${userId}/${currentMonth}/${currentYear}`
      );
      setAppliedBudget(refreshed.data);

      const matched = templates.find((t) => t.id === selectedTemplateId);
      if (matched) setSelectedTemplate(matched);
    } catch (error) {
      console.error("Failed to apply budget template:", error);
    } finally {
      setLoading(false);
    }
  };

  const manualLimits =
    appliedBudget?.budgetItems?.filter((i) => i.categoryId !== null) ?? [];

  const breakdownItems = selectedTemplate?.items?.map((item) => {
    const amount = Number(
      ((item?.percentage || 0) * parseFloat(monthlyIncome || "0")) / 100
    ).toFixed(2);
    return {
      ...item,
      amount: parseFloat(amount),
      name: item.categoryType,
      categoryType: item.categoryType,
      limit: parseFloat(amount),
    };
  }) ?? [];

  const chartItems = [
    ...manualLimits,
    ...breakdownItems.filter(
      (bi) => !manualLimits.some((ml) => ml.categoryType === bi.categoryType)
    ),
  ];

  const allCategories = useMemo(() => {
  return appliedBudget?.budgetItems
    .filter(bi => bi.category)
    .map(bi => bi.category)
    .filter((v, i, a) => a.findIndex(c => c.id === v.id) === i); // remove duplicates
}, [appliedBudget]);

const templateGroups = useMemo(() => {
  return selectedTemplate?.items?.map(item => item.categoryType) ?? [];
}, [selectedTemplate]);


  return (
    <Box p={4} maxWidth={1400} mx="auto">
      <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="start">
        <Box flex={1}>
          <Typography variant="h5" mb={3}>
            Choose a Budget Template
          </Typography>

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
            sx={{ mt: 2 }}
          />

          <Stack direction="row" spacing={2} mt={2}>
            <Button variant="outlined" onClick={() => navigate("/budget-tracker")}>Cancel</Button>
            <Button variant="contained" onClick={handleApplyTemplate} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Apply Template"}
            </Button>
          </Stack>
        </Box>

        <Box flex={2} >{chartItems.length > 0 && <BudgetChart items={chartItems} />}</Box>
      </Stack>

      {!loading && appliedBudget && (
        <Box mt={6}>
          <AddCategoryLimit
            userId={appliedBudget.userId}
            month={new Date(appliedBudget.month)}
            manualLimits={manualLimits}
            selectedTemplate={selectedTemplate}
            allCategories={allCategories}
            templateGroups={templateGroups}
            onBudgetUpdate={setAppliedBudget}
          />

        </Box>
      )}
    </Box>
  );
};

export default BudgetTemplateSelection;
