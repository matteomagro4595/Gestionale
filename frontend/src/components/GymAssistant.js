import React, { useState } from 'react';
import './Assistant.css';

const GymAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openFullGuide = () => {
    alert('La guida completa è disponibile in docs/GYM_GUIDE.md');
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="assistant-fab"
        onClick={() => setIsOpen(true)}
        title="Assistente Palestra"
      >
        💡
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="assistant-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="assistant-modal" onClick={(e) => e.stopPropagation()}>
            <div className="assistant-header">
              <h2>
                <span>💪</span>
                Assistente Schede Palestra
              </h2>
              <button className="assistant-close" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>

            <div className="assistant-content">
              {/* Quick Start */}
              <div className="assistant-section">
                <h3>🚀 Inizia Subito</h3>
                <p>Per creare la tua prima scheda:</p>
                <ul>
                  <li>Clicca <strong>"Nuova Scheda"</strong></li>
                  <li>Dai un nome (es. "Scheda A", "Upper Body", "Full Body")</li>
                  <li>Aggiungi una descrizione (opzionale, es. "3 volte a settimana")</li>
                  <li>Inizia ad aggiungere esercizi!</li>
                </ul>
              </div>

              {/* Adding Exercises */}
              <div className="assistant-section">
                <h3>➕ Aggiungere Esercizi</h3>
                <p>Per ogni esercizio specifica:</p>
                <ul>
                  <li><strong>Nome:</strong> Nome dell'esercizio (es. "Panca Piana", "Squat")</li>
                  <li><strong>Serie:</strong> Numero di serie (es. 3, 4)</li>
                  <li><strong>Ripetizioni:</strong> Range di ripetizioni (es. "10-12", "8")</li>
                  <li><strong>Peso:</strong> Peso utilizzato (es. "20kg", "50kg")</li>
                  <li><strong>Note:</strong> Dettagli extra (es. "rest 90s", "slow negative")</li>
                </ul>
                <div className="assistant-tip">
                  <p>
                    <strong>💡 Suggerimento:</strong> Gli esercizi vengono ordinati automaticamente
                    in base all'ordine di inserimento. Aggiungili nella sequenza di esecuzione!
                  </p>
                </div>
              </div>

              {/* Workout Types */}
              <div className="assistant-section">
                <h3>🏋️ Tipi di Schede</h3>
                <p><strong>Full Body:</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Allena tutto il corpo in una sessione (2-3 volte a settimana)
                </p>
                <p><strong>Push/Pull/Legs:</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  3 schede separate: Spinta (Push), Tirata (Pull), Gambe (Legs)
                </p>
                <p><strong>Upper/Lower:</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  2 schede: Parte superiore (Upper), Parte inferiore (Lower)
                </p>
              </div>

              {/* Exercise Organization */}
              <div className="assistant-section">
                <h3>📋 Organizzazione Esercizi</h3>
                <p>Struttura consigliata:</p>
                <ul>
                  <li><strong>Inizia</strong> con esercizi multi-articolari (squat, panca, stacchi)</li>
                  <li><strong>Procedi</strong> con esercizi complementari</li>
                  <li><strong>Termina</strong> con esercizi di isolamento</li>
                </ul>
              </div>

              {/* Using at Gym */}
              <div className="assistant-section">
                <h3>📱 Uso in Palestra</h3>
                <p>Durante l'allenamento:</p>
                <ul>
                  <li>Apri la scheda sul telefono prima di iniziare</li>
                  <li>Segui l'ordine degli esercizi come da tabella</li>
                  <li>Controlla serie, ripetizioni e peso per ogni esercizio</li>
                  <li>Leggi le note per dettagli tecnici</li>
                </ul>
                <div className="assistant-tip">
                  <p>
                    <strong>💡 Suggerimento:</strong> Dopo l'allenamento, puoi aggiornare i pesi
                    se hai fatto progressi. Tieni traccia dei tuoi miglioramenti!
                  </p>
                </div>
              </div>

              {/* Progression */}
              <div className="assistant-section">
                <h3>📈 Progressione</h3>
                <p><strong>Principianti:</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Aggiungi 2.5kg ogni settimana sugli esercizi principali
                </p>
                <p><strong>Intermedi:</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Aumenta prima le ripetizioni, poi il peso quando raggiungi il massimo del range
                </p>
                <p><strong>Avanzati:</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Usa periodizzazione: cicli di forza, ipertrofia e deload
                </p>
              </div>

              {/* Volume Guidelines */}
              <div className="assistant-section">
                <h3>🎯 Volume di Allenamento</h3>
                <p>Serie per gruppo muscolare a settimana:</p>
                <ul>
                  <li><strong>Principianti:</strong> 10-15 serie totali</li>
                  <li><strong>Intermedi:</strong> 15-20 serie totali</li>
                  <li><strong>Avanzati:</strong> 20-25+ serie totali</li>
                </ul>
              </div>

              {/* Intensity Zones */}
              <div className="assistant-section">
                <h3>⚡ Zone di Intensità</h3>
                <p>Scegli in base al tuo obiettivo:</p>
                <ul>
                  <li><strong>Forza:</strong> 1-5 reps, peso alto (80-90% max), rest 3-5min</li>
                  <li><strong>Ipertrofia:</strong> 6-12 reps, peso medio (65-85% max), rest 60-90s</li>
                  <li><strong>Resistenza:</strong> 12-20+ reps, peso basso (50-65% max), rest 30-60s</li>
                </ul>
              </div>

              {/* Privacy Note */}
              <div className="assistant-section">
                <h3>🔒 Note Privacy</h3>
                <p>
                  Le schede palestra sono <strong>completamente private</strong>. Nessun altro utente
                  può vedere le tue schede. Non sono condivisibili.
                </p>
              </div>

              {/* Common Issues */}
              <div className="assistant-section">
                <h3>🆘 Problemi Comuni</h3>
                <p><strong>Non posso modificare un esercizio</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Attualmente la modifica non è supportata. Elimina l'esercizio e ricrealo con i dati aggiornati.
                </p>
                <p><strong>Gli esercizi non sono nell'ordine giusto</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  L'ordine è determinato dall'inserimento. Ricrea gli esercizi nell'ordine desiderato.
                </p>
              </div>

              {/* Tips */}
              <div className="assistant-section">
                <h3>💡 Suggerimenti Pro</h3>
                <ul>
                  <li>Usa le note per tracciare record personali (es. "Max: 60kg x 8")</li>
                  <li>Crea schede A/B per variare gli stimoli</li>
                  <li>Mantieni uno storico delle schede precedenti</li>
                  <li>Aggiungi dettagli tecnici nelle note (tempo di recupero, velocità esecuzione)</li>
                </ul>
              </div>
            </div>

            <div className="assistant-actions">
              <button className="assistant-btn assistant-btn-secondary" onClick={() => setIsOpen(false)}>
                Chiudi
              </button>
              <button className="assistant-btn assistant-btn-primary" onClick={openFullGuide}>
                Guida Completa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GymAssistant;
