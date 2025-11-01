# 🐛 Problema: Gruppi Spesa Non Visibili in Produzione

## Sintomi

- ❌ Non vedo gruppi di spesa nella webapp in produzione
- ❌ Non riesco a creare nuovi gruppi in produzione
- ✅ In locale funziona tutto correttamente

## Causa Identificata

Il problema è dovuto alle **variabili d'ambiente React** che sono **embedded nel bundle JavaScript durante la build**.

### Come Funziona React

1. Durante `npm run build`, React legge le variabili `REACT_APP_*`
2. Sostituisce ogni `process.env.REACT_APP_API_URL` con il valore **hardcoded** nel bundle JS
3. Il bundle viene servito come file statico
4. **Non è possibile modificare queste variabili senza rifare la build**

### Esempio

**render.yaml (corretto):**
```yaml
envVars:
  - key: REACT_APP_API_URL
    value: https://gestionale-backend-ztow.onrender.com
```

**Durante la build**, React sostituisce nel codice:
```javascript
// Prima (codice sorgente)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Dopo (bundle produzione)
const API_URL = 'https://gestionale-backend-ztow.onrender.com';
```

### Cosa è Successo

1. Il frontend è stato deployato con un vecchio URL o senza la variabile
2. Il `render.yaml` è stato corretto DOPO il deploy
3. Ma il frontend continua a usare il vecchio URL embedded nel bundle
4. **Soluzione**: Fare un nuovo build del frontend

## Verifica Configurazione

### ✅ render.yaml - CORRETTO

```yaml
# Backend FastAPI
- type: web
  name: gestionale-backend
  envVars:
    - key: FRONTEND_URL
      value: https://gestionale-frontend-aa3q.onrender.com  # ✅ Corretto
    - key: BACKEND_URL
      value: https://gestionale-backend-ztow.onrender.com   # ✅ Corretto

# Frontend React
- type: web
  name: gestionale-frontend
  envVars:
    - key: REACT_APP_API_URL
      value: https://gestionale-backend-ztow.onrender.com   # ✅ Corretto
```

### ✅ Backend API - FUNZIONANTE

```bash
# Test health check
curl https://gestionale-backend-ztow.onrender.com/api/health
# Risposta: {"status":"healthy"} ✅

# Test lista gruppi (con token)
curl -H "Authorization: Bearer TOKEN" \
  https://gestionale-backend-ztow.onrender.com/api/expenses/groups
# Risposta: [] (array vuoto, nessun gruppo ancora) ✅
```

### ✅ Backend CORS - CONFIGURATO

```python
# backend/main.py
allowed_origins = [
    "http://localhost:3000",  # Development ✅
    "https://gestionale-frontend-aa3q.onrender.com",  # Production ✅
]
```

### ✅ Frontend Codice - CORRETTO

```javascript
// frontend/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,  // Es: https://gestionale-backend-ztow.onrender.com
});

// Chiamate API
export const expensesAPI = {
  createGroup: (data) => api.post('/api/expenses/groups', data),  // ✅
  getGroups: () => api.get('/api/expenses/groups'),                // ✅
  // ...
};
```

### ✅ Schema Backend - CORRETTO

```python
# backend/schemas/expense.py
class GroupBase(BaseModel):
    nome: str                      # ✅ Italiano
    descrizione: Optional[str] = None

class GroupCreate(GroupBase):
    pass
```

### ✅ Frontend Form - CORRETTO

```javascript
// frontend/src/pages/Expenses/Dashboard.js
const [newGroup, setNewGroup] = useState({
  nome: '',        // ✅ Italiano
  descrizione: ''  // ✅ Italiano
});

await expensesAPI.createGroup(newGroup);  // Invia { nome, descrizione } ✅
```

## 🎯 Soluzione

### Metodo 1: Script Automatico (Raccomandato)

```bash
cd /home/matteo/Documenti/GitHub/Gestionale

# Esegui lo script per forzare il redeploy
./force-redeploy.sh
```

Lo script:
1. Verifica la configurazione
2. Crea un commit vuoto
3. Pusha su GitHub
4. Render rileva il commit e ricostruisce automaticamente il frontend
5. Verifica che il backend sia online

### Metodo 2: Manuale dalla Dashboard Render

1. Vai su https://dashboard.render.com/
2. Login
3. Trova **"gestionale-frontend"**
4. Clicca **"Manual Deploy"** → **"Deploy latest commit"**
5. Attendi 3-5 minuti
6. Verifica su https://gestionale-frontend-aa3q.onrender.com

### Metodo 3: Commit Vuoto Manuale

