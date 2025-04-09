import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import apiClient from "../../api/axiosConfig";
import useCategoryForm from "../../hooks/useCategoryForm";

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
          headers: { userId }
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
    { field: "isPredefined", headerName: "Predefined", flex: 1, type: "boolean" },
    { field: "createdAt", headerName: "Created At", flex: 2 },
    { field: "parentCategoryId", headerName: "Parent Category ID", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button variant="contained" size="small" onClick={() => handleOpen(params.row)}>
            Edit
          </Button>
          <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" onClick={() => handleOpen(null)}>
          Add Category
        </Button>
      </Box>

      <DataGrid rows={categories} columns={columns} pageSize={5} getRowId={(row) => row.id} />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{formData.id ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2, width: "100%" }}>
          {["name", "parentCategoryId"].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
              fullWidth
              type={field.includes("Id") ? "number" : "text"}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoriesTable;
