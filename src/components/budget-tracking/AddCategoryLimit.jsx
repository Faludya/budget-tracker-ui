import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Typography,
    Stack,
    IconButton,
    Button,
    Menu,
    MenuItem,
} from "@mui/material";
import AppSelect from "../common/AppSelect";
import AppInput from "../common/AppInput";
import apiClient from "../../api/axiosConfig";
import { Delete, Edit, MoreVert } from "@mui/icons-material";
import CategoryIcon from "@mui/icons-material/Category";

const AddCategoryLimit = ({ userId, month, manualLimits, onBudgetUpdate, selectedTemplate }) => {
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const [limit, setLimit] = useState("");
    const [group, setGroup] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const response = await apiClient.get("/categories", { headers: { userId } });
                setCategories(response.data);
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };

        fetchCategories();
    }, []);

    const templateGroups = useMemo(() => selectedTemplate?.items?.map(i => i.categoryType) || [], [selectedTemplate]);

    const groupedLimits = useMemo(() => {
        const groups = {};
        for (const group of templateGroups) {
            groups[group] = [];
        }

        for (const item of manualLimits) {
            const key = item.categoryType;
            if (key && groups.hasOwnProperty(key)) {
                groups[key].push(item);
            }
        }

        return groups;
    }, [manualLimits, templateGroups]);

    const handleSave = async () => {
        if (!categoryId || !limit) return;

        try {
            await apiClient.post("/userbudgets/category-limit", {
                userId,
                month: month.getMonth() + 1,
                year: month.getFullYear(),
                categoryId,
                limit: parseFloat(limit),
                parentCategoryType: group?.value || group,
            });

            const refreshed = await apiClient.get(`/userbudgets/${userId}/${month.getMonth() + 1}/${month.getFullYear()}`);
            onBudgetUpdate(refreshed.data);

            setCategoryId(null);
            setLimit("");
            setGroup(null);
        } catch (err) {
            console.error("Failed to save category limit", err);
        }
    };

    const handleDelete = async (itemId) => {
        try {
            await apiClient.delete(`/userbudgets/category-limit/${itemId}`);
            const refreshed = await apiClient.get(`/userbudgets/${userId}/${month.getMonth() + 1}/${month.getFullYear()}`);
            onBudgetUpdate(refreshed.data);
        } catch (err) {
            console.error("Failed to delete limit", err);
        }
    };

    const handleMenuClick = (event, itemId) => {
        setAnchorEl(event.currentTarget);
        setSelectedItemId(itemId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItemId(null);
    };

    return (
        <Box>
            <Typography variant="h6" mt={4} mb={2}>
                Add Monthly Limit for a Category
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" mb={3}>
                <Box flex={1}>
                    <AppSelect
                        label="Category"
                        value={categories.find(c => c.id === categoryId) || null}
                        onChange={(val) => setCategoryId(val?.id || null)}
                        options={categories}
                        getOptionLabel={(opt) => opt.name}
                        getOptionValue={(opt) => opt.id}
                    />
                </Box>

                <Box width={160}>
                    <AppInput
                        label="Limit"
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                    />
                </Box>

                <Box flex={1}>
                    <AppSelect
                        label="Budget Group"
                        value={group || null}
                        onChange={val => setGroup(val)}
                        options={templateGroups.map(g => ({ label: g, value: g }))}
                        getOptionLabel={opt => opt.label}
                        getOptionValue={opt => opt.value}
                    />
                </Box>

                <Box alignSelf={{ xs: "stretch", md: "flex-end" }}>
                    <Button variant="contained" onClick={handleSave} sx={{ height: "40px", textTransform: "none" }}>
                        Save
                    </Button>
                </Box>
            </Stack>

            <Box display="flex" flexWrap="wrap" gap={2}>
                {Object.entries(groupedLimits).map(([group, items]) => {
                    const total = items.reduce((sum, i) => sum + i.limit, 0);
                    return (
                        <Box
                            key={group}
                            sx={{ flex: "1 1 300px", borderRadius: 2, p: 2, bgcolor: "#f8f9fc", boxShadow: 1 }}
                        >
                            <Typography fontWeight="bold" fontSize="1.05rem" mb={1}>
                                {group} — {total.toFixed(2)} LEI
                            </Typography>
                            <ul style={{ marginTop: 0, paddingLeft: 20, color: "#444" }}>
                                {items
                                    .filter((item) => item.category && item.category.name)
                                    .map((item, i) => (
                                        <li key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <span>
                                                <CategoryIcon fontSize="small" sx={{ mr: 1 }} />
                                                {item.category.name}: {item.limit.toFixed(2)} LEI
                                            </span>
                                            <IconButton size="small" onClick={(e) => handleMenuClick(e, item.id)} sx={{ p: 0.5 }}>
                                                <MoreVert fontSize="small" />
                                            </IconButton>
                                        </li>
                                    ))}

                            </ul>
                        </Box>
                    );
                })}
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => {
                    console.log("Edit", selectedItemId);
                    handleMenuClose();
                }}>
                    <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={() => {
                    handleDelete(selectedItemId);
                    handleMenuClose();
                }}>
                    <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default AddCategoryLimit;
