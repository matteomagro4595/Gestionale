# 🚀 Deployment Produzione - Gestionale Android App

## ✅ Configurazione Finale

L'app Android è configurata per connettersi al backend di produzione su **Render.com**.

### 🌐 URL di Produzione

| Componente | URL |
|------------|-----|
| **Backend API** | `https://gestionale-backend-ztow.onrender.com` |
| **Backend Health** | `https://gestionale-backend-ztow.onrender.com/api/health` |
| **WebSocket** | `wss://gestionale-backend-ztow.onrender.com/api/notifications/ws` |
| **Frontend Web** | `https://gestionale-frontend-aa3q.onrender.com` |

---

## 📦 APK Finali Disponibili

### ⭐ **Production v2** (Per utenti finali - ULTIMA VERSIONE)

```bash
# Posizione:
~/Gestionale-Production-FINAL-v2.apk

# Configurazione:
- Backend: https://gestionale-backend-ztow.onrender.com
- Package: com.gestionale.app
- Nome: "Gestionale"
- Dimensione: 2.3 MB
- Firmato: ✅ (gestionale-release.keystore)
- Ottimizzato: ✅ (R8/ProGuard)
- Miglioramenti: ✅ Messaggi di errore dettagliati per diagnosi problemi
```

### 📋 Troubleshooting

**Se hai problemi con login/registrazione**, consulta la guida:
`android-app/TROUBLESHOOTING_LOGIN.md`

### 🛠️ **Development** (Per test locali)

```bash
# Posizione:
~/Gestionale-Development.apk

# Configurazione:
- Backend: http://localhost:8000 (10.0.2.2 per emulatore)
- Package: com.gestionale.app.dev
- Nome: "Gestionale Dev"
- Dimensione: 2.3 MB
```

---

## 🔨 Build Commands

### APK Production (con URL corretto)

```bash
cd /home/matteo/Documenti/GitHub/Gestionale/android-app

# Build APK Production
./gradlew assembleProductionRelease

# Output:
# app/build/outputs/apk/production/release/app-production-release.apk
```

### APK Development

```bash
# Build APK Development
./gradlew assembleDevelopmentRelease

# Output:
# app/build/outputs/apk/development/release/app-development-release.apk
```

---

## 📲 Installazione

### Su Emulatore/Dispositivo USB

```bash
# Production v2 (CONSIGLIATO)
adb install ~/Gestionale-Production-FINAL-v2.apk

# Development
adb install ~/Gestionale-Development.apk

# Se c'è una versione vecchia, prima disinstalla:
adb uninstall com.gestionale.app
```

### Su Telefono (Manuale)

1. Trasferisci `~/Gestionale-Production-FINAL-v2.apk` al telefono
2. Apri il file APK
3. Abilita "Installa app sconosciute" se richiesto
4. Tocca "Installa"

**⚠️ Nota**: Se hai già una versione installata, disinstallala prima di installare la nuova versione.

---

## ✅ Verifica Backend Online

Prima di distribuire, verifica che il backend risponda:

```bash
# Test API Health
curl https://gestionale-backend-ztow.onrender.com/api/health

# Risposta attesa:
# {"status":"healthy"}
```

Se non risponde:
- Il backend Render potrebbe essere in sleep (piano free)
- Ci vogliono 30-50 secondi per il cold start
- L'app ha timeout di 60s, quindi aspetta

---

## 🔧 Configurazione Tecnica

### Timeout Aumentati

Per supportare il cold start di Render.com (piano free):

```kotlin
// NetworkModule.kt
OkHttpClient.Builder()
    .connectTimeout(60, TimeUnit.SECONDS)  // ⬆️ Aumentato da 30s
    .readTimeout(60, TimeUnit.SECONDS)
    .writeTimeout(60, TimeUnit.SECONDS)
    .retryOnConnectionFailure(true)        // ✅ Retry automatico
```

### Product Flavors

```kotlin
// build.gradle.kts
productFlavors {
    create("development") {
        buildConfigField("String", "API_BASE_URL",
            "\"http://10.0.2.2:8000/api/\"")
    }

    create("production") {
        buildConfigField("String", "API_BASE_URL",
            "\"https://gestionale-backend-ztow.onrender.com/api/\"")
    }
}
```

---

## 🔐 Firma Digitale

Tutte le build Release sono firmate con:

```bash
# Keystore:
gestionale-release.keystore

# Alias: gestionale
# Password: password123
# Validità: 10,000 giorni
```

⚠️ **IMPORTANTE**: Conserva il keystore per pubblicare aggiornamenti su Google Play!

