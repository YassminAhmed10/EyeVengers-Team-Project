
import React, { useState } from "react";
import { Box, Typography, TextField, MenuItem, Tabs, Tab, Grid } from "@mui/material";

const Operations = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [operation, setOperation] = useState({
    name: "",
    date: "",
    eye: "",
    surgeon: "",
    diagnosis: "",
    preMedications: "",
    specialInstructions: "",
    postMedications: "",
    followUp: "",
    complications: "",
    status: "",
    anesthesia: "",
    duration: "",
  });

  const handleChangeField = (field, value) => {
    setOperation({ ...operation, [field]: value });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        🏥 Operation Details
      </Typography>

      
      <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
        <Tab label="Basic Info" />
        <Tab label="Pre-Op" />
        <Tab label="Post-Op" />
        <Tab label="Status & Surgery Info" />
      </Tabs>

      
      {activeTab === 0 && (
        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Operation Name"
                fullWidth
                sx={{ mb: 1 }}
                value={operation.name}
                onChange={(e) => handleChangeField("name", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 1 }}
                value={operation.date}
                onChange={(e) => handleChangeField("date", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Eye / Side"
                fullWidth
                value={operation.eye}
                onChange={(e) => handleChangeField("eye", e.target.value)}
              >
                <MenuItem value="Right">Right</MenuItem>
                <MenuItem value="Left">Left</MenuItem>
                <MenuItem value="Both">Both</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
          <TextField
            label="Diagnosis / Reason"
            fullWidth
            sx={{ mb: 1 }}
            value={operation.diagnosis}
            onChange={(e) => handleChangeField("diagnosis", e.target.value)}
          />
          <TextField
            label="Pre-Op Medications"
            fullWidth
            sx={{ mb: 1 }}
            value={operation.preMedications}
            onChange={(e) => handleChangeField("preMedications", e.target.value)}
          />
          <TextField
            label="Special Instructions"
            fullWidth
            value={operation.specialInstructions}
            onChange={(e) => handleChangeField("specialInstructions", e.target.value)}
          />
        </Box>
      )}

      {activeTab === 2 && (
        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
          <TextField
            label="Post-Op Medications"
            fullWidth
            sx={{ mb: 1 }}
            value={operation.postMedications}
            onChange={(e) => handleChangeField("postMedications", e.target.value)}
          />
          <TextField
            label="Follow-up Schedule"
            fullWidth
            sx={{ mb: 1 }}
            value={operation.followUp}
            onChange={(e) => handleChangeField("followUp", e.target.value)}
          />
          <TextField
            label="Complications"
            fullWidth
            value={operation.complications}
            onChange={(e) => handleChangeField("complications", e.target.value)}
          />
        </Box>
      )}

      {activeTab === 3 && (
        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
          <TextField
            select
            label="Status"
            fullWidth
            sx={{ mb: 1 }}
            value={operation.status}
            onChange={(e) => handleChangeField("status", e.target.value)}
          >
            <MenuItem value="Planned">Planned</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
          <TextField
            select
            label="Anesthesia Type"
            fullWidth
            sx={{ mb: 1 }}
            value={operation.anesthesia}
            onChange={(e) => handleChangeField("anesthesia", e.target.value)}
          >
            <MenuItem value="Local">Local</MenuItem>
            <MenuItem value="General">General</MenuItem>
            <MenuItem value="Sedation">Sedation</MenuItem>
          </TextField>
          <TextField
            label="Duration"
            fullWidth
            placeholder="e.g., 1 hour"
            value={operation.duration}
            onChange={(e) => handleChangeField("duration", e.target.value)}
          />
        </Box>
      )}
    </Box>
  );
};

export default Operations;