#!/bin/bash

# Script per forzare il redeploy del backend su Render.com

set -e

echo "🚀 Forzando redeploy del BACKEND su Render.com..."
echo ""
echo "⚠️  IMPORTANTE: Questo riavvierà il backend con le nuove variabili d'ambiente."
echo ""

read -p "Vuoi procedere? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Redeploy annullato."
    exit 0
fi

echo ""
echo "📋 Configurazione CORS in render.yaml:"
grep -A 2 "FRONTEND_URL" render.yaml || echo "   FRONTEND_URL non trovato!"
echo ""

echo "1️⃣  Creo commit vuoto per forzare redeploy backend..."
git commit --allow-empty -m "chore: force backend redeploy to reload CORS configuration

Backend needs to restart to apply new FRONTEND_URL environment variable
for CORS policy.

FRONTEND_URL: https://gestionale-frontend-aa3q.onrender.com"

echo ""
echo "2️⃣  Push su GitHub..."
git push origin master

echo ""
echo "✅ Commit pushato!"
echo ""
echo "📊 Il backend verrà ridistribuito automaticamente da Render."
echo "   ⏱️  Tempo stimato: ~2 minuti"
echo ""
echo "🔍 Verifica backend dopo il deploy:"
echo "   curl https://gestionale-backend-ztow.onrender.com/api/health"
echo ""
echo "✨ Fatto!"