---

## 🎯 Test Rapido

### 1. Verifica Backend

```bash
curl https://gestionale-backend-ztow.onrender.com/api/health
```

✅ Se risponde `{"status":"healthy"}` → Backend OK

### 2. Installa App

```bash
adb install ~/Gestionale-Production-FINAL.apk
```

### 3. Testa Registrazione

1. Apri l'app sul dispositivo
2. Clicca "Registrati"
3. Compila: email, nome, cognome, password
4. Se tutto funziona: registrazione completata ✅

### 4. Testa Login

1. Usa le credenziali appena create
2. Dovresti vedere la Home con 4 tab
3. Naviga tra: Spese, Spesa, Palestra, Profilo

---

## 🔄 Sincronizzazione Frontend-Mobile

Le configurazioni sono sincronizzate:

**Frontend React** (`render.yaml`):
```yaml
REACT_APP_API_URL: https://gestionale-backend-ztow.onrender.com
```

**Android Production** (`build.gradle.kts`):
```kotlin
API_BASE_URL: https://gestionale-backend-ztow.onrender.com/api/
```

✅ **Stesso backend per web e mobile!**

---

## 📊 Confronto Versioni

| Feature | Development | Production |
|---------|-------------|------------|
| **Backend** | Localhost | Render.com ⭐ |
| **URL** | `http://10.0.2.2:8000` | `https://gestionale-backend-ztow.onrender.com` |
| **Nome App** | "Gestionale Dev" | "Gestionale" |
| **Package** | `com.gestionale.app.dev` | `com.gestionale.app` |
| **Timeout** | 60s | 60s |
| **Retry** | ✅ Abilitato | ✅ Abilitato |
| **Uso** | Test locali | Utenti finali |

---

## 🐛 Troubleshooting

### Problema: "Errore di connessione" al login

**Causa**: Backend Render in sleep mode (piano free)

**Soluzione**:
1. Aspetta 30-50 secondi per il cold start
2. Riprova il login
3. L'app ha timeout di 60s + retry automatico

### Problema: "Timeout dopo 60 secondi"

**Causa**: Backend offline o problemi di rete

**Verifica**:
```bash
curl https://gestionale-backend-ztow.onrender.com/api/health
```

Se non risponde:
1. Controlla Render Dashboard
2. Verifica stato del servizio
3. Controlla i log

### Problema: "Package com.gestionale.app già installato"

**Causa**: Versione precedente con firma diversa

**Soluzione**:
```bash
adb uninstall com.gestionale.app
adb install ~/Gestionale-Production-FINAL.apk
```

---

## 📈 Prossimi Passi (Opzionale)

### 1. Google Play Store

Per pubblicare su Play Store:
1. Crea un account Google Play Developer ($25 una tantum)
2. Carica `app-production-release.apk`
3. Compila listing, screenshot, descrizione
4. Pubblica!

### 2. Firebase Crashlytics

Per monitorare crash in produzione:
```gradle
// Aggiungi in build.gradle.kts
implementation("com.google.firebase:firebase-crashlytics-ktx")
```

### 3. Analytics

Per tracciare utilizzo:
```gradle
implementation("com.google.firebase:firebase-analytics-ktx")
```

### 4. Push Notifications (FCM)

Per notifiche push oltre WebSocket:
```gradle
implementation("com.google.firebase:firebase-messaging-ktx")
```

---

## 📝 Checklist Distribuzione

Prima di distribuire agli utenti:

- [x] Backend online e raggiungibile
- [x] APK firmato con keystore valido
- [x] Timeout aumentati per Render free tier
- [x] Retry automatico abilitato
- [x] URL sincronizzato con frontend web
- [x] Test registrazione funzionante
- [x] Test login funzionante
- [x] Test navigazione tra tab
- [ ] Test su dispositivi fisici (non solo emulatore)
- [ ] Screenshot per Play Store (opzionale)
- [ ] Privacy policy (se pubblichi su Play Store)

---

## 🎉 Risultato Finale

✅ **App Android nativa completa**
✅ **Connessa al backend Render.com**
✅ **Stesse API del frontend web**
✅ **Supporto offline con Room**
✅ **Notifiche real-time con WebSocket**
✅ **Material Design 3**
✅ **Firmata e ottimizzata (2.3 MB)**
✅ **Pronta per la distribuzione!**

---

**Ultima modifica**: 2025-11-01
**Backend URL**: `https://gestionale-backend-ztow.onrender.com`
**APK Version**: 1.0.0 (versionCode: 1)
