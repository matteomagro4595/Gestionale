# Gestionale - App Android Nativa

App Android nativa che utilizza le API REST del backend FastAPI per gestire spese condivise, liste della spesa collaborative e schede palestra.

## 🚀 Caratteristiche

- **Autenticazione JWT** sicura con storage token criptato
- **Gestione Spese Condivise**: crea gruppi, aggiungi spese, calcola bilanci automaticamente
- **Liste della Spesa**: collaborative con sync real-time via WebSocket
- **Schede Palestra**: crea workout personalizzati con esercizi drag-and-drop
- **Notifiche Real-time**: WebSocket per aggiornamenti istantanei
- **Supporto Offline**: cache locale con Room Database
- **Material Design 3**: UI moderna con Jetpack Compose
- **Architettura MVVM**: pulita, scalabile e testabile

## 📋 Requisiti

- **Android Studio** Hedgehog (2023.1.1) o superiore
- **JDK 17** o superiore
- **Gradle 8.2** o superiore
- **Android SDK**:
  - Compile SDK: 34
  - Min SDK: 26 (Android 8.0)
  - Target SDK: 34

## 🛠️ Tecnologie Utilizzate

### Core
- **Kotlin** 1.9.20
- **Jetpack Compose** (UI moderna e reattiva)
- **Material Design 3**

### Networking
- **Retrofit 2.9.0** (API REST)
- **OkHttp 4.12.0** (HTTP client + WebSocket)
- **Gson** (JSON parsing)

### Database & Storage
- **Room 2.6.1** (cache offline)
- **DataStore** (preferences criptate)

### Dependency Injection
- **Hilt 2.48** (Dagger)

### Async
- **Kotlin Coroutines** (operazioni asincrone)
- **Flow** (stream reattivi)

### Navigation
- **Jetpack Navigation Compose**

### Altro
- **Coil** (image loading)
- **Accompanist** (system UI, permissions)
- **WorkManager** (background tasks)
- **Biometric** (autenticazione biometrica)

## 📁 Struttura del Progetto

```
app/
├── data/
│   ├── local/          # Room Database
│   │   ├── dao/        # Data Access Objects
│   │   └── entity/     # Database entities
│   ├── remote/         # Network layer
│   │   ├── api/        # Retrofit API interfaces
│   │   ├── AuthInterceptor.kt
│   │   └── WebSocketManager.kt
│   ├── models/         # DTOs (API models)
│   └── repository/     # Repository pattern
├── domain/
│   └── usecase/        # Business logic
├── presentation/
│   ├── auth/           # Login, Register
│   ├── home/           # Home screen + tabs
│   ├── expenses/       # Expense management
│   ├── shopping/       # Shopping lists
│   ├── gym/            # Workout cards
│   ├── notifications/  # Notifications
│   ├── common/
│   │   └── theme/      # Material Design theme
│   └── navigation/     # Navigation logic
├── di/                 # Dependency Injection modules
└── utils/              # Utilities
```

## ⚙️ Configurazione

### 1. Clona il repository

```bash
cd android-app
```

### 2. Configura l'URL del backend

Apri `app/build.gradle.kts` e modifica gli URL del backend:

```kotlin
defaultConfig {
    // Per emulatore Android
    buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:8000/api/\"")
    buildConfigField("String", "WS_BASE_URL", "\"ws://10.0.2.2:8000/api/\"")
}
```

**IMPORTANTE:**
- **Emulatore**: usa `10.0.2.2` (redirect verso `localhost` del PC)
- **Dispositivo fisico**: usa l'IP locale del tuo PC (es. `192.168.1.100`)
- **Produzione**: sostituisci con il tuo dominio

Esempio per dispositivo fisico:
```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.100:8000/api/\"")
buildConfigField("String", "WS_BASE_URL", "\"ws://192.168.1.100:8000/api/\"")
```

### 3. Backend FastAPI

Assicurati che il backend sia in esecuzione:

```bash
# Dalla root del progetto
cd ../
docker-compose up -d
```

Verifica che il backend sia accessibile:
```bash
curl http://localhost:8000/api/health
```

### 4. Build del progetto

```bash
# Dalla directory android-app
./gradlew build
```

## 🚀 Esecuzione

### Da Android Studio

1. Apri il progetto `android-app` in Android Studio
2. Aspetta il sync di Gradle
3. Seleziona un emulatore o collega un dispositivo fisico
4. Premi Run ▶️

### Da Command Line

