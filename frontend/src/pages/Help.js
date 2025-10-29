import React, { useState } from 'react';
import './Help.css';

const Help = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = {
    overview: {
      title: '📊 Panoramica Generale',
      content: (
        <>
          <p>
            <strong>Gestionale</strong> è un'applicazione web all-in-one che integra tre moduli
            principali per aiutarti a organizzare la vita quotidiana:
          </p>
          <div className="help-modules">
            <div className="help-module-card" onClick={() => setActiveSection('expenses')}>
              <span className="help-module-icon">💰</span>
              <h3>Gestione Spese</h3>
              <p>Condividi e traccia le spese con amici, familiari o coinquilini</p>
            </div>
            <div className="help-module-card" onClick={() => setActiveSection('shopping')}>
              <span className="help-module-icon">🛒</span>
              <h3>Lista della Spesa</h3>
              <p>Crea liste collaborative e coordina gli acquisti</p>
            </div>
            <div className="help-module-card" onClick={() => setActiveSection('gym')}>
              <span className="help-module-icon">💪</span>
              <h3>Schede Palestra</h3>
              <p>Organizza i tuoi allenamenti e traccia i progressi</p>
            </div>
          </div>
          <div className="help-tip">
            <strong>💡 Suggerimento:</strong> Tutti i moduli sono integrati con un sistema di
            autenticazione unificato e notifiche in tempo reale.
          </div>
        </>
      ),
    },
    gettingStarted: {
      title: '🚀 Iniziare',
      content: (
        <>
          <h3>Registrazione e Login</h3>
          <ol>
            <li>
              <strong>Registrazione:</strong> Vai alla pagina di registrazione e compila nome,
              cognome, email e password
            </li>
            <li>
              <strong>Login:</strong> Usa email e password per accedere
            </li>
            <li>
              <strong>Sessione:</strong> La sessione dura 72 ore. Verrai automaticamente
              disconnesso alla scadenza
            </li>
          </ol>

          <h3>Navigazione</h3>
          <p>La barra di navigazione superiore ti permette di:</p>
          <ul>
            <li>Tornare alla Home cliccando sul logo</li>
            <li>Accedere rapidamente a ogni modulo (Spese, Lista Spesa, Palestra)</li>
            <li>Vedere le notifiche in tempo reale (campanella 🔔)</li>
            <li>Accedere al menu utente per logout</li>
          </ul>

          <div className="help-tip">
            <strong>💡 Suggerimento:</strong> L'interfaccia cambia colore in base al modulo attivo
            per una migliore esperienza visiva.
          </div>
        </>
      ),
    },
    notifications: {
      title: '🔔 Sistema Notifiche',
      content: (
        <>
          <h3>Come Funziona</h3>
          <p>
            Il sistema notifiche utilizza <strong>WebSocket</strong> per aggiornamenti in tempo
            reale:
          </p>
          <ul>
            <li>Connessione automatica al login</li>
            <li>Notifiche istantanee senza ricaricare la pagina</li>
            <li>Supporto multi-dispositivo</li>
            <li>Auto-riconnessione in caso di perdita di connessione</li>
          </ul>

          <h3>Gestire le Notifiche</h3>
          <ol>
            <li>Clicca sulla campanella 🔔 nella barra di navigazione</li>
            <li>Vedi l'elenco completo delle notifiche</li>
            <li>Il badge rosso indica il numero di notifiche non lette</li>
            <li>L'indicatore verde mostra che la connessione WebSocket è attiva</li>
          </ol>

          <h3>Notifiche Browser</h3>
          <p>
            Se accetti i permessi browser, riceverai notifiche anche quando l'app è in background.
          </p>

          <div className="help-tip">
            <strong>💡 Suggerimento:</strong> Clicca su una notifica per essere portato
            direttamente alla risorsa associata (gruppo o lista).
          </div>
        </>
      ),
    },
    expenses: {
      title: '💰 Gestione Spese',
      content: (
        <>
          <h3>Cosa Puoi Fare</h3>
          <ul>
            <li>Creare gruppi spese per progetti, vacanze, coinquilini</li>
            <li>Invitare membri tramite link, token o WhatsApp</li>
            <li>Registrare spese con tag e partecipanti</li>
            <li>Calcolare automaticamente i saldi</li>
            <li>Visualizzare chi deve soldi a chi</li>
            <li>Monitorare statistiche e riepilogo</li>
          </ul>

          <h3>Iniziare</h3>
          <ol>
            <li>Vai alla pagina Spese</li>
            <li>Clicca "Nuovo Gruppo"</li>
            <li>Dai un nome descrittivo (es. "Vacanza Estate 2025")</li>
            <li>Condividi il link con gli altri membri</li>
            <li>Inizia a registrare le spese!</li>
          </ol>

          <h3>Tag Disponibili</h3>
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

          <h3>Comprendere i Saldi</h3>
          <ul>
            <li>
              <strong>Saldo Positivo (+€):</strong> Hai anticipato soldi, gli altri ti devono
            </li>
            <li>
              <strong>Saldo Negativo (-€):</strong> Devi soldi agli altri
            </li>
            <li>
              <strong>Saldo Zero (€0.00):</strong> Sei in pari
            </li>
          </ul>

          <div className="help-tip">
            <strong>💡 Suggerimento:</strong> Clicca sull'icona 💡 nella pagina Spese per
            l'assistente interattivo con ulteriori dettagli.
          </div>
        </>
      ),
    },
    shopping: {
      title: '🛒 Lista della Spesa',
      content: (
        <>
          <h3>Cosa Puoi Fare</h3>
          <ul>
            <li>Creare liste della spesa condivise</li>
            <li>Condividere via link, token o WhatsApp</li>
            <li>Aggiungere articoli con quantità e note</li>
            <li>Sistema anti-duplicati con autocomplete</li>
            <li>Segnare articoli come completati</li>
            <li>Ordinamento automatico intelligente</li>
          </ul>

          <h3>Iniziare</h3>
          <ol>
            <li>Vai alla pagina Lista Spesa</li>
            <li>Clicca "Nuova Lista"</li>
            <li>Dai un nome descrittivo (es. "Spesa Settimanale")</li>
            <li>Condividi con famiglia o coinquilini</li>
            <li>Inizia ad aggiungere articoli!</li>
          </ol>

          <h3>Sistema Anti-Duplicati</h3>
          <p>Quando inizi a scrivere, vedrai suggerimenti in tempo reale:</p>
          <ul>
            <li>
              <strong>Suggerimenti Blu (✓):</strong> Articoli già completati - clicca per
              riattivarli
            </li>
            <li>
              <strong>Suggerimenti Rossi (⚠):</strong> Articoli già nella lista da comprare
            </li>
          </ul>

          <h3>Ordinamento Intelligente</h3>
          <p>Gli articoli sono ordinati automaticamente:</p>
          <ul>
            <li>Articoli da comprare in alto, ordinati alfabeticamente</li>
            <li>Articoli completati in fondo, ordinati alfabeticamente</li>
            <li>L'ordine si aggiorna in tempo reale</li>
          </ul>

          <div className="help-tip">
            <strong>💡 Suggerimento:</strong> Clicca sull'icona 💡 nella pagina Lista Spesa per
            l'assistente interattivo con ulteriori dettagli.
          </div>
        </>
      ),
    },
    gym: {
      title: '💪 Schede Palestra',
      content: (
        <>
          <h3>Cosa Puoi Fare</h3>
          <ul>
            <li>Creare schede di allenamento personalizzate</li>
            <li>Aggiungere esercizi con serie, ripetizioni, peso</li>
            <li>Organizzare esercizi in ordine di esecuzione</li>
            <li>Tracciare progressi e note per ogni esercizio</li>
            <li>Gestire multiple schede (Push/Pull/Legs, Upper/Lower, etc.)</li>
          </ul>

          <h3>Iniziare</h3>
          <ol>
            <li>Vai alla pagina Palestra</li>
            <li>Clicca "Nuova Scheda"</li>
            <li>Dai un nome (es. "Scheda A", "Upper Body")</li>
            <li>Aggiungi una descrizione (opzionale)</li>
            <li>Inizia ad aggiungere esercizi!</li>
          </ol>

          <h3>Tipi di Schede</h3>
          <ul>
            <li>
              <strong>Full Body:</strong> Allena tutto il corpo in una sessione (2-3 volte a
              settimana)
            </li>
            <li>
              <strong>Push/Pull/Legs:</strong> 3 schede separate: Spinta, Tirata, Gambe
            </li>
            <li>
              <strong>Upper/Lower:</strong> 2 schede: Parte superiore, Parte inferiore
            </li>
          </ul>

          <h3>Volume di Allenamento</h3>
          <p>Serie per gruppo muscolare a settimana:</p>
          <ul>
            <li>
              <strong>Principianti:</strong> 10-15 serie totali
            </li>
            <li>
              <strong>Intermedi:</strong> 15-20 serie totali
            </li>
            <li>
              <strong>Avanzati:</strong> 20-25+ serie totali
            </li>
          </ul>

          <div className="help-tip">
            <strong>💡 Suggerimento:</strong> Clicca sull'icona 💡 nella pagina Palestra per
            l'assistente interattivo con ulteriori dettagli.
          </div>

          <div className="help-warning">
            <strong>🔒 Privacy:</strong> Le schede palestra sono completamente private. Non sono
            condivisibili con altri utenti.
          </div>
        </>
      ),
    },
    sharing: {
      title: '📤 Condivisione',
      content: (
        <>
          <h3>Metodi di Condivisione</h3>
          <p>Sia le Spese che le Liste della Spesa supportano 3 metodi di condivisione:</p>

          <h4>1. Link Diretto</h4>
          <ol>
            <li>Apri il gruppo/lista</li>
            <li>Clicca "Copia Link"</li>
            <li>Invia il link a chi vuoi</li>
            <li>Quando aprono il link, si uniscono automaticamente</li>
          </ol>

          <h4>2. Token Manuale</h4>
          <ol>
            <li>Apri il gruppo/lista</li>
            <li>Clicca "Copia Token"</li>
            <li>Invia solo il token (codice alfanumerico)</li>
            <li>Gli altri possono inserirlo nella pagina "Accedi con Token"</li>
          </ol>

          <h4>3. WhatsApp</h4>
          <ol>
            <li>Clicca "📱 Condividi su WhatsApp"</li>
            <li>Si apre WhatsApp con messaggio pre-compilato</li>
            <li>Seleziona contatto o gruppo</li>
            <li>Invia il messaggio con link</li>
          </ol>

          <h3>Gestione Membri</h3>
          <ul>
            <li>
              <strong>Proprietario (👑):</strong> Chi ha creato la risorsa, può eliminarla
            </li>
            <li>
              <strong>Membri:</strong> Chi si è unito, possono aggiungere/modificare contenuti
            </li>
          </ul>

          <div className="help-warning">
            <strong>⚠️ Sicurezza:</strong> Non condividere pubblicamente i token. Solo chi ha il
            token può accedere alla risorsa.
          </div>
        </>
      ),
    },
    security: {
      title: '🔐 Sicurezza e Privacy',
      content: (
        <>
          <h3>Autenticazione</h3>
          <ul>
            <li>Sistema basato su JWT (JSON Web Token)</li>
            <li>Password hashate con bcrypt</li>
            <li>Token inviato in ogni richiesta API</li>
            <li>Logout automatico alla scadenza (72 ore)</li>
          </ul>

          <h3>Privacy Dati</h3>
          <ul>
            <li>
              <strong>Gruppi Spese:</strong> Visibili solo ai membri
            </li>
            <li>
              <strong>Liste Spesa:</strong> Visibili solo ai membri
            </li>
            <li>
              <strong>Schede Palestra:</strong> Visibili solo al proprietario (non condivisibili)
            </li>
            <li>Token di condivisione: Unici e non indicizzati</li>
          </ul>

          <h3>Best Practices</h3>
          <ul>
            <li>✅ Usa password forti (minimo 8 caratteri, mix lettere/numeri/simboli)</li>
            <li>✅ Non condividere pubblicamente i token di gruppi/liste</li>
            <li>✅ Controlla periodicamente i membri dei tuoi gruppi/liste</li>
            <li>⚠️ Effettua logout su dispositivi condivisi</li>
            <li>⚠️ Non salvare la password nel browser su PC pubblici</li>
          </ul>
        </>
      ),
    },
    troubleshooting: {
      title: '🆘 Risoluzione Problemi',
      content: (
        <>
          <h3>Login/Autenticazione</h3>

          <h4>"Credenziali non valide"</h4>
          <ul>
            <li>Controlla email e password</li>
            <li>Email è case-sensitive</li>
            <li>Assicurati di aver completato la registrazione</li>
          </ul>

          <h4>"Sessione scaduta"</h4>
          <ul>
            <li>Sono passate più di 72 ore dall'ultimo login</li>
            <li>Effettua nuovamente il login</li>
          </ul>

          <h3>Notifiche</h3>

          <h4>Non ricevo notifiche</h4>
          <ul>
            <li>Controlla l'indicatore verde sulla campanella</li>
            <li>Se non c'è, la connessione WebSocket è persa - ricarica la pagina</li>
            <li>Verifica connessione internet</li>
          </ul>

          <h4>Notifiche browser non funzionano</h4>
          <ul>
            <li>Controlla permessi browser (Impostazioni → Notifiche)</li>
            <li>Assicurati di aver accettato il permesso</li>
          </ul>

          <h3>Condivisione</h3>

          <h4>"Non hai accesso a questa risorsa"</h4>
          <ul>
            <li>Il link/token potrebbe essere errato</li>
            <li>La risorsa potrebbe essere stata eliminata</li>
            <li>Chiedi al proprietario un nuovo link</li>
          </ul>

          <h3>Sincronizzazione</h3>

          <h4>Le modifiche non appaiono</h4>
          <ul>
            <li>Controlla connessione internet</li>
            <li>Ricarica la pagina</li>
            <li>Verifica che l'altro utente abbia salvato</li>
          </ul>

          <h4>Vedo dati vecchi</h4>
          <ul>
            <li>Forza refresh: Ctrl+F5 (PC) o Cmd+Shift+R (Mac)</li>
            <li>Cancella cache browser</li>
            <li>Disconnettiti e riconnettiti</li>
          </ul>
        </>
      ),
    },
    faq: {
      title: '❓ Domande Frequenti',
      content: (
        <>
          <h3>Generali</h3>

          <h4>Posso usare l'app offline?</h4>
          <p>No, serve connessione internet per sincronizzare i dati con gli altri membri.</p>

          <h4>I miei dati sono sicuri?</h4>
          <p>
            Sì, password hashate, token JWT, dati accessibili solo ai membri autorizzati.
          </p>

          <h4>Posso cambiare email o password?</h4>
          <p>Attualmente non implementato. Contatta l'assistenza se necessario.</p>

          <h4>Quanti gruppi/liste/schede posso creare?</h4>
          <p>Nessun limite, crea quante risorse vuoi.</p>

          <h3>Spese</h3>

          <h4>Supporta valute diverse dall'Euro?</h4>
          <p>No, attualmente solo Euro (€).</p>

          <h4>Posso modificare una spesa?</h4>
          <p>Sì, clicca sulla spesa e modifica i campi.</p>

          <h3>Liste Spesa</h3>

          <h4>Gli articoli completati vengono eliminati?</h4>
          <p>
            No, restano nella lista ma vanno in fondo. Puoi eliminarli manualmente se vuoi.
          </p>

          <h4>Posso ordinare la lista manualmente?</h4>
          <p>
            No, l'ordine è automatico: alfabetico per non completati, completati in fondo.
          </p>

          <h3>Palestra</h3>

          <h4>Posso condividere le schede?</h4>
          <p>No, le schede sono personali e private.</p>

          <h4>Posso modificare un esercizio?</h4>
          <p>Attualmente no, eliminalo e ricrealo con dati aggiornati.</p>
        </>
      ),
    },
  };

  return (
    <div className="help-container">
      <div className="help-sidebar">
        <h2>📚 Centro Assistenza</h2>
        <nav className="help-nav">
          {Object.entries(sections).map(([key, section]) => (
            <button
              key={key}
              className={`help-nav-item ${activeSection === key ? 'active' : ''}`}
              onClick={() => setActiveSection(key)}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="help-content">
        <div className="help-content-inner">
          <h1>{sections[activeSection].title}</h1>
          <div className="help-content-body">{sections[activeSection].content}</div>

          <div className="help-footer">
            <p>
              <strong>Hai bisogno di ulteriore aiuto?</strong>
            </p>
            <p>
              Consulta gli assistenti interattivi disponibili in ogni modulo cliccando sull'icona
              💡 nell'angolo in basso a destra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
