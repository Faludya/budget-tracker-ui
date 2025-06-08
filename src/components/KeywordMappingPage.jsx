import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Save, Delete, FolderOpen } from "@mui/icons-material";
import apiClient from "../api/axiosConfig";
import CategorySelect from "../components/common/CategorySelect";

const KeywordMappingPage = () => {
  const [mappings, setMappings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteSnackbarOpen, setDeleteSnackbarOpen] = useState(false);

  // Fetch mappings + categories like ImportReview
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const [mappingRes, categoryRes] = await Promise.all([
          apiClient.get("/categorykeywordmapping", { headers: { userId } }),
          apiClient.get("/categories", { headers: { userId } }),
        ]);
        setMappings(mappingRes.data);
        setCategories(categoryRes.data);
      } catch (err) {
        console.error("Error loading mappings or categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...mappings];
    updated[index][field] = value;
    setMappings(updated);
  };

  const handleSave = async (index) => {
    const { id, keyword, categoryId } = mappings[index];
    setSavingIndex(index);
    try {
      await apiClient.put(
        "/categorykeywordmapping",
        { id, keyword, categoryId },
        { headers: { userId: localStorage.getItem("userId") } }
      );
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error saving mapping:", err);
    } finally {
      setSavingIndex(null);
    }
  };

  const handleDelete = async () => {
    const { id } = mappings[deleteIndex];
    try {
      await apiClient.delete(`/categorykeywordmapping/${id}`, {
        headers: { userId: localStorage.getItem("userId") },
      });
      const updated = [...mappings];
      updated.splice(deleteIndex, 1);
      setMappings(updated);
      setDeleteSnackbarOpen(true);
    } catch (err) {
      console.error("Error deleting mapping:", err);
    } finally {
      setDeleteIndex(null);
    }
  };

  const getFieldError = (value) =>
    !value || (typeof value === "string" && value.trim() === "");

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        Manage Category Keyword Mappings
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : mappings.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No mappings found.
        </Typography>
      ) : (
        <Paper sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 200 }}>Keyword</TableCell>
                <TableCell sx={{ minWidth: 240 }}>Category</TableCell>
                <TableCell sx={{ minWidth: 160 }}>Created</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {mappings.map((map, index) => (
                <TableRow key={map.id}>
                  <TableCell>
                    <TextField
                      fullWidth
                      value={map.keyword}
                      onChange={(e) => handleChange(index, "keyword", e.target.value)}
                      size="small"
                      sx={getFieldError(map.keyword) ? { border: "1px solid red", borderRadius: 1 } : {}}
                    />
                  </TableCell>
                  <TableCell>
                    <CategorySelect
                      options={categories}
                      value={categories.find((c) => c.id === map.categoryId) || null}
                      onChange={(val) => handleChange(index, "categoryId", val?.id ?? "")}
                      icon={<FolderOpen fontSize="small" />}
                      placeholder="Search categories..."
                      sx={getFieldError(map.categoryId) ? { border: "1px solid red", borderRadius: 1 } : {}}
                    />
                  </TableCell>
                  <TableCell>{new Date(map.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Save">
                      <IconButton onClick={() => handleSave(index)} disabled={savingIndex === index}>
                        <Save />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => setDeleteIndex(index)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Confirm delete dialog */}
      <Dialog
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        PaperProps={{ sx: { maxWidth: 300 } }}
      >
        <DialogTitle>Delete this mapping?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteIndex(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Mapping updated successfully!
        </Alert>
      </Snackbar>

      {/* Delete snackbar */}
      <Snackbar
        open={deleteSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setDeleteSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setDeleteSnackbarOpen(false)} severity="info">
          Mapping deleted.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KeywordMappingPage;
