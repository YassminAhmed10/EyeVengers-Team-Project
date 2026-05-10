// src/pages/Radiology/NotificationsPage.jsx
// Patient page to view notifications

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaCheckCircle, FaTimesCircle, FaClock, FaFileAlt, FaTrash } from 'react-icons/fa';
import { notificationService } from '../../services/notificationService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get patient ID from localStorage
  const patientId = localStorage.getItem('radiologyPatientId');

  useEffect(() => {
    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await notificationService.getNotifications(patientId);
    if (result.success) {
      setNotifications(result.data);
      setUnreadCount(result.unreadCount || 0);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    await notificationService.markAsRead(notificationId);
    await loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead(patientId);
    await loadNotifications();
  };

  const handleDelete = async (notificationId) => {
    await notificationService.deleteNotification(notificationId);
    await loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_accepted':
        return <FaCheckCircle size={20} style={{ color: '#10b981' }} />;
      case 'appointment_rejected':
        return <FaTimesCircle size={20} style={{ color: '#ef4444' }} />;
      case 'status_update':
        return <FaClock size={20} style={{ color: '#f59e0b' }} />;
      case 'result_uploaded':
        return <FaFileAlt size={20} style={{ color: '#3b82f6' }} />;
      default:
        return <FaBell size={20} style={{ color: '#6f86a3' }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading notifications...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f7fa', minHeight: '100vh' }}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e', margin: 0, marginBottom: 8 }}>
              Notifications
            </h1>
            <p style={{ color: '#6f86a3', margin: 0 }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <motion.button
              onClick={handleMarkAllAsRead}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '10px 20px',
                background: '#1f6bff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Mark all as read
            </motion.button>
          )}
        </div>
      </motion.div>

      {notifications.length === 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 60,
            textAlign: 'center',
            color: '#6f86a3'
          }}
        >
          <FaBell size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
          <p style={{ fontSize: 16 }}>No notifications yet</p>
          <p style={{ fontSize: 14 }}>You'll receive notifications about your appointments and results</p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gap: 12, maxWidth: 800 }}>
          {notifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: idx * 0.05 }}
              style={{
                background: notification.isRead ? 'white' : '#f0f9ff',
                borderRadius: 12,
                padding: 20,
                border: notification.isRead ? '1px solid #e2e8f0' : '2px solid #0284c7',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                boxShadow: notification.isRead ? 'none' : '0 4px 12px rgba(2, 132, 199, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Icon */}
              <div style={{ flexShrink: 0, paddingTop: 4 }}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#1a1a2e',
                  margin: 0,
                  marginBottom: 6
                }}>
                  {notification.title}
                </h3>
                <p style={{
                  fontSize: 13,
                  color: '#6f86a3',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {notification.message}
                </p>
                <p style={{
                  fontSize: 11,
                  color: '#9ca3af',
                  margin: '8px 0 0'
                }}>
                  {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {!notification.isRead && (
                  <motion.button
                    onClick={() => handleMarkAsRead(notification.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Mark as read"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#dbeafe',
                      border: '1px solid #0284c7',
                      color: '#0284c7',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: 0
                    }}
                  >
                    •
                  </motion.button>
                )}
                <motion.button
                  onClick={() => handleDelete(notification.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete notification"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  <FaTrash size={12} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
