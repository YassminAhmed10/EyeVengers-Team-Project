// src/services/radiologyResultService.js
const STORAGE_KEYS = {
  RESULTS: 'radiologyResults'
};

export const radiologyResultService = {
  // Get results by appointment
  getResultsByAppointment: async (appointmentId) => {
    try {
      const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
      const filtered = results.filter(r => r.appointmentId === appointmentId);
      return { success: true, data: filtered };
    } catch (error) {
      console.error('Error fetching results:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Create new result
  createResult: async (appointmentId, reportTitle, reportText, findings, conclusion) => {
    try {
      const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
      const newResult = {
        id: Date.now(),
        appointmentId,
        reportTitle,
        reportText,
        findings,
        conclusion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      results.push(newResult);
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
      
      return { success: true, data: newResult };
    } catch (error) {
      console.error('Error creating result:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload image (simulated - stores as data URL)
  uploadImage: async (resultId, file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
          const resultIndex = results.findIndex(r => r.id === resultId);
          
          if (resultIndex !== -1) {
            results[resultIndex].imageUrl = reader.result;
            results[resultIndex].imageFileName = file.name;
            results[resultIndex].imageFileSize = file.size;
            localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
          }
          
          resolve({ success: true, message: 'Image uploaded' });
        } catch (error) {
          console.error('Error uploading image:', error);
          resolve({ success: false, error: error.message });
        }
      };
      reader.readAsDataURL(file);
    });
  },

  // Upload report PDF (simulated - stores as data URL)
  uploadReport: async (resultId, file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
          const resultIndex = results.findIndex(r => r.id === resultId);
          
          if (resultIndex !== -1) {
            results[resultIndex].reportUrl = reader.result;
            results[resultIndex].reportFileName = file.name;
            results[resultIndex].reportFileSize = file.size;
            localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
          }
          
          resolve({ success: true, message: 'Report uploaded' });
        } catch (error) {
          console.error('Error uploading report:', error);
          resolve({ success: false, error: error.message });
        }
      };
      reader.readAsDataURL(file);
    });
  }
};