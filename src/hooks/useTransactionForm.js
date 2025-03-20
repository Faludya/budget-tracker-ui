import { useState } from "react";
import { TransactionModel } from "../models/TransactionModel";
import apiClient from "../api/axiosConfig";

const useTransactionForm = (setTransactions) => {
  const [formData, setFormData] = useState(TransactionModel);
  const [setCurrentTransaction] = useState(null);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleOpen = (transaction = null) => {
    setCurrentTransaction(transaction);
    setFormData(transaction || TransactionModel);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentTransaction(null);
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
  
      const transactionData = {
        ...formData,
        userId: userId,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        currencyId: parseInt(formData.currencyId),
        date: new Date(formData.date).toISOString(), // ✅ Convert to UTC
      };
  
      console.log("🚀 Sending Transaction Data:", transactionData);
  
      let response;
      if (formData.id) {
        // ✅ Update existing transaction
        response = await apiClient.put(`/transactions/${formData.id}`, transactionData);
      } else {
        // ✅ Create new transaction
        response = await apiClient.post("/transactions", transactionData);
      }
  
      console.log("✅ Transaction Saved:", response.data);
  
      // ✅ Update table by adding the new transaction
      setTransactions((prev) => {
        if (formData.id) {
          // Update existing transaction
          return prev.map((t) => (t.id === formData.id ? response.data : t));
        } else {
          // Add new transaction
          return [...prev, response.data];
        }
      });
  
      setSnackbar({ open: true, message: "Transaction saved!", severity: "success" });
  
      // ✅ Close modal
      handleClose();
  
    } catch (error) {
      console.error("❌ API Error:", error.response?.data || error);
      setSnackbar({ open: true, message: "Error saving transaction", severity: "error" });
    }
  };
  
  

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/transactions/${id}`);

      // Refresh transactions
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setSnackbar({ open: true, message: "Transaction deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setSnackbar({ open: true, message: "Failed to delete transaction.", severity: "error" });
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

export default useTransactionForm;