```bash
# Build e installa su dispositivo connesso
./gradlew installDebug

# Oppure build dell'APK
./gradlew assembleDebug
# APK generato in: app/build/outputs/apk/debug/app-debug.apk
```

## 📱 Funzionalità

### Autenticazione
- **Registrazione** con email, password, nome e cognome
- **Login** con JWT token (valido 72 ore)
- **Logout** sicuro con pulizia token
- **Profilo utente** con aggiornamento email/password

### Spese Condivise
- Crea **gruppi di spesa** con nome personalizzato
- Aggiungi **membri** tramite email
- Registra **spese** con:
  - Descrizione
  - Importo
  - Tag (Bolletta, Affitto, Spesa, ecc.)
  - Divisione: Equa, Importi esatti, Percentuale
- Visualizza **bilanci** in tempo reale
- **Condividi gruppi** via link/WhatsApp

### Liste della Spesa
- Crea **liste collaborative**
- Aggiungi **articoli** con quantità e note
- **Spunta articoli** completati
- **Sync real-time** tra utenti (WebSocket)
- **Condividi liste** via link/WhatsApp

### Schede Palestra
- Crea **workout personalizzati**
- Aggiungi **esercizi** con:
  - Nome esercizio
  - Serie
  - Ripetizioni
  - Peso (opzionale)
  - Note (opzionale)
- **Riordina esercizi** (drag-and-drop / frecce)

### Notifiche
- **Real-time** via WebSocket
- Notifiche per:
  - Nuovi membri nel gruppo
  - Nuove spese aggiunte
  - Articoli spesa completati
- **Badge** con contatore non lette
- Cache offline con Room

## 🔧 Configurazione Avanzata

### Cambio URL Backend

Per cambiare dinamicamente l'URL (utile per test):

1. Modifica `BuildConfig.API_BASE_URL` in `app/build.gradle.kts`
2. Rebuild del progetto

### Abilitazione HTTPS

Per produzione, usa HTTPS/WSS:

```kotlin
// In build.gradle.kts - buildTypes.release
buildConfigField("String", "API_BASE_URL", "\"https://tuo-dominio.com/api/\"")
buildConfigField("String", "WS_BASE_URL", "\"wss://tuo-dominio.com/api/\"")
```

Rimuovi `android:usesCleartextTraffic="true"` da `AndroidManifest.xml`.

### Deep Links

L'app supporta deep links per share tokens:

```xml
<!-- Già configurato in AndroidManifest.xml -->
<intent-filter android:autoVerify="true">
    <data
        android:scheme="https"
        android:host="gestionale.app"
        android:pathPrefix="/share" />
</intent-filter>
```

Esempio URL: `https://gestionale.app/share/expense?token=ABC123`

## 📝 Note Importanti

### Cleartext Traffic (HTTP)

Per development, l'app permette HTTP. In produzione:
1. Usa HTTPS/WSS
2. Rimuovi `android:usesCleartextTraffic="true"`

### Permessi

L'app richiede:
- `INTERNET` - comunicazione con API
- `ACCESS_NETWORK_STATE` - stato connessione
- `POST_NOTIFICATIONS` - notifiche push (Android 13+)
- `USE_BIOMETRIC` - autenticazione biometrica (opzionale)

### WebSocket

Il WebSocket si connette automaticamente al login e disconnette al logout. Gestisce riconnessioni automatiche in caso di errore.

### Cache Offline

Le notifiche sono cachate localmente con Room. Le altre entità possono essere aggiunte estendendo il database.

## 🐛 Debug

### Backend non raggiungibile

1. Verifica che il backend sia attivo: `curl http://localhost:8000/api/health`
2. Controlla l'URL in `BuildConfig.API_BASE_URL`
3. Per emulatore, usa `10.0.2.2` invece di `localhost`
4. Per dispositivo fisico, usa l'IP locale del PC

### Problemi di build

```bash
# Clean e rebuild
./gradlew clean build

# Invalida cache in Android Studio
File > Invalidate Caches > Invalidate and Restart
```

### Errori JWT

Se ricevi errori 401:
1. Verifica che il token sia salvato correttamente
2. Controlla la validità del token (scadenza 72h)
3. Fai logout e login di nuovo

## 📄 License

Questo progetto è parte del sistema Gestionale.

## 👥 Contributing

Per contribuire:
1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📞 Supporto

Per problemi o domande, apri una issue nel repository.

---

**Sviluppato con ❤️ usando Kotlin e Jetpack Compose**
