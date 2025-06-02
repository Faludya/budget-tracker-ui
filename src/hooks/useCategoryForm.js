import { useCallback, useState, useEffect } from "react";
import apiClient from "../api/axiosConfig";

const useCategoryForm = (setCategories) => {
  const [formData, setFormData] = useState({});
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [groupedCategories, setGroupedCategories] = useState([]);
  const [expanded, setExpanded] = useState({});
  const userId = localStorage.getItem("userId");
  
const groupCategories = (categories) => {
  const parentCategories = categories.filter(c => !c.parentCategoryId);
  const subCategoriesMap = {};

  categories.forEach((cat) => {
    if (cat.parentCategoryId) {
      if (!subCategoriesMap[cat.parentCategoryId]) {
        subCategoriesMap[cat.parentCategoryId] = [];
      }
      subCategoriesMap[cat.parentCategoryId].push(cat);
    }
  });

  return parentCategories.map((parent) => ({
    ...parent, // ⬅️ This keeps iconName, colorHex, etc.
    children: subCategoriesMap[parent.id] || [],
  }));
};


const fetchCategories = useCallback(async () => {
  try {
    const { data } = await apiClient.get("/categories", {
      headers: { userId },
    });

    const grouped = groupCategories(data);
    setCategories(data);
    setGroupedCategories(grouped);

    const defaultExpanded = {};
    grouped.forEach((cat) => {
      defaultExpanded[cat.id] = true;
    });

    setExpanded(defaultExpanded);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}, [setCategories, userId]);



  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);


  const handleOpen = (data) => {
    setFormData({
      ...data,
      parentCategoryId: data?.parentCategoryId ?? null,
      iconName: typeof data?.iconName === "string" ? data.iconName : "Category",
      colorHex: data?.colorHex || "#000000",
    });
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
        await apiClient.post("/categories", {...formData, userId}, {headers : {userId}});
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
    setGroupedCategories,
    expanded,
    setExpanded,
    fetchCategories,
  };
};

export default useCategoryForm;