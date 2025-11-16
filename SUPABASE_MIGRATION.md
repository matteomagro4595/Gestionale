# Guida alla Migrazione Database: Render → Supabase

Questa guida ti aiuterà a migrare il tuo database PostgreSQL da Render a Supabase.

## 📋 Prerequisiti

- Account Supabase (gratuito): https://supabase.com
- Accesso al database Render attuale
- Python 3.8+ installato
- Dipendenze Python installate: `pip install -r requirements.txt`

## 🚀 Passo 1: Configura Supabase

### 1.1 Crea un nuovo progetto

1. Vai su https://supabase.com
2. Clicca su "New Project"
3. Scegli un nome per il progetto (es. "gestionale")
4. Scegli una password forte per il database (SALVALA!)
5. Seleziona la regione più vicina (es. "Europe (Frankfurt)")
6. Clicca "Create new project"
7. Attendi 2-3 minuti per la creazione del progetto

### 1.2 Ottieni la Connection String

1. Nel tuo progetto Supabase, vai su **Settings** (icona ingranaggio)
2. Clicca su **Database** nel menu laterale
3. Scorri fino a "Connection string"
4. Seleziona la modalità **URI**
5. Copia la stringa di connessione (sarà simile a):
   ```
   postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
6. Sostituisci `[YOUR-PASSWORD]` con la password che hai scelto al punto 1.1

## 🔧 Passo 2: Configura le Variabili d'Ambiente

### 2.1 Ottieni l'URL del database Render

1. Vai su https://dashboard.render.com
2. Apri il tuo database PostgreSQL
3. Vai su "Connect"
4. Copia la "External Database URL" (sarà simile a):
   ```
   postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/database
   ```

### 2.2 Configura le variabili per la migrazione

Crea un file `.env.migration` nella cartella `backend/`:

```bash
cd backend
cp .env.supabase.example .env.migration
nano .env.migration  # o usa il tuo editor preferito
```

Inserisci le URL:

```env
# URL del database Render (sorgente)
SOURCE_DATABASE_URL=postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/database

# URL del database Supabase (destinazione)
TARGET_DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Salva il file.

## 📊 Passo 3: Verifica i Dati (Dry Run)

Prima di migrare, verifica quanti dati verranno copiati:

```bash
cd backend

# Carica le variabili d'ambiente
export $(cat .env.migration | xargs)

# Esegui il dry run
python migrate_to_supabase.py --dry-run
```

Vedrai un output simile a:

```
🔍 DRY RUN - Conteggio record da migrare:

   📊 users                      5 record
   📊 shopping_lists            12 record
   📊 shopping_items            45 record
   📊 shared_lists               3 record
   📊 expense_groups             8 record
   📊 group_members             18 record
   📊 expenses                  67 record
   📊 expense_participants     134 record
   📊 workout_cards              2 record
   📊 workout_days              10 record
   📊 exercises                 48 record
   📊 notifications             23 record

   📈 TOTALE: 375 record da migrare
```

## 🚀 Passo 4: Esegui la Migrazione

⚠️ **IMPORTANTE**: Prima di procedere:
- Metti l'applicazione in modalità manutenzione (se in produzione)
- Fai un backup del database Render
- Assicurati che nessuno stia usando l'app durante la migrazione

```bash
cd backend

# Carica le variabili d'ambiente (se non già fatto)
export $(cat .env.migration | xargs)

# Esegui la migrazione
python migrate_to_supabase.py
```

Lo script:
1. ✅ Creerà tutte le tabelle su Supabase
2. 📦 Copierà tutti i dati da Render a Supabase
3. 🔍 Verificherà che tutti i record siano stati copiati correttamente

Output atteso:

