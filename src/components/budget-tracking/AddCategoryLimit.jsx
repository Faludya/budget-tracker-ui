import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import AppSelect from "../common/AppSelect";
import AppInput from "../common/AppInput";
import apiClient from "../../api/axiosConfig";
import { Delete, Edit, MoreVert, WarningAmberRounded } from "@mui/icons-material";
import CategoryIcon from "@mui/icons-material/Category";

const AddCategoryLimit = ({ userId, month, manualLimits, onBudgetUpdate, selectedTemplate, currencySymbol = "EUR" }) => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [limit, setLimit] = useState("");
  const [group, setGroup] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await apiClient.get("/categories", { headers: { userId } });
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const templateGroups = useMemo(() => selectedTemplate?.items?.map(i => i.categoryType) || [], [selectedTemplate]);

  const groupedLimits = useMemo(() => {
    const groups = {};

    // Always include template-defined groups
    for (const group of templateGroups) {
      groups[group] = [];
    }

    // Add category-level limits to those groups
    for (const item of manualLimits) {
      if (!item.categoryId) continue; // skip group-level item
      const key = item.categoryType;
      if (key) {
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      }
    }

    return groups;
  }, [manualLimits, templateGroups]);

  const handleSave = async () => {
    if (!categoryId || !limit || !group || !userId) return;

    const payload = {
      id: isEditing ? editItem?.id : undefined,
      userId,
      categoryId,
      limit: parseFloat(limit),
      parentCategoryType: group?.value || group,
      month: month.getMonth() + 1,
      year: month.getFullYear(),
    };

    try {
      setSaving(true);

      await apiClient.post(`/userbudgets/category-limit`, payload);
      showSnackbar(isEditing ? "Limit updated!" : "Limit saved!");

      const refreshed = await apiClient.get(
        `/userbudgets/${userId}/${month.getMonth() + 1}/${month.getFullYear()}`
      );
      onBudgetUpdate(refreshed.data);

      setCategoryId(null);
      setLimit("");
      setGroup(null);
      setEditItem(null);
      setIsEditing(false);
    } catch (err) {
      showSnackbar("Failed to save category limit", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      await apiClient.delete(`/userbudgets/category-limit/${deleteItem.id}`);
      showSnackbar("Category limit deleted!");
      const refreshed = await apiClient.get(`/userbudgets/${userId}/${month.getMonth() + 1}/${month.getFullYear()}`);
      onBudgetUpdate(refreshed.data);
    } catch (err) {
      showSnackbar("Failed to delete limit", "error");
    } finally {
      setDeleteItem(null);
    }
  };

  const handleMenuClick = (event, itemId) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItemId(null);
  };

  return (
    <Box>
      <Typography variant="h6" mt={4} mb={2}>
        Add Monthly Limit for a Category
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" mb={3}>
        <Box flex={1}>
          <AppSelect
            label="Category"
            value={categories.find(c => c.id === categoryId) || null}
            onChange={(val) => setCategoryId(val?.id || null)}
            options={categories}
            getOptionLabel={(opt) => opt.name}
            getOptionValue={(opt) => opt.id}
          />
        </Box>

        <Box width={160}>
          <AppInput
            label="Limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </Box>

        <Box flex={1}>
          <AppSelect
            label="Budget Group"
            value={group || null}
            onChange={val => setGroup(val)}
            options={templateGroups.map(g => ({ label: g, value: g }))}
            getOptionLabel={opt => opt.label}
            getOptionValue={opt => opt.value}
          />
        </Box>

        <Box alignSelf={{ xs: "stretch", md: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {saving ? "Saving..." : isEditing ? "Update" : "Save"}
          </Button>
        </Box>
      </Stack>

      <Box display="flex" flexWrap="wrap" gap={2}>
        {Object.entries(groupedLimits).map(([groupKey, items]) => {
          const total = items.reduce((sum, i) => sum + (i.convertedLimit ?? i.limit), 0);
          const groupLimitItem = selectedTemplate?.items?.find(i => i.categoryType === groupKey);
          const groupLimit = groupLimitItem?.convertedAmount ?? groupLimitItem?.amount ?? null;
          const isOverBudget = groupLimit !== null && total > groupLimit;

          return (
            <Box key={groupKey} sx={{ flex: "1 1 300px", borderRadius: 2, p: 2, bgcolor: "#f8f9fc", boxShadow: 1 }}>
              <Typography fontWeight="bold" fontSize="1.05rem" mb={1} display="flex" alignItems="center">
                {groupKey} — {total.toFixed(2)} {currencySymbol}
                {isOverBudget && (
                  <Tooltip title="Over group budget limit">
                    <WarningAmberRounded color="warning" sx={{ ml: 1, fontSize: 18 }} />
                  </Tooltip>
                )}
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: 20, color: "#444" }}>
                {items
                  .filter((item) => item.category && item.category.name)
                  .map((item, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>
                        <CategoryIcon fontSize="small" sx={{ mr: 1 }} />
                        {item.category.name}: {(item.convertedLimit ?? item.limit).toFixed(2)} {currencySymbol}
                      </span>
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, item.id)} sx={{ p: 0.5 }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </li>
                  ))}
              </ul>
            </Box>
          );
        })}
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          const item = manualLimits.find(i => i.id === selectedItemId);
          if (item) {
            setCategoryId(item.categoryId);
            setLimit(item.limit);
            setGroup({ label: item.categoryType, value: item.categoryType });
            setEditItem(item);
            setIsEditing(true);
          }
          handleMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>

        <MenuItem onClick={() => {
          const item = manualLimits.find(i => i.id === selectedItemId);
          if (item) {
            setDeleteItem(item);
          }
          handleMenuClose();
        }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        PaperProps={{ sx: { maxWidth: 300 } }}
      >
        <DialogTitle>
          Delete {deleteItem?.category?.name || "this limit"}?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteItem(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddCategoryLimit;
