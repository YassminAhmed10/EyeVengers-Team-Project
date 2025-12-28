// API Configuration
export const API_BASE_URL = 'http://localhost:5201/api';

export const endpoints = {
  appointments: {
    list: `${API_BASE_URL}/Appointments`,
    detail: (id) => `${API_BASE_URL}/Appointments/${id}`,
    byPatient: (patientId) => `${API_BASE_URL}/Appointments/ByPatient/${patientId}`,
    create: `${API_BASE_URL}/Appointments`,
    update: (id) => `${API_BASE_URL}/Appointments/${id}`,
    patch: (id) => `${API_BASE_URL}/Appointments/${id}`,
  },
  doctors: {
    list: `${API_BASE_URL}/Doctors`,
    detail: (id) => `${API_BASE_URL}/Doctors/${id}`,
  }
};

// Generic fetch function with error handling
export const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Specific API functions
export const appointmentsAPI = {
  // Get all appointments
  getAll: () => fetchData(endpoints.appointments.list),

  // Get appointment by ID
  getById: (id) => fetchData(endpoints.appointments.detail(id)),

  // Get appointments by patient ID
  getByPatient: (patientId) => fetchData(endpoints.appointments.byPatient(patientId)),

  // Create new appointment
  create: (appointmentData) => fetchData(endpoints.appointments.create, {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  }),

  // Update appointment status or surgery flag
  patch: (id, updateData) => fetchData(endpoints.appointments.patch(id), {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  }),

  // Update full appointment
  update: (id, appointmentData) => fetchData(endpoints.appointments.update(id), {
    method: 'PUT',
    body: JSON.stringify(appointmentData)
  })
};

export const doctorsAPI = {
  // Get all doctors
  getAll: () => fetchData(endpoints.doctors.list),

  // Get doctor by ID
  getById: (id) => fetchData(endpoints.doctors.detail(id))
};
