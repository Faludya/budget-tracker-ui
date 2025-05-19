import { useCallback, useState, useEffect } from "react";
import apiClient from "../api/axiosConfig";

const useCategoryForm = (setCategories) => {
  const [formData, setFormData] = useState({});
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [groupedCategories, setGroupedCategories] = useState([]);
  const [expanded, setExpanded] = useState({});

  const groupCategories = (categories) => {
    const map = new Map();
    const roots = [];

    categories.forEach((cat) => {
      cat.children = [];
      map.set(cat.id, cat);
    });

    categories.forEach((cat) => {
      if (cat.parentCategoryId) {
        const parent = map.get(cat.parentCategoryId);
        if (parent) parent.children.push(cat);
      } else {
        roots.push(cat);
      }
    });

    return roots;
  };

  const fetchCategories = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await apiClient.get("/categories", {
        headers: { userId },
      });

      const grouped = groupCategories(response.data);
      setCategories(response.data);
      setGroupedCategories(grouped);

      const expandedDefault = {};
      grouped.forEach((cat) => {
        expandedDefault[cat.id] = true;
      });
      setExpanded(expandedDefault);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, [setCategories]); // only changes if setCategories reference changes


  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);


  const handleOpen = (data) => {
    setFormData(data || {});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        await apiClient.put(`/categories/${formData.id}`, formData);
      } else {
        await apiClient.post("/categories", formData);
      }

      handleClose();
      await fetchCategories();

      setSnackbar({
        open: true,
        message: "Category saved successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Submit error:", error);
      setSnackbar({
        open: true,
        message: "Error saving category",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/categories/${id}`);
      await fetchCategories();

      setSnackbar({
        open: true,
        message: "Category deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
        message: "Error deleting category",
        severity: "error",
      });
    }
  };

  return {
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
    expanded,
    setExpanded,
  };
};

export default useCategoryForm;