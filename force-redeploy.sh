#!/bin/bash

# Script per forzare il redeploy del frontend su Render.com
# Questo è necessario quando modifichi variabili d'ambiente React (REACT_APP_*)

set -e  # Exit on error

echo "🚀 Forzando redeploy del frontend su Render.com..."
echo ""

# Verifica di essere nella directory corretta
if [ ! -f "render.yaml" ]; then
    echo "❌ Errore: render.yaml non trovato!"
    echo "   Esegui questo script dalla directory root del progetto."
    exit 1
fi

# Verifica configurazione Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Errore: Questa non è una directory Git!"
    exit 1
fi

# Mostra configurazione attuale
echo "📋 Configurazione attuale in render.yaml:"
echo ""
grep -A 2 "REACT_APP_API_URL" render.yaml || echo "   REACT_APP_API_URL non trovato!"
echo ""

# Chiedi conferma
read -p "Vuoi procedere con il redeploy? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Redeploy annullato."
    exit 0
fi

echo ""
echo "1️⃣  Verifico stato Git..."
git status --short

echo ""
echo "2️⃣  Creo commit vuoto per forzare redeploy..."
git commit --allow-empty -m "chore: force frontend redeploy to update REACT_APP_API_URL

Redeploy necessario per aggiornare le variabili d'ambiente React
che vengono embedded nel bundle durante la build.

API URL: https://gestionale-backend-ztow.onrender.com"

echo ""
echo "3️⃣  Push su GitHub..."
git push origin master

echo ""
echo "✅ Commit pushato con successo!"
echo ""
echo "📊 Prossimi passi:"
echo "   1. Vai su https://dashboard.render.com/"
echo "   2. Cerca il servizio 'gestionale-frontend'"
echo "   3. Dovresti vedere il build in corso (Auto-deploy da GitHub)"
echo "   4. Attendi 3-5 minuti per il completamento"
echo "   5. Testa il frontend: https://gestionale-frontend-aa3q.onrender.com"
echo ""
echo "💡 Suggerimento:"
echo "   Puoi monitorare i log in tempo reale dalla dashboard Render"
echo ""
echo "🎯 Per verificare che funzioni:"
echo "   1. Apri il frontend in modalità incognito"
echo "   2. Fai login"
echo "   3. Vai su 'Spese' e prova a creare un gruppo"
echo "   4. Apri Console (F12) → Network per vedere le chiamate API"
echo "   5. Le chiamate dovrebbero andare a: https://gestionale-backend-ztow.onrender.com/api/"
echo ""

# Verifica backend
echo "🔍 Verifico che il backend sia online..."
if curl -s -f "https://gestionale-backend-ztow.onrender.com/api/health" > /dev/null; then
    echo "   ✅ Backend online e raggiungibile!"
else
    echo "   ⚠️  Backend potrebbe essere offline o in sleep mode"
    echo "   ℹ️  Apri https://gestionale-backend-ztow.onrender.com/api/health"
    echo "      per svegliarlo (se su piano free Render)"
fi

echo ""
echo "✨ Fatto! Il frontend verrà ridistribuito automaticamente."
