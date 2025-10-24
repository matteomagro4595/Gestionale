# Gestionale

Applicazione web modulare per la gestione di spese, liste della spesa e schede palestra.

## Caratteristiche

L'applicazione è composta da tre moduli indipendenti:

### 1. Gestione Spese
- Crea gruppi per organizzare le spese (es. casa, viaggi)
- Aggiungi spese con tag personalizzati (Bolletta, Spesa, Pranzo/Cena, Cani, Altro)
- Dividi le spese in modo uguale, per importi esatti o per percentuale
- Visualizza i bilanci per utente e gruppo
- Monitora chi deve quanto a chi

### 2. Lista della Spesa
- Crea liste della spesa personalizzate
- Condividi le liste tramite token generato automaticamente
- Collabora in tempo reale: gli aggiornamenti sono visibili a tutti i partecipanti
- Marca gli articoli come completati
- Aggiungi note e quantità per ogni articolo

### 3. Schede Palestra
- Crea schede di allenamento personalizzate
- Organizza gli esercizi con serie, ripetizioni e peso
- Aggiungi note per ogni esercizio
- Gestisci più schede per diverse routine di allenamento

## Stack Tecnologico

- **Backend**: Python (FastAPI)
- **Frontend**: Node.js (React)
- **Database**: PostgreSQL
- **Containerizzazione**: Docker & Docker Compose
- **Autenticazione**: JWT (JSON Web Tokens)

## Prerequisiti

- Docker Desktop installato e in esecuzione
- Docker Compose (di solito incluso con Docker Desktop)
- Porte disponibili: 3000 (frontend), 8000 (backend), 5432 (database)

## Installazione e Setup

### 1. Clona il repository

```bash
git clone <repository-url>
cd Gestionale
```

### 2. Configura le variabili d'ambiente (opzionale)

Copia il file `.env.example` in `.env` e modifica i valori se necessario:

```bash
cp .env.example .env
```

**IMPORTANTE**: Cambia il `SECRET_KEY` in produzione con una chiave sicura!

### 3. Avvia l'applicazione con Docker

```bash
docker-compose up --build
```

Al primo avvio, Docker:
- Scaricherà le immagini necessarie
- Costruirà i container per backend, frontend e database
- Installerà tutte le dipendenze
- Creerà il database e le tabelle

### 4. Accedi all'applicazione

Una volta avviati i container, l'applicazione sarà disponibile:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentazione API**: http://localhost:8000/docs

## Utilizzo

### Prima registrazione

1. Accedi a http://localhost:3000
2. Clicca su "Registrati"
3. Compila il form con i tuoi dati
4. Sarai automaticamente autenticato e reindirizzato alla home

### Gestione Spese

#### Creare un gruppo
1. Vai su "Spese" dal menu
2. Clicca "Nuovo Gruppo"
3. Inserisci nome e descrizione
4. Il gruppo sarà creato e tu sarai automaticamente aggiunto come membro

#### Aggiungere una spesa
1. Entra in un gruppo
2. Clicca "Nuova Spesa"
3. Compila i campi:
   - **Descrizione**: opzionale, descrivi la spesa
   - **Importo**: costo totale
   - **Tag**: categoria della spesa
   - **Pagato da**: chi ha effettuato il pagamento
   - **Tipo di divisione**:
     - *Uguale*: divide equamente tra tutti i partecipanti
     - *Importi esatti*: specifica l'importo per ogni persona
     - *Percentuale*: specifica la percentuale per ogni persona

#### Visualizzare i bilanci
I bilanci mostrano per ogni membro:
- **Totale Pagato**: quanto ha pagato in totale
- **Totale Dovuto**: quanto deve in totale
- **Bilancio**: differenza (positivo = credito, negativo = debito)

### Lista della Spesa

#### Creare una lista
1. Vai su "Lista Spesa" dal menu
2. Clicca "Nuova Lista"
3. Inserisci il nome della lista

#### Condividere una lista
1. Entra nella lista
2. Clicca "Copia Token di Condivisione"
3. Invia il token ad altri utenti
4. Gli altri utenti possono:
   - Andare su "Lista Spesa"
   - Cliccare "Accedi con Token"
   - Incollare il token ricevuto

#### Gestire gli articoli
- Clicca "Nuovo Articolo" per aggiungere prodotti
- Spunta la checkbox per marcare come completato
- Clicca "Elimina" per rimuovere un articolo

### Schede Palestra

#### Creare una scheda
1. Vai su "Palestra" dal menu
2. Clicca "Nuova Scheda"
3. Inserisci nome e descrizione

