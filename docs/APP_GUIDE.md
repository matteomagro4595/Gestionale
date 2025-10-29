# 📊 Guida Gestionale - Applicazione Completa

## Panoramica
**Gestionale** è un'applicazione web all-in-one che integra tre moduli principali per aiutarti a organizzare la vita quotidiana:

- 💰 **Gestione Spese**: Condividi e traccia le spese con amici, familiari o coinquilini
- 🛒 **Lista della Spesa**: Crea liste collaborative e coordinate gli acquisti
- 💪 **Schede Palestra**: Organizza i tuoi allenamenti e traccia i progressi

Tutti i moduli sono integrati in un'unica piattaforma con un sistema di autenticazione unificato e notifiche in tempo reale.

---

## 🚀 Iniziare

### Registrazione
1. Vai alla pagina di **Registrazione**
2. Compila il form con:
   - **Nome**: Il tuo nome
   - **Cognome**: Il tuo cognome
   - **Email**: Indirizzo email valido (usato per il login)
   - **Password**: Password sicura (minimo 6 caratteri)
3. Clicca **Registrati**
4. Verrai automaticamente loggato nell'applicazione

### Login
1. Vai alla pagina di **Login**
2. Inserisci:
   - **Email**: L'email usata in fase di registrazione
   - **Password**: La tua password
3. Clicca **Accedi**
4. Verrai reindirizzato alla Home

### Durata Sessione
- La sessione dura **72 ore** (3 giorni)
- Dopo 72 ore senza attività, sarai automaticamente disconnesso
- Riceverai un logout automatico alla scadenza del token
- Puoi effettuare manualmente il logout dal menu utente

---

## 🏠 Navigazione

### Barra di Navigazione
La barra di navigazione superiore è sempre visibile e contiene:

#### Lato Sinistro
- **Logo Gestionale**: Cliccando torni alla Home
- **🏠 Home**: Pagina principale con i 3 moduli
- **💰 Spese**: Accesso diretto alla gestione spese
- **🛒 Lista Spesa**: Accesso diretto alle liste della spesa
- **💪 Palestra**: Accesso diretto alle schede palestra

#### Lato Destro
- **🔔 Notifiche**: Campanella con badge per notifiche non lette
- **👤 Menu Utente**: Mostra nome, cognome, email e pulsante logout

