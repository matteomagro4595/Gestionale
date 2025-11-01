# ⚡ Quick Start Locale - 5 Minuti

Setup super rapido per testare Google OAuth in locale.

## 🚀 Setup Automatico

```bash
# 1. Esegui script setup
./setup-local.sh

# Questo script:
# ✅ Verifica prerequisiti (Docker, Python, Node)
# ✅ Avvia database PostgreSQL
# ✅ Installa dipendenze backend
# ✅ Installa dipendenze frontend
# ✅ Crea file .env da template
```

## 🔑 Configura Google OAuth (5 minuti)

### 1. Google Cloud Console

Vai su: https://console.cloud.google.com/

**Crea progetto**:
- Nome: `Gestionale Dev`
- Clicca "Crea"

**Abilita API**:
- Menu → "API e servizi" → "Raccolta"
- Cerca "Google+ API"
- Clicca "Abilita"

**Schermata consenso**:
- Menu → "API e servizi" → "Schermata consenso OAuth"
- Tipo: "Esterno"
- Nome app: `Gestionale Dev`
- Email: `tua@email.com`
- **Utenti di test**: Aggiungi la TUA email Gmail
- Salva

**Crea credenziali**:
- Menu → "API e servizi" → "Credenziali"
- "Crea credenziali" → "ID client OAuth 2.0"
- Tipo: "Applicazione web"
- Nome: `Gestionale Localhost`

**Origini autorizzate**:
```
http://localhost:3000
http://localhost:8000
```

**URI redirect**:
```
http://localhost:3000/auth/google/callback
http://localhost:8000/api/oauth/google/callback
```

- Clicca "Crea"
- **COPIA** Client ID e Secret

### 2. Configura .env

```bash
# Apri file .env
nano backend/.env
```

**Incolla le tue credenziali**:
```env
# Sostituisci con i TUOI valori
GOOGLE_CLIENT_ID=123456789-abcd.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tuosecret
```

Salva: `Ctrl+X`, `Y`, `Enter`

## ▶️ Avvia Applicazione

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

**Browser**:
```
http://localhost:3000/login
```

## ✅ Test Login Google

1. Clicca "**🔵 Accedi con Google**"
2. Seleziona account Google (deve essere in "utenti di test")
3. Autorizza app
4. Dovresti essere loggato! 🎉

## 🐛 Problemi?

### "redirect_uri_mismatch"
Aggiungi l'URI esatto su Google Cloud Console → Credenziali

### "Access blocked"
Aggiungi la tua email in "Utenti di test" su Google Cloud Console

### "OAuth not configured"
Verifica che Client ID e Secret siano corretti in `backend/.env`

## 📚 Guide Complete

- **Setup dettagliato**: `LOCAL_DEVELOPMENT_SETUP.md`
- **Google OAuth**: `GOOGLE_OAUTH_SETUP.md`

## 🛑 Stop Servizi

```bash
# Backend/Frontend: Ctrl+C

# Database:
docker-compose stop
```

---

**Tempo totale**: ~5 minuti
**Difficoltà**: ⭐ Facile
