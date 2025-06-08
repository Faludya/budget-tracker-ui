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
  CircularProgress,
  Snackbar,
  Alert,
  Checkbox,
} from "@mui/material";
import { WarningAmberRounded, FolderOpen } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import CategorySelect from "../components/common/CategorySelect";
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [importSnackbarOpen, setImportSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");

        const [sessionRes, categoriesRes, currenciesRes] = await Promise.all([
          apiClient.get(`/import/session/${sessionId}`),
          apiClient.get("/categories", { headers: { userId } }),
          apiClient.get("/currencies"),
        ]);

        const patchedTransactions = sessionRes.data.transactions.map((tx) => ({
          ...tx,
          rememberMapping: tx.rememberMapping ?? false,
          isFromMLModel: tx.isFromMLModel ?? false,
        }));

        setTransactions(patchedTransactions);
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
    // If user manually changes the category, clear ML flag
    if (field === "category") {
      updated[index].isFromMLModel = false;
    }
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

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/import/session/${sessionId}`, transactions);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteImport = async () => {
    setCompleting(true);
    try {
      await apiClient.put(`/import/session/${sessionId}`, transactions);
      await apiClient.post(`/import/session/${sessionId}/complete`);
      setImportSnackbarOpen(true);
      setTimeout(() => navigate("/budget-tracker"), 1500);
    } catch (error) {
      console.error("Error completing import:", error);
    } finally {
      setCompleting(false);
    }
  };

  const getFieldError = (value) =>
    !value || (typeof value === "string" && value.trim() === "");

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Review Imported Transactions</Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        type="date"
                        fullWidth
                        value={tx.date ? tx.date.split("T")[0] : ""}
                        onChange={(e) => handleChange(index, "date", e.target.value)}
                        sx={getFieldError(tx.date) ? { border: "1px solid red", borderRadius: 1 } : {}}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={tx.description}
                        onChange={(e) => handleChange(index, "description", e.target.value)}
                        sx={getFieldError(tx.description) ? { border: "1px solid red", borderRadius: 1 } : {}}
                      />
                    </TableCell>
                    <TableCell sx={{ width: 140 }}>
                      <TextField
                        type="number"
                        fullWidth
                        value={tx.amount}
                        onChange={(e) => handleChange(index, "amount", e.target.value)}
                        sx={getFieldError(tx.amount) ? { border: "1px solid red", borderRadius: 1 } : {}}
                      />
                    </TableCell>
                    <TableCell sx={{ width: 90 }}>
                      <Select
                        fullWidth
                        value={tx.currency || ""}
                        onChange={(e) => handleChange(index, "currency", e.target.value)}
                        sx={getFieldError(tx.currency) ? { border: "1px solid red", borderRadius: 1 } : {}}
                      >
                        {currencies.map((cur) => (
                          <MenuItem key={cur.id} value={cur.code}>
                            {cur.code}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Tooltip title={tx.isFromMLModel ? "Predicted by AI model" : ""}>
                          <Box
                            sx={{
                              border: tx.isFromMLModel ? "2px dashed #42a5f5" : undefined,
                              borderRadius: 1,
                              minWidth: 240,
                              padding: "2px",
                            }}
                          >
                            <CategorySelect
                              options={categories}
                              value={categories.find((c) => c.name === tx.category) || null}
                              onChange={(val) =>
                                handleChange(index, "category", val?.name ?? "")
                              }
                              icon={<FolderOpen fontSize="small" />}
                              placeholder="Search categories..."
                            />
                          </Box>
                        </Tooltip>
                        <Tooltip title="Remember this mapping">
                          <Checkbox
                            checked={tx.rememberMapping || false}
                            onChange={(e) =>
                              handleChange(index, "rememberMapping", e.target.checked)
                            }
                            size="small"
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete Transaction">
                        <IconButton onClick={() => setDeleteIndex(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper
            sx={{
              position: "sticky",
              bottom: 0,
              zIndex: 2,
              mt: 2,
              borderTop: "1px solid #ccc",
              background: "#fff",
              p: 2,
            }}
          >
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setConfirmCancelOpen(true)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSaveDraft} disabled={saving}>
                {saving ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Save Draft"}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCompleteImport}
                disabled={!isValid || completing}
              >
                {completing ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  "Complete Import"
                )}
              </Button>
            </Stack>
          </Paper>
        </>
      )}

      <Dialog open={deleteIndex !== null} onClose={() => setDeleteIndex(null)}>
        <DialogTitle>Delete this transaction?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteIndex(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmCancelOpen} onClose={() => setConfirmCancelOpen(false)}>
        <DialogTitle>
          <WarningAmberRounded color="warning" /> Confirm Cancel
        </DialogTitle>
        <Box px={3} py={4}>
          <Typography variant="body1">
            Are you sure you want to cancel this import? All imported data will be lost.
          </Typography>
        </Box>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmCancelOpen(false)}>No, Go Back</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={async () => {
              setConfirmCancelOpen(false);
              await handleCancelImport();
            }}
          >
            Yes, Cancel Import
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Draft saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={importSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setImportSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setImportSnackbarOpen(false)} severity="success">
          Import completed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImportReview;
