---
description: Controlla lo stato di tutti i servizi Docker
---

Verifica lo stato completo dei servizi del progetto Gestionale:

1. Esegui `docker-compose ps` per vedere tutti i container
2. Controlla i log recenti di ogni servizio:
   - Backend: `docker-compose logs --tail=50 backend`
   - Frontend: `docker-compose logs --tail=50 frontend`
   - Database: `docker-compose logs --tail=50 db`
3. Verifica la connettività:
   - Test connessione al backend: `curl http://localhost:8000/docs`
   - Test connessione al database dal backend
4. Mostra statistiche di utilizzo risorse con `docker stats --no-stream`

Fornisci un report completo dello stato di salute del sistema.
