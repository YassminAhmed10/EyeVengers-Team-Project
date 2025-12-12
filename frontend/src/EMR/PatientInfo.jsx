import React from "react";
import { Box, TextField, Grid, Typography } from "@mui/material";

const PatientInfo = ({ patient, readOnly }) => {
  return (
            <Box
              className="patient-info-section"
              sx={{
                p: 2,
                border: "2px solid #cae8ff",
                borderRadius: "12px",
                maxWidth: 1500,
                background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)",
              }}
            >
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: "#1e3a5f", fontSize: "1.1rem" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "1.25rem", verticalAlign: "middle", marginRight: "8px" }}>
          person
        </span>
        Patient Information
      </Typography>
      <Grid container spacing={1}>

        <Grid item xs={12} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Patient ID"
            variant="outlined"
            sx={{ maxWidth: 200 }}
            value={patient?.patientID || ""}
            InputProps={{ readOnly }}
          />
        </Grid>

        <Grid item xs={12} sm= {4} md={3}>
          <TextField 
            fullWidth
            size="small"
            label="Patient Name"
            variant="outlined"
            sx={{ maxWidth: 200 }}
            value={patient?.name || ""}
            InputProps={{ readOnly }}
          />
        </Grid>
        <Grid item xs={12} sm= {2} md={1.5}>
          <TextField
            fullWidth
            size="small"
            label="Age"
            type="number"
            variant="outlined"
            sx={{ maxWidth: 200 }}
            value={patient?.age || ""}
            InputProps={{ readOnly }}
          />
        </Grid>
        <Grid item xs={12} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Gender"
            variant="outlined"
            sx={{ maxWidth: 200 }}
            value={patient?.gender || ""}
            InputProps={{ readOnly }}
          />
        </Grid>
          <Grid item xs={12} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Visit Date"
            type="date"
            variant="outlined"
            sx={{ maxWidth: 200 }}
            value={patient?.visitDate || ""}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly }}
            
          />
        </Grid>

          

          <Grid item xs={12} sm={4} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Contact Number"
            variant="outlined"
            sx={{ maxWidth: 200 }}
            value={patient?.contactNumber || ""}
            InputProps={{ readOnly }}
          />
        </Grid>
        <Grid item xs={12} sm={5} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Insurance Company"
            variant="outlined"
            sx={{ maxWidth: 200 }}
            value={patient?.insuranceCompany || ""}
            InputProps={{ readOnly }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientInfo;