import React, { useState, useEffect } from "react";
import { Button, Box, Snackbar, Alert, Typography, Grid } from "@mui/material";
import {
  Label,
  AttachMoney,
  Notes,
  CalendarMonth,
  FolderOpen,
  MonetizationOn,
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

        const [transactionsRes, categoriesRes, currenciesRes] = await Promise.all([
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
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        Transactions
      </Typography>

      {/* Filter UI */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <AppDatePicker
            label="From"
            name="fromDate"
            value={filters.fromDate}
            onChange={() => {}}
            icon={<CalendarMonth fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AppDatePicker
            label="To"
            name="toDate"
            value={filters.toDate}
            onChange={() => {}}
            icon={<CalendarMonth fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AppInput
            label="Min Amount"
            name="amountMin"
            value={filters.amountMin}
            onChange={() => {}}
            type="number"
            icon={<AttachMoney fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AppInput
            label="Max Amount"
            name="amountMax"
            value={filters.amountMax}
            onChange={() => {}}
            type="number"
            icon={<AttachMoney fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AppSelect
            label="Category"
            value={filters.categoryId}
            options={categories}
            getOptionLabel={(opt) => opt.name}
            onChange={() => {}}
            icon={<FolderOpen fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button variant="contained" fullWidth>
            Apply
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button variant="outlined" fullWidth>
            Reset
          </Button>
        </Grid>
      </Grid>

      <AppTable rows={transactions} columns={columns} pageSize={5} autoHeight />

      <AppModal
        open={open}
        title={formData.id ? "Edit Transaction" : "Add Transaction"}
        onClose={handleClose}
        onSave={handleSubmit}
      >
        <AppInput label="Type" name="type" value={formData.type} onChange={handleChange} icon={<Label fontSize="small" />} />
        <AppInput label="Amount" name="amount" value={formData.amount} onChange={handleChange} type="number" icon={<AttachMoney fontSize="small" />} />
        <AppInput label="Description" name="description" value={formData.description} onChange={handleChange} icon={<Notes fontSize="small" />} />
        <AppDatePicker label="Date" name="date" value={formData.date} onChange={handleChange} icon={<CalendarMonth fontSize="small" />} />
        <AppSelect
          label="Category"
          value={formData.categoryId}
          options={categories}
          getOptionLabel={(opt) => opt.name}
          onChange={(val) => handleChange({ target: { name: "categoryId", value: val } })}
          icon={<FolderOpen fontSize="small" />}
        />
        <AppSelect
          label="Currency"
          value={formData.currencyId}
          options={currencies}
          getOptionLabel={(opt) => opt.name}
          onChange={(val) => handleChange({ target: { name: "currencyId", value: val } })}
          icon={<MonetizationOn fontSize="small" />}
        />
      </AppModal>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionsTable;
