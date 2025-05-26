// ✅ TransactionsTable.js (fixed Type select + React warnings)
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Snackbar,
  Alert,
  Typography,
  Stack,
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
import dayjs from "dayjs";
import useTransactions from "../../hooks/useTransactions";
import useTransactionForm from "../../hooks/useTransactionForm";
import apiClient from "../../api/axiosConfig";
import AppModal from "../../components/common/AppModal";
import AppSelect from "../../components/common/AppSelect";
import AppInput from "../../components/common/AppInput";
import AppDatePicker from "../../components/common/AppDatePicker";
import AppTable from "../../components/common/AppTable";
import ExportMenu from "../../components/common/ExportMenu";
import ImportModal from "./ImportModal";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";

const TransactionsTable = () => {
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [activeImportSession, setActiveImportSession] = useState(null);
  const FILTERS_STORAGE_KEY = "transactions-filters";

  const defaultFilters = {
    fromDate: dayjs().startOf("month"),
    toDate: dayjs().endOf("month"),
    amountMin: "",
    amountMax: "",
    categoryId: "",
    type: "",
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

  const {
    transactions,
    setTransactions,
    fetchFilteredTransactions,
  } = useTransactions();

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
    if (
      formData.categoryId &&
      categories.length > 0 &&
      !categories.find(cat => cat.id === formData.categoryId)
    ) {
      handleChange({ target: { name: "categoryId", value: "" } });
    }
  }, [categories, formData.categoryId, handleChange]);

  useEffect(() => {
    const fetchActiveImportSession = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await apiClient.get(`/import/session/in-progress`, {
          headers: { userId },
        });
        setActiveImportSession(response.data);
      } catch (err) {
        setActiveImportSession(null);
      }
    };

    fetchActiveImportSession();
  }, []);

  const updateFilters = (updated) => {
    setFilters(updated);
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(updated));
  };

  const columns = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: ({ row }) => dayjs(row.date).format("DD/MM/YYYY"),
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
      field: "categoryName",
      headerName: "Category",
      flex: 1,
      renderCell: ({ row }) => row?.category?.name ?? "Unknown",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleOpen(row)}
            sx={{ minWidth: 36, padding: "4px 8px" }}
          >
            <Edit fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(row.id)}
            sx={{ minWidth: 36, padding: "4px 8px" }}
          >
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
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen(null)}
          >
            Add Transaction
          </Button>

          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<UploadFile />}
              onClick={() => {
                if (activeImportSession?.id) {
                  navigate(`/import/review?sessionId=${activeImportSession.id}`);
                } else {
                  setImportOpen(true);
                }
              }}
            >
              {activeImportSession?.id ? "Resume Import" : "Import"}
            </Button>
          </Box>
        </Stack>
      </Box>

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

      {/* Filters UI */}
      <Stack spacing={2} mb={4}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <AppDatePicker
            label="From"
            name="fromDate"
            value={filters.fromDate}
            onChange={(value) => updateFilters({ ...filters, fromDate: value })}
            icon={<CalendarMonth fontSize="small" />}
            sx={{ maxWidth: 220 }}
          />
          <AppDatePicker
            label="To"
            name="toDate"
            value={filters.toDate}
            onChange={(value) => updateFilters({ ...filters, toDate: value })}
            icon={<CalendarMonth fontSize="small" />}
            sx={{ maxWidth: 220 }}
          />
          <AppInput
            label="Min Amount"
            name="amountMin"
            value={filters.amountMin}
            onChange={(e) => updateFilters({ ...filters, amountMin: e.target.value })}
            type="number"
            icon={<AttachMoney fontSize="small" />}
            sx={{ maxWidth: 220 }}
          />
          <AppInput
            label="Max Amount"
            name="amountMax"
            value={filters.amountMax}
            onChange={(e) => updateFilters({ ...filters, amountMax: e.target.value })}
            type="number"
            icon={<AttachMoney fontSize="small" />}
            sx={{ maxWidth: 220 }}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          useFlexGap
        >
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <AppSelect
              label="Category"
              value={categories.find((cat) => cat.id === filters.categoryId) || ""}
              options={categories}
              getOptionLabel={(opt) => opt.name}
              onChange={(val) => updateFilters({ ...filters, categoryId: val?.id ?? "" })}
              icon={<FolderOpen fontSize="small" />}
              sx={{ minWidth: 220 }}
            />
            <AppSelect
              label="Type"
              value={typeOptions.find(opt => opt.id === filters.type) || ""}
              options={typeOptions}
              getOptionLabel={(opt) => opt.name}
              onChange={(val) => updateFilters({ ...filters, type: val?.id ?? "" })}
              icon={<Label fontSize="small" />}
              sx={{ minWidth: 220 }}
            />
          </Stack>

          <Stack direction="row" spacing={2} mt={{ xs: 2, md: 0 }}>
            <ExportMenu filters={filters} />
            <Button
              variant="outlined"
              sx={{ minWidth: 120, borderRadius: 2 }}
              onClick={() => {
                localStorage.removeItem(FILTERS_STORAGE_KEY);
                const resetFilters = { ...defaultFilters };
                setFilters(resetFilters);
              }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <AppTable rows={transactions} columns={columns} pageSize={5} autoHeight loading={loading} />

      {categories.length > 0 && (
        <AppModal
          open={open}
          title={formData.id ? "Edit Transaction" : "Add Transaction"}
          onClose={handleClose}
          onSave={handleSubmit}
        >
          <AppInput
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            icon={<Label fontSize="small" />}
          />
          <AppInput
            label="Amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            type="number"
            icon={<AttachMoney fontSize="small" />}
          />
          <AppInput
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            icon={<Notes fontSize="small" />}
          />
          <AppDatePicker
            label="Date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            icon={<CalendarMonth fontSize="small" />}
          />
          <AppSelect
            label="Category"
            value={categories.find((cat) => cat.id === formData.categoryId) || ""}
            options={categories}
            getOptionLabel={(opt) => opt.name}
            onChange={(val) =>
              handleChange({ target: { name: "categoryId", value: val?.id ?? "" } })
            }
            icon={<FolderOpen fontSize="small" />}
            sx={{ minWidth: 220 }}
          />
          <AppSelect
            label="Currency"
            value={currencies.find((cur) => cur.id === formData.currencyId) || ""}
            options={currencies}
            getOptionLabel={(opt) => opt.name}
            onChange={(val) =>
              handleChange({ target: { name: "currencyId", value: val?.id ?? "" } })
            }
            icon={<MonetizationOn fontSize="small" />}
            sx={{ minWidth: 220 }}
          />
        </AppModal>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionsTable;