```bash
cd /home/matteo/Documenti/GitHub/Gestionale

git commit --allow-empty -m "chore: force frontend redeploy"
git push origin master

# Render ricostruirà automaticamente il frontend
```

## Verifica Post-Deploy

### 1. Apri il Frontend

https://gestionale-frontend-aa3q.onrender.com

### 2. Console Browser (F12)

Verifica che non ci siano errori CORS o network

### 3. Test Creazione Gruppo

1. Login
2. Vai su "Spese"
3. Clicca "Nuovo Gruppo"
4. Compila:
   - Nome: "Test Produzione"
   - Descrizione: "Test dopo redeploy"
5. Clicca "Crea"
6. **Dovrebbe funzionare!** ✅

### 4. Network Tab (F12)

Verifica che le chiamate vadano a:
```
https://gestionale-backend-ztow.onrender.com/api/expenses/groups
```

**NON** a:
- `http://localhost:8000/api/...` ❌
- Vecchi URL Render ❌

## Timeline

1. **Esegui script/manual deploy**: Immediato
2. **Render rileva cambiamento**: ~30 secondi
3. **Build frontend**: ~2-4 minuti
   - `npm install`
   - `npm run build` (qui vengono embedded le variabili!)
   - Upload file statici
4. **Deploy**: ~30 secondi
5. **TOTALE**: ~3-5 minuti

## Troubleshooting

### ⚠️ Dopo deploy vedo ancora il vecchio frontend

**Causa**: Cache del browser

**Soluzione**:
- Modalità incognito
- Hard refresh: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
- Pulisci cache: F12 → Application → Clear storage

### ⚠️ Errore CORS

**Sintomo**:
```
Access to fetch at 'https://gestionale-backend-ztow.onrender.com/api/expenses/groups'
from origin 'https://gestionale-frontend-aa3q.onrender.com'
has been blocked by CORS policy
```

**Causa**: Backend non permette richieste da quel frontend

**Soluzione**:
```bash
# Verifica BACKEND_URL in render.yaml (riga 28)
# Deve essere: https://gestionale-backend-ztow.onrender.com

# Verifica FRONTEND_URL in render.yaml (riga 26)
# Deve essere: https://gestionale-frontend-aa3q.onrender.com

# Se modifichi, fai redeploy del BACKEND:
# Dashboard Render → gestionale-backend → Manual Deploy
```

### ⚠️ Backend non risponde (504 Gateway Timeout)

**Causa**: Backend in sleep mode (piano free Render)

**Soluzione**:
```bash
# Sveglia il backend aprendo:
curl https://gestionale-backend-ztow.onrender.com/api/health

# Aspetta 30-50 secondi per il cold start
# Poi riprova dal frontend
```

### ⚠️ 404 Not Found sulle API

**Causa**: Path API errato

**Verifica**:
```bash
# Test health check (dovrebbe funzionare)
curl https://gestionale-backend-ztow.onrender.com/api/health

# Test gruppi (con token valido)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://gestionale-backend-ztow.onrender.com/api/expenses/groups

# Se entrambi rispondono → problema nel frontend (rifare build)
# Se non rispondono → problema nel backend
```

## Documentazione Correlata

- `REDEPLOY_FRONTEND.md` - Guida completa al redeploy
- `force-redeploy.sh` - Script automatico per redeploy
- `render.yaml` - Configurazione Render.com

## Checklist Finale

Dopo il redeploy, verifica:

- [ ] Frontend raggiungibile: https://gestionale-frontend-aa3q.onrender.com
- [ ] Backend raggiungibile: https://gestionale-backend-ztow.onrender.com/api/health
- [ ] Login funziona
- [ ] Visualizzazione gruppi funziona (anche se lista vuota)
- [ ] Creazione nuovo gruppo funziona
- [ ] Nessun errore CORS in Console (F12)
- [ ] Chiamate API vanno all'URL corretto (Network tab F12)

## Note Tecniche

**Differenza React vs Backend:**

| Aspetto | React (Frontend) | FastAPI (Backend) |
|---------|------------------|-------------------|
| Variabili env | Embed nel bundle al build | Lette a runtime |
| Modifica env | Richiede rebuild | Richiede solo restart |
| File config | `render.yaml` → build time | `render.yaml` → runtime |
| Cache | Cache browser può ingannare | No cache server-side |

**Best Practice:**
- Cambi al backend: modifica render.yaml → Manual Deploy backend
- Cambi al frontend: modifica render.yaml → Rebuild frontend (script)
- Cambi variabili React: **SEMPRE** rebuild frontend

---

**Ultima modifica**: 2025-11-01
**Status**: ✅ Configurazione corretta, necessita solo redeploy frontend
**Priorità**: Alta (blocca funzionalità principali)
