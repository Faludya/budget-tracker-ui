import React from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Stack,
  Alert,
  Paper,
  useTheme,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Folder,
  SubdirectoryArrowRight,
} from "@mui/icons-material";
import useCategoryForm from "../../hooks/useCategoryForm";
import AppInput from "../../components/common/AppInput";
import AppModal from "../../components/common/AppModal";
import AppSelect from "../../components/common/AppSelect";

const CategoriesTable = () => {
  const [categories, setCategories] = React.useState([]);
  const theme = useTheme();
  const { formData, open, handleOpen, handleClose, handleChange, handleSubmit, handleDelete, snackbar, setSnackbar, groupedCategories, expanded, setExpanded,
  } = useCategoryForm(setCategories);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const parentOptions = [
  { id: null, name: "None" },
  ...categories.filter((cat) =>
    formData?.id ? cat.id !== formData.id && !cat.parentCategoryId : !cat.parentCategoryId
  ),
];

  const renderCategoryList = (categories, depth = 0) => {
    return categories.map((cat) => (
      <Box key={cat.id} mb={2}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            pl: 2,
            borderLeft: `5px solid ${theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.common.black}`,
            backgroundColor:
              depth === 0
                ? theme.palette.mode === "dark"
                  ? theme.palette.grey[900]
                  : theme.palette.common.white
                : "transparent",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1} flex={1}>
              {depth === 0 ? (
                <Button
                  onClick={() => toggleExpand(cat.id)}
                  startIcon={<Folder />}
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    color: "text.primary",
                    justifyContent: "flex-start",
                  }}
                >
                  {cat.name}
                </Button>
              ) : (
                <>
                  <SubdirectoryArrowRight fontSize="small" />
                  <Typography
                    variant="body2"
                    color={theme.palette.mode === "dark" ? "grey.200" : "text.primary"}
                  >
                    {cat.name}
                  </Typography>
                </>
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => handleOpen(cat)}
                sx={{ px: 1, minWidth: "auto" }}
              >
                <Edit fontSize="small" />
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDelete(cat.id)}
                sx={{ px: 1, minWidth: "auto" }}
              >
                <Delete fontSize="small" />
              </Button>
            </Stack>
          </Stack>

          {cat.children?.length > 0 && expanded[cat.id] && (
            <Box mt={1} ml={3}>
              {cat.children.map((subcat) => (
                <Paper
                  key={subcat.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    pl: 2,
                    mt: 1,
                    ml: 2,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : theme.palette.common.white,
                    borderRadius: 1,
                    borderLeft: `4px solid ${theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.common.black}`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SubdirectoryArrowRight fontSize="small" />
                      <Typography
                        variant="body2"
                        color={theme.palette.mode === "dark" ? "grey.200" : "text.primary"}
                      >
                        {subcat.name}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleOpen(subcat)}
                        sx={{ px: 1, minWidth: "auto" }}
                      >
                        <Edit fontSize="small" />
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(subcat.id)}
                        sx={{ px: 1, minWidth: "auto" }}
                      >
                        <Delete fontSize="small" />
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    ));
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Categories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen(null)}>
          Add Category
        </Button>
      </Box>

      {renderCategoryList(groupedCategories)}

      <AppModal
        open={open}
        title={formData.id ? "Edit Category" : "Add Category"}
        onClose={handleClose}
        onSave={handleSubmit}
        sx={{ mx: 'auto', my: '10vh' }}
      >
        <AppInput
          label="Name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
        />

        <AppSelect
  label="Parent Category"
  value={
    parentOptions.find((cat) => cat.id === formData.parentCategoryId) || parentOptions[0]
  }
  options={parentOptions}
  getOptionLabel={(opt) => opt.name}
  onChange={(val) =>
    handleChange({ target: { name: "parentCategoryId", value: val?.id ?? null } })
  }
  sx={{ mt: 2, minWidth: 220 }}
/>

      </AppModal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoriesTable;
