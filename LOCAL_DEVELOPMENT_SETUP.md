# 🛠️ Setup Sviluppo Locale - Gestionale

Guida completa per configurare l'ambiente di sviluppo locale con Google OAuth.

## 📋 Prerequisiti

- Python 3.11+
- Node.js 18+
- PostgreSQL (tramite Docker)
- Account Google

## 🚀 Setup Rapido

### 1. Clona Repository (se non l'hai già fatto)

```bash
cd /home/matteo/Documenti/GitHub/Gestionale
```

### 2. Setup Database con Docker

```bash
# Avvia PostgreSQL con Docker
docker-compose up -d

# Verifica che sia attivo
docker-compose ps
```

Il database sarà disponibile su:
- Host: `localhost`
- Porta: `5432`
- Database: `gestionale_db`
- User: `gestionale`
- Password: `gestionale123`

### 3. Setup Backend

```bash
cd backend

# Crea file .env
cp .env.example .env

# Modifica .env con le tue credenziali Google
nano .env
```

**Contenuto `.env`**:
```env
# Database (usa quello di docker-compose)
DATABASE_URL=postgresql://gestionale:gestionale123@localhost:5432/gestionale_db

# JWT
SECRET_KEY=dev-secret-key-change-in-production-12345678
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Google OAuth - COMPILA DOPO AVER CREATO CREDENZIALI
GOOGLE_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

**Installa dipendenze**:
```bash
# Crea virtual environment (opzionale ma consigliato)
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# oppure: venv\Scripts\activate  # Windows

# Installa requirements
pip install -r requirements.txt
```

**Avvia backend**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend disponibile su: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### 4. Setup Frontend

```bash
cd ../frontend

# Installa dipendenze
npm install

# Avvia frontend
npm start
```

Frontend disponibile su: `http://localhost:3000`

## 🔐 Configurazione Google OAuth per Localhost

### 1. Vai su Google Cloud Console

Apri: https://console.cloud.google.com/

### 2. Crea/Seleziona Progetto

Se non hai ancora un progetto:
1. Clicca su "Seleziona progetto" in alto
2. "Nuovo progetto"
3. Nome: `Gestionale Dev` (o `Gestionale`)
4. Crea

### 3. Abilita Google+ API

1. Menu laterale → "API e servizi" → "Raccolta"
2. Cerca "Google+ API"
3. Clicca "Abilita"

### 4. Configura Schermata Consenso OAuth

1. Menu laterale → "API e servizi" → "Schermata consenso OAuth"
2. Tipo: **"Esterno"**
3. Clicca "Crea"

**Informazioni app**:
- Nome app: `Gestionale Dev`
- Email supporto: `tua-email@gmail.com`

**Ambiti**:
- Aggiungi ambiti: `email`, `profile`, `openid`

**Utenti di test** (IMPORTANTE per ambiente di test):
- Clicca "Aggiungi utenti"
- Aggiungi la TUA email Gmail che userai per testare
- Salva

Clicca "Salva e continua" fino alla fine.

### 5. Crea Credenziali OAuth (LOCALHOST)

1. Menu laterale → "API e servizi" → "Credenziali"
2. "Crea credenziali" → "ID client OAuth 2.0"

**Tipo applicazione**: `Applicazione web`

**Nome**: `Gestionale Dev - Localhost`

**Origini JavaScript autorizzate** (clicca "+ Aggiungi URI"):
```
http://localhost:3000
http://localhost:8000
http://127.0.0.1:3000
```

**URI di reindirizzamento autorizzati** (clicca "+ Aggiungi URI"):
```
http://localhost:3000/auth/google/callback
http://localhost:8000/api/oauth/google/callback
http://127.0.0.1:3000/auth/google/callback
```

3. Clicca "Crea"

4. **COPIA E SALVA**:
   - Client ID: `123456789-abcdefgh.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abcdefghijklmnop`

### 6. Aggiorna .env Backend

```bash
cd backend
nano .env
```

