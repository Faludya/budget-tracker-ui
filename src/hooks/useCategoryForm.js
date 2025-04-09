import { useState } from "react";
import { CategoryModel } from "../models/CategoryModel";
import apiClient from "../api/axiosConfig";

const useCategoryForm = (setCategories) => {
  const [formData, setFormData] = useState(CategoryModel);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [open, setOpen] = useState(false);
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
      if (!userId) {
        console.error("❌ UserId is missing in localStorage");
        return;
      }

      const categoryData = {
        ...formData,
        userId,
        parentCategoryId: formData.parentCategoryId ? parseInt(formData.parentCategoryId) : null,
        createdAt: new Date().toISOString(),
      };
      

      if (!formData.id) {
        delete categoryData.id;
      }

      console.log("🚀 Sending Category Data:", categoryData);

      if (formData.id) {
        await apiClient.put(`/categories/${formData.id}`, categoryData);
      } else {
        await apiClient.post("/categories", categoryData);
      }

      const response = await apiClient.get("/categories");
      setCategories(response.data);

      setSnackbar({ open: true, message: "Category saved!", severity: "success" });
      handleClose();

    } catch (error) {
      console.error("❌ API Error:", error.response?.data || error);
      setSnackbar({ open: true, message: "Error saving category", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSnackbar({ open: true, message: "Category deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Error deleting category:", error);
      setSnackbar({ open: true, message: "Failed to delete category.", severity: "error" });
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
    setSnackbar,
  };
};

export default useCategoryForm;
