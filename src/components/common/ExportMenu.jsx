import { Stack, Button, Menu, MenuItem, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useState } from "react";
import dayjs from "dayjs";
import apiClient from "../../api/axiosConfig"; // adjust path based on your project

const ExportButton = ({ filters }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleExport = async (format) => {
    const queryObj = {
      ...filters,
      format,
      fromDate: filters.fromDate ? dayjs(filters.fromDate).format("YYYY-MM-DD") : undefined,
      toDate: filters.toDate ? dayjs(filters.toDate).format("YYYY-MM-DD") : undefined,
    };

    const query = new URLSearchParams(queryObj).toString();

    try {
      const response = await apiClient.get(`/transactions/export?${query}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type:
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_export.${format === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      handleClose();
    }
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Button onClick={handleClick} variant="outlined">
        Export ▼
      </Button>

      <Tooltip
        title="Your exported file will include only the transactions currently filtered."
        arrow
      >
        <IconButton size="small" sx={{ border: "1px solid #ccc", borderRadius: 2 }}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleExport("pdf")}>Export as PDF</MenuItem>
        <MenuItem onClick={() => handleExport("excel")}>Export as Excel</MenuItem>
      </Menu>
    </Stack>
  );
};

export default ExportButton;
