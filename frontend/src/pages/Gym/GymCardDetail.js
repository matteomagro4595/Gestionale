import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gymAPI } from '../../services/api';
import { PlusIcon, EditIcon, TrashIcon, CheckIcon, XIcon, GripIcon } from '../../components/Icons';
import './GymCardDetail.css';

const GymCardDetail = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);

  // Modals state
  const [showDayModal, setShowDayModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);

  // Form state
  const [dayForm, setDayForm] = useState({ nome: '', ordine: 0 });
  const [exerciseForm, setExerciseForm] = useState({
    nome: '',
    serie: '',
    ripetizioni: '',
    peso: '',
    note: '',
    ordine: 0
  });

  // Drag and drop state
  const [draggedExercise, setDraggedExercise] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchCurrentY, setTouchCurrentY] = useState(null);
  const [draggedRow, setDraggedRow] = useState(null);
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const lastTouchMoveTime = React.useRef(0);
  const exerciseRefs = React.useRef({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadCard();
  }, [cardId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  // Register non-passive touch event listeners
  useEffect(() => {
    const handleTouchMoveNonPassive = (e) => {
      // Only prevent if we have a dragged exercise and event is cancelable
      if (draggedExercise && e.cancelable) {
        const touch = e.touches[0];
        if (touch && touchStartY !== null) {
          const deltaY = Math.abs(touch.clientY - touchStartY);
          // Prevent only if moved more than threshold (15px for better scroll tolerance)
          if (deltaY > 15) {
            e.preventDefault();
          }
        }
      }
    };

    // Add event listeners to all exercise cards with non-passive option
    Object.values(exerciseRefs.current).forEach((element) => {
      if (element) {
        element.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false });
      }
    });

    return () => {
      // Cleanup listeners
      Object.values(exerciseRefs.current).forEach((element) => {
        if (element) {
          element.removeEventListener('touchmove', handleTouchMoveNonPassive);
        }
      });
    };
  }, [card?.days, draggedExercise, touchStartY]);

  // Register global mouse event listeners for drag
  useEffect(() => {
    if (!isDragging) return;

    const currentDay = card?.days?.[activeDay];
    if (!currentDay) return;

    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = (e) => handleMouseUp(e, activeDay, currentDay.id);

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, activeDay, card?.days]);

  const loadCard = async () => {
    try {
      const response = await gymAPI.getCard(cardId);
      setCard(response.data);

      // Set active day to first day if exists
      if (response.data.days && response.data.days.length > 0 && activeDay === 0) {
        setActiveDay(0);
      }
    } catch (error) {
      console.error('Error loading card:', error);
      if (error.response && (error.response.status === 404 || error.response.status === 403)) {
        alert('Questa scheda non esiste più o è stata eliminata.');
        navigate('/gym');
      }
    } finally {
      setLoading(false);
    }
  };

  // Day functions
  const handleCreateDay = async (e) => {
    e.preventDefault();
    try {
      await gymAPI.createDay(cardId, {
        ...dayForm,
        ordine: card.days?.length || 0
      });
      setShowDayModal(false);
      setDayForm({ nome: '', ordine: 0 });
      loadCard();
    } catch (error) {
      console.error('Error creating day:', error);
      alert('Errore nella creazione del giorno');
    }
  };

  const handleUpdateDay = async (e) => {
    e.preventDefault();
    try {
      await gymAPI.updateDay(cardId, editingDay.id, dayForm);
      setShowDayModal(false);
      setEditingDay(null);
      setDayForm({ nome: '', ordine: 0 });
      loadCard();
    } catch (error) {
      console.error('Error updating day:', error);
      alert('Errore nell\'aggiornamento del giorno');
    }
  };

  const handleDeleteDay = async (dayId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo giorno? Verranno eliminati anche tutti gli esercizi associati.')) return;

    try {
      await gymAPI.deleteDay(cardId, dayId);
      if (activeDay >= card.days.length - 1) {
        setActiveDay(Math.max(0, card.days.length - 2));
      }
      loadCard();
    } catch (error) {
      console.error('Error deleting day:', error);
      alert('Errore nell\'eliminazione del giorno');
    }
  };

  const openEditDayModal = (day) => {
    setEditingDay(day);
    setDayForm({ nome: day.nome, ordine: day.ordine });
    setShowDayModal(true);
  };

  // Exercise functions
  const handleCreateExercise = async (e) => {
    e.preventDefault();
    const currentDay = card.days[activeDay];
    if (!currentDay) return;

    try {
      await gymAPI.createExercise(currentDay.id, {
        ...exerciseForm,
        serie: exerciseForm.serie ? parseInt(exerciseForm.serie) : null,
        ordine: currentDay.exercises?.length || 0
      });
      setShowExerciseModal(false);
      setExerciseForm({ nome: '', serie: '', ripetizioni: '', peso: '', note: '', ordine: 0 });
      loadCard();
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('Errore nella creazione dell\'esercizio');
    }
  };

  const handleUpdateExercise = async (e) => {
    e.preventDefault();
    const currentDay = card.days[activeDay];
    if (!currentDay) return;

    try {
      await gymAPI.updateExercise(currentDay.id, editingExercise.id, {
        ...exerciseForm,
        serie: exerciseForm.serie ? parseInt(exerciseForm.serie) : null
      });
      setShowExerciseModal(false);
      setEditingExercise(null);
      setExerciseForm({ nome: '', serie: '', ripetizioni: '', peso: '', note: '', ordine: 0 });
      loadCard();
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Errore nell\'aggiornamento dell\'esercizio');
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo esercizio?')) return;

    const currentDay = card.days[activeDay];
    if (!currentDay) return;

    try {
      await gymAPI.deleteExercise(currentDay.id, exerciseId);
      loadCard();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Errore nell\'eliminazione dell\'esercizio');
    }
  };

  const openEditExerciseModal = (exercise) => {
    setEditingExercise(exercise);
    setExerciseForm({
      nome: exercise.nome,
      serie: exercise.serie || '',
      ripetizioni: exercise.ripetizioni || '',
      peso: exercise.peso || '',
      note: exercise.note || '',
      ordine: exercise.ordine
    });
    setShowExerciseModal(true);
  };

  // Drag and drop functions
  // Optimistic UI update - update local state immediately
  const updateLocalOrder = (dayIndex, exercises) => {
    const updatedExercises = exercises.map((ex, index) => ({
      ...ex,
      ordine: index,
    }));

    const updatedDays = [...card.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      exercises: updatedExercises,
    };

    setCard({
      ...card,
      days: updatedDays,
    });

    return updatedExercises;
  };

  // Debounced save to backend
  const saveOrderToBackend = async (dayId, exercises) => {
    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set a new timeout to save after 1 second of no changes
    const timeout = setTimeout(async () => {
      setIsSaving(true);
      const previousState = card;

      try {
        // Update each exercise with new order
        for (let i = 0; i < exercises.length; i++) {
          await gymAPI.updateExercise(dayId, exercises[i].id, {
            ...exercises[i],
            ordine: i,
          });
        }
        setIsSaving(false);
      } catch (error) {
        console.error('Error saving order:', error);
        // Rollback to previous state on error
        setCard(previousState);
        alert('Errore durante il salvataggio dell\'ordine. Riprovare.');
        setIsSaving(false);
      }
    }, 1000); // Wait 1 second after last change

    setSaveTimeout(timeout);
  };

  // Reorder exercises with optimistic update
  const reorderExercises = (dayIndex, dayId, exercises) => {
    // Update UI immediately for instant feedback
    const updatedExercises = updateLocalOrder(dayIndex, exercises);

    // Save to backend with debounce
    saveOrderToBackend(dayId, updatedExercises);
  };

  // Mouse drag handlers (desktop)
  const handleMouseDown = (e, exercise) => {
    e.preventDefault();
    e.stopPropagation();

    const exerciseCard = e.currentTarget.closest('.gym-exercise-card');
    if (!exerciseCard) return;

    setTouchStartY(e.clientY);
    setTouchCurrentY(e.clientY);
    setDraggedExercise(exercise);
    setDraggedRow(exerciseCard);
    setIsDragging(true);
    lastTouchMoveTime.current = 0;

    exerciseCard.classList.add('dragging');
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !draggedExercise || !draggedRow) return;

    const deltaY = e.clientY - touchStartY;

    // Only update if moved more than 5px
    if (Math.abs(deltaY) > 5) {
      // Throttle updates
      const now = Date.now();
      if (now - lastTouchMoveTime.current < 16) return;
      lastTouchMoveTime.current = now;

      setTouchCurrentY(e.clientY);

      requestAnimationFrame(() => {
        if (draggedRow) {
          draggedRow.style.willChange = 'transform';
          draggedRow.style.transform = `translateY(${deltaY}px)`;
        }
      });
    }
  };

  const handleMouseUp = (e, dayIndex, dayId) => {
    if (!isDragging || !draggedExercise || !draggedRow) return;

    draggedRow.classList.remove('dragging');
    draggedRow.style.willChange = 'auto';
    draggedRow.style.transform = '';

    const deltaY = touchCurrentY - touchStartY;
    const threshold = 40;

    if (Math.abs(deltaY) > threshold) {
      const currentDay = card.days[dayIndex];
      const sortedExercises = [...currentDay.exercises].sort((a, b) => a.ordine - b.ordine);
      const draggedIndex = sortedExercises.findIndex(ex => ex.id === draggedExercise.id);

      let targetIndex = draggedIndex;
      if (deltaY < 0 && draggedIndex > 0) {
        targetIndex = draggedIndex - 1;
      } else if (deltaY > 0 && draggedIndex < sortedExercises.length - 1) {
        targetIndex = draggedIndex + 1;
      }

      if (targetIndex !== draggedIndex) {
        const newExercises = [...sortedExercises];
        newExercises.splice(draggedIndex, 1);
        newExercises.splice(targetIndex, 0, draggedExercise);
        reorderExercises(dayIndex, dayId, newExercises);
      }
    }

    setDraggedExercise(null);
    setTouchStartY(null);
    setTouchCurrentY(null);
    setDraggedRow(null);
    setIsDragging(false);
    lastTouchMoveTime.current = 0;
  };

  // Touch handlers for mobile drag and drop
  const handleTouchStart = (e, exercise) => {
    e.stopPropagation();

    const exerciseCard = e.currentTarget.closest('.gym-exercise-card');
    if (!exerciseCard) return;

    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchCurrentY(touch.clientY);
    setDraggedExercise(exercise);
    setDraggedRow(exerciseCard);
    lastTouchMoveTime.current = 0; // Reset throttle timer

    // Add dragging class for CSS transitions
    exerciseCard.classList.add('dragging');
  };

  const handleTouchMove = (e, exercise) => {
    if (!draggedExercise) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartY;

    // Only update if user is actually dragging (moved more than 15px for consistency)
    if (Math.abs(deltaY) > 15) {
      // Throttle updates to ~60fps (16ms) for better performance
      const now = Date.now();
      if (now - lastTouchMoveTime.current < 16) return;
      lastTouchMoveTime.current = now;

      setTouchCurrentY(touch.clientY);

      // Visual feedback: move the row with transform
      if (draggedRow) {
        // Use requestAnimationFrame for smooth 60fps updates
        requestAnimationFrame(() => {
          if (draggedRow) {
            draggedRow.style.willChange = 'transform';
            draggedRow.style.transform = `translateY(${deltaY}px)`;
          }
        });
      }
    }
  };

  const handleTouchEnd = (e, dayIndex, dayId) => {
    if (!draggedExercise || !draggedRow) return;

    // Remove dragging class
    draggedRow.classList.remove('dragging');

    // Reset styles
    draggedRow.style.willChange = 'auto';
    draggedRow.style.transform = '';

    // Calculate if we should swap
    const deltaY = touchCurrentY - touchStartY;
    const threshold = 50; // pixels to trigger swap

    if (Math.abs(deltaY) > threshold) {
      const currentDay = card.days[dayIndex];
      const sortedExercises = [...currentDay.exercises].sort((a, b) => a.ordine - b.ordine);
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
        reorderExercises(dayIndex, dayId, newExercises);
      }
    }

    // Reset state
    setDraggedExercise(null);
    setTouchStartY(null);
    setTouchCurrentY(null);
    setDraggedRow(null);
    lastTouchMoveTime.current = 0; // Reset throttle timer
  };

  if (loading) {
    return (
      <div className="gym-loading">
        <div className="spinner"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!card) return null;

  const currentDay = card.days && card.days[activeDay];

  return (
    <div className="gym-card-detail">
      <div className="gym-card-header">
        <button onClick={() => navigate('/gym')} className="btn-back">
          ← Indietro
        </button>
        <div className="gym-card-title">
          <h1>{card.nome}</h1>
          {card.descrizione && <p className="gym-card-description">{card.descrizione}</p>}
        </div>
      </div>

      {/* Days tabs */}
      <div className="gym-days-section">
        <div className="gym-days-header">
          <h2>Giorni</h2>
          <button
            onClick={() => {
              setEditingDay(null);
              setDayForm({ nome: '', ordine: card.days?.length || 0 });
              setShowDayModal(true);
            }}
            className="btn btn-primary"
          >
            <PlusIcon /> Aggiungi Giorno
          </button>
        </div>

        {card.days && card.days.length > 0 ? (
          <>
            <div className="gym-days-tabs">
              {card.days.map((day, index) => (
                <div
                  key={day.id}
                  className={`gym-day-tab ${activeDay === index ? 'active' : ''}`}
                  onClick={() => setActiveDay(index)}
                >
                  <span>{day.nome}</span>
                  <div className="gym-day-tab-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDayModal(day);
                      }}
                      className="btn-icon"
                      title="Modifica giorno"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDay(day.id);
                      }}
                      className="btn-icon btn-danger"
                      title="Elimina giorno"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Current day exercises */}
            {currentDay && (
              <div className="gym-day-content">
                <div className="gym-exercises-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3>Esercizi - {currentDay.nome}</h3>
                    {isSaving && (
                      <span style={{
                        fontSize: '0.85rem',
                        color: '#7f8c8d',
                        fontStyle: 'italic'
                      }}>
                        Salvataggio...
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setEditingExercise(null);
                      setExerciseForm({ nome: '', serie: '', ripetizioni: '', peso: '', note: '', ordine: 0 });
                      setShowExerciseModal(true);
                    }}
                    className="btn btn-secondary"
                  >
                    <PlusIcon /> Aggiungi Esercizio
                  </button>
                </div>

                {currentDay.exercises && currentDay.exercises.length > 0 ? (
                  <div className="gym-exercises-list">
                    {currentDay.exercises
                      .sort((a, b) => a.ordine - b.ordine)
                      .map((exercise) => (
                      <div
                        key={exercise.id}
                        ref={(el) => exerciseRefs.current[exercise.id] = el}
                        className="gym-exercise-card"
                      >
                        <div
                          className="gym-grip-handle"
                          onTouchStart={(e) => handleTouchStart(e, exercise)}
                          onTouchMove={(e) => handleTouchMove(e, exercise)}
                          onTouchEnd={(e) => handleTouchEnd(e, activeDay, currentDay.id)}
                          onMouseDown={(e) => handleMouseDown(e, exercise)}
                        >
                          <GripIcon size={18} />
                        </div>
                        <div className="gym-exercise-info">
                          <h4>{exercise.nome}</h4>
                          <div className="gym-exercise-details">
                            {exercise.serie && <span className="exercise-badge">Serie: {exercise.serie}</span>}
                            {exercise.ripetizioni && <span className="exercise-badge">Rip: {exercise.ripetizioni}</span>}
                            {exercise.peso && <span className="exercise-badge">Peso: {exercise.peso}</span>}
                          </div>
                          {exercise.note && <p className="gym-exercise-note">{exercise.note}</p>}
                        </div>
                        <div className="gym-exercise-actions">
                          <button
                            onClick={() => openEditExerciseModal(exercise)}
                            className="btn-icon"
                            title="Modifica"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteExercise(exercise.id)}
                            className="btn-icon btn-danger"
                            title="Elimina"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="gym-empty-state">
                    <p>Nessun esercizio in questo giorno</p>
                    <button
                      onClick={() => {
                        setEditingExercise(null);
                        setExerciseForm({ nome: '', serie: '', ripetizioni: '', peso: '', note: '', ordine: 0 });
                        setShowExerciseModal(true);
                      }}
                      className="btn btn-primary"
                    >
                      Aggiungi il primo esercizio
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="gym-empty-state">
            <p>Nessun giorno nella scheda</p>
            <button
              onClick={() => {
                setEditingDay(null);
                setDayForm({ nome: '', ordine: 0 });
                setShowDayModal(true);
              }}
              className="btn btn-primary"
            >
              Aggiungi il primo giorno
            </button>
          </div>
        )}
      </div>

      {/* Day Modal */}
      {showDayModal && (
        <div className="modal-overlay" onClick={() => {
          setShowDayModal(false);
          setEditingDay(null);
          setDayForm({ nome: '', ordine: 0 });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDay ? 'Modifica Giorno' : 'Nuovo Giorno'}</h2>
              <button
                onClick={() => {
                  setShowDayModal(false);
                  setEditingDay(null);
                  setDayForm({ nome: '', ordine: 0 });
                }}
                className="btn-close"
              >
                <XIcon />
              </button>
            </div>
            <form onSubmit={editingDay ? handleUpdateDay : handleCreateDay}>
              <div className="form-group">
                <label>Nome Giorno *</label>
                <input
                  type="text"
                  value={dayForm.nome}
                  onChange={(e) => setDayForm({ ...dayForm, nome: e.target.value })}
                  placeholder="es: Giorno 1 - Petto/Tricipiti, Lunedì, Upper Body..."
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowDayModal(false);
                  setEditingDay(null);
                  setDayForm({ nome: '', ordine: 0 });
                }} className="btn btn-secondary">
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDay ? 'Salva' : 'Crea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Modal */}
      {showExerciseModal && (
        <div className="modal-overlay" onClick={() => {
          setShowExerciseModal(false);
          setEditingExercise(null);
          setExerciseForm({ nome: '', serie: '', ripetizioni: '', peso: '', note: '', ordine: 0 });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingExercise ? 'Modifica Esercizio' : 'Nuovo Esercizio'}</h2>
              <button
                onClick={() => {
                  setShowExerciseModal(false);
                  setEditingExercise(null);
                  setExerciseForm({ nome: '', serie: '', ripetizioni: '', peso: '', note: '', ordine: 0 });
                }}
                className="btn-close"
              >
                <XIcon />
              </button>
            </div>
            <form onSubmit={editingExercise ? handleUpdateExercise : handleCreateExercise}>
              <div className="form-group">
                <label>Nome Esercizio *</label>
                <input
                  type="text"
                  value={exerciseForm.nome}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, nome: e.target.value })}
                  placeholder="es: Panca Piana, Squat, Lat Machine..."
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Serie</label>
                  <input
                    type="number"
                    value={exerciseForm.serie}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, serie: e.target.value })}
                    placeholder="es: 3"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Ripetizioni</label>
                  <input
                    type="text"
                    value={exerciseForm.ripetizioni}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, ripetizioni: e.target.value })}
                    placeholder="es: 10, 8-12, Max..."
                  />
                </div>
                <div className="form-group">
                  <label>Peso</label>
                  <input
                    type="text"
                    value={exerciseForm.peso}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, peso: e.target.value })}
                    placeholder="es: 20kg, 50%..."
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  value={exerciseForm.note}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, note: e.target.value })}
                  placeholder="Note aggiuntive sull'esercizio..."
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowExerciseModal(false);
                  setEditingExercise(null);
                  setExerciseForm({ nome: '', serie: '', ripetizioni: '', peso: '', note: '', ordine: 0 });
                }} className="btn btn-secondary">
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingExercise ? 'Salva' : 'Crea'}
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
