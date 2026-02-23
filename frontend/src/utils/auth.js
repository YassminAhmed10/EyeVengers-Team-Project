// Authentication utility functions

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setUserData = (user) => {
  if (user) {
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', user.username);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('isAuthenticated', 'true');
  }
};

export const getUserData = () => {
  return {
    role: localStorage.getItem('userRole'),
    username: localStorage.getItem('userName'),
    email: localStorage.getItem('userEmail'),
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true'
  };
};

export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isAuthenticated');
};

export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true' && 
         localStorage.getItem('authToken') !== null;
};

export const hasRole = (role) => {
  return localStorage.getItem('userRole') === role;
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
};

export const checkAuthStatus = () => {
  const token = getAuthToken();
  
  if (!token || isTokenExpired(token)) {
    clearAuth();
    return false;
  }
  
  return true;
};

export const redirectToLogin = () => {
  clearAuth();
  window.location.href = '/login';
};
