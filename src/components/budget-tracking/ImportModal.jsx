import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { styled } from "@mui/system";
import AppSelect from "../common/AppSelect"; // adjust path as needed

const importTemplates = [
  { id: "Revolut", name: "Revolut" },
  { id: "Raiffeisen", name: "Raiffeisen" },
  { id: "BCR", name: "BCR" },
];

const DropArea = styled("div")(({ theme, isDragging }) => ({
  border: "2px dashed #aaa",
  padding: "32px",
  borderRadius: "12px",
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: isDragging ? "#f0f4ff" : "#fafafa",
  transition: "background-color 0.3s ease, border 0.3s ease",
  borderColor: isDragging ? theme.palette.primary.main : "#aaa",
}));

const ImportModal = ({ open, onClose, onContinue }) => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  
  };
  const handleContinue = async () => {
    if (selectedTemplate && file) {
      setLoading(true);
      try {
        await onContinue({ template: selectedTemplate, file });
        setFile(null);
        setSelectedTemplate("");
      } catch (error) {
        console.error("Import failed:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const currentTemplate = importTemplates.find((t) => t.id === selectedTemplate) || "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Import Transactions
        <Tooltip title="Upload a bank export to import multiple transactions." arrow>
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <AppSelect
            label="Template"
            value={currentTemplate}
            onChange={(val) => setSelectedTemplate(val?.id)}
            options={importTemplates}
            getOptionLabel={(opt) => opt.name}
            getOptionValue={(opt) => opt.id}
          />

          <Box
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <DropArea isDragging={isDragging}>
              <Typography>
                {file ? `Selected file: ${file.name}` : "Drag & drop or click to select a file"}
              </Typography>
              <input
                id="fileInput"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </DropArea>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {loading ? (
          <CircularProgress size={24} sx={{ marginLeft: 2 }} />
        ) : (
          <Tooltip
            title={!selectedTemplate || !file
              ? "Please select a template and upload a file to continue."
              : ""}
            arrow
          >
            <span>
              <Button
                variant="contained"
                onClick={handleContinue}
                disabled={!selectedTemplate || !file}
                sx={{
                  color: !selectedTemplate || !file ? "#666" : "#fff",
                }}
              >
                Continue
              </Button>
            </span>
          </Tooltip>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;
