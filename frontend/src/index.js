import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registra il service worker per abilitare la PWA
// Se vuoi disabilitare la PWA, cambia register() con unregister()
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('PWA installata con successo!');
    console.log('L\'app è ora disponibile offline.');
  },
  onUpdate: (registration) => {
    console.log('Nuova versione disponibile!');
    // Puoi mostrare un messaggio all'utente qui
    // Per forzare l'aggiornamento:
    // serviceWorkerRegistration.updateServiceWorker(registration);

    // Notifica l'utente del nuovo aggiornamento
    if (window.confirm('Nuova versione disponibile! Vuoi aggiornare?')) {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }
});
