import { Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

const ExportButton = ({ filters }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleExport = async (format) => {
    const query = new URLSearchParams({
      ...filters,
      format,
    }).toString();

    const response = await fetch(`/api/transactions/export?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_export.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    a.click();
    window.URL.revokeObjectURL(url);

    handleClose();
  };

  return (
    <>
      <Button onClick={handleClick} variant="outlined">Export ▼</Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>Export as Excel</MenuItem>
      </Menu>
    </>
  );
};
