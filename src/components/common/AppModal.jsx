import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";

const AppModal = ({ open, title, onClose, onSave, children }) => {

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: "700px", 
          minHeight : "600px",
          p: 2,
        },
      }}>
        
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {children}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppModal;