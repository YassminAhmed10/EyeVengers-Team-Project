import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
import { Notifications, NotificationsActive, CheckCircle } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5201/api';

const NotificationBell = ({ patientId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const fetchNotifications = async () => {
        if (!patientId) return;
        try {
            const [notificationsRes, countRes] = await Promise.all([
                axios.get(`${API_URL}/Notifications/patient/${patientId}`),
                axios.get(`${API_URL}/Notifications/patient/${patientId}/unread-count`)
            ]);
            setNotifications(notificationsRes.data);
            setUnreadCount(countRes.data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [patientId]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(`${API_URL}/Notifications/${notificationId}/mark-read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch(`${API_URL}/Notifications/patient/${patientId}/mark-all-read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <>
            <IconButton onClick={handleClick} color="inherit">
                <Badge badgeContent={unreadCount} color="error">
                    {unreadCount > 0 ? <NotificationsActive /> : <Notifications />}
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 350, maxHeight: 400 }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Notifications</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="textSecondary">
                            No notifications
                        </Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notif) => (
                        <MenuItem 
                            key={notif.id}
                            onClick={() => {
                                if (!notif.isRead) markAsRead(notif.id);
                                handleClose();
                                // Navigate to related order if needed
                                if (notif.type === 'DoctorOrder' && notif.relatedId) {
                                    window.location.href = '/patient/orders';
                                }
                            }}
                            sx={{ 
                                backgroundColor: notif.isRead ? 'transparent' : '#e3f2fd',
                                whiteSpace: 'normal'
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="subtitle2" fontWeight={notif.isRead ? 'normal' : 'bold'}>
                                    {notif.title}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {new Date(notif.createdAt).toLocaleString()}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {notif.message}
                                </Typography>
                                {!notif.isRead && (
                                    <CheckCircle fontSize="small" sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#4caf50' }} />
                                )}
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;