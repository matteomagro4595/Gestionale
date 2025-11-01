# 📦 Build Variants - Gestionale Android App

## 🎯 Configurazione Multi-Ambiente

L'app Android è configurata con **Product Flavors** per supportare diversi ambienti, proprio come il frontend web React.

### 🌍 Ambienti Disponibili

#### 1. **Development** (Sviluppo Locale)
- **API URL**: `http://10.0.2.2:8000/api/` (localhost per emulatore)
- **WebSocket**: `ws://10.0.2.2:8000/api/`
- **Package ID**: `com.gestionale.app.dev`
- **Nome App**: "Gestionale Dev"
- **Uso**: Test locali, sviluppo, debug con backend locale

#### 2. **Production** (Produzione Render.com) ⭐
- **API URL**: `https://gestionale-backend.onrender.com/api/`
- **WebSocket**: `wss://gestionale-backend.onrender.com/api/`
- **Package ID**: `com.gestionale.app`
- **Nome App**: "Gestionale"
- **Uso**: Distribuzione agli utenti finali, stesso backend del web

---

## 🔨 Comandi per Generare APK

### APK di Produzione (Consigliato per utenti)

```bash
# Genera APK firmato per produzione (Render.com)
./gradlew assembleProductionRelease

# Output:
# app/build/outputs/apk/production/release/app-production-release.apk (2.3 MB)
```

### APK di Sviluppo (Per test locali)

```bash
# Genera APK firmato per sviluppo (localhost)
./gradlew assembleDevelopmentRelease

# Output:
# app/build/outputs/apk/development/release/app-development-release.apk (2.3 MB)
```

### APK Debug (Non firmato, per test rapidi)

```bash
# Development Debug
./gradlew assembleDevelopmentDebug

# Production Debug
./gradlew assembleProductionDebug
```

### Tutti gli APK insieme

```bash
# Genera tutte le varianti
./gradlew assemble

# Genera solo le versioni Release
./gradlew assembleRelease
```

---

## 📱 APK Pronti

Dopo la build, trovi gli APK in:

```
~/Gestionale-Production.apk    # ⭐ Per utenti finali (Render.com)
~/Gestionale-Development.apk   # Per test con backend locale
```

---

## 🔧 Configurazione URL

Le URL sono configurate in `app/build.gradle.kts`:

```kotlin
productFlavors {
    create("development") {
        buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:8000/api/\"")
        buildConfigField("String", "WS_BASE_URL", "\"ws://10.0.2.2:8000/api/\"")
    }

    create("production") {
        // Stesse URL del frontend React (da render.yaml)
        buildConfigField("String", "API_BASE_URL", "\"https://gestionale-backend.onrender.com/api/\"")
        buildConfigField("String", "WS_BASE_URL", "\"wss://gestionale-backend.onrender.com/api/\"")
    }
}
```

---

## 🔐 Firma Digitale

Tutti gli APK Release sono firmati con:
- **Keystore**: `gestionale-release.keystore`
- **Alias**: `gestionale`
- **Validità**: 10.000 giorni

⚠️ **IMPORTANTE**: Conserva il keystore! È necessario per pubblicare aggiornamenti su Google Play Store.

---

## 📲 Installazione

### Su Emulatore

```bash
# Production
adb install ~/Gestionale-Production.apk

# Development
adb install ~/Gestionale-Development.apk
```

### Su Telefono Fisico

1. Trasferisci `~/Gestionale-Production.apk` al telefono
2. Tocca il file per installare
3. Abilita "Installa app sconosciute" se richiesto

---

## 🎨 Differenze Visibili

| Feature | Development | Production |
|---------|-------------|------------|
| Nome App | "Gestionale Dev" | "Gestionale" |
| Package ID | `com.gestionale.app.dev` | `com.gestionale.app` |
| Icona | Stessa | Stessa |
| API Backend | Localhost | Render.com |

**Nota**: Puoi installare ENTRAMBE le versioni contemporaneamente sullo stesso dispositivo (hanno Package ID diversi).

---

## 🚀 Workflow di Sviluppo

### Test Locale (Development)

1. Avvia backend locale:
   ```bash
   docker-compose up -d
   ```

2. Installa APK Development:
   ```bash
   ./gradlew installDevelopmentDebug
   ```

3. L'app si connetterà al backend locale

### Distribuzione Utenti (Production)

1. Assicurati che il backend Render.com sia online

2. Genera APK Production:
   ```bash
   ./gradlew assembleProductionRelease
   ```

3. Distribuisci `~/Gestionale-Production.apk` agli utenti

---

## 🔄 Sincronizzazione con Frontend Web

Le URL di produzione sono **sincronizzate** con il frontend React:

**`render.yaml`** (configurazione frontend):
```yaml
envVars:
  - key: REACT_APP_API_URL
    value: https://gestionale-backend.onrender.com
```

**`build.gradle.kts`** (configurazione Android):
```kotlin
buildConfigField("String", "API_BASE_URL",
    "\"https://gestionale-backend.onrender.com/api/\"")
```

Entrambi puntano allo stesso backend! ✅

---

## 📊 Dimensioni APK

| Variante | Dimensione | Contenuto |
|----------|------------|-----------|
| Debug | ~18 MB | Simboli debug + non ottimizzato |
| Release | ~2.3 MB | Ottimizzato con R8/ProGuard |

---

## 🐛 Troubleshooting

### APK Production non si connette

1. Verifica che il backend Render.com sia attivo:
   ```bash
   curl https://gestionale-backend.onrender.com/api/health
   ```

2. Se il backend è in "sleep" (piano free Render), aspetta ~30 secondi per il riavvio

### APK Development non si connette

1. Verifica che il backend locale sia attivo:
   ```bash
   docker-compose ps
   curl http://localhost:8000/api/health
   ```

2. Assicurati di usare un **emulatore Android** (non dispositivo fisico) perché `10.0.2.2` funziona solo su emulatore

### Voglio usare un altro URL

Modifica `app/build.gradle.kts` nella sezione `productFlavors` e ricompila.

---

## 📝 Note

- ✅ Configurazione **identica** al frontend web React
- ✅ Support HTTPS/WSS per produzione
- ✅ Product Flavors permettono installazione parallela
- ✅ Firmato digitalmente per distribuzione
- ✅ Ottimizzato con R8 (2.3 MB vs 18 MB)

---

**Ultima modifica**: 2025-11-01
