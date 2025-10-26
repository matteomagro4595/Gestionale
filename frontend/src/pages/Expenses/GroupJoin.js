import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expensesAPI } from '../../services/api';

const GroupJoin = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinGroup = async () => {
      try {
        const response = await expensesAPI.getGroupByToken(token);
        // Redirect to the group detail page
        navigate(`/expenses/groups/${response.data.id}`, { replace: true });
      } catch (err) {
        console.error('Error joining group:', err);
        setError('Token non valido o gruppo non trovato');
      }
    };

    if (token) {
      joinGroup();
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
            onClick={() => navigate('/expenses')}
            style={{ marginTop: '1rem' }}
          >
            Torna ai Gruppi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2rem', textAlign: 'center' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '1rem' }}>Accesso al gruppo in corso...</p>
    </div>
  );
};

export default GroupJoin;
