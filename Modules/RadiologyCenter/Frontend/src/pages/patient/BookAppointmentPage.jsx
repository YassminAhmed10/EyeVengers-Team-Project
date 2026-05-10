import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  LinearProgress,
} from "@mui/material";
import {
  LocalHospital,
  EventAvailable,
  AccessTime,
  Science,
  ArrowBack,
  PersonAdd,
  CheckCircle,
  Error as ErrorIcon,
  Info,
} from "@mui/icons-material";
import axios from "axios";

const CLINIC_API = "http://localhost:5201/api";
const RADIOLOGY_API = "http://localhost:5301/api";

const steps = [
  "Patient Information",
  "Select Service",
  "Choose Date & Time",
  "Confirm Booking",
];

const BookRadiologyAppointmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${CLINIC_API}/RadiologyIntegration/services`, { headers });
        setServices(data);
      } catch (e) {
        setError("Could not load radiology services. The Radiology Center may be offline.");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const fetchSlots = async () => {
    if (!selectedService || !date) return;
    setLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const code = selectedService.type?.[0]?.coding?.[0]?.code || selectedService.id;
      const { data } = await axios.get(
        `${CLINIC_API}/RadiologyIntegration/slots`,
        { params: { service: code, date }, headers }
      );
      setSlots(data);
    } catch (e) {
      setError("Could not load available slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedService && date) fetchSlots(); }, [selectedService, date]);

  const handleBook = async () => {
    if (!orderId || !selectedService || !selectedSlot) return;
    setBooking(true);
    try {
      const code = selectedService.type?.[0]?.coding?.[0]?.code;
      const display = selectedService.type?.[0]?.coding?.[0]?.display;
      const slotStart = new Date(selectedSlot.start);
      const time = slotStart.toTimeString().slice(0, 5);

      const { data } = await axios.post(
        `${CLINIC_API}/RadiologyIntegration/Book`,
        {
          orderId: parseInt(orderId, 10),
          appointmentDate: date,
          appointmentTime: time,
          serviceCode: code,
          serviceDisplay: display,
          priority: "routine"
        },
        { headers }
      );

      setSnackbar({
        open: true,
        message: `Appointment booked! Confirmation: ${data.confirmationId}`,
        severity: "success"
      });

      setTimeout(() => navigate("/patient/orders"), 2000);
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || "Booking failed";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setBooking(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2, color: "#1e3a5f" }}
        >
          Back
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <LocalHospital sx={{ fontSize: 40, color: "#1e3a5f" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e3a5f" }}>
              Book Radiology Appointment
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Complete the steps below to schedule your radiology appointment
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Patient Information */}
      {activeStep === 0 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Patient Information"
            icon={<PersonAdd />}
            sx={{ bgcolor: "#f5f7fa", borderBottom: "1px solid #ddd" }}
          />
          <CardContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={patientData.firstName}
                  onChange={(e) => handlePatientFieldChange("firstName", e.target.value)}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={patientData.lastName}
                  onChange={(e) => handlePatientFieldChange("lastName", e.target.value)}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={patientData.email}
                  onChange={(e) => handlePatientFieldChange("email", e.target.value)}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  value={patientData.phone}
                  onChange={(e) => handlePatientFieldChange("phone", e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={patientData.dateOfBirth}
                  onChange={(e) => handlePatientFieldChange("dateOfBirth", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={patientData.gender}
                    label="Gender"
                    onChange={(e) => handlePatientFieldChange("gender", e.target.value)}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="unknown">Unknown</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {orderId && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: "#f0f8ff", border: "1px solid #87ceeb" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      <Info sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }} />
                      Order Information
                    </Typography>
                    <Typography variant="body2">Order ID: {orderId}</Typography>
                    <Typography variant="body2">Priority: {orderData.priority}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Select Service */}
      {activeStep === 1 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Select Radiology Service"
            icon={<Science />}
            sx={{ bgcolor: "#f5f7fa", borderBottom: "1px solid #ddd" }}
          />
          <CardContent sx={{ pt: 3 }}>
            {services.length === 0 ? (
              <Alert severity="warning">No services available</Alert>
            ) : (
              <Grid container spacing={2}>
                {services.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                      <Card
                        variant="outlined"
                        onClick={() => handleServiceSelect(service)}
                        sx={{
                          cursor: "pointer",
                          height: "100%",
                          bgcolor: isSelected ? "#e8f0fe" : "white",
                          border: isSelected ? "2px solid #1e3a5f" : "1px solid #ddd",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: "#1e3a5f",
                            boxShadow: 2,
                          },
                        }}
                      >
                        <CardContent>
                          {isSelected && (
                            <Box sx={{ mb: 1 }}>
                              <CheckCircle sx={{ color: "#1e3a5f", fontSize: 20 }} />
                            </Box>
                          )}
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            {service.display || service.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Code: {service.code}
                          </Typography>
                          {service.modality && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                              Modality: {service.modality}
                            </Typography>
                          )}
                          {service.durationMin && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Duration: ~{service.durationMin} minutes
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Choose Date & Time */}
      {activeStep === 2 && selectedService && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Select Date"
              icon={<EventAvailable />}
              sx={{ bgcolor: "#f5f7fa", borderBottom: "1px solid #ddd" }}
            />
            <CardContent sx={{ pt: 3 }}>
              <TextField
                type="date"
                value={date}
                onChange={handleDateChange}
                inputProps={{ min: getMinDate() }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 300 }}
              />
              <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#666" }}>
                Select an available date for your appointment (at least 1 day in advance)
              </Typography>
            </CardContent>
          </Card>

          {date && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Select Time Slot"
                icon={<AccessTime />}
                sx={{ bgcolor: "#f5f7fa", borderBottom: "1px solid #ddd" }}
              />
              <CardContent sx={{ pt: 3 }}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : slots.length === 0 ? (
                  <Alert severity="info">
                    No available slots for {date}. Please choose a different date.
                  </Alert>
                ) : (
                  <Box>
                    <Grid container spacing={1}>
                      {slots.map((slot) => {
                        const start = new Date(slot.start);
                        const time = start.toTimeString().slice(0, 5);
                        const isSelected = selectedSlot?.id === slot.id;

                        return (
                          <Grid item key={slot.id}>
                            <Chip
                              label={time}
                              onClick={() => setSelectedSlot(slot)}
                              color={isSelected ? "primary" : "default"}
                              variant={isSelected ? "filled" : "outlined"}
                              sx={{
                                minWidth: 90,
                                fontSize: "0.95rem",
                                py: 2.5,
                                cursor: "pointer",
                                fontWeight: isSelected ? 600 : 400,
                              }}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Step 3: Confirm Booking */}
      {activeStep === 3 && (
        <Card sx={{ mb: 3, bgcolor: "#f0f8ff", border: "2px solid #87ceeb" }}>
          <CardHeader
            title="Booking Confirmation"
            icon={<CheckCircle sx={{ color: "#4caf50" }} />}
            sx={{ bgcolor: "#e8f5e9", borderBottom: "1px solid #81c784" }}
          />
          <CardContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              {/* Patient Summary */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Patient Details
                </Typography>
                <Paper sx={{ p: 2, bgcolor: "white", border: "1px solid #ddd" }}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {patientData.firstName} {patientData.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>ID:</strong> {patientData.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Email:</strong> {patientData.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {patientData.phone || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Divider sx={{ width: "100%" }} />

              {/* Service Summary */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Service Details
                </Typography>
                <Paper sx={{ p: 2, bgcolor: "white", border: "1px solid #ddd" }}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Service:</strong> {selectedService?.display || selectedService?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Code:</strong> {selectedService?.code}
                      </Typography>
                    </Grid>
                    {selectedService?.modality && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Modality:</strong> {selectedService.modality}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              <Divider sx={{ width: "100%" }} />

              {/* Appointment Summary */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Appointment Details
                </Typography>
                <Paper sx={{ p: 2, bgcolor: "white", border: "1px solid #ddd" }}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Date:</strong> {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Time:</strong> {new Date(selectedSlot?.start).toTimeString().slice(0, 5)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Priority:</strong> <Chip label={orderData.priority} size="small" variant="outlined" />
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={booking}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmBooking}
                disabled={booking}
                startIcon={booking ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                sx={{ bgcolor: "#1e3a5f" }}
              >
                {booking ? "Confirming..." : "Confirm & Book"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      {activeStep < 3 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading || booking}
            sx={{ bgcolor: "#1e3a5f" }}
          >
            {activeStep === steps.length - 2 ? "Review Booking" : "Next"}
          </Button>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to confirm this radiology appointment?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <strong>{patientData.firstName} {patientData.lastName}</strong> on{" "}
            <strong>{new Date(date).toLocaleDateString()}</strong> at{" "}
            <strong>{new Date(selectedSlot?.start).toTimeString().slice(0, 5)}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialog} disabled={booking}>
            Cancel
          </Button>
          <Button
            onClick={handleExecuteBooking}
            variant="contained"
            disabled={booking}
            sx={{ bgcolor: "#1e3a5f" }}
          >
            {booking ? "Processing..." : "Confirm Booking"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );

  // ===== Handler Functions =====
  function handlePatientFieldChange(field, value) {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }));
    localStorage.setItem(`patient${field.charAt(0).toUpperCase() + field.slice(1)}`, value);
  }

  function fetchSlots(service, selectedDate) {
    if (!service || !selectedDate) return;

    setLoading(true);
    try {
      const serviceCode = service.code || service.id;
      axios.get(`${CLINIC_API}/RadiologyIntegration/slots`, {
        params: { service: serviceCode, date: selectedDate },
        headers,
      }).then(({ data }) => {
        setSlots(data || []);
        setSelectedSlot(null);
        setError("");
      }).catch((e) => {
        const errorMsg = e.response?.data?.error || "Could not load available slots";
        setError(errorMsg);
        setSlots([]);
      }).finally(() => {
        setLoading(false);
      });
    } catch (e) {
      setLoading(false);
    }
  }

  function handleDateChange(e) {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    fetchSlots(selectedService, selectedDate);
  }

  function handleServiceSelect(service) {
    setSelectedService(service);
    setDate("");
    setSlots([]);
    setSelectedSlot(null);
  }

  function handleConfirmBooking() {
    setConfirmDialog({ open: true });
  }

  function handleCancelDialog() {
    setConfirmDialog({ open: false });
  }

  function handleExecuteBooking() {
    setConfirmDialog({ open: false });
    setBooking(true);

    try {
      if (!patientData.id || !patientData.firstName || !patientData.lastName || !selectedService || !date || !selectedSlot) {
        throw new Error("Please fill in all required fields");
      }

      const slotStart = new Date(selectedSlot.start);
      const appointmentTime = slotStart.toTimeString().slice(0, 5);

      const bookingPayload = {
        orderId: parseInt(patientData.id, 10),
        appointmentDate: date,
        appointmentTime: appointmentTime,
        serviceCode: selectedService.code || selectedService.id,
        serviceDisplay: selectedService.display || selectedService.name,
        priority: orderData.priority || "routine",
      };

      axios.post(`${CLINIC_API}/RadiologyIntegration/book`, bookingPayload, { headers })
        .then(({ data: bookingResult }) => {
          setSnackbar({
            open: true,
            message: `✓ Appointment booked successfully! Confirmation ID: ${bookingResult.confirmationId || bookingResult.appointmentId || "N/A"}`,
            severity: "success",
          });

          setActiveStep(3);
          setTimeout(() => {
            navigate("/patient/dashboard", { replace: true });
          }, 3000);
        })
        .catch((e) => {
          const errorMsg = e.response?.data?.error || e.response?.data?.message || e.message || "Failed to book appointment";
          setSnackbar({
            open: true,
            message: `✗ ${errorMsg}`,
            severity: "error",
          });
          setBooking(false);
        });
    } catch (e) {
      setSnackbar({
        open: true,
        message: `✗ ${e.message}`,
        severity: "error",
      });
      setBooking(false);
    }
  }

  function handleNext() {
    if (activeStep === 0) {
      if (!patientData.firstName || !patientData.lastName || !patientData.email) {
        setError("Please fill in patient name and email");
        return;
      }
      setError("");
    } else if (activeStep === 1) {
      if (!selectedService) {
        setError("Please select a service");
        return;
      }
      setError("");
    } else if (activeStep === 2) {
      if (!date || !selectedSlot) {
        setError("Please select a date and time slot");
        return;
      }
      setError("");
      setActiveStep(3);
      return;
    }

    setActiveStep((prev) => prev + 1);
  }

  function handleBack() {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  }

  function getMinDate() {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split("T")[0];
  }
};

export default BookRadiologyAppointmentPage;