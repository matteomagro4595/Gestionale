import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const error = params.get('message');

      if (error) {
        // Show error and redirect to login
        alert(`Errore durante l'accesso con Google: ${error}`);
        navigate('/login');
        return;
      }

      if (token) {
        // Save token and redirect to home
        localStorage.setItem('token', token);

        // If loginWithToken exists, use it to refresh user data
        if (loginWithToken) {
          await loginWithToken(token);
        }

        navigate('/');
      } else {
        // No token, redirect to login
        navigate('/login');
      }
    };

    handleCallback();
  }, [location, navigate, loginWithToken]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner"></div>
      <p>Accesso in corso con Google...</p>
    </div>
  );
};

export default GoogleCallback;
