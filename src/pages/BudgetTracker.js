import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  TableSortLabel,
  Chip,
  Button,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { format } from "date-fns";

const initialData = [
  {
    id: 1,
    account: "Bank Account",
    subAccounts: [
      { id: 101, name: "Savings", type: "Income", amount: 500, date: new Date() },
      { id: 102, name: "Checking", type: "Expense", amount: 200, date: new Date() },
    ],
  },
  {
    id: 2,
    account: "Cash",
    subAccounts: [
      { id: 201, name: "Pocket Money", type: "Expense", amount: 50, date: new Date() },
    ],
  },
];

const BudgetTracker = () => {
  const [data, setData] = useState(initialData);
  const [openRows, setOpenRows] = useState({});
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("date");

  const toggleRow = (id) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);

    setData((prev) =>
      prev.map((acc) => ({
        ...acc,
        subAccounts: [...acc.subAccounts].sort((a, b) =>
          isAsc ? (a[field] > b[field] ? 1 : -1) : a[field] < b[field] ? 1 : -1
        ),
      }))
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Budget Tracker
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Account</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "type"}
                  direction={sortOrder}
                  onClick={() => handleSort("type")}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "amount"}
                  direction={sortOrder}
                  onClick={() => handleSort("amount")}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "date"}
                  direction={sortOrder}
                  onClick={() => handleSort("date")}
                >
                  Date
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((account) => (
              <React.Fragment key={account.id}>
                <TableRow>
                  <TableCell>
                    <IconButton size="small" onClick={() => toggleRow(account.id)}>
                      {openRows[account.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </TableCell>
                  <TableCell colSpan={4}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {account.account}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={openRows[account.id]} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Table size="small">
                          <TableBody>
                            {account.subAccounts.map((sub) => (
                              <TableRow key={sub.id}>
                                <TableCell />
                                <TableCell>{sub.name}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={sub.type}
                                    color={sub.type === "Income" ? "success" : "error"}
                                  />
                                </TableCell>
                                <TableCell>${sub.amount}</TableCell>
                                <TableCell>{format(sub.date, "dd/MM/yyyy")}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" sx={{ mt: 3 }}>
        Add Transaction
      </Button>
    </Container>
  );
};

export default BudgetTracker;
