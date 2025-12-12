import React from "react";
import { Box, TextField, Typography } from "@mui/material";

const PatientComplaint = ({ data, setData }) => {
  const handleChange = (e) => {
    setData({ ...data, complaint: e.target.value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
         Patient Complaint
      </Typography>

      <TextField
        label="Enter patient's main complaint"
        multiline
        rows={4}
        fullWidth
        value={data.complaint || ""}
        onChange={handleChange}
      />
    </Box>
  );
};

export default PatientComplaint;