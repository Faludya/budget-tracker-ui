// CategoriesTable with arrow-based reorder fix
import React from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Paper,
  Stack,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ExpandLess,
  ExpandMore,
  Folder,
  ArrowUpward,
  ArrowDownward,
  Category as DefaultIcon,
} from "@mui/icons-material";
import * as Icons from "@mui/icons-material";
import useCategoryForm from "../../hooks/useCategoryForm";
import AppInput from "../../components/common/AppInput";
import AppModal from "../../components/common/AppModal";
import AppSelect from "../../components/common/AppSelect";
import apiClient from "../../api/axiosConfig";

const iconOptions = [
  "Home", "Fastfood", "ShoppingCart", "CarRental", "Category",
  "Work", "Pets", "FitnessCenter", "HealthAndSafety",
  "LocalHospital", "LocalGroceryStore", "DirectionsBus", "Restaurant",
  "LocalCafe", "EmojiEvents", "School", "Savings", "ElectricBolt"
];

const IconGrid = ({ selected, onSelect }) => (
  <Grid container spacing={1} sx={{ maxHeight: 180, overflowY: "auto", p: 1 }}>
    {iconOptions.map((iconName) => {
      const Icon = Icons[iconName] || DefaultIcon;
      return (
        <Grid item xs={2} sm={1.5} md={1.2} key={iconName}>
          <IconButton
            onClick={() => onSelect(iconName)}
            sx={{
              border: selected === iconName ? "2px solid #1976d2" : "1px solid #ccc",
              borderRadius: 2,
              width: "100%",
              height: 40,
            }}
          >
            <Icon fontSize="small" />
          </IconButton>
        </Grid>
      );
    })}
  </Grid>
);

const CategoriesTable = () => {
  const [categories, setCategories] = React.useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState(null);

  const {
    formData,
    open,
    handleOpen,
    handleClose,
    handleChange,
    handleSubmit,
    handleDelete,
    snackbar,
    setSnackbar,
    groupedCategories,
    setGroupedCategories,
    expanded,
    setExpanded,
    fetchCategories,
  } = useCategoryForm(setCategories);

  const confirmDelete = (id) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await handleDelete(categoryToDelete);
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const moveUp = (index) => {
    if (index === 0) return;

    const newList = [...groupedCategories];
    const current = newList[index];
    const above = newList[index - 1];

    newList[index] = above;
    newList[index - 1] = current;

    setGroupedCategories(newList);
    handleReorder(current, above);
  };

  const moveDown = (index) => {
    if (index === groupedCategories.length - 1) return;

    const newList = [...groupedCategories];
    const current = newList[index];
    const below = newList[index + 1];

    newList[index] = below;
    newList[index + 1] = current;

    setGroupedCategories(newList);
    handleReorder(current, below);
  };


  const handleReorderSubmit = async (reorderPayload) => {
    try {
      await apiClient.put("/categories/reorder", reorderPayload);
    } catch (err) {
      console.error("Reorder failed", err);
    }
  };

  const handleReorder = async (movedCat, targetCat) => {
    const reorderPayload = [
      { id: movedCat.id, orderIndex: targetCat.orderIndex },
      { id: targetCat.id, orderIndex: movedCat.orderIndex },
    ];

    await handleReorderSubmit(reorderPayload);
    await fetchCategories();
  };

  const parentOptions = [
    { id: null, name: "None" },
    ...categories.filter((cat) =>
      formData?.id ? cat.id !== formData.id && !cat.parentCategoryId : !cat.parentCategoryId
    ),
  ];

  const renderSubcategories = (subcats, parentColor) => (
    <Box mt={1} pl={3}>
      <Stack spacing={1}>
        {subcats.map((sub) => {
          const Icon = sub.iconName && Icons[sub.iconName] ? Icons[sub.iconName] : DefaultIcon;
          return (
            <Paper
              key={sub.id}
              variant="outlined"
              sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: 'background.paper' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Icon fontSize="small" sx={{ color: sub.colorHex || parentColor || '#999' }} />
                <Typography variant="body2">{sub.name}</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" onClick={() => handleOpen(sub)}><Edit fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => confirmDelete(sub.id)}><Delete fontSize="small" /></IconButton>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Categories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen(null)}>Add Category</Button>
      </Stack>

      {groupedCategories.map((cat, index) => {
        const Icon = cat.iconName && Icons[cat.iconName] ? Icons[cat.iconName] : Folder;
        const color = cat.colorHex || '#888';

        return (
          <Box key={cat.id} mb={2}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, borderLeft: `6px solid ${color}`, bgcolor: 'background.default' }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Icon fontSize="small" sx={{ color }} />
                  <Typography fontWeight={600}>{cat.name}</Typography>
                  <IconButton onClick={() => toggleExpand(cat.id)}>
                    {expanded[cat.id] ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => moveUp(index)} disabled={index === 0}>
                    <ArrowUpward fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => moveDown(index)} disabled={index === groupedCategories.length - 1}>
                    <ArrowDownward fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleOpen(cat)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => confirmDelete(cat.id)}><Delete fontSize="small" /></IconButton>
                </Stack>
              </Stack>
              {expanded[cat.id] && cat.children?.length > 0 && renderSubcategories(cat.children, color)}
            </Paper>
          </Box>
        );
      })}

      <AppModal
        open={open}
        title={formData.id ? "Edit Category" : "Add Category"}
        onClose={handleClose}
        onSave={handleSubmit}
        sx={{ maxWidth: 620 }}
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-end">
            <Box flex={2}>
              <AppInput
                label="Name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                fullWidth
              />
            </Box>
            <Box flex={1}>
              <Typography variant="caption" sx={{ mb: 0.5 }}>Color</Typography>
              <TextField
                name="colorHex"
                type="color"
                value={formData.colorHex || "#000000"}
                onChange={handleChange}
                fullWidth
                sx={{ height: 40 }}
              />
            </Box>
          </Stack>
          <Box>
            <Typography variant="caption" sx={{ mb: 0.5 }}>Icon</Typography>
            <IconGrid
              selected={formData.iconName}
              onSelect={(val) => handleChange({ target: { name: "iconName", value: val } })}
            />
          </Box>
          <AppSelect
            label="Parent Category"
            value={parentOptions.find((cat) => cat.id === formData.parentCategoryId) || parentOptions[0]}
            options={parentOptions}
            getOptionLabel={(opt) => opt.name}
            onChange={(val) => handleChange({ target: { name: "parentCategoryId", value: val?.id ?? null } })}
            sx={{ mt: 1 }}
          />
        </Stack>
      </AppModal>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this category? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoriesTable;
