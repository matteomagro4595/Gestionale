import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shoppingAPI } from '../../services/api';

const ShoppingListJoin = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinList = async () => {
      try {
        const response = await shoppingAPI.getListByToken(token);
        // Redirect to the list detail page
        navigate(`/shopping/${response.data.id}`, { replace: true });
      } catch (err) {
        console.error('Error joining list:', err);
        setError('Token non valido o lista non trovata');
      }
    };

    if (token) {
      joinList();
    }
  }, [token, navigate]);

  if (error) {
    return (
      <div className="container" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <div className="card">
          <h2 style={{ color: '#e74c3c' }}>Errore</h2>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/shopping')}
            style={{ marginTop: '1rem' }}
          >
            Torna alle Liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2rem', textAlign: 'center' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '1rem' }}>Accesso alla lista in corso...</p>
    </div>
  );
};

export default ShoppingListJoin;
