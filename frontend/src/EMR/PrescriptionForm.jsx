import React from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Button,
  IconButton,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { Delete, AddCircle } from "@mui/icons-material";

const mockDrugs = [
  { label: "Panadol", form: "Tablet" },
  { label: "Cataflam", form: "Tablet" },
  { label: "Augmentin", form: "Syrup" },
  { label: "Tobradex", form: "Drop" },
  { label: "Brufen", form: "Tablet" },
  { label: "Otrivin", form: "Drop" },
];

const drugForms = ["Tablet", "Drop", "Syrup", "Cream", "Injection"];
const doseOptions = ["1", "2", "3", "5", "10", "15", "20", "Other"];
const frequencies = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Every 8 hours",
  "Before sleep",
  "As needed",
  "Other",
];

const PrescriptionForm = ({ data, setData }) => {
  const handleChange = (index, field, value) => {
    const updated = [...data];
    updated[index][field] = value;
    setData(updated);
  };

  const addPrescription = () => {
    setData([
      ...data,
      {
        drug: "",
        form: "",
        dose: "",
        customDose: "",
        frequency: "",
        customFrequency: "",
        notes: "",
      },
    ]);
  };

  const removePrescription = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ mt: 3, width: "100%" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Prescription Details
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
            alignItems: "center",
            backgroundColor: "#fff",
          }}
        >
          
          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              options={mockDrugs}
              getOptionLabel={(option) => option.label || ""}
              onChange={(e, value) =>
                handleChange(index, "drug", value?.label || "")
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Drug Name"
                  placeholder="Search or type drug..."
                  variant="outlined"
                  fullWidth
                  value={item.drug}
                  onChange={(e) => handleChange(index, "drug", e.target.value)}
                  sx={{ "& .MuiInputBase-root": { minWidth: "400px" } }}
                />
              )}
            />
          </Grid>

          
          <Grid item xs={12} sm={2}>
            <TextField
              select
              label="Form"
              variant="outlined"
              fullWidth
              value={item.form}
              onChange={(e) => handleChange(index, "form", e.target.value)}
              InputLabelProps={{
                shrink: true, 
              }}
            >
              {drugForms.map((form) => (
                <MenuItem key={form} value={form}>
                  {form}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          
          <Grid item xs={12} sm={2}>
            <TextField
              select
              label="Dose"
              variant="outlined"
              fullWidth
              value={item.dose}
              onChange={(e) => handleChange(index, "dose", e.target.value)}
              InputLabelProps={{
                shrink: true, 
              }}
            >
              {doseOptions.map((dose) => (
                <MenuItem key={dose} value={dose}>
                  {dose}
                </MenuItem>
              ))}
            </TextField>

            {item.dose === "Other" && (
              <TextField
                label="Custom Dose"
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                value={item.customDose}
                onChange={(e) =>
                  handleChange(index, "customDose", e.target.value)
                }
                placeholder="Enter custom dose (e.g., 2.5 tablet, 7 ml)"
              />
            )}
          </Grid>

          
          <Grid item xs={12} sm={2}>
            <TextField
              select
              label="Frequency"
              variant="outlined"
              fullWidth
              value={item.frequency}
              onChange={(e) => handleChange(index, "frequency", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            >
              {frequencies.map((freq) => (
                <MenuItem key={freq} value={freq}>
                  {freq}
                </MenuItem>
              ))}
            </TextField>

            {item.frequency === "Other" && (
              <TextField
                label="Custom Frequency"
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                value={item.customFrequency}
                onChange={(e) =>
                  handleChange(index, "customFrequency", e.target.value)
                }
                placeholder="Enter custom frequency..."
              />
            )}
          </Grid>

         
          <Grid
            item
            xs={12}
            sm={1}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IconButton color="error" onClick={() => removePrescription(index)}>
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
        </Grid>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddCircle />}
          onClick={addPrescription}
        >
          Add Another Drug
        </Button>
      </Box>
    </Box>
  );
};

export default PrescriptionForm;