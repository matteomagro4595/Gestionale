import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gymAPI } from '../../services/api';

const GymCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCard, setNewCard] = useState({ nome: '', descrizione: '' });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await gymAPI.getCards();
      setCards(response.data);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      await gymAPI.createCard({ ...newCard, exercises: [] });
      setNewCard({ nome: '', descrizione: '' });
      setShowModal(false);
      loadCards();
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
        <h1>Schede Palestra</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Nuova Scheda
        </button>
      </div>

      <div className="grid" style={{ marginTop: '2rem' }}>
        {cards.map((card) => (
          <Link key={card.id} to={`/gym/${card.id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer' }}>
              <h2>{card.nome}</h2>
              <p style={{ color: '#7f8c8d' }}>{card.descrizione || 'Nessuna descrizione'}</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
                {card.exercises?.length || 0} esercizi
              </p>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <h2>Nuova Scheda</h2>
            <form onSubmit={handleCreateCard}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={newCard.nome}
                  onChange={(e) => setNewCard({ ...newCard, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrizione</label>
                <textarea
                  value={newCard.descrizione}
                  onChange={(e) => setNewCard({ ...newCard, descrizione: e.target.value })}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Crea</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymCards;
