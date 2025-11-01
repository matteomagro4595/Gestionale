# 🚀 Redeploy Frontend su Render.com

## Problema Identificato

Il frontend React in produzione non riesce a comunicare con il backend perché le variabili d'ambiente `REACT_APP_*` in React sono **embedded nel bundle durante la build**.

Se modifichi il `render.yaml` DOPO un deploy, il frontend continua a usare il vecchio URL fino a quando non fai un nuovo build.

## ✅ Soluzione: Forzare un Redeploy

### Metodo 1: Dashboard Render.com (Consigliato)

1. Vai su https://dashboard.render.com/
2. Accedi al tuo account
3. Trova il servizio **"gestionale-frontend"**
4. Clicca su **"Manual Deploy"** → **"Deploy latest commit"**
5. Attendi che il deploy si completi (~2-5 minuti)
6. Verifica che il frontend funzioni

### Metodo 2: Commit Vuoto (Automatico)

Se hai configurato auto-deploy da GitHub:

```bash
cd /home/matteo/Documenti/GitHub/Gestionale

# Crea un commit vuoto per forzare redeploy
git commit --allow-empty -m "chore: force frontend redeploy to update API URL"

# Push su GitHub
git push origin master

# Render rileverà il nuovo commit e rifarà automaticamente il build del frontend
```

### Metodo 3: Modificare render.yaml e Push

```bash
cd /home/matteo/Documenti/GitHub/Gestionale

# Il render.yaml è già corretto, ma puoi aggiungere un commento per forzare il redeploy
# (Render rileva qualsiasi cambiamento al file)

git add render.yaml
git commit -m "chore: update render.yaml to trigger frontend rebuild"
git push origin master
```

## Verifica Post-Deploy

Dopo il redeploy del frontend, verifica che funzioni:

### 1. Apri il Frontend

Vai su: https://gestionale-frontend-aa3q.onrender.com

### 2. Apri Console del Browser

Premi `F12` → Tab "Console"

### 3. Verifica URL API

Nella console, scrivi:
```javascript
localStorage.clear() // Pulisci token vecchi
location.reload() // Ricarica pagina
```

### 4. Prova a Creare un Gruppo

1. Fai login con le tue credenziali
2. Vai su "Spese"
3. Clicca "Nuovo Gruppo"
4. Compila:
   - Nome: "Test Deploy"
   - Descrizione: "Test dopo redeploy"
5. Clicca "Crea"

### 5. Controlla Errori

Se ci sono errori:
- Apri **Console** (F12) e cerca errori CORS o network
- Apri **Network** tab (F12) e verifica le chiamate API

Dovresti vedere chiamate a:
```
https://gestionale-backend-ztow.onrender.com/api/expenses/groups
```

**Non** a:
- `http://localhost:8000`
- Vecchio URL di Render

## Configurazione Corretta (render.yaml)

```yaml
# Frontend React
- type: web
  name: gestionale-frontend
  runtime: static
  buildCommand: cd frontend && npm install && npm run build
  staticPublishPath: ./frontend/build
  plan: free
  envVars:
    - key: REACT_APP_API_URL
      value: https://gestionale-backend-ztow.onrender.com  # ✅ CORRETTO
  routes:
    - type: rewrite
      source: /*
      destination: /index.html
```

## Configurazione Backend CORS

Il backend permette richieste da:
- `http://localhost:3000` (development)
- `https://gestionale-frontend-aa3q.onrender.com` (production)

Questo è configurato in `backend/main.py`:

```python
allowed_origins = [
    "http://localhost:3000",  # Development
    os.getenv("FRONTEND_URL", ""),  # Production
]
```

E in `render.yaml`:

```yaml
envVars:
  - key: FRONTEND_URL
    value: https://gestionale-frontend-aa3q.onrender.com
```

✅ Configurazione CORS corretta!

## Troubleshooting

### Problema: Errore CORS

**Sintomo**:
```
Access to fetch at 'https://gestionale-backend-ztow.onrender.com/api/...'
from origin 'https://gestionale-frontend-aa3q.onrender.com'
has been blocked by CORS policy
```

**Causa**: Backend non permette richieste da quel frontend

**Soluzione**:
1. Verifica che `FRONTEND_URL` sia corretto nel backend
2. Fai redeploy del backend se necessario

### Problema: Chiamate vanno a localhost

**Sintomo**: Vedi chiamate a `http://localhost:8000/api/...` nella console Network

**Causa**: Frontend non ha la variabile `REACT_APP_API_URL` corretta

**Soluzione**:
1. Verifica `render.yaml` (riga 40)
2. Fai redeploy del frontend (vedi metodi sopra)

### Problema: 404 Not Found sulle API

**Sintomo**: Chiamate restituiscono 404

**Causa**: Backend potrebbe essere offline o URL errato

**Soluzione**:
```bash
# Testa se il backend risponde
curl https://gestionale-backend-ztow.onrender.com/api/health

# Dovrebbe restituire:
# {"status":"healthy"}
```

Se non risponde:
- Backend in sleep (piano free Render)
- Aspetta 30-50 secondi e riprova
- Controlla Dashboard Render per errori

### Problema: Frontend non si aggiorna dopo deploy

**Sintomo**: Vedi ancora il vecchio frontend dopo il deploy

**Causa**: Cache del browser

**Soluzione**:
1. Apri frontend in **modalità incognito**
2. Oppure fai **hard refresh**: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
3. Oppure pulisci cache: F12 → Network → checkbox "Disable cache"

## Timeline di Deploy

1. **Commit push**: ~10 secondi
2. **Render rileva cambiamento**: ~30 secondi
3. **Build frontend**: ~2-4 minuti
4. **Deploy**: ~30 secondi
5. **Totale**: ~3-5 minuti

## Note Importanti

⚠️ **Le variabili `REACT_APP_*` sono STATICHE**
- Vengono "baked" nel bundle JS durante `npm run build`
- NON possono essere cambiate a runtime
- Ogni modifica richiede un nuovo build

✅ **Per il backend invece**
- Le variabili d'ambiente sono lette a runtime
- Possono essere cambiate senza rebuild
- Basta riavviare il servizio su Render

## Comandi Rapidi

```bash
# Forzare redeploy frontend
cd /home/matteo/Documenti/GitHub/Gestionale
git commit --allow-empty -m "chore: trigger frontend redeploy"
git push origin master

# Verificare backend
curl https://gestionale-backend-ztow.onrender.com/api/health

# Verificare gruppi (con token valido)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://gestionale-backend-ztow.onrender.com/api/expenses/groups
```

---

**Ultima modifica**: 2025-11-01
**Backend URL**: `https://gestionale-backend-ztow.onrender.com`
**Frontend URL**: `https://gestionale-frontend-aa3q.onrender.com`
