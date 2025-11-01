# 🔧 Fix CORS Error - Gruppi Spesa

## Errore Riscontrato

```
Access to XMLHttpRequest at 'https://gestionale-backend-ztow.onrender.com/api/expenses/groups'
from origin 'https://gestionale-frontend-aa3q.onrender.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

GET https://gestionale-backend-ztow.onrender.com/api/expenses/groups net::ERR_FAILED 500
```

## Causa

Il backend non permetteva richieste dal frontend perché:

1. ✅ Il `render.yaml` è stato corretto con `FRONTEND_URL` corretta
2. ❌ Ma il **backend non è stato ridistribuito** per caricare la nuova configurazione
3. ❌ Anche se il backend FastAPI legge variabili a runtime, le legge **all'avvio del processo**
4. ❌ Quindi il backend sta ancora usando la vecchia configurazione CORS

## Configurazione CORS Backend

```python
# backend/main.py
allowed_origins = [
    "http://localhost:3000",  # Development
    os.getenv("FRONTEND_URL", ""),  # Production <- Questa viene letta all'avvio!
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # ["http://localhost:3000", "https://..."]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Configurazione render.yaml

```yaml
# Backend
- type: web
  name: gestionale-backend
  envVars:
    - key: FRONTEND_URL
      value: https://gestionale-frontend-aa3q.onrender.com  # ✅ Corretto
    - key: BACKEND_URL
      value: https://gestionale-backend-ztow.onrender.com   # ✅ Corretto
```

## Soluzione Applicata

### ✅ Step 1: Corretto render.yaml (già fatto)

```bash
Commit: 95bd4d3
- Fixed REACT_APP_API_URL per frontend
- Added BACKEND_URL
```

### ✅ Step 2: Forzato Redeploy Backend (appena fatto)

```bash
Commit: f700cdd
- Commit vuoto per forzare redeploy backend
- Push: master → origin/master
```

## Timeline

### Redeploy Automatici in Corso

Render.com sta ora processando:

1. **Frontend** (dal commit 95bd4d3)
   - ⏱️ Tempo: ~3-5 minuti
   - 📦 Build: `npm install && npm run build`
   - ✨ Embed nuovo URL API nel bundle

2. **Backend** (dal commit f700cdd)
   - ⏱️ Tempo: ~1-2 minuti
   - 🐳 Build: Docker build del backend
   - ♻️ Restart: Riavvio con nuova FRONTEND_URL

### Verifica (dopo 5 minuti totali)

**Passo 1: Aspetta 5 minuti**

Entrambi i servizi devono completare il deploy.

**Passo 2: Apri Frontend in Modalità Incognito**

```
https://gestionale-frontend-aa3q.onrender.com
```

**Importante**: Usa modalità incognito o fai hard refresh (`Ctrl+Shift+R`) per evitare cache!

**Passo 3: Fai Login**

Usa le tue credenziali.

**Passo 4: Vai su "Spese"**

Dovresti vedere:
- Lista gruppi (anche se vuota)
- Pulsante "Nuovo Gruppo" funzionante
- **Nessun errore CORS nella Console** (F12)

**Passo 5: Network Tab (F12)**

Verifica che le chiamate vadano a:
```
Request URL: https://gestionale-backend-ztow.onrender.com/api/expenses/groups
Status: 200 OK
Response Headers:
  access-control-allow-origin: https://gestionale-frontend-aa3q.onrender.com ✅
```

## Monitoraggio Deploy

Puoi monitorare in tempo reale su:

https://dashboard.render.com/

Cerca:
- **gestionale-frontend**: Dovrebbe mostrare "Building..." poi "Live"
- **gestionale-backend**: Dovrebbe mostrare "Deploying..." poi "Live"

## Test Rapido Backend CORS

Dopo che il backend è live, testa CORS manualmente:

```bash
# Test OPTIONS request (preflight CORS)
curl -X OPTIONS https://gestionale-backend-ztow.onrender.com/api/expenses/groups \
  -H "Origin: https://gestionale-frontend-aa3q.onrender.com" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Dovresti vedere nell'output:
