import React from "react";
import { Button } from "@mui/material";

const ClearButton = ({ onClear, label = "Clear Tab" }) => {
  const handleClick = () => {
    if (window.confirm("Are you sure you want to clear all data in this tab?")) {
      onClear();
    }
  };

  return (
    <Button variant="outlined" color="error" onClick={handleClick}>
      {label}
    </Button>
  );
};

export default ClearButton;