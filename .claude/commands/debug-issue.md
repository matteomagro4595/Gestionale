---
description: Debug di problemi e errori nel progetto
---

Quando si verifica un errore o problema, segui questo processo di debug sistematico:

## 1. Raccolta Informazioni
- Chiedi all'utente di descrivere esattamente il problema
- Identifica quale modulo è coinvolto (Expenses/Shopping/Gym/Auth/Notifications)
- Determina se il problema è frontend, backend o integrazione

## 2. Verifica Servizi
- Controlla che tutti i container Docker siano attivi: `docker-compose ps`
- Verifica i log recenti per errori:
  - Backend: `docker-compose logs --tail=100 backend | grep -i error`
  - Frontend: `docker-compose logs --tail=100 frontend | grep -i error`
  - Database: `docker-compose logs --tail=100 db | grep -i error`

## 3. Debug Backend (se applicabile)
- Controlla i modelli in `backend/models/` per relazioni errate
- Verifica gli endpoint in `backend/routers/` per errori logici
- Controlla le query del database
- Verifica le autorizzazioni e autenticazione JWT
- Testa endpoint con curl o API docs: http://localhost:8000/docs

## 4. Debug Frontend (se applicabile)
- Controlla la console browser per errori JavaScript
- Verifica le chiamate API in `frontend/src/services/api.js`
- Controlla che gli stati React siano gestiti correttamente
- Verifica che le props siano passate correttamente ai componenti
- Controlla routing in App.js

## 5. Debug WebSocket (se problema con notifiche)
- Verifica connessione WebSocket nella console browser
- Controlla `backend/websocket_manager.py` per problemi di connessione
- Verifica che le notifiche vengano create correttamente in `backend/utils/notifications.py`

## 6. Debug Database
- Verifica schema database
- Controlla foreign keys e vincoli
- Verifica che le migrazioni siano state applicate
- Test query SQL direttamente se necessario

## 7. Soluzione e Test
- Implementa la fix identificata
- Testa in modo completo la funzionalità corretta
- Verifica che non ci siano regressioni
- Documenta la soluzione se è un problema comune

## 8. Commit
- Crea commit con messaggio descrittivo: "fix: descrizione del problema risolto"
- Include dettagli tecnici nel corpo del commit se necessario

Usa questo approccio sistematico per risolvere problemi in modo efficiente.
