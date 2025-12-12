import React from "react";
import { Box, Typography, TextField } from "@mui/material";

const MedicalHistory = ({ data, setData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  return (
    <Box sx={{ p: 3, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Medical & Family History
      </Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="Previous Eye History"
          placeholder="Any previous eye problems"
          multiline
          rows={6}
          fullWidth
          name="previousEye"
          value={data.previousEye || ""}
          onChange={handleChange}
        />
        <TextField
          label="Family History"
          placeholder="Any family eye problems"
          multiline
          rows={6}
          fullWidth
          name="familyHistory"
          value={data.familyHistory || ""}
          onChange={handleChange}
        />
        <TextField
          label="Allergies / Medical Conditions"
          placeholder="Any allergies or medical conditions"
          multiline
          rows={6}
          fullWidth
          name="allergies"
          value={data.allergies || ""}
          onChange={handleChange}
        />
      </Box>
    </Box>
  );
};

export default MedicalHistory;