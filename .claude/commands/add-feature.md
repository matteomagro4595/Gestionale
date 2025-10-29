---
description: Guida per aggiungere una nuova feature al progetto
---

Quando l'utente richiede una nuova feature, segui questa procedura sistematica:

## 1. Analisi e Pianificazione
- Comprendi completamente la richiesta dell'utente
- Identifica quali moduli sono coinvolti (Expenses, Shopping, Gym)
- Determina se servono modifiche a:
  - Backend (modelli, API, schemas)
  - Frontend (componenti, pagine, servizi)
  - Database (nuove tabelle, colonne, migrazioni)

## 2. Backend (se necessario)
- Crea/modifica modelli in `backend/models/`
- Crea/modifica schemas Pydantic in `backend/schemas/`
- Crea/modifica router in `backend/routers/`
- Aggiungi validazioni e gestione errori
- Testa gli endpoint con curl o API docs

## 3. Frontend (se necessario)
- Crea/modifica componenti in `frontend/src/components/`
- Crea/modifica pagine in `frontend/src/pages/`
- Aggiorna `frontend/src/services/api.js` con nuove chiamate API
- Aggiungi routing in `App.js` se necessario
- Implementa UI responsive e accessibile

## 4. Integrazione
- Testa l'integrazione completa backend-frontend
- Verifica notifiche WebSocket se applicabile
- Controlla che le autorizzazioni siano corrette
- Verifica mobile responsiveness

## 5. Documentazione (⚠️ OBBLIGATORIO)

**REGOLA FONDAMENTALE: OGNI MODIFICA AL CODICE RICHIEDE AGGIORNAMENTO DOCUMENTAZIONE**

Checklist documentazione da aggiornare:
- [ ] Guide in `docs/` (EXPENSES_GUIDE.md, SHOPPING_GUIDE.md, GYM_GUIDE.md)
- [ ] Assistenti interattivi in `frontend/src/components/` (*Assistant.js)
- [ ] Pagina Help in `frontend/src/pages/Help.js`
- [ ] README.md se la feature è significativa
- [ ] CONTRIBUTING.md se cambiano workflow

**Non procedere al commit senza aver aggiornato la documentazione appropriata!**

## 6. Commit
- Usa git add per staging
- Crea un commit descrittivo seguendo il formato del progetto
- **Menziona nel messaggio quale documentazione è stata aggiornata**
- Include emoji appropriati nel messaggio

## Promemoria

Una feature NON è completa finché la documentazione non è aggiornata. Il codice senza documentazione è codice incompleto.

Vedi `CONTRIBUTING.md` per dettagli completi sul workflow di contribuzione.
