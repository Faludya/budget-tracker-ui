import {
  Stack,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useState } from "react";
import dayjs from "dayjs";
import apiClient from "../../api/axiosConfig";

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
    <Stack direction="row" alignItems="center" spacing={0.35}>
  <Button
    onClick={handleClick}
    variant="outlined"
    endIcon={<ArrowDropDownIcon />}
    sx={{ textTransform: "none" }}
  >
    Export
  </Button>

  <Tooltip title="Only filtered transactions will be included in the export." arrow>
    <IconButton
      size="small"
      disableRipple
      sx={{
        ml: "-2px", // move slightly left if needed
        color: "text.secondary",
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "transparent",
          color: "primary.main",
        },
      }}
    >
      <InfoOutlinedIcon fontSize="medium" />
    </IconButton>
  </Tooltip>


      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          dense: true,
          sx: { minWidth: 160, p: 0.5 },
        }}
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 2,
            boxShadow: "0px 4px 16px rgba(0,0,0,0.12)",
          },
        }}
      >
        <MenuItem onClick={() => handleExport("pdf")}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="PDF" />
        </MenuItem>

        <MenuItem onClick={() => handleExport("excel")}>
          <ListItemIcon>
            <GridOnIcon fontSize="small" sx={{ color: "#1D6F42" }} />
          </ListItemIcon>
          <ListItemText primary="Excel" />
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default ExportButton;
