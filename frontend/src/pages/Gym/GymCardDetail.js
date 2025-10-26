import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gymAPI } from '../../services/api';

const GymCardDetail = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newExercise, setNewExercise] = useState({
    nome: '',
    serie: '',
    ripetizioni: '',
    peso: '',
    note: '',
    ordine: 0,
  });

  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    try {
      const response = await gymAPI.getCard(cardId);
      setCard(response.data);
    } catch (error) {
      console.error('Error loading card:', error);

      // Check if card was deleted or doesn't exist
      if (error.response && (error.response.status === 404 || error.response.status === 403)) {
        alert('Questa scheda non esiste più o è stata eliminata.');
        navigate('/gym');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    try {
      await gymAPI.createExercise(cardId, {
        ...newExercise,
        serie: newExercise.serie ? parseInt(newExercise.serie) : null,
        ordine: card.exercises?.length || 0,
      });
      setNewExercise({
        nome: '',
        serie: '',
        ripetizioni: '',
        peso: '',
        note: '',
        ordine: 0,
      });
      setShowModal(false);
      loadCard();
    } catch (error) {
      console.error('Error creating exercise:', error);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo esercizio?')) {
      try {
        await gymAPI.deleteExercise(cardId, exerciseId);
        loadCard();
      } catch (error) {
        console.error('Error deleting exercise:', error);
      }
    }
  };

  const handleDeleteCard = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questa scheda? Questa azione eliminerà anche tutti gli esercizi associati e non può essere annullata.')) {
      try {
        await gymAPI.deleteCard(cardId);
        navigate('/gym');
      } catch (error) {
        console.error('Error deleting card:', error);
        alert('Errore durante l\'eliminazione della scheda');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      <button
        onClick={() => navigate('/gym')}
        className="btn btn-secondary"
        style={{ marginTop: '1rem' }}
      >
        ← Indietro
      </button>

      <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h1 style={{ margin: 0 }}>{card?.nome}</h1>
          <button
            className="btn btn-danger"
            onClick={handleDeleteCard}
            style={{ marginLeft: '1rem' }}
          >
            Elimina Scheda
          </button>
        </div>
        <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>{card?.descrizione}</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Esercizi</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Nuovo Esercizio
          </button>
        </div>

        <table style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Esercizio</th>
              <th>Serie</th>
              <th>Ripetizioni</th>
              <th>Peso</th>
              <th>Note</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {card?.exercises
              ?.sort((a, b) => a.ordine - b.ordine)
              .map((exercise) => (
                <tr key={exercise.id}>
                  <td>{exercise.nome}</td>
                  <td>{exercise.serie || '-'}</td>
                  <td>{exercise.ripetizioni || '-'}</td>
                  <td>{exercise.peso || '-'}</td>
                  <td>{exercise.note || '-'}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteExercise(exercise.id)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
            <h2>Nuovo Esercizio</h2>
            <form onSubmit={handleCreateExercise}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={newExercise.nome}
                  onChange={(e) => setNewExercise({ ...newExercise, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Serie</label>
                <input
                  type="number"
                  value={newExercise.serie}
                  onChange={(e) => setNewExercise({ ...newExercise, serie: e.target.value })}
                  placeholder="es. 3"
                />
              </div>
              <div className="form-group">
                <label>Ripetizioni</label>
                <input
                  type="text"
                  value={newExercise.ripetizioni}
                  onChange={(e) => setNewExercise({ ...newExercise, ripetizioni: e.target.value })}
                  placeholder="es. 10-12"
                />
              </div>
              <div className="form-group">
                <label>Peso</label>
                <input
                  type="text"
                  value={newExercise.peso}
                  onChange={(e) => setNewExercise({ ...newExercise, peso: e.target.value })}
                  placeholder="es. 20kg"
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  value={newExercise.note}
                  onChange={(e) => setNewExercise({ ...newExercise, note: e.target.value })}
                  rows="3"
                  placeholder="Note aggiuntive..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Aggiungi</button>
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

export default GymCardDetail;