Incolla i valori che hai copiato:
```env
GOOGLE_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

Salva e chiudi (`Ctrl+X`, `Y`, `Enter`).

### 7. Riavvia Backend

```bash
# Ctrl+C per fermare il server
# Poi riavvia:
uvicorn main:app --reload
```

## ✅ Verifica Configurazione

### 1. Test Backend OAuth Status

Apri browser:
```
http://localhost:8000/api/oauth/google/status
```

Dovresti vedere:
```json
{
  "configured": true,
  "redirect_uri": "http://localhost:3000/auth/google/callback"
}
```

✅ Se vedi `"configured": true`, sei pronto!

❌ Se vedi `"configured": false`:
- Verifica che le variabili in `.env` siano corrette
- Controlla che non ci siano spazi o caratteri extra
- Riavvia il backend

### 2. Test API Docs

Apri:
```
http://localhost:8000/docs
```

Dovresti vedere la documentazione Swagger con:
- Sezione "OAuth" con 3 endpoint
- `/api/oauth/google/login`
- `/api/oauth/google/callback`
- `/api/oauth/google/status`

### 3. Test Frontend

Apri:
```
http://localhost:3000/login
```

Dovresti vedere:
- Form di login standard
- Separatore "oppure"
- Bottone "🔵 Accedi con Google"

## 🧪 Test Completo OAuth

### Flow di Test

1. **Vai su**: `http://localhost:3000/login`

2. **Clicca** "Accedi con Google"

3. **Verifica reindirizzamento**:
   - Dovresti essere reindirizzato a `accounts.google.com`
   - URL contiene il tuo `client_id`

4. **Seleziona account Google**:
   - Usa l'account che hai aggiunto come "utente di test"
   - Se non l'hai aggiunto, vedrai un errore

5. **Autorizza app**:
   - Google chiede di autorizzare l'accesso
   - Accetta

6. **Redirect a frontend**:
   - Dovresti tornare a `http://localhost:3000`
   - Se tutto funziona, sarai loggato automaticamente

7. **Verifica login**:
   - Dovresti vedere la home page
   - Navbar con tuo nome
   - Puoi navigare nell'app

### Controllo Database

Verifica che l'utente sia stato creato:

```bash
# Connettiti al database
docker exec -it gestionale-db psql -U gestionale -d gestionale_db

# Query utenti
SELECT id, email, nome, cognome FROM users;

# Esci
\q
```

Dovresti vedere il tuo utente Google con:
- Email da Google
- Nome e cognome (se forniti da Google)

## 🐛 Troubleshooting Locale

### Errore: "redirect_uri_mismatch"

**Causa**: URI non autorizzato

**Soluzione**:
1. Copia l'URI esatto dall'errore
2. Google Cloud Console → Credenziali → Modifica client
3. Aggiungi l'URI esatto in "URI di reindirizzamento autorizzati"
4. Salva e riprova

**URI comuni da aggiungere**:
- `http://localhost:3000/auth/google/callback`
- `http://127.0.0.1:3000/auth/google/callback`
- `http://localhost:8000/api/oauth/google/callback`

### Errore: "Access blocked: This app's request is invalid"

**Causa**: Utente non in lista test su Google

**Soluzione**:
1. Google Cloud Console → "Schermata consenso OAuth"
2. Scorri fino a "Utenti di test"
3. Clicca "Aggiungi utenti"
4. Aggiungi la tua email Gmail
5. Salva
6. Riprova il login

### Errore: "Google OAuth not configured"

**Causa**: Variabili `.env` non caricate

**Soluzione**:
```bash
# Verifica che .env esista
ls -la backend/.env

# Controlla contenuto
cat backend/.env

# Verifica che le variabili siano corrette (no spazi extra)
# Riavvia backend
cd backend
uvicorn main:app --reload
```

### Errore: "Failed to get user info from Google"

**Causa**: Scope OAuth insufficienti

**Soluzione**:
1. Google Cloud Console → Credenziali
2. Modifica client OAuth
3. Verifica che gli scope includano:
   - `openid`
   - `email`
   - `profile`
4. Salva

### Errore: Database connection failed

**Causa**: PostgreSQL non avviato

**Soluzione**:
```bash
# Verifica containers Docker
docker-compose ps

# Se non attivo, avvia
docker-compose up -d

# Verifica log
docker-compose logs db
```

### Frontend non raggiunge backend

**Causa**: CORS o backend non avviato

**Soluzione**:
```bash
# Verifica backend attivo
curl http://localhost:8000/api/health

# Dovrebbe rispondere: {"status":"healthy"}

# Se non risponde, riavvia backend
cd backend
uvicorn main:app --reload
```

