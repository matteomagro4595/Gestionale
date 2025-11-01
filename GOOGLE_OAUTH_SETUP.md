# 🔐 Google OAuth Setup - Gestionale

Guida completa per configurare Google OAuth per il login/registrazione con account Google.

## 📋 Prerequisiti

- Account Google
- Accesso a Google Cloud Console
- App deployata su Render.com

## 🚀 Setup Google Cloud Console

### 1. Crea un Progetto

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Clicca su **"Seleziona progetto"** in alto
3. Clicca su **"Nuovo progetto"**
4. Nome progetto: `Gestionale`
5. Clicca **"Crea"**

### 2. Abilita Google+ API

1. Nel menu laterale, vai su **"API e servizi"** → **"Raccolta"**
2. Cerca **"Google+ API"**
3. Clicca su **"Abilita"**

### 3. Configura Schermata Consenso OAuth

1. Nel menu laterale, vai su **"API e servizi"** → **"Schermata consenso OAuth"**
2. Scegli **"Esterno"** (per permettere a chiunque di accedere)
3. Clicca **"Crea"**

**Informazioni app**:
- Nome app: `Gestionale`
- Email di supporto: `tua-email@gmail.com`
- Logo app: (opzionale)

**Informazioni contatto sviluppatore**:
- Email: `tua-email@gmail.com`

**Ambiti** (scopes):
- `email`
- `profile`
- `openid`

Clicca **"Salva e continua"** fino alla fine.

### 4. Crea Credenziali OAuth

1. Nel menu laterale, vai su **"API e servizi"** → **"Credenziali"**
2. Clicca **"Crea credenziali"** → **"ID client OAuth 2.0"**

**Tipo di applicazione**: `Applicazione web`

**Nome**: `Gestionale Web App`

**Origini JavaScript autorizzate**:
```
http://localhost:3000
https://gestionale-frontend-aa3q.onrender.com
```

**URI di reindirizzamento autorizzati**:
```
http://localhost:3000/auth/google/callback
https://gestionale-frontend-aa3q.onrender.com/auth/google/callback
https://gestionale-backend-ztow.onrender.com/api/oauth/google/callback
```

3. Clicca **"Crea"**

4. **IMPORTANTE**: Copia e salva:
   - **Client ID**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-abcdefghijklmnop`

## 🔧 Configurazione Backend (Locale)

### 1. Crea file `.env` nel backend

```bash
cd backend
nano .env
```

Aggiungi:
```env
GOOGLE_CLIENT_ID=tuo-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tuo-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### 2. Installa Dipendenze

```bash
pip install -r requirements.txt
```

### 3. Avvia Backend

```bash
uvicorn main:app --reload
```

## ☁️ Configurazione Produzione (Render.com)

### 1. Imposta Variabili d'Ambiente su Render

