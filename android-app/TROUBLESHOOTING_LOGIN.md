# Troubleshooting Login/Registrazione - App Android

## Miglioramenti Apportati

Ho migliorato la gestione degli errori nell'app per fornire messaggi più dettagliati che aiutano a diagnosticare il problema.

### Nuovi Messaggi di Errore

L'app ora mostra messaggi specifici per ogni tipo di errore:

- **Impossibile raggiungere il server**: Problema di connettività DNS/Internet
- **Timeout: il server non risponde**: Il backend impiega troppo tempo (>60s)
- **Errore SSL/Certificato**: Problema con il certificato HTTPS
- **Errore di rete**: Problema generico di connessione
- **Dati non validi**: HTTP 422 - campi mancanti o errati
- **Servizio temporaneamente non disponibile**: HTTP 503 - backend offline

## APK Aggiornato

**Nuovo APK**: `~/Gestionale-Production-FINAL-v2.apk` (2.3 MB)

Questo APK include:
- ✅ Messaggi di errore dettagliati
- ✅ Backend produzione: `https://gestionale-backend-ztow.onrender.com`
- ✅ Timeout: 60 secondi
- ✅ Retry automatico

## Test Effettuati

### ✅ Backend Online e Funzionante

```bash
# Health check
curl https://gestionale-backend-ztow.onrender.com/api/health
# ✓ Risposta: {"status":"healthy"}

# Registrazione
curl -X POST https://gestionale-backend-ztow.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","nome":"Test","cognome":"User"}'
# ✓ Risposta: HTTP 201 Created

# Login
curl -X POST https://gestionale-backend-ztow.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
# ✓ Risposta: HTTP 200 OK con access_token
```

### ✅ App Funziona su Emulatore

L'app è stata testata sull'emulatore Android e funziona correttamente:
- Login: ✅
- Registrazione: ✅
- Connessione al backend produzione: ✅

## Checklist Diagnostica per Telefono Fisico

### 1. Verifica Connessione Internet

Sul telefono:
1. Apri il browser (Chrome/Firefox)
2. Vai su: `https://gestionale-backend-ztow.onrender.com/api/health`
3. Dovresti vedere: `{"status":"healthy"}`

**Se non vedi questa risposta**: Il telefono non riesce a raggiungere il server.

Possibili cause:
- Nessuna connessione WiFi/Dati mobili
- Firewall che blocca Render.com
- DNS che non risolve il dominio

### 2. Verifica Messaggi di Errore nell'App

Quando provi a registrarti o fare login:
1. Compila tutti i campi
2. Premi "Registrati" o "Accedi"
3. **Nota il messaggio di errore che appare**

I messaggi possibili sono:
- **"Impossibile raggiungere il server"** → Problema di connettività
- **"Timeout: il server non risponde"** → Backend in cold start o lento
- **"Errore SSL/Certificato"** → Problema certificati HTTPS
- **"Dati non validi"** → Email/password/nome/cognome mancanti o errati
- **Nessun messaggio (si blocca)** → Potrebbe esserci un crash

### 3. Verifica Versione Android

L'app richiede **Android 8.0 (API 26)** o superiore.

Per verificare:
1. Impostazioni → Info sul telefono → Versione Android
2. Deve essere ≥ 8.0

### 4. Reinstalla l'APK Aggiornato

```bash
# 1. Disinstalla versione vecchia
# Sul telefono: Impostazioni → App → Gestionale → Disinstalla

# 2. Trasferisci nuovo APK al telefono
# Copia ~/Gestionale-Production-FINAL-v2.apk al telefono

# 3. Installa
# Apri il file APK sul telefono e tocca Installa
```

### 5. Abilita Logging (Opzionale)

Se hai abilitato "Opzioni sviluppatore" sul telefono:

1. Collega il telefono al PC via USB
2. Abilita "Debug USB" sul telefono
3. Sul PC:
   ```bash
   # Verifica connessione
   adb devices

   # Avvia app e cattura log
   adb logcat -c  # pulisci log
   # (prova a registrarti/accedere sull'app)
   adb logcat -d | grep -i "gestionale\|error\|exception" > ~/app_logs.txt
   ```
4. Invia il file `~/app_logs.txt` per analisi

## Possibili Cause del Problema

### 1. Problema di Rete (Più Probabile)

**Sintomo**: Errore "Impossibile raggiungere il server"

**Causa**: Il telefono non riesce a connettersi a `gestionale-backend-ztow.onrender.com`

**Soluzioni**:
- Verifica WiFi/Dati mobili attivi
- Prova a disabilitare VPN se attiva
- Prova con rete WiFi diversa
- Verifica che il browser riesca ad aprire il link del backend

### 2. Timeout (Probabile)

**Sintomo**: Errore "Timeout: il server non risponde"

**Causa**: Il backend Render.com (piano free) è in cold start e impiega >60s

**Soluzione**:
- Apri il browser e vai su `https://gestionale-backend-ztow.onrender.com/api/health`
- Aspetta che risponda (può impiegare 30-50 secondi la prima volta)
- Riprova il login/registrazione nell'app

### 3. Certificati SSL (Meno Probabile)

**Sintomo**: Errore "Errore SSL/Certificato"

**Causa**: Android non riconosce il certificato di Render.com (raro, ma possibile su vecchi dispositivi)

**Soluzione**:
- Aggiorna Android all'ultima versione
- Aggiorna "WebView System" dal Play Store

### 4. Dati non Validi (Improbabile)

**Sintomo**: Errore "Dati non validi"

**Causa**: Campi email/password/nome/cognome non corretti

**Soluzione**:
- Email deve essere valida (es: `test@example.com`)
- Password deve essere ≥6 caratteri
- Nome e Cognome non devono essere vuoti
- Le due password devono coincidere (solo per registrazione)

## Test Veloce

Per testare rapidamente:

1. **Test Backend**: Apri browser sul telefono → `https://gestionale-backend-ztow.onrender.com/api/health`
   - ✅ Se risponde `{"status":"healthy"}` → backend OK
   - ❌ Se dà errore/timeout → problema connettività telefono

2. **Test App**: Apri app → Registrati con:
   - Email: `tuaemail@example.com`
   - Nome: `Mario`
   - Cognome: `Rossi`
   - Password: `password123`
   - Conferma: `password123`

3. **Leggi messaggio di errore** che appare e cerca sopra quale può essere la causa

## Prossimi Passi

Se il problema persiste:

1. **Cattura screenshot** del messaggio di errore nell'app
2. **Verifica** se il browser riesce ad aprire `https://gestionale-backend-ztow.onrender.com/api/health`
3. **Prova** con connessione WiFi diversa
4. **Collega** telefono via USB e cattura log con adb (vedi sopra)

## Note Tecniche

- Backend: `https://gestionale-backend-ztow.onrender.com`
- Timeout OkHttp: 60s (connect, read, write)
- Retry: Automatico su errori di connessione
- TLS: TLSv1.3 con certificato Google Trust Services (WE1)
- App: Firmata con keystore `gestionale-release.keystore`

---

**Ultima modifica**: 2025-11-01
**Versione APP**: 1.0.0 (build 1)
**APK**: `~/Gestionale-Production-FINAL-v2.apk`