## 📁 Struttura File Locale

```
Gestionale/
├── backend/
│   ├── .env              ← TUE CREDENZIALI GOOGLE (non committare!)
│   ├── .env.example      ← Template .env
│   ├── requirements.txt  ← Dipendenze Python
│   ├── main.py           ← App FastAPI
│   └── routers/
│       └── oauth.py      ← Endpoint Google OAuth
│
├── frontend/
│   ├── src/
│   │   ├── pages/Auth/
│   │   │   ├── Login.js          ← Con bottone Google
│   │   │   ├── Register.js       ← Con bottone Google
│   │   │   └── GoogleCallback.js ← Gestisce redirect
│   │   └── components/
│   │       └── GoogleLoginButton.js ← Bottone Google
│   └── package.json
│
├── docker-compose.yml    ← PostgreSQL locale
└── LOCAL_DEVELOPMENT_SETUP.md ← Questa guida
```

## 🔒 Sicurezza Locale

### Non Committare Secrets!

Il file `.env` contiene credenziali sensibili. È già in `.gitignore`, ma verifica:

```bash
# Controlla che .env sia ignorato
git status

# Non dovrebbe apparire .env

# Se appare, aggiungi a .gitignore
echo "backend/.env" >> .gitignore
```

### Password Sviluppo

Le password nel `.env.example` sono solo per sviluppo:
- **Mai** usarle in produzione
- Sono già pubbliche in questa repo
- Produzione usa variabili Render (sicure)

## 🚀 Workflow Sviluppo

### Avvio Quotidiano

```bash
# 1. Avvia database
docker-compose up -d

# 2. Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# 3. Terminal 2: Frontend
cd frontend
npm start

# 4. Browser
# → http://localhost:3000
```

### Stop Servizi

```bash
# Frontend: Ctrl+C nel terminal

# Backend: Ctrl+C nel terminal

# Database (mantieni dati):
docker-compose stop

# Database (elimina dati):
docker-compose down
```

## 📊 Porte Usate

| Servizio | Porta | URL |
|----------|-------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | localhost:5432 |
| API Docs | 8000 | http://localhost:8000/docs |

## ✅ Checklist Setup Locale

- [ ] Docker installato e avviato
- [ ] `docker-compose up -d` eseguito
- [ ] Database PostgreSQL attivo
- [ ] Progetto creato su Google Cloud Console
- [ ] Google+ API abilitata
- [ ] Schermata consenso OAuth configurata
- [ ] Email aggiunta come "utente di test"
- [ ] Credenziali OAuth create per localhost
- [ ] Client ID e Secret copiati
- [ ] URI di redirect aggiunti (localhost:3000, etc.)
- [ ] File `backend/.env` creato
- [ ] Variabili Google incollate in `.env`
- [ ] Dipendenze backend installate
- [ ] Backend avviato su porta 8000
- [ ] `/api/oauth/google/status` ritorna `configured: true`
- [ ] Dipendenze frontend installate
- [ ] Frontend avviato su porta 3000
- [ ] Bottone Google visibile su `/login`
- [ ] Test login Google funzionante
- [ ] Utente creato nel database

## 🎯 Prossimi Passi

Dopo che il setup locale funziona:

1. **Sviluppa nuove feature** in locale
2. **Testa** con Google OAuth
3. **Commit** codice (senza `.env`!)
4. **Push** su GitHub
5. **Render deploy automatico**
6. **Configura Google OAuth produzione** (vedi `GOOGLE_OAUTH_SETUP.md`)

## 📚 Link Utili

- [Google Cloud Console](https://console.cloud.google.com/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Authlib Docs](https://docs.authlib.org/)
- [React Router](https://reactrouter.com/)

---

**Ultima modifica**: 2025-11-01
**Per**: Sviluppo locale
**Testato su**: Ubuntu Linux, macOS

## 💡 Tips

1. **Usa utente di test**: Aggiungi sempre la tua email come "utente di test" su Google Cloud Console
2. **Riavvia backend**: Dopo modifiche a `.env`, riavvia sempre il backend
3. **Pulisci cache**: Se il login non funziona, prova `localStorage.clear()` in Console browser
4. **Controlla log**: Backend mostra log dettagliati su console
5. **Hot reload**: Backend e frontend si ricaricano automaticamente alle modifiche

Buon sviluppo! 🚀
