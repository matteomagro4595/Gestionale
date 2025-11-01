# Architettura App Android - Gestionale

## 📐 Pattern Architetturale: MVVM + Clean Architecture

L'app segue il pattern **MVVM (Model-View-ViewModel)** combinato con **Clean Architecture** per garantire separazione delle responsabilità, testabilità e manutenibilità.

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   UI/Views   │◄─│  ViewModels  │◄─│ Use Cases    │ │
│  │  (Compose)   │  │   (State)    │  │   (Logic)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                       DOMAIN                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Business Logic / Use Cases            │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                        DATA                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Repositories │◄─│  Remote API  │  │  Local DB    │ │
│  │  (Single     │  │  (Retrofit)  │  │   (Room)     │ │
│  │   Source)    │  └──────────────┘  └──────────────┘ │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. User Action → UI
```
User Click → Composable → ViewModel.function()
```

### 2. ViewModel → UseCase
```
ViewModel → UseCase.invoke() → Repository
```

### 3. Repository → Data Sources
```
Repository → (Remote API + Local Cache) → Response
```

### 4. Response → UI Update
```
Response → Resource<T> → StateFlow → Recompose UI
```

## 📦 Moduli e Responsabilità

### Data Layer (`data/`)

#### Remote (`data/remote/`)
- **API Interfaces**: definizioni endpoint Retrofit
- **AuthInterceptor**: aggiunge JWT token alle richieste
- **WebSocketManager**: gestisce connessioni WebSocket per notifiche real-time

#### Local (`data/local/`)
- **Entities**: modelli Room per database offline
- **DAOs**: query per accesso ai dati locali
- **Database**: configurazione Room database

#### Models (`data/models/`)
- **DTOs**: Data Transfer Objects per API (request/response)

#### Repository (`data/repository/`)
- **Single Source of Truth**: coordina remote e local data
- Implementa caching e sincronizzazione
- Gestisce Resource states (Loading, Success, Error)

### Domain Layer (`domain/`)

#### Use Cases (`domain/usecase/`)
- Business logic atomica e riutilizzabile
- Validazione input
- Orchestrazione di operazioni complesse
- Ogni Use Case ha una singola responsabilità

### Presentation Layer (`presentation/`)

#### UI (`presentation/*/`)
- **Composables**: UI dichiarativa con Jetpack Compose
- Nessuna business logic, solo rendering

#### ViewModels
- Gestisce UI state con StateFlow
- Chiama Use Cases
- Trasforma dati per la UI
- Sopravvive a configuration changes

#### Navigation
- Centralized navigation logic
- Type-safe navigation con routes

#### Theme
- Material Design 3
- Colori, typography, shapes centralizzati

## 🔧 Dependency Injection (Hilt)

### Moduli

#### NetworkModule (`di/NetworkModule.kt`)
Provides:
- OkHttpClient (con interceptors)
- Retrofit instance
- API interfaces (AuthApi, ExpenseApi, etc.)
- Gson
- WebSocketManager

#### DatabaseModule (`di/DatabaseModule.kt`)
Provides:
- Room Database instance
- DAOs (NotificationDao, etc.)

### Scopes
- **@Singleton**: Repository, API clients, Database
- **@ViewModelScoped**: Use Cases (quando necessario)

## 🌊 Reactive Streams

### StateFlow vs Flow
- **StateFlow**: UI state (always has a value)
- **Flow**: Events stream (WebSocket, database queries)

### Esempio
```kotlin
// ViewModel
private val _uiState = MutableStateFlow<Resource<T>?>(null)
val uiState: StateFlow<Resource<T>?> = _uiState.asStateFlow()

// UI
val state by viewModel.uiState.collectAsState()
```

## 🔐 Sicurezza

### JWT Storage
- **DataStore Preferences** (encrypted)
- Token salvato in modo sicuro
- Auto-attach a tutte le richieste API

### Password Handling
- Mai salvata in chiaro
- Solo trasmessa su HTTPS
- Validazione client-side (min 6 caratteri)

## 🌐 Network Layer

### Retrofit Configuration
```kotlin
Base URL → Interceptors → API Call → Response
              ↓
      AuthInterceptor (JWT)
      LoggingInterceptor (debug)
```

### Error Handling
```kotlin
sealed class Resource<T> {
    class Success<T>(data: T)
    class Error<T>(message: String)
    class Loading<T>
}
```

## 💾 Offline Support

### Caching Strategy

1. **Read**: Preferisci cache locale se disponibile
2. **Write**: Scrivi su remote, poi aggiorna cache
3. **Sync**: Periodicament sincronizza (WorkManager)

### Room Database
- Cache per notifiche
- Estendibile per altri dati (expenses, shopping lists, gym cards)

## 🔔 Real-time Updates

### WebSocket Flow
```
Login → Connect WS → Listen for messages → Update UI
                ↓
         Reconnect on error
                ↓
       Cache to Room Database
```

## 📱 UI/UX Patterns

### Navigation
- Bottom Navigation per sezioni principali
- Stack navigation per dettagli
- Back handling automatico

### Loading States
- Skeleton screens
- Progress indicators
- Pull-to-refresh

### Error Handling
- Toast per errori transitori
- Snackbar con retry per errori network
- Dialog per errori critici

## 🧪 Testing Strategy (Da implementare)

### Unit Tests
- ViewModels logic
- Use Cases validation
- Repository data transformation

### Integration Tests
- API calls con MockWebServer
- Database queries con Room testing

### UI Tests
- Compose testing
- Navigation testing
- User flows

## 🚀 Prossimi Miglioramenti

### Performance
- [ ] Paging 3 per liste grandi
- [ ] Image caching ottimizzato
- [ ] Reduce recompositions

### Features
- [ ] Biometric login
- [ ] Dark mode toggle
- [ ] Offline mode completo
- [ ] Push notifications (FCM)
- [ ] Export dati (PDF, Excel)
- [ ] Grafici e statistiche

### Architecture
- [ ] Migration a Kotlin Serialization
- [ ] Modularizzazione (multi-module)
- [ ] KMP (Kotlin Multiplatform) per iOS

### Testing
- [ ] Unit tests (90% coverage)
- [ ] Integration tests
- [ ] UI tests (critical flows)
- [ ] CI/CD pipeline

### Security
- [ ] Certificate pinning
- [ ] ProGuard rules ottimizzate
- [ ] Biometric encryption per token
- [ ] Root detection

## 📚 Risorse

### Documentazione
- [Jetpack Compose](https://developer.android.com/jetpack/compose)
- [Hilt](https://developer.android.com/training/dependency-injection/hilt-android)
- [Retrofit](https://square.github.io/retrofit/)
- [Room](https://developer.android.com/training/data-storage/room)

### Best Practices
- [Android Architecture Guide](https://developer.android.com/topic/architecture)
- [Material Design 3](https://m3.material.io/)
- [Kotlin Coroutines](https://kotlinlang.org/docs/coroutines-overview.html)

---

**Ultima modifica**: 2025-11-01
