import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import dayjs from "dayjs";
import apiClient from "../../api/axiosConfig";
import useTransactionForm from "../../hooks/useTransactionForm";
import AppModal from "../../components/common/AppModal";
import AppSelect from "../../components/common/AppSelect";
import AppInput from "../../components/common/AppInput";
import AppDatePicker from "../../components/common/AppDatePicker";
import AppTable from "../../components/common/AppTable";

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const [filters, setFilters] = useState({
    fromDate: dayjs().startOf("month"),
    toDate: dayjs().endOf("month"),
    amountMin: "",
    amountMax: "",
    categoryId: "",
    type: "",
  });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");

        const [transactionsRes, categoriesRes, currenciesRes] =
          await Promise.all([
            apiClient.get("/transactions", { headers: { userId } }),
            apiClient.get("/categories", { headers: { userId } }),
            apiClient.get("/currencies"),
          ]);

        const transactions = transactionsRes.data.map((t) => ({
          ...t,
          id: t.id ?? t.transactionId,
        }));

        setTransactions(transactions);
        setCategories(categoriesRes.data);
        setCurrencies(currenciesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
      renderCell: ({ row }) => `${row.currency?.symbol ?? ""}${row.amount}`,
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
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={3}
    >
      <Typography variant="h5">Transactions</Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleOpen(null)}
      >
        Add Transaction
      </Button>
    </Box>


{/* Filter UI */}
<Stack spacing={2} mb={4}>
  {/* Row 1: Date and Amount */}
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
      onChange={() => {}}
      icon={<CalendarMonth fontSize="small" />}
      sx={{ maxWidth: 220 }}
    />
    <AppDatePicker
      label="To"
      name="toDate"
      value={filters.toDate}
      onChange={() => {}}
      icon={<CalendarMonth fontSize="small" />}
      sx={{ maxWidth: 220 }}
    />
    <AppInput
      label="Min Amount"
      name="amountMin"
      value={filters.amountMin}
      onChange={() => {}}
      type="number"
      icon={<AttachMoney fontSize="small" />}
      sx={{ maxWidth: 220 }}
    />
    <AppInput
      label="Max Amount"
      name="amountMax"
      value={filters.amountMax}
      onChange={() => {}}
      type="number"
      icon={<AttachMoney fontSize="small" />}
      sx={{ maxWidth: 220 }}
    />
  </Stack>

  {/* Row 2: Category, Type, Buttons */}
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
        value={filters.categoryId}
        options={categories}
        getOptionLabel={(opt) => opt.name}
        onChange={() => {}}
        icon={<FolderOpen fontSize="small" />}
        sx={{ minWidth: 220 }}
      />
      <AppSelect
        label="Type"
        value={filters.type}
        options={[
          { id: "Debit", name: "Debit" },
          { id: "Credit", name: "Credit" },
        ]}
        getOptionLabel={(opt) => opt.name}
        onChange={() => {}}
        icon={<Label fontSize="small" />}
        sx={{ minWidth: 220 }}
      />
    </Stack>

    <Stack direction="row" spacing={2} mt={{ xs: 2, md: 0 }}>
      <Button
        variant="contained"
        sx={{ minWidth: 120, borderRadius: 2, boxShadow: 2 }}
      >
        Apply
      </Button>
      <Button variant="outlined" sx={{ minWidth: 120, borderRadius: 2 }}>
        Reset
      </Button>
    </Stack>
  </Stack>
</Stack>



      <AppTable rows={transactions} columns={columns} pageSize={5} autoHeight />

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
          value={formData.categoryId}
          options={categories}
          getOptionLabel={(opt) => opt.name}
          onChange={(val) =>
            handleChange({ target: { name: "categoryId", value: val } })
          }
          icon={<FolderOpen fontSize="small" />}
        />
        <AppSelect
          label="Currency"
          value={formData.currencyId}
          options={currencies}
          getOptionLabel={(opt) => opt.name}
          onChange={(val) =>
            handleChange({ target: { name: "currencyId", value: val } })
          }
          icon={<MonetizationOn fontSize="small" />}
        />
      </AppModal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionsTable;