### Temi Dinamici
L'interfaccia cambia colore in base al modulo attivo:
- **Home**: Tema blu predefinito
- **Spese**: Tema blu spese (#3498db)
- **Lista Spesa**: Tema verde (#2ecc71)
- **Palestra**: Tema rosso (#e74c3c)

---

## 🔔 Sistema Notifiche

### Come Funziona
Il sistema notifiche utilizza **WebSocket** per aggiornamenti in tempo reale:
- Connessione automatica al login
- Notifiche istantanee senza ricaricare la pagina
- Supporto multi-dispositivo (puoi essere connesso da più device)
- Auto-riconnessione in caso di perdita di connessione

### Tipi di Notifiche

#### Notifiche Spese
- **Nuovo membro**: Qualcuno si è unito a un tuo gruppo
- **Nuova spesa**: Qualcuno ha aggiunto una spesa al gruppo
- **Modifica spesa**: Una spesa è stata modificata o eliminata

#### Notifiche Lista Spesa
- **Nuovo membro**: Qualcuno si è unito alla tua lista
- **Nuovo articolo**: Qualcuno ha aggiunto un articolo
- **Articolo completato**: Qualcuno ha spuntato un articolo

### Visualizzare le Notifiche
1. Clicca sulla **campanella** 🔔 nella barra di navigazione
2. Vedi l'elenco completo delle notifiche
3. **Badge rosso**: Indica il numero di notifiche non lette
4. **Indicatore verde**: Mostra che la connessione WebSocket è attiva

### Gestire le Notifiche
- **Clicca su una notifica**: Ti porta alla risorsa associata (gruppo o lista)
- **Segna come letta**: Le notifiche si segnano automaticamente quando le clicchi
- **Segna tutte come lette**: Pulsante per segnare tutte insieme
- **Filtra**: Vedi tutte le notifiche o solo quelle non lette

### Notifiche Browser
- L'app richiede il permesso per le notifiche del browser
- Se accetti, riceverai notifiche anche quando l'app è in background
- Le notifiche browser mostrano titolo e messaggio
- Cliccando la notifica browser, ti porta all'app

---

## 💰 Modulo Gestione Spese

### Cosa Puoi Fare
- Creare gruppi spese per progetti, vacanze, coinquilini
- Invitare membri tramite link, token o WhatsApp
- Registrare spese con tag e partecipanti
- Calcolare automaticamente i saldi
- Visualizzare chi deve soldi a chi
- Monitorare statistiche e riepilogo

### Accesso Rapido
- **Dashboard**: `/expenses` - Vedi tutti i tuoi gruppi
- **Riepilogo**: `/expenses/summary` - Statistiche globali
- **Dettaglio Gruppo**: Clicca su un gruppo dalla dashboard

### Guide Dettagliate
Consulta **EXPENSES_GUIDE.md** per documentazione completa su:
- Come creare e gestire gruppi
- Come invitare membri
- Come registrare spese
- Come interpretare i saldi
- Best practices per diversi scenari

---

## 🛒 Modulo Lista della Spesa

### Cosa Puoi Fare
- Creare liste della spesa condivise
- Condividere via link, token o WhatsApp
- Aggiungere articoli con quantità e note
- Sistema anti-duplicati con autocomplete
- Segnare articoli come completati
- Ordinamento automatico (alfabetico + completati in fondo)

### Accesso Rapido
- **Liste**: `/shopping` - Vedi tutte le tue liste
- **Dettaglio Lista**: Clicca su una lista dalla pagina principale
- **Unisciti con Token**: Inserisci un token per unirti a una lista

### Guide Dettagliate
Consulta **SHOPPING_GUIDE.md** per documentazione completa su:
- Come creare e condividere liste
- Sistema anti-duplicati con suggerimenti
- Collaborazione e membri
- Use cases (famiglia, coinquilini, eventi)
- Best practices

---

## 💪 Modulo Schede Palestra

### Cosa Puoi Fare
- Creare schede di allenamento personalizzate
- Aggiungere esercizi con serie, ripetizioni, peso
- Organizzare esercizi in ordine di esecuzione
- Tracciare progressi e note per ogni esercizio
- Gestire multiple schede (Push/Pull/Legs, Upper/Lower, etc.)

### Accesso Rapido
- **Schede**: `/gym` - Vedi tutte le tue schede
- **Dettaglio Scheda**: Clicca su una scheda dalla pagina principale
- **Durante Allenamento**: Apri la scheda e segui gli esercizi

### Guide Dettagliate
Consulta **GYM_GUIDE.md** per documentazione completa su:
- Come creare e gestire schede
- Come strutturare gli esercizi
- Tipi di schede (Full Body, PPL, Upper/Lower)
- Progressione e periodizzazione
- Best practices per principianti, intermedi e avanzati

---

## 👥 Funzionalità Condivise

### Condivisione Risorse
Sia le **Spese** che le **Liste della Spesa** supportano la condivisione:

#### Metodo 1: Link Diretto
1. Apri il gruppo/lista
2. Clicca **Copia Link**
3. Invia il link a chi vuoi
4. Quando aprono il link, si uniscono automaticamente

**Formato Link**:
- Spese: `https://app.com/expenses/groups/join/TOKEN`
- Shopping: `https://app.com/shopping/join/TOKEN`

#### Metodo 2: Token Manuale
1. Apri il gruppo/lista
2. Clicca **Copia Token**
3. Invia solo il token (codice alfanumerico)
4. Gli altri possono inserirlo nella pagina "Accedi con Token"

#### Metodo 3: WhatsApp
1. Clicca **📱 Condividi su WhatsApp**
2. Si apre WhatsApp con messaggio pre-compilato
3. Seleziona contatto o gruppo
4. Invia il messaggio con link

### Gestione Membri
- **Proprietario**: Chi ha creato la risorsa (icona 👑)
  - Può eliminare la risorsa
  - Può modificare dettagli principali
- **Membri**: Chi si è unito
  - Possono aggiungere/modificare contenuti
  - Non possono eliminare la risorsa

---

## 🔐 Sicurezza e Privacy

### Autenticazione
- Sistema basato su **JWT (JSON Web Token)**
- Password hashate con bcrypt
- Token inviato in ogni richiesta API
- Logout automatico alla scadenza (72 ore)

### Privacy Dati
- **Gruppi Spese**: Visibili solo ai membri
- **Liste Spesa**: Visibili solo ai membri
- **Schede Palestra**: Visibili solo al proprietario (non condivisibili)
- Token di condivisione: Unici e non indicizzati

### Best Practices Sicurezza
- ✅ Usa password forti (minimo 8 caratteri, mix lettere/numeri/simboli)
- ✅ Non condividere pubblicamente i token di gruppi/liste
- ✅ Controlla periodicamente i membri dei tuoi gruppi/liste
- ⚠️ Effettua logout su dispositivi condivisi
- ⚠️ Non salvare la password nel browser su PC pubblici

---

## 📱 Ottimizzazione Mobile

### Design Responsivo
L'applicazione è ottimizzata per tutti i dispositivi:
- **Desktop**: Layout a griglia con sidebar
- **Tablet**: Layout adattivo con navigazione compatta
- **Mobile**: Layout verticale, touch-friendly

### Funzionalità Mobile
- **Token scrollabili**: Non rompono il layout
- **Menu hamburger**: Navigazione ottimizzata
- **Tap targets grandi**: Facile interazione touch
- **Modal full-screen**: Miglior esperienza mobile

### Uso Consigliato Mobile
1. **Al supermercato**: Apri la lista spesa, spunta gli articoli
2. **In palestra**: Apri la scheda, segui gli esercizi
3. **In viaggio**: Registra le spese condivise
4. **Notifiche**: Resta aggiornato in tempo reale

---

## 🎯 Scenari d'Uso Completi

### Scenario 1: Vacanza con Amici
```
Setup:
1. Crea gruppo spese "Vacanza Estate 2025"
2. Condividi link su WhatsApp di gruppo
3. Crea lista spesa "Cibo Vacanza"
4. Condividi anche quella

Durante la vacanza:
- Mario paga hotel → Registra in gruppo spese
- Luigi fa spesa → Aggiunge articoli in lista
- Peach paga benzina → Registra in spese
- Tutti spuntano la lista al supermercato

A fine vacanza:
- Controlla saldi nel gruppo spese
- Trasferisci i soldi secondo i saldi
- Mantieni lista spesa come riferimento per prossima volta
```

### Scenario 2: Coinquilini
```
Setup:
1. Crea gruppo spese "Casa Via Roma 10"
2. Crea lista spesa "Necessità Casa"
3. Condividi entrambi con coinquilini

Uso quotidiano:
- Bolletta luce → Spesa in gruppo (divisa tra tutti)
- Finito carta igienica → Aggiungi a lista
- Qualcuno va al super → Compra dalla lista
- Fine mese → Controlla saldi e pareggia

Palestra:
- Ognuno gestisce le proprie schede personalmente
- Nessuna interferenza tra coinquilini
```

### Scenario 3: Famiglia
```
Setup:
1. Gruppo spese "Famiglia Rossi" per spese condivise
2. Lista spesa "Settimanale" sempre attiva
3. Papà e mamma hanno proprie schede palestra

Uso:
Lunedì:
- Mamma aggiunge "latte, pane" alla lista
- Papà registra spesa pediatra in gruppo

Mercoledì:
- Papà va al super, spunta dalla lista
- Riceve notifica: "Figlio ha aggiunto Nutella"
- Compra anche quella

Venerdì:
- Papà va in palestra, segue scheda "Upper Body"
- Mamma fa shopping, registra spesa in gruppo

Fine mese:
- Controllano riepilogo spese
- Vedono statistiche per categoria
```

### Scenario 4: Progetto di Gruppo
```
Setup:
1. Gruppo spese "Progetto Evento Beneficenza"
2. Lista spesa "Materiali Evento"

Fase Preparazione:
- Ogni membro registra le spese sostenute
- Lista condivisa per coordinare acquisti
- Tag spese per categoria (Allestimento, Cibo, Materiali)

Durante Evento:
- Spese urgenti registrate in tempo reale
- Notifiche a tutti i membri
- Lista spesa per comprare mancanze dell'ultimo minuto

Post Evento:
- Riepilogo completo spese
- Calcolo saldi finali
- Statistiche per report
```

---

## 💡 Tips e Tricks

### Organizzazione Generale
- ✅ **Nomina chiaramente** le risorse: "Vacanza Mare 2025" invece di "Gruppo 1"
- ✅ **Usa le descrizioni** per aggiungere contesto
- ✅ **Archivia mentalmente** risorse vecchie (usa prefisso "[OLD]")
- ✅ **Controlla notifiche** regolarmente per restare sincronizzato

### Workflow Efficiente
```
Mattina:
1. Controlla notifiche (30 secondi)
2. Apri lista spesa, vedi cosa manca
3. Aggiungi articoli se necessario

Durante il giorno:
- Registra spese immediatamente
- Spunta articoli mentre compri
- Segui scheda palestra se ti alleni

Sera:
- Rivedi notifiche perse
- Aggiorna liste per domani
- Pianifica allenamenti settimana
```

### Sincronizzazione Multi-Dispositivo
- Puoi usare l'app da PC, tablet e smartphone contemporaneamente
- Tutte le modifiche si sincronizzano in tempo reale
- Le notifiche arrivano su tutti i dispositivi connessi
- Usa il dispositivo più comodo per ogni task:
  - **PC**: Gestione gruppi, statistiche, riepilogo
  - **Smartphone**: Uso quotidiano, spesa, palestra

---

## 🆘 Risoluzione Problemi

### Login/Autenticazione

#### "Credenziali non valide"
- Controlla email e password
- Email è case-sensitive
- Hai confermato la registrazione?

#### "Sessione scaduta"
- Sono passate più di 72 ore dall'ultimo login
- Effettua nuovamente il login
- Il sistema salverà di nuovo il token

#### "Token non valido"
- Ricarica la pagina
- Se persiste, effettua logout e login

### Notifiche

#### Non ricevo notifiche
- Controlla l'indicatore verde sulla campanella
- Se non c'è, la connessione WebSocket è persa
- Ricarica la pagina per riconnetterti
- Verifica connessione internet

#### Notifiche browser non funzionano
- Controlla permessi browser (Impostazioni → Notifiche)
- Assicurati di aver accettato il permesso
- Alcuni browser bloccano notifiche su HTTP (serve HTTPS)

#### Badge notifiche non si aggiorna
- Ricarica la pagina
- Segna notifiche come lette manualmente
- Controlla console browser per errori

### Condivisione

#### "Non hai accesso a questa risorsa"
- Il link/token potrebbe essere errato
- La risorsa potrebbe essere stata eliminata
- Chiedi al proprietario un nuovo link

#### Il link condiviso non funziona
- Copia nuovamente il link (potrebbe essersi troncato)
- Usa il token manuale come alternativa
- Verifica che l'altro utente sia registrato

### Sincronizzazione

#### Le modifiche non appaiono
- Controlla connessione internet
- Ricarica la pagina
- Verifica che l'altro utente abbia salvato le modifiche

#### Vedo dati vecchi
- Forza refresh: Ctrl+F5 (PC) o Cmd+Shift+R (Mac)
- Cancella cache browser
- Disconnettiti e riconnettiti

---

## ❓ Domande Frequenti

### Generali

**Posso usare l'app offline?**
No, serve connessione internet per sincronizzare i dati con gli altri membri.

**I miei dati sono sicuri?**
Sì, password hashate, token JWT, dati accessibili solo ai membri autorizzati.

**Posso cambiare email o password?**
Attualmente non implementato, contatta assistenza se necessario.

**Quanti gruppi/liste/schede posso creare?**
Nessun limite, crea quante risorse vuoi.

### Spese

**Supporta valute diverse dall'Euro?**
No, attualmente solo Euro (€).

**Posso modificare una spesa?**
Sì, clicca sulla spesa e modifica i campi.

**Come funziona il calcolo dei saldi?**
Automatico: somma quanto hai speso - quanto dovevi spendere = saldo.

### Liste Spesa

**Gli articoli completati vengono eliminati?**
No, restano nella lista ma vanno in fondo. Puoi eliminarli manualmente.

**Posso ordinare la lista manualmente?**
No, l'ordine è automatico: alfabetico per non completati, completati in fondo.

### Palestra

**Posso condividere le schede?**
No, le schede sono personali e private.

**Posso modificare un esercizio?**
Attualmente no, eliminalo e ricrealo con dati aggiornati.

**Posso copiare una scheda?**
Non direttamente, ricrea manualmente gli esercizi in una nuova scheda.

---

## 🚀 Roadmap Futura

Funzionalità in arrivo (non promesse):
- 📊 Grafici spese nel tempo
- 📷 Foto scontrini nelle spese
- 🔄 Modifica esercizi palestra
- 📋 Template schede palestra
- 🌍 Supporto multi-lingua
- 📱 App mobile nativa
- 🔔 Notifiche email
- 👤 Modifica profilo utente
- 💾 Esporta dati in CSV/PDF
- 🎨 Temi personalizzabili

---

## 📞 Supporto

### Hai bisogno di aiuto?
- Consulta le guide dettagliate per ogni modulo
- Controlla questa guida completa
- Verifica la sezione Risoluzione Problemi

### Segnala un Bug
Se trovi un problema:
1. Verifica che non sia nella sezione Problemi Comuni
2. Prova a ricaricare la pagina
3. Se persiste, annota:
   - Cosa stavi facendo
   - Messaggio di errore (se presente)
   - Browser e dispositivo usato
4. Contatta l'assistenza

### Richiesta Funzionalità
Hai un'idea per migliorare l'app? Invia il tuo feedback!

---

## 📚 Guide Correlate

Per documentazione dettagliata su ogni modulo:
- **EXPENSES_GUIDE.md**: Guida completa Gestione Spese
- **SHOPPING_GUIDE.md**: Guida completa Lista della Spesa
- **GYM_GUIDE.md**: Guida completa Schede Palestra

---

**Buon lavoro con Gestionale!** 📊

L'applicazione che organizza la tua vita in un unico posto.
