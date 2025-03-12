import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert } from "@mui/material";
import apiClient from "../../api/axiosConfig";
import useTransactionForm from "../../hooks/useTransactionForm";

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const { formData, open, handleOpen, handleClose, handleChange, handleSubmit, handleDelete, snackbar, setSnackbar } = useTransactionForm(setTransactions);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await apiClient.get("/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  const columns = [
    { field: "type", headerName: "Type", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "categoryId", headerName: "Category", flex: 1 },
    { field: "currencyId", headerName: "Currency", flex: 1 },
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
        <Button variant="contained" onClick={() => handleOpen(null)}>Add Transaction</Button>
      </Box>

      <DataGrid rows={transactions} columns={columns} pageSize={5} />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{formData.id ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2, width: "100%" }}>
          {["type", "amount", "description", "date", "categoryId", "currencyId"].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              fullWidth
              type={field === "amount" || field.includes("Id") ? "number" : field === "date" ? "date" : "text"}
              InputLabelProps={field === "date" ? { shrink: true } : {}}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionsTable;
