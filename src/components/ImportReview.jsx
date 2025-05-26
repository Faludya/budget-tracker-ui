import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
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
  CircularProgress,
} from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
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
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchData();
  }, [sessionId]);

  const handleChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = value;
    setTransactions(updated);
  };

  const handleDelete = async () => {
    try {
      const transactionId = transactions[deleteIndex].id;
      await apiClient.delete(`/import/transaction/${transactionId}`);
      const updated = [...transactions];
      updated.splice(deleteIndex, 1);
      setTransactions(updated);
      setDeleteIndex(null);
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const handleCancelImport = async () => {
    try {
      await apiClient.delete(`/import/session/${sessionId}`);
      navigate("/budget-tracker");
    } catch (err) {
      console.error("Error cancelling session:", err);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const updatePromises = transactions.map((tx) =>
        apiClient.put(`/import/session/${sessionId}/transaction/${tx.id}`, tx)
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setSaving(false);
    }
  };

  const isValid = useMemo(() => {
    return (
      transactions.length > 0 &&
      transactions.every(
        (tx) =>
          !!tx.date &&
          !!tx.description?.trim() &&
          !isNaN(tx.amount) &&
          tx.amount !== "" &&
          !!tx.currency &&
          !!tx.category
      )
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3} pb={12}>
      <Typography variant="h5" mb={3}>Review Imported Transactions</Typography>

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
                amount: !tx.amount || isNaN(parseFloat(tx.amount)),
                currency: !tx.currency,
                category: !tx.category,
              };

              return (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      type="date"
                      fullWidth
                      value={tx.date ? tx.date.split("T")[0] : ""}
                      onChange={(e) => handleChange(index, "date", e.target.value)}
                      sx={errors.date ? { border: '1px solid red', borderRadius: 1 } : {}}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      value={tx.description}
                      onChange={(e) => handleChange(index, "description", e.target.value)}
                      sx={errors.description ? { border: '1px solid red', borderRadius: 1 } : {}}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      fullWidth
                      value={tx.amount}
                      onChange={(e) => handleChange(index, "amount", e.target.value)}
                      sx={errors.amount ? { border: '1px solid red', borderRadius: 1 } : {}}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      fullWidth
                      value={tx.currency || ""}
                      onChange={(e) => handleChange(index, "currency", e.target.value)}
                     sx={errors.currency ? { border: '1px solid red', borderRadius: 1 } : {}}
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
                      sx={errors.category ? { border: "1px solid red", borderRadius: 1 } : {}}
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

      <Box
        position="fixed"
        bottom={0}
        left={0}
        width="100%"
        bgcolor="white"
        borderTop="1px solid #ddd"
        py={2}
        px={3}
        display="flex"
        justifyContent="flex-end"
        gap={2}
        zIndex={1300}
      >
        <Button variant="outlined" onClick={() => setConfirmCancelOpen(true)}>Cancel</Button>
        <Button variant="outlined" onClick={handleSaveDraft} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : "Save Draft"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCompleteImport}
          disabled={!isValid}
          sx={{
            "&.Mui-disabled": {
              backgroundColor: "#e0e0e0",
              color: "#9e9e9e",
              boxShadow: "none",
              cursor: "not-allowed",
            },
          }}
        >
          Complete Import
        </Button>

      </Box>

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

      <Dialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minWidth: 320,
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberRounded color="warning" />
          Confirm Cancel
        </DialogTitle>

        <Box px={3} py={4}>
          <Typography variant="body1">
            Are you sure you want to cancel this import? All imported data will be lost.
          </Typography>
        </Box>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setConfirmCancelOpen(false)}
          >
            No, Go Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              setConfirmCancelOpen(false);
              await handleCancelImport();
            }}
          >
            Yes, Cancel Import
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImportReview;
