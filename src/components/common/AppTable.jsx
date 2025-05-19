import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TableSortLabel,
  CircularProgress,
} from "@mui/material";

const AppTable = ({ columns, rows, loading = false, rowsPerPageOptions = [5, 10, 25] }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(columns[0]?.field || "");

  const handleSort = (field) => {
    const isAsc = orderBy === field && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(field);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const valA = a[orderBy] ?? "";
      const valB = b[orderBy] ?? "";
      return order === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [rows, order, orderBy]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, page, rowsPerPage]);

  return (
    <TableContainer
      component={Paper}
      elevation={4}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "#111" : "#fff",
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#1e1e1e" : "#f9f9f9",
            }}
          >
            {columns.map((col) => (
              <TableCell
                key={col.field}
                sortDirection={orderBy === col.field ? order : false}
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: (theme) => theme.palette.text.primary,
                  py: 2,
                  border: "none",
                }}
              >
                <TableSortLabel
                  active={orderBy === col.field}
                  direction={orderBy === col.field ? order : "asc"}
                  onClick={() => handleSort(col.field)}
                >
                  {col.headerName}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : (
            paginatedRows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={col.field} sx={{ py: 2 }}>
                    {col.renderCell ? col.renderCell({ row }) : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!loading && (
        <Box display="flex" justifyContent="flex-end" px={2} pt={1}>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={rowsPerPageOptions}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
    </TableContainer>
  );
};

export default AppTable;
