import { useState } from "react";
import { TransactionModel } from "../models/TransactionModel";
import apiClient from "../api/axiosConfig";

const useTransactionForm = (setTransactions) => {
  const [formData, setFormData] = useState(TransactionModel);
  const [currentTransaction, setCurrentTransaction] = useState(null);
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
        date: new Date(formData.date).toISOString(),
      };
  
      console.log("🚀 Sending Transaction Data:", transactionData);
  
      // 🔄 Create or update transaction
      if (formData.id) {
        await apiClient.put(`/transactions/${formData.id}`, transactionData);
      } else {
        await apiClient.post("/transactions", transactionData);
      }
  
      // ✅ Refresh the entire transaction list
      const refreshed = await apiClient.get("/transactions", {
        headers: { userId }
      });
  
      console.log("🔄 Refreshed transactions:", refreshed.data);
      setTransactions(refreshed.data);
  
      setSnackbar({ open: true, message: "Transaction saved!", severity: "success" });
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
