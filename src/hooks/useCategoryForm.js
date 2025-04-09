import { useState } from "react";
import { CategoryModel } from "../models/CategoryModel";
import apiClient from "../api/axiosConfig";

const useCategoryForm = (setCategories) => {
  const [formData, setFormData] = useState(CategoryModel);
  const [open, setOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleOpen = (category = null) => {
    setCurrentCategory(category);
    setFormData(category || CategoryModel);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentCategory(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const categoryData = {
        ...formData,
        userId,
        parentCategoryId: parseInt(formData.parentCategoryId) || null,
        isPredefined: false,
        createdAt: new Date().toISOString()
      };

      if (formData.id) {
        await apiClient.put(`/categories/${formData.id}`, categoryData);
      } else {
        await apiClient.post("/categories", categoryData);
      }

      // Refresh categories
      const response = await apiClient.get("/categories", { headers: { userId } });
      setCategories(response.data);
      setSnackbar({ open: true, message: "Category saved!", severity: "success" });
      handleClose();
    } catch (error) {
      console.error("Error saving category:", error);
      setSnackbar({ open: true, message: "Error saving category", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      setSnackbar({ open: true, message: "Category deleted!", severity: "success" });
    } catch (error) {
      console.error("Error deleting category:", error);
      setSnackbar({ open: true, message: "Failed to delete category", severity: "error" });
    }
  };

  return {
    formData,
    setFormData,
    open,
    handleOpen,
    handleClose,
    handleChange,
    handleSubmit,
    handleDelete,
    snackbar,
    setSnackbar
  };
};

export default useCategoryForm;
