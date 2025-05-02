import React, { useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, TableSortLabel, Box, Button
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";
import { saveAs } from "file-saver";

// Helper to export to CSV
const exportToCSV = (columns, rows) => {
  const headers = columns.map(col => col.headerName).join(",");
  const data = rows.map(row =>
    columns.map(col =>
      typeof col.renderCell === "function"
        ? `"${col.renderCell({ row })?.props?.children ?? ""}"`
        : `"${row[col.field] ?? ""}"`
    ).join(",")
  );
  const csvContent = [headers, ...data].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "transactions_export.csv");
};

const AppTable = ({ columns, rows }) => {
  const [orderBy, setOrderBy] = useState(columns[0].field);
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const sortedRows = [...rows].sort((a, b) => {
    const aVal = a[orderBy];
    const bVal = b[orderBy];
    if (aVal === undefined || bVal === undefined) return 0;
    return (order === "asc" ? aVal > bVal : aVal < bVal) ? 1 : -1;
  });

  const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper elevation={4} sx={{ borderRadius: 4, overflow: "hidden", mt: 3 }}>
      <Box display="flex" justifyContent="flex-end" p={2}>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={() => exportToCSV(columns, sortedRows)}
        >
          Export CSV
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sortDirection={orderBy === col.field ? order : false}
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1e1e1e" : "#f9f9f9",
                  }}
                >
                  <TableSortLabel
                    active={orderBy === col.field}
                    direction={orderBy === col.field ? order : "asc"}
                    onClick={() => handleRequestSort(col.field)}
                  >
                    {col.headerName}
                    {orderBy === col.field ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === "desc" ? "sorted descending" : "sorted ascending"}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow key={row.id} hover>
                {columns.map((col) => (
                  <TableCell key={col.field}>
                    {col.renderCell ? col.renderCell({ row }) : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default AppTable;
