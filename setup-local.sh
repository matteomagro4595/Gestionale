#!/bin/bash

# Setup locale automatico per Gestionale con Google OAuth

set -e  # Exit on error

echo "🚀 Setup Sviluppo Locale - Gestionale"
echo "======================================"
echo ""

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funzione per stampare con colore
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verifica prerequisiti
echo "📋 Verifico prerequisiti..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker non trovato. Installa Docker prima di continuare."
    exit 1
fi
print_success "Docker installato"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose non trovato. Installa Docker Compose prima di continuare."
    exit 1
fi
print_success "Docker Compose installato"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 non trovato. Installa Python 3.11+ prima di continuare."
    exit 1
fi
print_success "Python 3 installato ($(python3 --version))"

# Check Node
if ! command -v node &> /dev/null; then
    print_error "Node.js non trovato. Installa Node.js 18+ prima di continuare."
    exit 1
fi
print_success "Node.js installato ($(node --version))"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm non trovato. Installa npm prima di continuare."
    exit 1
fi
print_success "npm installato ($(npm --version))"

echo ""
echo "✅ Tutti i prerequisiti soddisfatti!"
echo ""

# Setup Database
echo "🗄️  Setup Database PostgreSQL..."
if docker-compose ps | grep -q "gestionale_db"; then
    print_warning "Database già avviato"
else
    docker-compose up -d
    print_success "Database PostgreSQL avviato"
    echo "   Aspetto che il database sia pronto..."
    sleep 5
fi

# Test connessione database
if docker exec gestionale_db pg_isready -U gestionale -d gestionale_db > /dev/null 2>&1; then
    print_success "Database pronto e accessibile"
else
    print_error "Database non risponde. Controlla i log con: docker-compose logs postgres"
    exit 1
fi

echo ""

# Setup Backend
echo "🔧 Setup Backend..."

cd backend

# Crea virtual environment se non esiste
if [ ! -d "venv" ]; then
    echo "   Creo virtual environment Python..."
    python3 -m venv venv
    print_success "Virtual environment creato"
else
    print_warning "Virtual environment già esistente"
fi

# Attiva virtual environment
source venv/bin/activate

# Installa dipendenze
echo "   Installo dipendenze Python..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
print_success "Dipendenze Python installate"

# Crea .env se non esiste
if [ ! -f ".env" ]; then
    echo "   Creo file .env da .env.example..."
    cp .env.example .env
    print_success "File .env creato"
    print_warning "IMPORTANTE: Devi configurare le credenziali Google in backend/.env"
else
    print_warning ".env già esistente"
fi

# Verifica se .env ha credenziali Google
if grep -q "your-google-client-id" .env; then
    print_warning "Le credenziali Google non sono ancora configurate!"
    echo ""
    echo "   📝 Per configurare Google OAuth:"
    echo "   1. Vai su https://console.cloud.google.com/"
    echo "   2. Crea un progetto e abilita Google+ API"
    echo "   3. Crea credenziali OAuth 2.0"
    echo "   4. Modifica backend/.env e incolla Client ID e Secret"
    echo ""
    echo "   Guida completa: LOCAL_DEVELOPMENT_SETUP.md"
    echo ""
fi

cd ..

echo ""

# Setup Frontend
echo "⚛️  Setup Frontend..."

cd frontend

# Installa dipendenze npm
if [ ! -d "node_modules" ]; then
    echo "   Installo dipendenze npm..."
    npm install --silent
    print_success "Dipendenze npm installate"
else
    print_warning "node_modules già esistente"
    echo "   Aggiorno dipendenze npm..."
    npm install --silent
    print_success "Dipendenze npm aggiornate"
fi

cd ..

echo ""

# Riepilogo
echo "✅ Setup completato!"
echo "=================="
echo ""
echo "📊 Servizi configurati:"
echo "   • Database PostgreSQL: localhost:5432"
echo "   • Backend FastAPI: http://localhost:8000"
echo "   • Frontend React: http://localhost:3000"
echo ""

# Verifica stato OAuth
cd backend
source venv/bin/activate
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()
client_id = os.getenv('GOOGLE_CLIENT_ID', '')
configured = not ('your-google' in client_id or not client_id)
status = '✅ Configurato' if configured else '❌ Non configurato'
print(f'   • Google OAuth: {status}')
" 2>/dev/null || echo "   • Google OAuth: ❓ Stato sconosciuto"
cd ..

echo ""
echo "🚀 Per avviare l'applicazione:"
echo ""
echo "   # Terminal 1 - Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn main:app --reload"
echo ""
echo "   # Terminal 2 - Frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "   # Browser:"
echo "   http://localhost:3000"
echo ""

if ! grep -q "your-google-client-id" backend/.env 2>/dev/null; then
    print_success "Google OAuth configurato! Puoi testare il login con Google."
else
    print_warning "Ricorda di configurare Google OAuth in backend/.env"
    echo "   Guida: LOCAL_DEVELOPMENT_SETUP.md"
fi

echo ""
echo "📚 Documentazione:"
echo "   • Setup locale: LOCAL_DEVELOPMENT_SETUP.md"
echo "   • Google OAuth: GOOGLE_OAUTH_SETUP.md"
echo "   • API Docs: http://localhost:8000/docs (quando backend è avviato)"
echo ""
echo "💡 Tips:"
echo "   • Usa Ctrl+C per fermare backend/frontend"
echo "   • docker-compose stop per fermare il database"
echo "   • docker-compose logs postgres per vedere log database"
echo ""

print_success "Setup completato! Buon sviluppo! 🎉"