#### Aggiungere esercizi
1. Entra nella scheda
2. Clicca "Nuovo Esercizio"
3. Compila i campi:
   - **Nome**: nome dell'esercizio
   - **Serie**: numero di serie (es. 3)
   - **Ripetizioni**: range di ripetizioni (es. 10-12)
   - **Peso**: peso utilizzato (es. 20kg)
   - **Note**: note aggiuntive

## Comandi Docker Utili

### Avviare l'applicazione
```bash
docker-compose up
```

### Avviare in background
```bash
docker-compose up -d
```

### Fermare l'applicazione
```bash
docker-compose down
```

### Ricostruire i container (dopo modifiche al codice)
```bash
docker-compose up --build
```

### Visualizzare i log
```bash
# Tutti i servizi
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Accedere al database
```bash
docker-compose exec postgres psql -U gestionale -d gestionale_db
```

### Pulire tutto (database incluso)
```bash
docker-compose down -v
```

**ATTENZIONE**: Questo comando eliminerà tutti i dati nel database!

## Sviluppo

### Struttura del Progetto

```
Gestionale/
├── backend/
│   ├── models/          # Modelli del database
│   ├── schemas/         # Schemi Pydantic per validazione
│   ├── routers/         # Endpoint API
│   ├── main.py          # Entry point FastAPI
│   ├── database.py      # Configurazione database
│   ├── auth.py          # Utility autenticazione
│   └── requirements.txt # Dipendenze Python
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Componenti React riutilizzabili
│   │   ├── pages/       # Pagine dell'applicazione
│   │   ├── context/     # Context API (AuthContext)
│   │   ├── services/    # Chiamate API
│   │   └── App.js       # Componente principale
│   └── package.json     # Dipendenze Node.js
├── docker-compose.yml   # Configurazione Docker
└── README.md
```

### API Endpoints

La documentazione completa delle API è disponibile su http://localhost:8000/docs

Principali endpoint:

#### Autenticazione
- `POST /api/auth/register` - Registrazione
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Ottieni utente corrente

#### Gestione Spese
- `GET/POST /api/expenses/groups` - Lista/Crea gruppi
- `GET/PUT/DELETE /api/expenses/groups/{id}` - Dettagli gruppo
- `POST /api/expenses/groups/{id}/members` - Aggiungi membro
- `GET/POST /api/expenses/expenses` - Lista/Crea spese
- `GET /api/expenses/groups/{id}/balances` - Bilanci gruppo

#### Liste della Spesa
- `GET/POST /api/shopping-lists` - Lista/Crea liste
- `GET /api/shopping-lists/{id}` - Dettagli lista
- `GET /api/shopping-lists/shared/{token}` - Accedi con token
- `POST /api/shopping-lists/{id}/items` - Aggiungi articolo
- `PUT /api/shopping-lists/{list_id}/items/{item_id}` - Aggiorna articolo

#### Schede Palestra
- `GET/POST /api/gym/cards` - Lista/Crea schede
- `GET /api/gym/cards/{id}` - Dettagli scheda
- `POST /api/gym/cards/{id}/exercises` - Aggiungi esercizio
- `PUT /api/gym/cards/{card_id}/exercises/{exercise_id}` - Aggiorna esercizio

## Troubleshooting

### Errore: porta già in uso
Se ricevi errori tipo "port already in use", modifica le porte nel `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Frontend su porta 3001
  - "8001:8000"  # Backend su porta 8001
```

### Errore: database connection failed
Assicurati che il database sia completamente avviato prima del backend. Docker Compose gestisce questo automaticamente, ma se il problema persiste:

```bash
docker-compose down
docker-compose up
```

### Errore: CORS
Se hai problemi CORS, verifica che nel `docker-compose.yml` la variabile `REACT_APP_API_URL` corrisponda all'URL del backend.

### Modifiche non visibili
Se le modifiche al codice non sono visibili:

```bash
docker-compose down
docker-compose up --build
```

## Sicurezza

### Produzione

Prima di deployare in produzione:

1. **Cambia il SECRET_KEY** in `.env` con una chiave sicura:
   ```bash
   openssl rand -hex 32
   ```

2. **Usa password sicure** per il database

3. **Abilita HTTPS** con un reverse proxy (nginx, traefik)

4. **Configura CORS** per accettare solo domini trusted

5. **Usa variabili d'ambiente** per le credenziali sensibili

## Licenza

MIT License

## Contributi

Le contribuzioni sono benvenute! Sentiti libero di aprire issue o pull request.

## Supporto

Per problemi o domande, apri un issue su GitHub.
