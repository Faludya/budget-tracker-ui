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
      if (currentTransaction) {
        await apiClient.put(`/transactions/${currentTransaction.id}`, formData);
      } else {
        await apiClient.post("/transactions", formData);
      }

      // Refresh transactions
      const response = await apiClient.get("/transactions");
      setTransactions(response.data);

      setSnackbar({ open: true, message: "Transaction saved successfully!", severity: "success" });
      handleClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
      setSnackbar({ open: true, message: "Failed to save transaction.", severity: "error" });
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