1. Vai su [Render Dashboard](https://dashboard.render.com/)
2. Seleziona il servizio **"gestionale-backend"**
3. Vai su **"Environment"** nel menu laterale
4. Clicca **"Add Environment Variable"**

Aggiungi le seguenti variabili:

**GOOGLE_CLIENT_ID**:
```
il-tuo-client-id.apps.googleusercontent.com
```

**GOOGLE_CLIENT_SECRET**:
```
GOCSPX-il-tuo-client-secret
```

**GOOGLE_REDIRECT_URI**:
```
https://gestionale-frontend-aa3q.onrender.com/auth/google/callback
```

5. Clicca **"Save Changes"**
6. Il backend si riavvierà automaticamente

### 2. Verifica Configurazione

Vai su:
```
https://gestionale-backend-ztow.onrender.com/api/oauth/google/status
```

Dovresti vedere:
```json
{
  "configured": true,
  "redirect_uri": "https://gestionale-frontend-aa3q.onrender.com/auth/google/callback"
}
```

## 🧪 Test Funzionamento

### Test Locale

1. Avvia backend: `uvicorn main:app --reload`
2. Avvia frontend: `npm start`
3. Vai su `http://localhost:3000/login`
4. Clicca **"Accedi con Google"**
5. Dovresti essere reindirizzato a Google
6. Dopo l'autorizzazione, torni all'app con login effettuato

### Test Produzione

1. Vai su `https://gestionale-frontend-aa3q.onrender.com/login`
2. Clicca **"Accedi con Google"**
3. Autorizza l'app
4. Dovresti essere loggato e reindirizzato alla home

## 🔄 Flusso OAuth Completo

```
1. User clicca "Accedi con Google"
   ↓
2. Frontend reindirizza a:
   https://gestionale-backend-ztow.onrender.com/api/oauth/google/login
   ↓
3. Backend reindirizza a Google OAuth:
   https://accounts.google.com/o/oauth2/v2/auth?...
   ↓
4. User autorizza l'app su Google
   ↓
5. Google reindirizza al backend:
   https://gestionale-backend-ztow.onrender.com/api/oauth/google/callback?code=...
   ↓
6. Backend:
   - Scambia code con access token
   - Ottiene user info da Google
   - Crea/aggiorna user nel database
   - Genera JWT token
   ↓
7. Backend reindirizza al frontend:
   https://gestionale-frontend-aa3q.onrender.com/auth/google/success?token=...
   ↓
8. Frontend:
   - Salva token in localStorage
   - Reindirizza alla home
   - User è loggato ✅
```

## 📁 File Modificati

### Backend
- `backend/requirements.txt` - Aggiunte authlib e httpx
- `backend/routers/oauth.py` - Nuovi endpoint OAuth
- `backend/main.py` - Include router OAuth
- `render.yaml` - Variabili d'ambiente Google

### Frontend
- `frontend/src/components/GoogleLoginButton.js` - Bottone Google
- `frontend/src/pages/Auth/Login.js` - Aggiunto bottone
- `frontend/src/pages/Auth/Register.js` - Aggiunto bottone
- `frontend/src/pages/Auth/GoogleCallback.js` - Gestisce callback
- `frontend/src/App.js` - Route per callback

## 🐛 Troubleshooting

### Errore: "Google OAuth not configured"

**Causa**: Variabili d'ambiente non impostate

**Soluzione**:
1. Verifica che `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` siano impostate
2. Riavvia il backend
3. Controlla `/api/oauth/google/status`

### Errore: "redirect_uri_mismatch"

**Causa**: URI di redirect non autorizzato su Google Cloud Console

**Soluzione**:
1. Vai su Google Cloud Console → Credenziali
2. Modifica il client OAuth
3. Aggiungi l'URI esatto che appare nell'errore
4. Salva e riprova

### Errore: "Invalid token"

**Causa**: Token JWT non valido o scaduto

**Soluzione**:
1. Pulisci localStorage: `localStorage.clear()`
2. Effettua nuovamente il login
3. Verifica che `SECRET_KEY` sia configurata nel backend

### User creato ma nome/cognome vuoti

**Causa**: Google non fornisce given_name/family_name

**Soluzione**:
- Il backend usa l'username dall'email come fallback
- L'user può aggiornare il profilo manualmente

## 🔐 Sicurezza

### Best Practices

1. **Non committare secrets su Git**:
   ```bash
   # Aggiungi a .gitignore
   backend/.env
   ```

2. **Usa variabili d'ambiente**:
   - Locale: file `.env`
   - Produzione: Render dashboard

3. **Limita gli scope OAuth**:
   - Chiedi solo `email`, `profile`, `openid`
   - Non richiedere permessi extra

4. **Valida sempre il token**:
   - Il backend verifica il token da Google
   - Genera un JWT separato per l'app

5. **HTTPS in produzione**:
   - Render fornisce automaticamente HTTPS
   - Google richiede HTTPS per OAuth

## 📊 Monitoraggio

### Google Cloud Console

Puoi monitorare l'utilizzo OAuth su:
- **"API e servizi"** → **"Dashboard"**
- Vedi numero di login con Google
- Vedi errori OAuth

### Backend Logs

Controlla i log su Render:
```
Dashboard → gestionale-backend → Logs
```

Cerca:
- `OAuth login initiated`
- `OAuth callback received`
- `User created/logged in via Google`

## 🎯 Vantaggi Google OAuth

✅ **Per l'utente**:
- Login veloce senza creare password
- Non deve ricordare altra password
- Fiducia nel brand Google

✅ **Per l'app**:
- Meno abbandoni durante registrazione
- Email già verificata
- Autenticazione sicura

✅ **Per lo sviluppatore**:
- Non gestire reset password
- Meno support per problemi login
- Scalabile e affidabile

## 🔗 Link Utili

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Authlib Documentation](https://docs.authlib.org/)
- [Render Environment Variables](https://render.com/docs/environment-variables)

## 📝 Checklist Setup

- [ ] Progetto creato su Google Cloud Console
- [ ] Google+ API abilitata
- [ ] Schermata consenso OAuth configurata
- [ ] Credenziali OAuth create
- [ ] Client ID e Secret copiati
- [ ] URI di redirect autorizzati aggiunti
- [ ] Variabili d'ambiente impostate su Render
- [ ] Backend ridistribuito
- [ ] Test login locale funzionante
- [ ] Test login produzione funzionante
- [ ] User creato correttamente nel database

---

**Ultima modifica**: 2025-11-01
**Versione**: 1.0.0
**Status**: ✅ Pronto per produzione
