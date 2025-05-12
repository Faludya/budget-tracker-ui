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

  const fetchTransactions = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("UserId missing");

      const response = await apiClient.get("/transactions", {
        headers: { userId },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("UserId missing");

      const transactionData = {
        ...formData,
        userId,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        currencyId: parseInt(formData.currencyId),
        date: new Date(formData.date).toISOString(),
      };

      if (formData.id) {
        await apiClient.put(`/transactions/${formData.id}`, transactionData);
      } else {
        await apiClient.post("/transactions", transactionData);
      }

      await fetchTransactions();
      setSnackbar({ open: true, message: "Transaction saved!", severity: "success" });
      handleClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
      setSnackbar({ open: true, message: "Error saving transaction", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/transactions/${id}`);
      await fetchTransactions();
      setSnackbar({ open: true, message: "Transaction deleted!", severity: "success" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setSnackbar({ open: true, message: "Failed to delete transaction", severity: "error" });
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
    fetchTransactions, 
  };
};

export default useTransactionForm;