```
============================================================
  🚀 MIGRAZIONE DATABASE: RENDER → SUPABASE
============================================================
  Data: 2025-01-16 15:30:00
============================================================

🔗 Connessione ai database...
✅ Connesso ai database

📋 Creazione tabelle su Supabase...
✅ Tabelle create

============================================================
  📦 INIZIO MIGRAZIONE DATI
============================================================

📦 Migrazione users...
   Trovati 5 record nella sorgente
   ✅ Migrati 5 record

📦 Migrazione shopping_lists...
   Trovati 12 record nella sorgente
   ✅ Migrati 12 record

[...continua per tutte le tabelle...]

============================================================
  ✅ MIGRAZIONE COMPLETATA
============================================================
  📊 Totale record migrati: 375
============================================================

============================================================
  🔍 VERIFICA MIGRAZIONE
============================================================
   ✅ users: 5 record (OK)
   ✅ shopping_lists: 12 record (OK)
   ✅ shopping_items: 45 record (OK)
   [...]

✅ Tutte le tabelle verificate con successo!

============================================================
  🎉 MIGRAZIONE TERMINATA
============================================================

🔌 Connessioni chiuse
```

## 🔄 Passo 5: Aggiorna l'Applicazione

### 5.1 Aggiorna il file .env

Nel file `backend/.env`, aggiorna la `DATABASE_URL`:

```env
# Vecchio (Render)
# DATABASE_URL=postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/database

# Nuovo (Supabase)
DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### 5.2 Testa l'applicazione

```bash
# Backend
cd backend
python -m uvicorn main:app --reload

# Frontend
cd frontend
npm start
```

Verifica che:
- ✅ Login funziona
- ✅ Liste della spesa si caricano
- ✅ Gruppi di spese sono visibili
- ✅ Schede palestra sono accessibili
- ✅ Puoi creare nuovi elementi

### 5.3 Deploy in produzione

Aggiorna la variabile d'ambiente `DATABASE_URL` sul tuo servizio di hosting:

**Render (se usi Render anche per il backend):**
1. Vai sul tuo servizio Web in Render
2. Environment → Edit
3. Aggiorna `DATABASE_URL` con l'URL Supabase
4. Salva e aspetta il redeploy automatico

**Docker Compose:**
```bash
# Aggiorna docker-compose.yml o .env
# Poi:
docker-compose down
docker-compose up -d
```

## 🎯 Vantaggi di Supabase

✅ **Piano gratuito più generoso**:
- 500 MB di database storage (vs 256 MB Render free)
- 2 GB di bandwidth
- Nessuna sleep automatica dopo 90 giorni

✅ **Funzionalità extra**:
- Dashboard SQL integrata
- Backup automatici
- Row Level Security (RLS)
- Realtime subscriptions
- Storage per file
- Auth integrato

✅ **Performance migliore**:
- Connection pooling integrato
- Query più veloci
- Uptime migliore

## 🆘 Risoluzione Problemi

### Errore: "SOURCE_DATABASE_URL non configurato"

Assicurati di aver esportato le variabili:
```bash
export $(cat .env.migration | xargs)
```

### Errore: "permission denied"

Rendi lo script eseguibile:
```bash
chmod +x backend/migrate_to_supabase.py
```

### Record count non combacia

Se dopo la migrazione alcuni record non combaciano:
1. Controlla i log per errori
2. Verifica le foreign key constraints
3. Esegui di nuovo la migrazione (lo script gestisce i duplicati)

### Connessione rifiutata

Verifica che:
- L'URL del database sia corretto
- La password sia corretta (senza caratteri speciali nell'URL)
- Il progetto Supabase sia attivo
- Render consenta connessioni esterne

## 📞 Supporto

Se hai problemi:
1. Controlla i log dello script di migrazione
2. Verifica le credenziali su Supabase Dashboard
3. Consulta la documentazione Supabase: https://supabase.com/docs

## 🔒 Sicurezza

Dopo la migrazione:
- ✅ Cambia la password del database Supabase
- ✅ Abilita Row Level Security (RLS) se necessario
- ✅ Elimina il file `.env.migration` con le credenziali
- ✅ Mantieni il backup del database Render per 30 giorni

## ✅ Checklist Finale

- [ ] Progetto Supabase creato
- [ ] Connection string ottenuta
- [ ] Variabili d'ambiente configurate
- [ ] Dry run eseguito con successo
- [ ] Migrazione completata senza errori
- [ ] Verifica record OK per tutte le tabelle
- [ ] .env aggiornato con nuovo DATABASE_URL
- [ ] Applicazione testata localmente
- [ ] Deploy in produzione effettuato
- [ ] Tutto funziona correttamente
- [ ] Backup Render mantenuto
- [ ] File .env.migration eliminato

🎉 **Congratulazioni! La migrazione è completa!**
