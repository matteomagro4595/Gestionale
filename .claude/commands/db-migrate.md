---
description: Crea e applica migrazioni database
---

Quando è necessario modificare lo schema del database:

## 1. Analisi Modifiche
- Identifica quali modelli in `backend/models/` sono stati modificati
- Determina il tipo di modifica:
  - Nuova tabella
  - Nuova colonna
  - Modifica colonna esistente
  - Nuova relazione
  - Indice o vincolo

## 2. Creazione Migrazione
- Le migrazioni sono gestite tramite SQLAlchemy
- Modifica i modelli in `backend/models/`
- Il database viene ricreato automaticamente in sviluppo

## 3. Per Produzione (Alembic - se implementato)
Se in futuro verrà aggiunto Alembic:
```bash
# Genera migrazione automatica
docker-compose exec backend alembic revision --autogenerate -m "descrizione"

# Applica migrazioni
docker-compose exec backend alembic upgrade head

# Verifica stato
docker-compose exec backend alembic current
```

## 4. Sviluppo Attuale
Il progetto usa attualmente SQLAlchemy con `create_all()`:
- Modifica i modelli in `backend/models/`
- Riavvia il backend: `docker-compose restart backend`
- Il database viene aggiornato automaticamente
- **ATTENZIONE**: In sviluppo potrebbe essere necessario ricreare il database

## 5. Ricreare Database (se necessario)
```bash
# Ferma i servizi
docker-compose down

# Rimuovi il volume del database (CANCELLA TUTTI I DATI!)
docker volume rm gestionale_postgres_data

# Riavvia
docker-compose up -d

# Popola con dati di test se necessario
docker-compose exec backend python scripts/populate_db.py
```

## 6. Verifica
- Controlla i log del backend per confermare schema
- Testa le operazioni CRUD sulle tabelle modificate
- Verifica che le relazioni funzionino correttamente

## 7. Commit
- Committa le modifiche ai modelli
- Documenta breaking changes se presenti
- Aggiorna README se necessario

**NOTA**: Per produzione, sarà necessario implementare un sistema di migrazioni appropriato (Alembic) per evitare perdita di dati.
