# Guida per Contribuire

Grazie per il tuo interesse nel contribuire a Gestionale! 🎉

## ⚠️ REGOLA FONDAMENTALE

**OGNI MODIFICA AL CODICE DEVE ESSERE ACCOMPAGNATA DA UN AGGIORNAMENTO DELLA DOCUMENTAZIONE**

Questa è la regola più importante del progetto. Non è opzionale.

## Documentazione da Aggiornare

Quando apporti modifiche, aggiorna **sempre** la documentazione appropriata:

### 📚 Guide Modulo-Specifiche (`docs/`)
- `EXPENSES_GUIDE.md` - per modifiche al modulo Spese
- `SHOPPING_GUIDE.md` - per modifiche al modulo Lista Spesa
- `GYM_GUIDE.md` - per modifiche al modulo Palestra

### 🤖 Assistenti Interattivi (`frontend/src/components/`)
- `ExpensesAssistant.js` - per nuove funzionalità o modifiche alle Spese
- `ShoppingAssistant.js` - per nuove funzionalità o modifiche alla Lista Spesa
- `GymAssistant.js` - per nuove funzionalità o modifiche alla Palestra

### 📖 Pagina Aiuto (`frontend/src/pages/Help.js`)
- Aggiorna se la modifica impatta l'esperienza utente
- Aggiungi nuove sezioni per feature importanti
- Aggiorna le FAQ se necessario

### 📋 README Principale
- Aggiorna la sezione "Funzionalità" per feature nuove
- Aggiorna requisiti se cambiano dipendenze

## Workflow per Aggiungere una Feature

### 1. Analisi e Pianificazione
- Comprendi completamente la richiesta
- Identifica quali moduli sono coinvolti
- **Pianifica quali documenti dovrai aggiornare**

### 2. Implementazione Backend
```
backend/
├── models/         # Modelli SQLAlchemy
├── schemas/        # Schemi Pydantic
└── routers/        # Endpoint API
```

### 3. Implementazione Frontend
```
frontend/src/
├── components/     # Componenti riutilizzabili
├── pages/         # Pagine principali
└── services/      # Chiamate API
```

### 4. Testing
- Testa backend con API docs (`/docs`)
- Testa frontend su desktop e mobile
- Verifica integrazioni WebSocket

### 5. **📝 DOCUMENTAZIONE (OBBLIGATORIO)**
Checklist completa:
- [ ] Aggiornata guida in `docs/` appropriata
- [ ] Aggiornato assistente interattivo se applicabile
- [ ] Aggiornata pagina Help se necessario
- [ ] Aggiornato README se feature è significativa
- [ ] Aggiunte istruzioni per nuove dipendenze

### 6. Commit
```bash
git add .
git commit -m "tipo: descrizione

Dettagli della modifica...

Documentazione aggiornata:
- NOME_FILE.md - cosa è stato aggiornato
- NomeAssistant.js - cosa è stato aggiornato
"
```

## Tipi di Commit

- `feat:` - Nuova feature
- `fix:` - Bug fix
- `refactor:` - Refactoring senza cambio funzionalità
- `docs:` - Solo documentazione
- `style:` - Formattazione, CSS
- `perf:` - Miglioramenti performance
- `test:` - Aggiunta test

## Esempio Completo

**Scenario**: Aggiunta modifica esercizio in scheda palestra

**Implementazione**:
1. ✅ Backend già disponibile (`PUT /api/gym/cards/{id}/exercises/{id}`)
2. ✅ Aggiunto modal edit in `GymCardDetail.js`
3. ✅ Aggiunto pulsante "Modifica" nella UI

**Documentazione** (TUTTE obbligatorie):
1. ✅ `docs/GYM_GUIDE.md` - aggiunta sezione "Modificare un Esercizio"
2. ✅ `GymAssistant.js` - aggiunta sezione "Modificare Esercizi"
3. ✅ `Help.js` - aggiornata sezione Palestra con gestione esercizi
4. ✅ Commit con messaggio descrittivo

## Risorse Utili

### Claude Code
Se usi Claude Code, il progetto include comandi slash utili:
- `/add-feature` - Workflow guidato per nuove feature
- `/check-services` - Verifica stato servizi
- `/dev-setup` - Setup ambiente sviluppo

### API Documentation
- Backend API: `http://localhost:8000/docs`
- WebSocket: `ws://localhost:8000/ws/{user_id}`

### Struttura Documentazione
```
docs/
├── EXPENSES_GUIDE.md      # Guida completa modulo Spese
├── SHOPPING_GUIDE.md      # Guida completa modulo Shopping
├── GYM_GUIDE.md          # Guida completa modulo Palestra
└── ARCHITECTURE.md       # (futuro) Architettura sistema
```

## Domande?

Se hai dubbi su quale documentazione aggiornare, segui questa regola:

> "Se ho modificato del codice, almeno un file di documentazione DEVE essere aggiornato"

In caso di dubbi, apri una issue per chiedere chiarimenti.

## Note Finali

La documentazione è ciò che rende il progetto accessibile ai nuovi contributori e utenti. Non è un extra, è parte integrante del codice. Un codice non documentato è un codice incompleto.

Grazie per mantenere Gestionale ben documentato! 🙏
