import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = (requiredRole = null) => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const role = localStorage.getItem('userRole');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      
      if (!isAuthenticated || !role) {
        navigate('/login');
        return;
      }

      if (requiredRole && role !== requiredRole) {
        navigate('/login');
        return;
      }

      setUserRole(role);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, requiredRole]);

  return { userRole, isLoading };
};