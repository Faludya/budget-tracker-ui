import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Tooltip,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AppSelect from "../components/common/AppSelect";
import DeleteIcon from "@mui/icons-material/Delete";
import apiClient from "../api/axiosConfig";

const ImportReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = new URLSearchParams(location.search).get("sessionId");

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");

        const [sessionRes, categoriesRes, currenciesRes] = await Promise.all([
          apiClient.get(`/import/session/${sessionId}`),
          apiClient.get("/categories", { headers: { userId } }),
          apiClient.get("/currencies"),
        ]);

        setTransactions(sessionRes.data.transactions);
        setCategories(categoriesRes.data);
        setCurrencies(currenciesRes.data);
      } catch (error) {
        console.error("Failed to fetch session or meta info:", error);
      }
    };

    if (sessionId) fetchData();
  }, [sessionId]);

  const handleChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = value;
    setTransactions(updated);
  };

  const handleDelete = () => {
    setTransactions(transactions.filter((_, idx) => idx !== deleteIndex));
    setDeleteIndex(null);
  };

  const isValid = useMemo(() => {
    return transactions.length > 0 && transactions.every(
      (tx) => tx.date && tx.description && tx.amount && tx.currency && tx.category
    );
  }, [transactions]);

  const handleCompleteImport = async () => {
    try {
      await apiClient.post(`/import/session/${sessionId}/complete`);
      navigate("/transactions");
    } catch (error) {
      console.error("Error completing import:", error);
    }
  };

  if (!transactions.length) {
    return (
      <Box p={3}>
        <Typography variant="h6">No data to review. Please start a new import.</Typography>
        <Button onClick={() => navigate("/transactions")} sx={{ mt: 2 }}>
          Back to Transactions
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Review Imported Transactions</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => navigate("/transactions")}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCompleteImport}
            disabled={!isValid}
          >
            Complete Import
          </Button>
        </Stack>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 130 }}>Date</TableCell>
              <TableCell sx={{ minWidth: 240 }}>Description</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Amount</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Currency</TableCell>
              <TableCell sx={{ minWidth: 200 }}>Category</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx, index) => {
              const errors = {
                date: !tx.date,
                description: !tx.description,
                amount: !tx.amount,
                currency: !tx.currency,
                category: !tx.category,
              };
              return (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      type="date"
                      fullWidth
                      value={tx.date.split("T")[0]}
                      onChange={(e) => handleChange(index, "date", e.target.value)}
                      error={errors.date}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      value={tx.description}
                      onChange={(e) => handleChange(index, "description", e.target.value)}
                      error={errors.description}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      fullWidth
                      value={tx.amount}
                      onChange={(e) => handleChange(index, "amount", e.target.value)}
                      error={errors.amount}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      fullWidth
                      value={tx.currency || ""}
                      onChange={(e) => handleChange(index, "currency", e.target.value)}
                      error={errors.currency}
                    >
                      {currencies.map((cur) => (
                        <MenuItem key={cur.id} value={cur.code}>{cur.code}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <AppSelect
                      options={categories}
                      value={categories.find((c) => c.name === tx.category) || ""}
                      onChange={(val) => handleChange(index, "category", val.name)}
                      getOptionLabel={(opt) => opt.name}
                      getOptionValue={(opt) => opt.name}
                      sx={errors.category ? { border: '1px solid red', borderRadius: 1 } : {}}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete Transaction">
                      <IconButton onClick={() => setDeleteIndex(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        PaperProps={{ sx: { maxWidth: 300 } }}
      >
        <DialogTitle>Delete this transaction?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteIndex(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImportReview;
