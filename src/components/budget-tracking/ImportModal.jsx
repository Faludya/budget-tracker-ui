import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  TextField,
} from "@mui/material";

const importTemplates = ["Revolut", "Raiffeisen", "BCR"];

const ImportStart = ({ onContinue }) => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleContinue = () => {
    if (selectedTemplate && file) {
      onContinue({ template: selectedTemplate, file });
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        Start Import
      </Typography>

      <Stack spacing={3} maxWidth={400}>
        <FormControl fullWidth>
          <InputLabel>Template</InputLabel>
          <Select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            label="Template"
          >
            {importTemplates.map((template) => (
              <MenuItem key={template} value={template}>
                {template}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="file"
          inputProps={{ accept: ".csv,.xlsx" }}
          onChange={handleFileChange}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={!selectedTemplate || !file}
        >
          Continue
        </Button>
      </Stack>
    </Box>
  );
};

export default ImportStart;
