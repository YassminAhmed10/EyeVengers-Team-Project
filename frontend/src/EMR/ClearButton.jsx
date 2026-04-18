// ClearButton.jsx
import React from "react";
import { Button } from "@mui/material";
import { DeleteSweep } from "@mui/icons-material";

const ClearButton = ({ onClear, label = "Clear Tab" }) => {
  const handleClick = () => {
    if (window.confirm("Are you sure you want to clear all data in this tab?")) {
      onClear();
    }
  };

  return (
    <Button
      variant="outlined"
      color="error"
      startIcon={<DeleteSweep />}
      onClick={handleClick}
      sx={{
        borderColor: "#d32f2f",
        color: "#d32f2f",
        "&:hover": {
          backgroundColor: "#ffebee",
          borderColor: "#d32f2f",
        },
        textTransform: "none",
        fontWeight: 500,
      }}
    >
      {label}
    </Button>
  );
};

export default ClearButton;