import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Stack,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import dayjs from "dayjs";
import apiClient from "../../api/axiosConfig";
import useCategoryForm from "../../hooks/useCategoryForm";
import AppInput from "../../components/common/AppInput";
import AppModal from "../../components/common/AppModal";
import AppTable from "../../components/common/AppTable";

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);

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
  } = useCategoryForm(setCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await apiClient.get("/categories", {
          headers: { userId },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const columns = [
    { field: "name", headerName: "Name", flex: 2 },
    {
      field: "isPredefined",
      headerName: "Predefined",
      flex: 1,
      renderCell: ({ row }) => (row.isPredefined ? "Yes" : "No"),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 2,
      renderCell: ({ row }) =>
        row.createdAt ? dayjs(row.createdAt).format("DD/MM/YYYY") : "-",
    },
    {
      field: "parentCategoryId",
      headerName: "Parent ID",
      flex: 1,
      renderCell: ({ row }) => row.parentCategoryId ?? "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleOpen(row)}
            sx={{ minWidth: 36, padding: "4px 8px" }}
          >
            <Edit fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(row.id)}
            sx={{ minWidth: 36, padding: "4px 8px" }}
          >
            <Delete fontSize="small" />
          </Button>
        </Stack>
      ),
    },    
  ];

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen(null)}
        >
          Add Category
        </Button>
      </Box>

      <AppTable rows={categories} columns={columns} />

      <AppModal
        open={open}
        title={formData.id ? "Edit Category" : "Add Category"}
        onClose={handleClose}
        onSave={handleSubmit}
      >
        <AppInput
          label="Name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
        />
        <AppInput
          label="Parent Category ID"
          name="parentCategoryId"
          type="number"
          value={formData.parentCategoryId || ""}
          onChange={handleChange}
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
