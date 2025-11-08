// Questo file gestisce la registrazione del service worker per la PWA

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    // L'URL del service worker deve essere relativo alla root
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // In localhost, controlla se il service worker esiste
        checkValidServiceWorker(swUrl, config);

        navigator.serviceWorker.ready.then(() => {
          console.log(
            'Questa app è servita da un service worker in modalità localhost. ' +
            'Per saperne di più: https://cra.link/PWA'
          );
        });
      } else {
        // In produzione, registra il service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker registrato con successo:', registration);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Nuovo contenuto disponibile, mostra notifica all'utente
              console.log(
                'Nuovo contenuto disponibile. Chiudi tutte le schede per aggiornare.'
              );

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Il contenuto è stato cachato per l'uso offline
              console.log('Contenuto cachato per uso offline.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Errore durante la registrazione del Service Worker:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' }
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service Worker non trovato o non è un file JS
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service Worker trovato, procedi normalmente
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('Nessuna connessione internet. App in modalità offline.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Errore durante la deregistrazione del Service Worker:', error);
      });
  }
}

// Funzione helper per aggiornare il service worker
export function updateServiceWorker(registration) {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

// Funzione helper per controllare lo stato online/offline
export function checkOnlineStatus() {
  return navigator.onLine;
}

// Event listeners per online/offline
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Connessione internet ripristinata');
  });

  window.addEventListener('offline', () => {
    console.log('Connessione internet persa. Modalità offline attiva.');
  });
}
