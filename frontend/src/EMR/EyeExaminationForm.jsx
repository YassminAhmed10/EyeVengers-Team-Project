import React from "react";
import { Box, TextField, Grid, Typography, MenuItem } from "@mui/material";

const pupilOptions = ["Brisk", "Sluggish", "Non-reactive", "Other"];
const alignmentOptions = ["Orthophoria", "Esotropia", "Exotropia", "Other"];
const movementsOptions = ["Normal", "Restricted", "Other"];

const EyeExaminationForm = ({ data, setData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Eye Examination Results
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="Right Eye"
            placeholder="e.g., 20/20"
            name="rightEye"
            value={data.rightEye}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="Left Eye"
            placeholder="e.g., 20/20"
            name="leftEye"
            value={data.leftEye}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Eye Pressure"
            placeholder="e.g., 15 mmHg"
            name="eyePressure"
            value={data.eyePressure}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            select
            label="Pupil Reaction"
            name="pupilReaction"
            value={data.pupilReaction}
            onChange={handleChange}
            InputProps={{ style: { minWidth: "100%" } }}
          >
            {pupilOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          {data.pupilReaction === "Other" && (
            <TextField
              fullWidth
              size="small"
              label="Specify Pupil Reaction"
              name="pupilReactionOther"
              value={data.pupilReactionOther || ""}
              onChange={handleChange}
              sx={{ mt: 1 }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            select
            label="Eye Alignment"
            name="eyeAlignment"
            value={data.eyeAlignment}
            onChange={handleChange}
            InputProps={{ style: { minWidth: "100%" } }}
          >
            {alignmentOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          {data.eyeAlignment === "Other" && (
            <TextField
              fullWidth
              size="small"
              label="Specify Alignment"
              name="eyeAlignmentOther"
              value={data.eyeAlignmentOther || ""}
              onChange={handleChange}
              sx={{ mt: 1 }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            select
            label="Eye Movements"
            name="eyeMovements"
            value={data.eyeMovements}
            onChange={handleChange}
            InputProps={{ style: { minWidth: "100%" } }}
          >
            {movementsOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          {data.eyeMovements === "Other" && (
            <TextField
              fullWidth
              size="small"
              label="Specify Eye Movements"
              name="eyeMovementsOther"
              value={data.eyeMovementsOther || ""}
              onChange={handleChange}
              sx={{ mt: 1 }}
            />
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          multiline
          rows={3}
          label="Anterior Segment Observation"
          placeholder="Enter observations..."
          name="anteriorSegment"
          value={data.anteriorSegment}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          size="small"
          multiline
          rows={3}
          label="Fundus/Retina Observation"
          placeholder="Enter observations..."
          name="fundusObservation"
          value={data.fundusObservation}
          onChange={handleChange}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          multiline
          rows={3}
          label="Other Notes"
          placeholder="Enter any other notes..."
          name="otherNotes"
          value={data.otherNotes}
          onChange={handleChange}
        />
      </Box>
    </Box>
  );
};

export default EyeExaminationForm;