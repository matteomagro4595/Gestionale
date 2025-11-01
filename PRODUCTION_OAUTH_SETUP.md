# Configurazione Google OAuth per Produzione (Render.com)

Guida per configurare l'autenticazione Google OAuth nell'ambiente di produzione su Render.com.

## 📋 Prerequisiti

- Account Google Cloud Console
- Progetto già configurato per OAuth (vedi GOOGLE_OAUTH_SETUP.md)
- Deploy su Render.com attivo

## 🔧 Configurazione Google Cloud Console

### 1. Aggiungi URI di Produzione

Vai su [Google Cloud Console](https://console.cloud.google.com/) e aggiorna le configurazioni OAuth:

1. Vai a **APIs & Services** → **Credentials**
2. Clicca sul tuo OAuth 2.0 Client ID
3. Nella sezione **"Authorized JavaScript origins"**, aggiungi:
   ```
   https://gestionale-frontend-aa3q.onrender.com
   https://gestionale-backend-ztow.onrender.com
   ```

4. Nella sezione **"Authorized redirect URIs"**, aggiungi:
   ```
   https://gestionale-backend-ztow.onrender.com/api/oauth/google/callback
   ```

   ⚠️ **IMPORTANTE**: Il redirect URI deve puntare al BACKEND, non al frontend!

5. Clicca su **"Save"**

### 2. Verifica delle Credenziali

- Mantieni lo stesso `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` usati in locale
- Oppure crea un nuovo OAuth Client ID dedicato alla produzione (consigliato)

## 🚀 Configurazione Render.com

### 1. Variabili d'Ambiente Backend

Nel dashboard di Render.com, vai al servizio **gestionale-backend**:

1. Clicca su **"Environment"** nella barra laterale
2. Aggiungi/Aggiorna le seguenti variabili:

   ```
   GOOGLE_CLIENT_ID=213885311541-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxx
   ```

   ⚠️ **NOTA**: `GOOGLE_REDIRECT_URI` è già configurato nel file render.yaml e non serve aggiungerlo manualmente

3. Clicca su **"Save Changes"**

### 2. Deploy delle Modifiche

Il file `render.yaml` è già configurato correttamente con:

```yaml
- key: GOOGLE_REDIRECT_URI
  value: https://gestionale-backend-ztow.onrender.com/api/oauth/google/callback
```

Dopo aver committato le modifiche, Render farà automaticamente il deploy.

## ✅ Test della Configurazione

### 1. Verifica Stato OAuth

Visita l'endpoint di stato:
```
https://gestionale-backend-ztow.onrender.com/api/oauth/google/status
```

Dovresti vedere:
```json
{
  "configured": true,
  "redirect_uri": "https://gestionale-backend-ztow.onrender.com/api/oauth/google/callback"
}
```

### 2. Test Login

1. Vai su: https://gestionale-frontend-aa3q.onrender.com/login
2. Clicca su **"Accedi con Google"**
3. Autorizza l'applicazione
4. Dovresti essere reindirizzato alla dashboard dell'app

## 🔐 Sicurezza in Produzione

### Checklist Sicurezza

- [x] **HTTPS**: Tutti gli URI usano HTTPS (obbligatorio per OAuth)
- [x] **Redirect URI**: Punta al backend, non al frontend
- [x] **Secret Key**: Generata automaticamente da Render
- [x] **SessionMiddleware**: Configurato per HTTPS in produzione
- [ ] **Secrets Rotation**: Cambia periodicamente le credenziali OAuth
- [ ] **CORS**: Verifica che solo il frontend di produzione possa accedere al backend

### Aggiornamento SessionMiddleware per Produzione

Il file `backend/main.py` ha già il SessionMiddleware configurato:

```python
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site='lax',
    https_only=False  # TODO: Set to True in production with HTTPS
)
```

⚠️ **TODO**: Considera di impostare `https_only=True` in produzione per maggiore sicurezza.

## 🐛 Troubleshooting

### Errore: "redirect_uri_mismatch"

**Causa**: Il redirect URI configurato su Google Cloud Console non corrisponde a quello inviato dall'app.

**Soluzione**:
1. Verifica che su Google Cloud Console ci sia esattamente:
   ```
   https://gestionale-backend-ztow.onrender.com/api/oauth/google/callback
   ```
2. Controlla che il backend sia raggiungibile e che l'endpoint `/api/oauth/google/status` restituisca il redirect URI corretto

### Errore: "OAuth not configured"

**Causa**: Le variabili d'ambiente `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET` non sono impostate su Render.

**Soluzione**: Aggiungi le variabili nel dashboard di Render come descritto sopra.

### Errore: "CSRF Warning State Mismatch"

**Causa**: Problemi con i cookie di sessione in produzione.

**Soluzione**: Verifica che:
1. Il SessionMiddleware sia configurato correttamente
2. Il browser accetti i cookie da domini diversi (SameSite='lax')
3. HTTPS sia attivo (obbligatorio per cookie sicuri)

## 📝 Riepilogo URI

| Ambiente | Frontend URL | Backend URL | Redirect URI |
|----------|-------------|-------------|--------------|
| **Locale** | http://localhost:3000 | http://localhost:8000 | http://localhost:8000/api/oauth/google/callback |
| **Produzione** | https://gestionale-frontend-aa3q.onrender.com | https://gestionale-backend-ztow.onrender.com | https://gestionale-backend-ztow.onrender.com/api/oauth/google/callback |

## 🔄 Prossimi Passi

1. Committa le modifiche al file `render.yaml`
2. Aggiungi gli URI di produzione su Google Cloud Console
3. Configura le variabili d'ambiente su Render dashboard
4. Testa il login in produzione

---

**Nota**: Questa guida assume che tu stia usando lo stesso progetto OAuth per sviluppo e produzione. Per maggiore sicurezza, considera di creare due progetti OAuth separati su Google Cloud Console.
