import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Snackbar,
  Alert,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogActions,
  Icon,
} from "@mui/material";
import {
  Label,
  AttachMoney,
  Notes,
  CalendarMonth,
  FolderOpen,
  MonetizationOn,
  Add,
  Edit,
  Delete,
  UploadFile,
} from "@mui/icons-material";
import * as Icons from "@mui/icons-material";
import dayjs from "dayjs";
import useTransactions from "../../hooks/useTransactions";
import useTransactionForm from "../../hooks/useTransactionForm";
import apiClient from "../../api/axiosConfig";
import AppModal from "../../components/common/AppModal";
import AppSelect from "../../components/common/AppSelect";
import AppInput from "../../components/common/AppInput";
import AppDatePicker from "../../components/common/AppDatePicker";
import AppTable from "../../components/common/AppTable";
import CategorySelect from "../../components/common/CategorySelect";
import ExportMenu from "../../components/common/ExportMenu";
import ImportModal from "./ImportModal";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";

const TransactionsTable = () => {
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [activeImportSession, setActiveImportSession] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const FILTERS_STORAGE_KEY = "transactions-filters";
  const defaultFilters = {
    fromDate: dayjs().startOf("month"),
    toDate: dayjs().endOf("month"),
    amountMin: "",
    amountMax: "",
    categoryId: "",
    type: "",
    description: "",
  };
  const savedFilters = JSON.parse(localStorage.getItem(FILTERS_STORAGE_KEY));
  const [filters, setFilters] = useState(
    savedFilters
      ? {
        ...savedFilters,
        fromDate: savedFilters.fromDate ? dayjs(savedFilters.fromDate) : defaultFilters.fromDate,
        toDate: savedFilters.toDate ? dayjs(savedFilters.toDate) : defaultFilters.toDate,
      }
      : defaultFilters
  );

  const navigate = useNavigate();
  const typeOptions = [
    { id: "Debit", name: "Debit" },
    { id: "Credit", name: "Credit" },
  ];

  const { transactions, setTransactions, fetchFilteredTransactions } = useTransactions();
  const {
    formData,
    open,
    handleOpen,
    handleClose,
    handleChange,
    handleSubmit,
    handleDelete,
    snackbar,
    setSnackbar,
  } = useTransactionForm(setTransactions);

  const { preferences } = useUserPreferences();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");

      const [categoriesData, currenciesData] = await Promise.all([
        apiClient.get("/categories", { headers: { userId } }),
        apiClient.get("/currencies"),
      ]);

      await fetchFilteredTransactions(filters);

      setCategories(categoriesData.data);
      setCurrencies(currenciesData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, fetchFilteredTransactions]);

  useEffect(() => {
    if (preferences?.preferredCurrency) {
      fetchData();
    }
  }, [preferences?.preferredCurrency, fetchData]);

  useEffect(() => {
    if (formData.categoryId && categories.length > 0 && !categories.find(cat => cat.id === formData.categoryId)) {
      handleChange({ target: { name: "categoryId", value: "" } });
    }
  }, [categories, formData.categoryId, handleChange]);

  useEffect(() => {
    const fetchActiveImportSession = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await apiClient.get(`/import/session/in-progress`, { headers: { userId } });
        setActiveImportSession(response.data);
      } catch (err) {
        setActiveImportSession(null);
      }
    };

    fetchActiveImportSession();
  }, []);

  const updateFilters = (updated) => {
    const sanitized = {
      ...updated,
      fromDate: updated.fromDate ? dayjs(updated.fromDate) : null,
      toDate: updated.toDate ? dayjs(updated.toDate) : null,
    };

    setFilters(sanitized);
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(sanitized));
    fetchFilteredTransactions(sanitized);
  };

  const resetFilters = () => {
    const reset = {
      fromDate: dayjs().startOf("month"),
      toDate: dayjs().endOf("month"),
      amountMin: "",
      amountMax: "",
      categoryId: "",
      type: "",
      description: "",
    };

    setFilters(reset);
    localStorage.removeItem(FILTERS_STORAGE_KEY);
    fetchFilteredTransactions(reset);
  };


  const handleConfirmDelete = async (id) => {
    try {
      await apiClient.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setSnackbar({ open: true, message: "Transaction deleted", severity: "success" });
    } catch (err) {
      console.error("Failed to delete transaction", err);
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: ({ row }) => {
        const format = preferences?.dateFormat || "DD/MM/YYYY";
        const today = dayjs();
        const value = dayjs(row.date);

        if (value.isSame(today, "day")) return "Today";
        if (value.isSame(today.subtract(1, "day"), "day")) return "Yesterday";
        return value.format(format);
      }
    },

    { field: "type", headerName: "Type", flex: 1 },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      renderCell: ({ row }) => {
        const symbol = currencies.find(c => c.code === preferences?.preferredCurrency)?.symbol ?? "";
        return `${row.convertedAmount ?? row.amount} ${symbol}`;
      },
    },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "categoryDisplay",
      headerName: "Category",
      flex: 1.5,
      renderCell: ({ row }) => {
        const category = row?.category;
        if (!category) return "Unknown";

        const IconComponent = Icons[category.iconName] || Icons.Category;

        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <IconComponent fontSize="small" sx={{ color: category.colorHex || "inherit" }} />
            <span>{category.name}</span>
          </Stack>
        );
      },
    },


    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="primary" size="small" onClick={() => handleOpen(row)}>
            <Edit fontSize="small" />
          </Button>
          <Button variant="outlined" color="error" size="small" onClick={() => setDeleteId(row.id)}>
            <Delete fontSize="small" />
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Transactions</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen(null)}>Add Transaction</Button>
          <Button variant="outlined" color="secondary" startIcon={<UploadFile />} onClick={() => activeImportSession?.id ? navigate(`/import/review?sessionId=${activeImportSession.id}`) : setImportOpen(true)}>
            {activeImportSession?.id ? "Resume Import" : "Import"}
          </Button>
        </Stack>
      </Box>

      <Stack spacing={2} mb={4}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <AppDatePicker
            label="From"
            name="fromDate"
            value={filters.fromDate}
            onChange={({ target }) => {
              const date = dayjs(target.value);
              if (date.isValid()) {
                updateFilters({ ...filters, fromDate: date });
              }
            }}
            format={preferences?.dateFormat}
            icon={<CalendarMonth />}
          />

          <AppDatePicker
            label="To"
            name="toDate"
            value={filters.toDate}
            onChange={({ target }) => {
              const date = dayjs(target.value);
              if (date.isValid()) {
                updateFilters({ ...filters, toDate: date });
              }
            }}
            format={preferences?.dateFormat}
            icon={<CalendarMonth />}
          />



          <AppInput label="Min Amount" name="amountMin" value={filters.amountMin} onChange={(e) => updateFilters({ ...filters, amountMin: e.target.value })} type="number" icon={<AttachMoney />} />
          <AppInput label="Max Amount" name="amountMax" value={filters.amountMax} onChange={(e) => updateFilters({ ...filters, amountMax: e.target.value })} type="number" icon={<AttachMoney />} />
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="flex-start"
          justifyContent="space-between"
          flexWrap="wrap"
          useFlexGap
        >
          {/* Filters Section */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {/* Description */}
            <Box sx={{ minWidth: 220 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Description
              </Typography>
              <AppInput
                name="description"
                value={filters.description}
                onChange={(e) => updateFilters({ ...filters, description: e.target.value })}
                icon={<Notes fontSize="small" />}
                sx={{ width: "100%" }}
              />
            </Box>

            {/* Category */}
            <Box sx={{ minWidth: 250 }}>
              <CategorySelect
                label="Category"
                value={categories.find((cat) => cat.id === filters.categoryId) || null}
                options={categories}
                onChange={(val) => updateFilters({ ...filters, categoryId: val?.id ?? "" })}
                icon={<FolderOpen fontSize="small" />}
              />
            </Box>

            {/* Type */}
            <Box sx={{ minWidth: 250 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Type
              </Typography>
              <AppSelect
                value={typeOptions.find((opt) => opt.id === filters.type) || ""}
                options={typeOptions}
                getOptionLabel={(opt) => opt.name}
                onChange={(val) => updateFilters({ ...filters, type: val?.id ?? "" })}
                icon={<Label fontSize="small" />}
                sx={{ width: "100%" }}
              />
            </Box>
          </Stack>

          {/* Buttons */}
          <Stack direction="row" spacing={1} alignSelf={{ xs: "center", md: "flex-end" }}>
            <Button variant="outlined" onClick={resetFilters}>
              Reset
            </Button>
            <ExportMenu filters={filters} />
          </Stack>
        </Stack>

      </Stack>

      <AppTable rows={transactions} columns={columns} pageSize={5} autoHeight loading={loading} />

      <AppModal open={open} title={formData.id ? "Edit Transaction" : "Add Transaction"} onClose={handleClose} onSave={async () => { await handleSubmit(); await fetchFilteredTransactions(filters); }}>
        <Typography fontWeight={500} fontSize="0.9rem" mb={0.5}>Type</Typography>
        <RadioGroup row name="type" value={formData.type} onChange={handleChange}>
          <FormControlLabel value="Debit" control={<Radio />} label="Debit" />
          <FormControlLabel value="Credit" control={<Radio />} label="Credit" />
        </RadioGroup>
        <AppInput label="Amount" name="amount" value={formData.amount} onChange={handleChange} type="number" icon={<AttachMoney />} />
        <AppInput label="Description" name="description" value={formData.description} onChange={handleChange} icon={<Notes />} />
        <AppDatePicker label="Date" name="date" value={formData.date} onChange={handleChange} format={preferences?.dateFormat} icon={<CalendarMonth />} />
        <CategorySelect
          label="Category"
          value={categories.find((cat) => cat.id === formData.categoryId) || null}
          options={categories}
          icon={<FolderOpen />}
          onChange={(val) =>
            handleChange({ target: { name: "categoryId", value: val?.id ?? "" } })
          }
        />
        <AppSelect label="Currency" value={currencies.find((cur) => cur.id === formData.currencyId) || ""} options={currencies} getOptionLabel={(opt) => opt.name} onChange={(val) => handleChange({ target: { name: "currencyId", value: val?.id ?? "" } })} icon={<MonetizationOn />} />
      </AppModal>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete this transaction?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={() => handleConfirmDelete(deleteId)}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} anchorOrigin={{ vertical: "top", horizontal: "center" }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onContinue={async (data) => {
          const formData = new FormData();
          formData.append("file", data.file);
          formData.append("template", data.template);

          try {
            const response = await apiClient.post("/import/start-session", formData);
            const sessionId = response.data.id;
            navigate(`/import/review?sessionId=${sessionId}`);
            return response.data;
          } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
          }
        }}
      />
    </Box>
  );
};

export default TransactionsTable;
