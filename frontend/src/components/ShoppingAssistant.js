import React, { useState } from 'react';
import './Assistant.css';

const ShoppingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openFullGuide = () => {
    alert('La guida completa è disponibile in docs/SHOPPING_GUIDE.md');
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="assistant-fab"
        onClick={() => setIsOpen(true)}
        title="Assistente Lista Spesa"
      >
        💡
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="assistant-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="assistant-modal" onClick={(e) => e.stopPropagation()}>
            <div className="assistant-header">
              <h2>
                <span>🛒</span>
                Assistente Lista della Spesa
              </h2>
              <button className="assistant-close" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>

            <div className="assistant-content">
              {/* Quick Start */}
              <div className="assistant-section">
                <h3>🚀 Inizia Subito</h3>
                <p>Per creare una lista condivisa:</p>
                <ul>
                  <li>Clicca <strong>"Nuova Lista"</strong></li>
                  <li>Dai un nome descrittivo (es. "Spesa Settimanale")</li>
                  <li>Condividi il link con famiglia o coinquilini</li>
                  <li>Inizia ad aggiungere articoli!</li>
                </ul>
              </div>

              {/* Sharing */}
              <div className="assistant-section">
                <h3>📤 Condivisione</h3>
                <p>Puoi condividere la lista in 3 modi:</p>
                <ul>
                  <li><strong>WhatsApp:</strong> Invia direttamente su WhatsApp con messaggio pre-compilato</li>
                  <li><strong>Link:</strong> Copia e invia il link, si uniscono automaticamente</li>
                  <li><strong>Token:</strong> Condividi solo il codice token</li>
                </ul>
              </div>

              {/* Adding Items */}
              <div className="assistant-section">
                <h3>➕ Aggiungere Articoli</h3>
                <p>Per ogni articolo puoi specificare:</p>
                <ul>
                  <li><strong>Nome:</strong> Il prodotto da comprare (es. "Latte")</li>
                  <li><strong>Quantità:</strong> Quanto serve (es. "2 litri", "1 confezione")</li>
                  <li><strong>Note:</strong> Dettagli extra (es. "intero", "senza lattosio")</li>
                </ul>
              </div>

              {/* Anti-Duplicate System */}
              <div className="assistant-section">
                <h3>🔍 Sistema Anti-Duplicati</h3>
                <p>Quando inizi a scrivere, vedrai suggerimenti in tempo reale:</p>
                <ul>
                  <li><strong>Suggerimenti Blu (✓):</strong> Articoli già completati - clicca per riattivarli</li>
                  <li><strong>Suggerimenti Rossi (⚠):</strong> Articoli già nella lista da comprare</li>
                </ul>
                <div className="assistant-tip">
                  <p>
                    <strong>💡 Suggerimento:</strong> Invece di creare duplicati, clicca sui
                    suggerimenti blu per riattivare articoli già comprati. Risparmia tempo!
                  </p>
                </div>
              </div>

              {/* Checking Items */}
              <div className="assistant-section">
                <h3>✓ Completare Articoli</h3>
                <p>Quando compri un articolo:</p>
                <ul>
                  <li>Spunta la checkbox accanto al nome</li>
                  <li>L'articolo viene segnato come completato</li>
                  <li>Gli altri membri vedono chi l'ha completato</li>
                  <li>L'articolo va automaticamente in fondo alla lista</li>
                </ul>
              </div>

              {/* Smart Sorting */}
              <div className="assistant-section">
                <h3>📋 Ordinamento Intelligente</h3>
                <p>Gli articoli sono ordinati automaticamente:</p>
                <ul>
                  <li>Articoli da comprare <strong>in alto</strong>, ordinati alfabeticamente</li>
                  <li>Articoli completati <strong>in fondo</strong>, ordinati alfabeticamente</li>
                  <li>L'ordine si aggiorna in tempo reale mentre compri</li>
                </ul>
              </div>

              {/* Collaboration */}
              <div className="assistant-section">
                <h3>👥 Collaborazione</h3>
                <p>Nella lista vedi:</p>
                <ul>
                  <li><strong>Proprietario:</strong> Chi ha creato la lista (icona corona 👑)</li>
                  <li><strong>Membri:</strong> Chi ha accesso alla lista</li>
                  <li><strong>Chi ha completato:</strong> Chi ha spuntato ogni articolo</li>
                </ul>
                <div className="assistant-tip">
                  <p>
                    <strong>💡 Suggerimento:</strong> Tutti possono aggiungere e completare articoli.
                    Solo il proprietario può eliminare la lista.
                  </p>
                </div>
              </div>

              {/* Notifications */}
              <div className="assistant-section">
                <h3>🔔 Notifiche</h3>
                <p>Ricevi notifiche quando:</p>
                <ul>
                  <li>Un nuovo membro si unisce alla lista</li>
                  <li>Qualcuno aggiunge un articolo</li>
                  <li>Un articolo viene completato</li>
                </ul>
              </div>

              {/* Use Cases */}
              <div className="assistant-section">
                <h3>🎯 Scenari d'Uso</h3>
                <p><strong>In Famiglia:</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Tutti aggiungono quello che serve durante la settimana. Chi va al super spunta gli articoli mentre compra.
                </p>
                <p><strong>Con Coinquilini:</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Lista condivisa per coordinare gli acquisti. Chi va prima compra per tutti.
                </p>
                <p><strong>Per Eventi:</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Organizza una cena o festa. Ognuno aggiunge cosa porta, evitando doppioni.
                </p>
              </div>

              {/* Common Issues */}
              <div className="assistant-section">
                <h3>🆘 Problemi Comuni</h3>
                <p><strong>"Non hai accesso a questa lista"</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Verifica di aver usato il link o token corretto. Chiedi al proprietario un nuovo link.
                </p>
                <p><strong>I suggerimenti non compaiono</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Assicurati di aver scritto almeno 1 carattere e che ci siano articoli corrispondenti.
                </p>
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

export default ShoppingAssistant;
