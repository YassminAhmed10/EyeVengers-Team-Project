// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { subscribeToAuthState, logoutUser } from '../firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = subscribeToAuthState((authState) => {
      console.log("Auth state changed:", authState); // للتصحيح
      
      if (authState && authState.isAuthenticated) {
        setCurrentUser(authState.user);
        setUserData(authState.userData);
        setAuthToken(authState.token);
        
        // Store in localStorage
        if (authState.token) {
          localStorage.setItem('authToken', authState.token);
        }
        if (authState.userData) {
          localStorage.setItem('userRole', authState.userData.role || 'patient');
          localStorage.setItem('userName', `${authState.userData.firstName || ''} ${authState.userData.lastName || ''}`.trim());
          localStorage.setItem('userEmail', authState.userData.email || '');
          localStorage.setItem('userId', authState.user.uid);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setAuthToken(null);
        
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    const result = await logoutUser();
    if (result.success) {
      setCurrentUser(null);
      setUserData(null);
      setAuthToken(null);
    }
    return result;
  };

  const value = {
    currentUser,
    userData,
    authToken,
    loading,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};