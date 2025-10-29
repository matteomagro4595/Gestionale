import React, { useState } from 'react';
import './Assistant.css';

const ExpensesAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openFullGuide = () => {
    // In a real implementation, this would navigate to the full guide
    // For now, we'll just alert
    alert('La guida completa è disponibile in docs/EXPENSES_GUIDE.md');
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="assistant-fab"
        onClick={() => setIsOpen(true)}
        title="Assistente Spese"
      >
        💡
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="assistant-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="assistant-modal" onClick={(e) => e.stopPropagation()}>
            <div className="assistant-header">
              <h2>
                <span>💰</span>
                Assistente Gestione Spese
              </h2>
              <button className="assistant-close" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>

            <div className="assistant-content">
              {/* Quick Start */}
              <div className="assistant-section">
                <h3>🚀 Inizia Subito</h3>
                <p>Per iniziare a gestire le spese:</p>
                <ul>
                  <li>Clicca <strong>"Nuovo Gruppo"</strong> per creare un gruppo spese</li>
                  <li>Dai un nome descrittivo (es. "Vacanza Estate 2025")</li>
                  <li>Condividi il link con gli altri membri</li>
                  <li>Inizia a registrare le spese!</li>
                </ul>
              </div>

              {/* Sharing */}
              <div className="assistant-section">
                <h3>📤 Condivisione</h3>
                <p>Puoi invitare membri in 3 modi:</p>
                <ul>
                  <li><strong>Link diretto:</strong> Copia e invia il link, si uniscono automaticamente</li>
                  <li><strong>Token:</strong> Copia il token, loro lo inseriscono nella pagina "Accedi con Token"</li>
                  <li><strong>WhatsApp:</strong> Invia messaggio pre-compilato direttamente su WhatsApp</li>
                </ul>
              </div>

              {/* Adding Expenses */}
              <div className="assistant-section">
                <h3>➕ Registrare Spese</h3>
                <p>Per ogni spesa indica:</p>
                <ul>
                  <li><strong>Descrizione:</strong> Cosa hai comprato (es. "Cena al ristorante")</li>
                  <li><strong>Importo:</strong> Quanto hai speso in Euro</li>
                  <li><strong>Tag:</strong> Categoria (Cibo, Trasporti, Alloggio, etc.)</li>
                  <li><strong>Chi ha pagato:</strong> Chi ha anticipato i soldi</li>
                  <li><strong>Dividi tra:</strong> Chi deve partecipare alla spesa</li>
                </ul>
              </div>

              {/* Understanding Balances */}
              <div className="assistant-section">
                <h3>💵 Comprendere i Saldi</h3>
                <p>Il sistema calcola automaticamente i saldi:</p>
                <ul>
                  <li><strong>Saldo Positivo (+€):</strong> Hai anticipato soldi, gli altri ti devono</li>
                  <li><strong>Saldo Negativo (-€):</strong> Devi soldi agli altri</li>
                  <li><strong>Saldo Zero (€0.00):</strong> Sei in pari</li>
                </ul>
                <div className="assistant-tip">
                  <p>
                    <strong>💡 Suggerimento:</strong> Controlla regolarmente i saldi nella sezione
                    "Saldi" del gruppo per sapere chi deve soldi a chi.
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="assistant-section">
                <h3>🏷️ Tag Disponibili</h3>
                <p>Usa i tag per categorizzare le spese:</p>
                <ul>
                  <li>🍕 Cibo e Bevande</li>
                  <li>🚗 Trasporti</li>
                  <li>🏠 Alloggio</li>
                  <li>🎉 Intrattenimento</li>
                  <li>🛒 Shopping</li>
                  <li>💊 Salute</li>
                  <li>🔧 Utilità</li>
                  <li>➕ Altro</li>
                </ul>
              </div>

              {/* Notifications */}
              <div className="assistant-section">
                <h3>🔔 Notifiche</h3>
                <p>Ricevi notifiche in tempo reale quando:</p>
                <ul>
                  <li>Un nuovo membro si unisce al gruppo</li>
                  <li>Qualcuno aggiunge una nuova spesa</li>
                  <li>Una spesa viene modificata o eliminata</li>
                </ul>
                <div className="assistant-tip">
                  <p>
                    <strong>💡 Suggerimento:</strong> Clicca sulla campanella in alto per vedere
                    tutte le notifiche. Cliccando su una notifica, verrai portato al gruppo
                    corrispondente.
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="assistant-section">
                <h3>📊 Riepilogo e Statistiche</h3>
                <p>Vai alla pagina <strong>"Riepilogo"</strong> per vedere:</p>
                <ul>
                  <li>Spesa totale su tutti i gruppi</li>
                  <li>Numero di spese registrate</li>
                  <li>Saldo totale complessivo</li>
                  <li>Grafici per tag e per gruppo</li>
                </ul>
              </div>

              {/* Common Issues */}
              <div className="assistant-section">
                <h3>🆘 Problemi Comuni</h3>
                <p><strong>"Non hai accesso a questo gruppo"</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Assicurati di aver usato il link o token corretto. Chiedi al proprietario di inviarti nuovamente il link.
                </p>
                <p><strong>I saldi sembrano sbagliati</strong></p>
                <p style={{ fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  Controlla che tutte le spese siano state registrate correttamente e che i partecipanti siano selezionati giusti.
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

export default ExpensesAssistant;
