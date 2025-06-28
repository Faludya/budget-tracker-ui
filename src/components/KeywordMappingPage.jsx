import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Stack,
} from "@mui/material";
import { Save, Delete, FolderOpen, Add } from "@mui/icons-material";
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

    const payload = { keyword, categoryId };
    const headers = { headers: { userId: localStorage.getItem("userId") } };

    try {
      if (!id) {
        const res = await apiClient.post("/categorykeywordmapping", payload, headers);
        const updated = [...mappings];
        updated[index].id = res.data?.id || Date.now();
        setMappings(updated);
      } else {
        await apiClient.put("/categorykeywordmapping", { id, ...payload }, headers);
      }
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

  const handleAddNew = () => {
    setMappings((prev) => [
      { id: null, keyword: "", categoryId: "", createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const getFieldError = (value) =>
    !value || (typeof value === "string" && value.trim() === "");

  return (
    <Box p={3}>
      <style>
        {`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        `}
      </style>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Manage Category Keyword Mappings</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddNew}>
          Add Mapping
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent>
            {mappings.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No mappings found.
              </Typography>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Keyword</TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 300 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 100, maxWidth: 120 }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mappings.map((map, index) => (
                      <TableRow key={map.id || `new-${index}`}>
                        <TableCell>
                          <TextField
                            fullWidth
                            value={map.keyword}
                            onChange={(e) => handleChange(index, "keyword", e.target.value)}
                            size="small"
                            placeholder="Enter keyword"
                            sx={(theme) => {
                              return getFieldError(map.keyword)
                                ? {
                                  border: `1px solid ${theme.palette.primary.main}`,
                                  borderRadius: 1,
                                }
                                : {};
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box minWidth={300}>
                            <CategorySelect
                              options={categories}
                              value={categories.find((c) => c.id === map.categoryId) || null}
                              onChange={(val) => handleChange(index, "categoryId", val?.id ?? "")}
                              icon={<FolderOpen fontSize="small" />}
                              placeholder="Select category"
                              sx={(theme) => {
                                return getFieldError(map.categoryId)
                                  ? {
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    borderRadius: 1,
                                  }
                                  : {};
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {new Date(map.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Save">
                              <IconButton
                                onClick={() => handleSave(index)}
                                disabled={savingIndex === index}
                                sx={
                                  !map.id
                                    ? { color: "primary.main", animation: "pulse 1.5s infinite" }
                                    : {}
                                }
                              >
                                <Save />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <span> {/* wrapping in span to allow disabled tooltip */}
                                <IconButton
                                  color="error"
                                  onClick={() => setDeleteIndex(index)}
                                  disabled={!map.id}
                                >
                                  <Delete />
                                </IconButton>
                              </span>
                            </Tooltip>

                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                      </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteIndex !== null} onClose={() => setDeleteIndex(null)}>
        <DialogTitle>Delete this mapping?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteIndex(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Mapping saved successfully!
        </Alert>
      </Snackbar>

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