# < access-control-allow-origin: https://gestionale-frontend-aa3q.onrender.com ✅
```

## Differenza: Frontend vs Backend

| Aspetto | Frontend React | Backend FastAPI |
|---------|---------------|-----------------|
| **Variabili env** | Embed nel bundle al build | Lette all'avvio del processo |
| **Quando caricare** | Durante `npm run build` | All'avvio con `uvicorn` |
| **Modifica env** | Richiede rebuild completo | Richiede restart/redeploy |
| **File statico** | Sì (bundle.js) | No (codice Python) |
| **Cache browser** | Sì, può ingannare | No |

**Entrambi** richiedono redeploy quando modifichi `render.yaml`!

## Errore 500 Internal Server Error

L'errore 500 che hai visto era probabilmente causato da:

1. Richiesta bloccata da CORS prima di arrivare al backend
2. Oppure backend in crash/restart
3. Verificheremo dopo il redeploy

## Troubleshooting

### ❌ Dopo 5 minuti vedo ancora errore CORS

**Possibili cause**:

1. **Deploy non completato**
   - Controlla dashboard Render
   - Aspetta che entrambi i servizi siano "Live" (verde)

2. **Cache browser**
   - Apri in modalità incognito
   - Hard refresh: `Ctrl + Shift + R`

3. **Deploy fallito**
   - Controlla log su dashboard Render
   - Cerca errori nel build/deploy

### ❌ Backend non risponde

```bash
# Sveglia il backend (se in sleep)
curl https://gestionale-backend-ztow.onrender.com/api/health

# Aspetta 30-50 secondi per cold start (piano free)
```

### ❌ Frontend chiama ancora localhost

```bash
# Verifica che il frontend sia stato ricostruito
# Controlla timestamp deploy su dashboard Render
# Dovrebbe essere dopo le 12:05 (ora del commit 95bd4d3)
```

## Checklist Finale

Dopo 5 minuti, verifica:

- [ ] Dashboard Render: entrambi i servizi "Live" (verde)
- [ ] Backend health: `curl https://gestionale-backend-ztow.onrender.com/api/health` → 200 OK
- [ ] Frontend aperto in modalità incognito
- [ ] Login funziona
- [ ] Console (F12): Nessun errore CORS
- [ ] Network (F12): Chiamate vanno a `gestionale-backend-ztow.onrender.com`
- [ ] Response Headers: `access-control-allow-origin: https://gestionale-frontend-aa3q.onrender.com`
- [ ] Creazione gruppo funziona
- [ ] Visualizzazione gruppi funziona

## Script Utili per il Futuro

```bash
# Redeploy solo frontend
./force-redeploy.sh

# Redeploy solo backend
./redeploy-backend.sh

# Verifica backend
curl https://gestionale-backend-ztow.onrender.com/api/health

# Verifica CORS
curl -X OPTIONS https://gestionale-backend-ztow.onrender.com/api/expenses/groups \
  -H "Origin: https://gestionale-frontend-aa3q.onrender.com" \
  -H "Access-Control-Request-Method: GET" \
  -v | grep -i "access-control"
```

## Perché Servono Entrambi i Redeploy?

### Frontend
- Aveva URL sbagliato: `gestionale-backend.onrender.com` ❌
- Serve rebuild per embed nuovo URL: `gestionale-backend-ztow.onrender.com` ✅

### Backend
- Aveva FRONTEND_URL vecchia (o mancante) in memoria
- Serve restart per caricare: `https://gestionale-frontend-aa3q.onrender.com` ✅
- In modo che CORS permetta richieste da quel dominio

## Risultato Atteso

```
Frontend → https://gestionale-backend-ztow.onrender.com/api/expenses/groups

Backend riceve:
  Origin: https://gestionale-frontend-aa3q.onrender.com

Backend controlla:
  allowed_origins = ["http://localhost:3000", "https://gestionale-frontend-aa3q.onrender.com"]
  ✅ Match! Permetti richiesta

Backend risponde con:
  access-control-allow-origin: https://gestionale-frontend-aa3q.onrender.com
  [...dati gruppi...]

Frontend riceve:
  ✅ Nessun errore CORS
  ✅ Dati gruppi visualizzati
```

---

**Commit Fix**:
- `95bd4d3` - Fix URL frontend
- `f700cdd` - Force backend redeploy

**Tempo stimato**: 5 minuti totali

**Status**: ⏳ Deploy in corso...

**Verifica dopo**: 12:10 (ora locale + 5 minuti)
