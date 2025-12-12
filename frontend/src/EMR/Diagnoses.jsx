import React from "react";
import { Box, Grid, TextField, MenuItem, Typography, IconButton, Button } from "@mui/material";
import { AddCircle, Delete } from "@mui/icons-material";

const mockStatuses = ["Active", "Inactive", "Resolved"];
const mockSeverities = ["Mild", "Moderate", "Severe"];

const DiagnosesTab = ({ data, setData }) => {

  const handleChange = (index, field, value) => {
    const updated = [...data];
    updated[index][field] = value;
    setData(updated);
  };

  const addDiagnosis = () => {
    setData([...data, { diagnosis: "", status: "", severity: "", notes: "", checkupDate: "" }]);
  };

  const removeDiagnosis = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Diagnoses
      </Typography>

      {data.map((item, index) => (
        <Grid
          container
          spacing={2}
          key={index}
          sx={{
            mb: 2,
            p: 2,
            border: "1px solid #ccc",
            borderRadius: 2,
            backgroundColor: "#fafafa",
            alignItems: "center",
          }}
        >
          
          <Grid item xs={12} sm={4}>
            <TextField
              label="Diagnosis"
              variant="outlined"
              fullWidth
              size="small"
              value={item.diagnosis}
              onChange={(e) => handleChange(index, "diagnosis", e.target.value)}
              placeholder="Enter diagnosis..."
            />
          </Grid>

         
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Status"
              variant="outlined"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true, style: { fontSize: 14, fontWeight: 600 } }}
              inputProps={{ style: { fontSize: 14 } }}
              value={item.status}
              onChange={(e) => handleChange(index, "status", e.target.value)}
            >
              {mockStatuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Severity */}
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Severity"
              variant="outlined"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true, style: { fontSize: 14, fontWeight: 600 } }}
              inputProps={{ style: { fontSize: 14 } }}
              value={item.severity}
              onChange={(e) => handleChange(index, "severity", e.target.value)}
            >
              {mockSeverities.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          
          <Grid item xs={12} sm={1} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <IconButton color="error" onClick={() => removeDiagnosis(index)}>
              <Delete />
            </IconButton>
          </Grid>

          
          <Grid item xs={12}>
            <TextField
              label="Notes"
              multiline
              rows={2}
              fullWidth
              value={item.notes}
              onChange={(e) => handleChange(index, "notes", e.target.value)}
              placeholder="Add any specific notes..."
            />
          </Grid>

          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Checkup Date & Time"
              type="datetime-local"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={item.checkupDate || ""}
              onChange={(e) => handleChange(index, "checkupDate", e.target.value)}
            />
          </Grid>

        </Grid>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" startIcon={<AddCircle />} onClick={addDiagnosis}>
          Add Another Diagnosis
        </Button>
      </Box>
    </Box>
  );
};

export default DiagnosesTab;