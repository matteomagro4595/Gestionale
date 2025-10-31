import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gymAPI } from '../../services/api';
import { PlusIcon, EditIcon, TrashIcon, CheckIcon, XIcon, GripIcon } from '../../components/Icons';

const GymCardDetail = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [draggedExercise, setDraggedExercise] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchCurrentY, setTouchCurrentY] = useState(null);
  const [draggedRow, setDraggedRow] = useState(null);
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

  const handleEditExercise = (exercise) => {
    setEditingExercise({
      ...exercise,
      serie: exercise.serie || '',
      ripetizioni: exercise.ripetizioni || '',
      peso: exercise.peso || '',
      note: exercise.note || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateExercise = async (e) => {
    e.preventDefault();
    try {
      await gymAPI.updateExercise(cardId, editingExercise.id, {
        nome: editingExercise.nome,
        serie: editingExercise.serie ? parseInt(editingExercise.serie) : null,
        ripetizioni: editingExercise.ripetizioni || null,
        peso: editingExercise.peso || null,
        note: editingExercise.note || null,
      });
      setEditingExercise(null);
      setShowEditModal(false);
      loadCard();
    } catch (error) {
      console.error('Error updating exercise:', error);
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

  // Reorder exercises and update backend
  const reorderExercises = async (exercises) => {
    try {
      // Update each exercise with new order
      for (let i = 0; i < exercises.length; i++) {
        await gymAPI.updateExercise(cardId, exercises[i].id, {
          ...exercises[i],
          ordine: i,
        });
      }
      loadCard();
    } catch (error) {
      console.error('Error reordering exercises:', error);
      alert('Errore durante il riordinamento degli esercizi');
    }
  };

  // Drag and drop handlers (desktop)
  const handleDragStart = (e, exercise) => {
    setDraggedExercise(exercise);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedExercise(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetExercise) => {
    e.preventDefault();
    if (!draggedExercise || draggedExercise.id === targetExercise.id) return;

    const sortedExercises = [...card.exercises].sort((a, b) => a.ordine - b.ordine);
    const draggedIndex = sortedExercises.findIndex(ex => ex.id === draggedExercise.id);
    const targetIndex = sortedExercises.findIndex(ex => ex.id === targetExercise.id);

    const newExercises = [...sortedExercises];
    newExercises.splice(draggedIndex, 1);
    newExercises.splice(targetIndex, 0, draggedExercise);

    reorderExercises(newExercises);
  };

  // Touch handlers for mobile drag and drop
  const handleTouchStart = (e, exercise) => {
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchCurrentY(touch.clientY);
    setDraggedExercise(exercise);
    setDraggedRow(e.currentTarget);
    e.currentTarget.style.opacity = '0.7';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  };

  const handleTouchMove = (e, exercise) => {
    if (!draggedExercise) return;

    const touch = e.touches[0];
    setTouchCurrentY(touch.clientY);

    // Prevent default scrolling while dragging
    e.preventDefault();

    // Visual feedback: move the row
    if (draggedRow) {
      const deltaY = touch.clientY - touchStartY;
      draggedRow.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = (e) => {
    if (!draggedExercise || !draggedRow) return;

    // Reset styles
    draggedRow.style.opacity = '1';
    draggedRow.style.transform = '';
    draggedRow.style.boxShadow = '';

    // Calculate if we should swap
    const deltaY = touchCurrentY - touchStartY;
    const threshold = 50; // pixels to trigger swap

    if (Math.abs(deltaY) > threshold) {
      const sortedExercises = [...card.exercises].sort((a, b) => a.ordine - b.ordine);
      const draggedIndex = sortedExercises.findIndex(ex => ex.id === draggedExercise.id);

      let targetIndex = draggedIndex;
      if (deltaY < 0 && draggedIndex > 0) {
        // Swiped up
        targetIndex = draggedIndex - 1;
      } else if (deltaY > 0 && draggedIndex < sortedExercises.length - 1) {
        // Swiped down
        targetIndex = draggedIndex + 1;
      }

      if (targetIndex !== draggedIndex) {
        const newExercises = [...sortedExercises];
        newExercises.splice(draggedIndex, 1);
        newExercises.splice(targetIndex, 0, draggedExercise);
        reorderExercises(newExercises);
      }
    }

    // Reset state
    setDraggedExercise(null);
    setTouchStartY(null);
    setTouchCurrentY(null);
    setDraggedRow(null);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <h1 style={{ margin: 0, flex: '1 1 auto' }}>{card?.nome}</h1>
          <button
            className="btn btn-danger"
            onClick={handleDeleteCard}
          >
            <span className="btn-icon"><TrashIcon size={20} /></span>
            <span className="btn-text">Elimina Scheda</span>
          </button>
        </div>
        <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>{card?.descrizione}</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0 }}>Esercizi</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <span className="btn-icon"><PlusIcon size={20} /></span>
            <span className="btn-text">Nuovo Esercizio</span>
          </button>
        </div>

        <div className="table-wrapper">
          <table style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}></th>
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
                .map((exercise, index) => (
                  <tr
                    key={exercise.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, exercise)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, exercise)}
                    onTouchStart={(e) => handleTouchStart(e, exercise)}
                    onTouchMove={(e) => handleTouchMove(e, exercise)}
                    onTouchEnd={handleTouchEnd}
                    style={{ cursor: 'move', userSelect: 'none' }}
                    className="draggable-row"
                  >
                    <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7f8c8d', cursor: 'grab' }}>
                        <GripIcon size={20} />
                      </div>
                    </td>
                    <td>{exercise.nome}</td>
                    <td>{exercise.serie || '-'}</td>
                    <td>{exercise.ripetizioni || '-'}</td>
                    <td>{exercise.peso || '-'}</td>
                    <td>{exercise.note || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEditExercise(exercise)}
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <span className="btn-icon"><EditIcon size={18} /></span>
                          <span className="btn-text">Modifica</span>
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteExercise(exercise.id)}
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <span className="btn-icon"><TrashIcon size={18} /></span>
                          <span className="btn-text">Elimina</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
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
                <button type="submit" className="btn btn-primary">
                  <span className="btn-icon"><CheckIcon size={20} /></span>
                  <span className="btn-text">Aggiungi</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  <span className="btn-icon"><XIcon size={20} /></span>
                  <span className="btn-text">Annulla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingExercise && (
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
            <h2>Modifica Esercizio</h2>
            <form onSubmit={handleUpdateExercise}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={editingExercise.nome}
                  onChange={(e) => setEditingExercise({ ...editingExercise, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Serie</label>
                <input
                  type="number"
                  value={editingExercise.serie}
                  onChange={(e) => setEditingExercise({ ...editingExercise, serie: e.target.value })}
                  placeholder="es. 3"
                />
              </div>
              <div className="form-group">
                <label>Ripetizioni</label>
                <input
                  type="text"
                  value={editingExercise.ripetizioni}
                  onChange={(e) => setEditingExercise({ ...editingExercise, ripetizioni: e.target.value })}
                  placeholder="es. 10-12"
                />
              </div>
              <div className="form-group">
                <label>Peso</label>
                <input
                  type="text"
                  value={editingExercise.peso}
                  onChange={(e) => setEditingExercise({ ...editingExercise, peso: e.target.value })}
                  placeholder="es. 20kg"
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  value={editingExercise.note}
                  onChange={(e) => setEditingExercise({ ...editingExercise, note: e.target.value })}
                  rows="3"
                  placeholder="Note aggiuntive..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  <span className="btn-icon"><CheckIcon size={20} /></span>
                  <span className="btn-text">Salva</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingExercise(null);
                  }}
                >
                  <span className="btn-icon"><XIcon size={20} /></span>
                  <span className="btn-text">Annulla</span>
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
