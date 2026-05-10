// src/services/notificationService.js
// Service to manage patient notifications

const baseUrl = import.meta.env.VITE_RADIOLOGY_BASE_URL || 'http://localhost:5301';

export const notificationService = {
  // Get all notifications for a patient
  async getNotifications(patientId, unreadOnly = false) {
    try {
      let url = `${baseUrl}/api/Notification/patient/${patientId}`;
      if (unreadOnly) url += '?unreadOnly=true';

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, data: [] };
    }
  },

  // Get specific notification
  async getNotification(id) {
    try {
      const response = await fetch(`${baseUrl}/api/Notification/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching notification:', error);
      return { success: false, data: null };
    }
  },

  // Mark notification as read
  async markAsRead(id) {
    try {
      const response = await fetch(`${baseUrl}/api/Notification/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false };
    }
  },

  // Mark all notifications as read for a patient
  async markAllAsRead(patientId) {
    try {
      const response = await fetch(`${baseUrl}/api/Notification/patient/${patientId}/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false };
    }
  },

  // Delete notification
  async deleteNotification(id) {
    try {
      const response = await fetch(`${baseUrl}/api/Notification/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false };
    }
  },

  // Delete all notifications for a patient
  async deleteAllNotifications(patientId) {
    try {
      const response = await fetch(`${baseUrl}/api/Notification/patient/${patientId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error deleting notifications:', error);
      return { success: false };
    }
  },
};
