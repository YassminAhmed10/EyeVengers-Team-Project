/**
 * Radiology Integration API Service
 * Handles all communication between Clinic Frontend and Radiology Center
 * Integrates with FHIR/HL7 data mapping
 */

import axios from "axios";

const CLINIC_API_BASE = "http://localhost:5201/api";
const RADIOLOGY_API_BASE = "http://localhost:5301/api";

class RadiologyIntegrationService {
  constructor() {
    this.clinicClient = axios.create({
      baseURL: CLINIC_API_BASE,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.radiologyClient = axios.create({
      baseURL: RADIOLOGY_API_BASE,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Add auth token to requests
    this.clinicClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.radiologyClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle errors consistently
    [this.clinicClient, this.radiologyClient].forEach((client) => {
      client.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      );
    });
  }

  /**
   * Fetch all available radiology services
   * @returns {Promise<Array>} List of available services
   */
  async getRadiologyServices() {
    try {
      const response = await this.clinicClient.get("/RadiologyIntegration/services");
      return response.data;
    } catch (error) {
      console.error("Error fetching radiology services:", error);
      throw this.handleError(error, "Failed to fetch radiology services");
    }
  }

  /**
   * Get available appointment slots for a service on a specific date
   * @param {string} serviceCode - The service code
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} List of available slots
   */
  async getAvailableSlots(serviceCode, date) {
    try {
      const response = await this.clinicClient.get("/RadiologyIntegration/slots", {
        params: {
          service: serviceCode,
          date: date,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching available slots:", error);
      throw this.handleError(error, "Failed to fetch available slots");
    }
  }

  /**
   * Book a radiology appointment
   * @param {Object} bookingData - Booking details
   * @param {number} bookingData.orderId - Patient/Order ID
   * @param {string} bookingData.appointmentDate - Date in YYYY-MM-DD format
   * @param {string} bookingData.appointmentTime - Time in HH:MM format
   * @param {string} bookingData.serviceCode - Service code
   * @param {string} bookingData.serviceDisplay - Service display name
   * @param {string} bookingData.priority - Priority (routine, urgent, etc.)
   * @returns {Promise<Object>} Booking confirmation
   */
  async bookAppointment(bookingData) {
    try {
      if (!bookingData.orderId || !bookingData.appointmentDate || !bookingData.appointmentTime) {
        throw new Error("Missing required booking fields");
      }

      const response = await this.clinicClient.post("/RadiologyIntegration/book", bookingData);
      return response.data;
    } catch (error) {
      console.error("Error booking appointment:", error);
      throw this.handleError(error, "Failed to book appointment");
    }
  }

  /**
   * Get appointment status
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise<Object>} Appointment details
   */
  async getAppointmentStatus(appointmentId) {
    try {
      const response = await this.clinicClient.get(`/RadiologyIntegration/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment status:", error);
      throw this.handleError(error, "Failed to fetch appointment status");
    }
  }

  /**
   * Cancel an appointment
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise<Object>} Cancellation confirmation
   */
  async cancelAppointment(appointmentId) {
    try {
      const response = await this.clinicClient.post(
        `/RadiologyIntegration/appointments/${appointmentId}/cancel`
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw this.handleError(error, "Failed to cancel appointment");
    }
  }

  /**
   * Get FHIR-compliant patient data for radiology booking
   * @param {Object} patientData - Patient information
   * @returns {Object} FHIR-formatted patient
   */
  createFhirPatient(patientData) {
    return {
      resourceType: "Patient",
      identifier: [
        {
          system: "http://eyeclinic.example.com/patient",
          value: patientData.id?.toString() || "",
        },
      ],
      name: [
        {
          given: [patientData.firstName || ""],
          family: patientData.lastName || "",
        },
      ],
      telecom: [
        ...(patientData.email
          ? [
              {
                system: "email",
                value: patientData.email,
              },
            ]
          : []),
        ...(patientData.phone
          ? [
              {
                system: "phone",
                value: patientData.phone,
              },
            ]
          : []),
      ],
      birthDate: patientData.dateOfBirth || undefined,
      gender: patientData.gender?.toLowerCase() || "unknown",
      address: patientData.address
        ? [
            {
              text: patientData.address,
            },
          ]
        : undefined,
    };
  }

  /**
   * Create FHIR ServiceRequest for radiology order
   * @param {Object} orderData - Order information
   * @returns {Object} FHIR-formatted ServiceRequest
   */
  createFhirServiceRequest(orderData) {
    const now = new Date().toISOString();

    return {
      resourceType: "ServiceRequest",
      identifier: [
        {
          system: "http://eyeclinic.example.com/order",
          value: orderData.orderId?.toString() || `ORD-${Date.now()}`,
        },
      ],
      status: "active",
      intent: "order",
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: orderData.serviceCode || "imaging-order",
            display: orderData.serviceDisplay || "Radiology Imaging",
          },
        ],
        text: orderData.serviceDisplay || "Radiology Imaging",
      },
      subject: {
        reference: `Patient/${orderData.patientId}`,
      },
      priority: this.mapPriority(orderData.priority || "routine"),
      orderedOn: now,
      requester: {
        reference: `Practitioner/${orderData.requestingPractitioner || ""}`,
      },
      reasonCode: orderData.clinicalIndication
        ? [
            {
              text: orderData.clinicalIndication,
            },
          ]
        : undefined,
    };
  }

  /**
   * Create FHIR Appointment resource
   * @param {Object} appointmentData - Appointment details
   * @returns {Object} FHIR-formatted Appointment
   */
  createFhirAppointment(appointmentData) {
    const [year, month, day] = appointmentData.date.split("-");
    const [hour, minute] = appointmentData.time.split(":");

    const startDateTime = new Date(year, parseInt(month) - 1, day, hour, minute).toISOString();
    const endDateTime = new Date(
      year,
      parseInt(month) - 1,
      day,
      hour,
      parseInt(minute) + 30
    ).toISOString();

    return {
      resourceType: "Appointment",
      status: "booked",
      serviceType: [
        {
          coding: [
            {
              system: "http://loinc.org",
              code: appointmentData.serviceCode,
              display: appointmentData.serviceDisplay,
            },
          ],
        },
      ],
      start: startDateTime,
      end: endDateTime,
      slot: [
        {
          reference: `Slot/${appointmentData.slotId}`,
        },
      ],
      participant: [
        {
          actor: {
            reference: `Patient/${appointmentData.patientId}`,
          },
          required: "required",
          status: "accepted",
        },
      ],
      comment: appointmentData.notes,
    };
  }

  /**
   * Map priority string to FHIR priority
   * @param {string} priority - Priority string
   * @returns {string} FHIR priority
   */
  mapPriority(priority) {
    const priorityMap = {
      routine: "routine",
      urgent: "urgent",
      asap: "asap",
      stat: "stat",
    };
    return priorityMap[priority?.toLowerCase()] || "routine";
  }

  /**
   * Standardized error handling
   * @param {Error} error - Error object
   * @param {string} message - Custom message
   * @returns {Error} Processed error
   */
  handleError(error, message) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      message ||
      "An error occurred";

    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.data = error.response?.data;

    return customError;
  }
}

export default new RadiologyIntegrationService();
