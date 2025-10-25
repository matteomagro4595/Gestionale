# Deploy su Render

Guida passo-passo per fare il deploy del progetto Gestionale su Render.

## Prerequisiti

1. Account su [Render](https://render.com) (gratuito)
2. Repository GitHub con il codice (assicurati che tutte le modifiche siano pushate)

## Metodo 1: Deploy automatico con render.yaml (Consigliato)

### 1. Push del codice su GitHub

Assicurati che tutte le modifiche siano committate e pushate:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin master
```

### 2. Crea un nuovo Blueprint su Render

1. Vai su https://dashboard.render.com
2. Clicca su **"New +"** in alto a destra
3. Seleziona **"Blueprint"**
4. Connetti il tuo repository GitHub
5. Render rileverà automaticamente il file `render.yaml` e creerà:
   - Database PostgreSQL (`gestionale-db`)
   - Backend FastAPI (`gestionale-backend`)
   - Frontend React (`gestionale-frontend`)

### 3. Configura le variabili d'ambiente

Render configurerà automaticamente le variabili dal `render.yaml`, ma dovrai:

1. **Aggiornare i nomi dei servizi** nei file se i nomi generati da Render sono diversi:
   - Il frontend sarà disponibile su: `https://gestionale-frontend.onrender.com`
   - Il backend sarà disponibile su: `https://gestionale-backend.onrender.com`

2. **Aggiorna FRONTEND_URL nel backend** se il nome è diverso:
   - Vai su Dashboard > gestionale-backend > Environment
   - Modifica `FRONTEND_URL` con l'URL corretto del frontend

3. **Aggiorna REACT_APP_API_URL nel frontend** se il nome è diverso:
   - Vai su Dashboard > gestionale-frontend > Environment
   - Modifica `REACT_APP_API_URL` con l'URL corretto del backend
   - **IMPORTANTE**: Rideploya il frontend dopo questa modifica (le variabili React vengono compilate nel build)

### 4. Attendi il deploy

Render farà automaticamente:
- Creare il database PostgreSQL
- Buildare il backend Docker
- Buildare il frontend React
- Connettere tutto insieme

Il primo deploy può richiedere 5-10 minuti.

---

## Metodo 2: Deploy manuale (Alternativo)

Se preferisci configurare manualmente o il blueprint non funziona:

### 1. Crea il Database PostgreSQL

1. Dashboard > **New +** > **PostgreSQL**
2. Nome: `gestionale-db`
3. Database: `gestionale_db`
4. User: `gestionale`
5. Region: Seleziona la più vicina (es. Frankfurt per Europa)
6. Plan: **Free**
7. Clicca **"Create Database"**
8. **Salva l'Internal Database URL** (lo userai dopo)

### 2. Deploy del Backend

1. Dashboard > **New +** > **Web Service**
2. Connetti il repository GitHub
3. Configurazione:
   - **Name**: `gestionale-backend`
   - **Region**: Stessa del database
   - **Branch**: `master`
   - **Root Directory**: Lascia vuoto
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Build Context**: `./backend`
   - **Plan**: Free

4. **Environment Variables**:
   ```
   DATABASE_URL=<Internal Database URL dal passo 1>
   SECRET_KEY=<genera con: openssl rand -hex 32>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   FRONTEND_URL=https://gestionale-frontend.onrender.com
   ```

   **Nota**: Dovrai aggiornare `FRONTEND_URL` dopo aver creato il frontend

5. **Advanced** > Health Check Path: `/api/health`
6. Clicca **"Create Web Service"**

### 3. Deploy del Frontend

1. Dashboard > **New +** > **Static Site**
2. Connetti il repository GitHub
3. Configurazione:
   - **Name**: `gestionale-frontend`
   - **Region**: Stessa del backend
   - **Branch**: `master`
   - **Root Directory**: Lascia vuoto
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `./frontend/build`

4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://gestionale-backend.onrender.com
   ```

   **Nota**: Sostituisci con l'URL effettivo del tuo backend

5. Clicca **"Create Static Site"**

### 4. Aggiorna le variabili cross-service

Dopo che tutti i servizi sono stati creati:

1. **Backend**: Aggiorna `FRONTEND_URL` con l'URL corretto del frontend
2. **Frontend**: Verifica che `REACT_APP_API_URL` punti al backend corretto
   - **IMPORTANTE**: Dopo aver modificato questa variabile, devi **rideploy manualmente** il frontend (Settings > Manual Deploy)

---

## Verifica del Deploy

1. Apri l'URL del frontend (es. `https://gestionale-frontend.onrender.com`)
2. Prova a registrare un nuovo utente
3. Verifica che login/logout funzionino
4. Testa le funzionalità principali (spese, liste spesa, palestra)

## Troubleshooting

### Errore CORS

Se vedi errori CORS nella console browser:
- Verifica che `FRONTEND_URL` nel backend sia corretto
- Riavvia il servizio backend

### Frontend non si connette al backend

- Verifica che `REACT_APP_API_URL` nel frontend sia corretto
- **Ribuilda il frontend** (le variabili React vengono embedded nel build)
- Controlla la console browser per errori di rete

### Database connection error

- Verifica che `DATABASE_URL` nel backend sia l'**Internal Database URL**
- Assicurati che backend e database siano nella stessa region

### Build fallisce

**Backend**:
- Verifica che `requirements.txt` sia aggiornato
- Controlla i logs del build

**Frontend**:
- Verifica che `package.json` sia presente
- Controlla che il path in `buildCommand` sia corretto

## Limitazioni del Free Tier

- **Database**: 90 giorni gratuiti, poi $7/mese
- **Web Services**: Spin-down dopo 15 minuti di inattività
- **Latenza**: Il primo accesso dopo inattività può richiedere 30-60 secondi

## Upgrade ai piani a pagamento

Per rimuovere le limitazioni del free tier:

1. Database: $7/mese (nessuno spin-down, più storage)
2. Web Services: Da $7/mese (nessuno spin-down, più risorse)
3. Static Sites: Sempre gratuiti

## Monitoraggio

- Dashboard Render: Logs in tempo reale per ogni servizio
- Metriche: CPU, memoria, richieste
- Alerts: Configura notifiche per downtime

## Custom Domain (Opzionale)

Per usare un dominio personalizzato:

1. Vai su Settings del servizio frontend
2. Aggiungi il tuo dominio custom
3. Configura i DNS records secondo le istruzioni
4. Aggiorna `FRONTEND_URL` nel backend con il nuovo dominio
5. Aggiorna `REACT_APP_API_URL` nel frontend e ribuilda

## Backup Database

Il piano free non include backup automatici. Per fare backup:

```bash
# Installa PostgreSQL client localmente
pg_dump <DATABASE_URL> > backup.sql
```

Considera l'upgrade al piano a pagamento per backup automatici giornalieri.

---

## Prossimi passi dopo il deploy

1. Cambia il `SECRET_KEY` nel backend con uno sicuro
2. Configura un dominio personalizzato
3. Monitora i logs per eventuali errori
4. Considera l'upgrade del database prima dei 90 giorni

## Link utili

- [Render Docs](https://render.com/docs)
- [Render Blueprint YAML](https://render.com/docs/blueprint-spec)
- [Deploy FastAPI on Render](https://render.com/docs/deploy-fastapi)
- [Deploy React on Render](https://render.com/docs/deploy-create-react-app)
