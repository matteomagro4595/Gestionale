#!/bin/bash

# Script helper per la migrazione a Supabase
# Uso: ./migrate.sh [comando]
#
# Comandi:
#   check    - Verifica configurazione
#   dry-run  - Conta i record senza migrare
#   migrate  - Esegue la migrazione completa
#   help     - Mostra questo messaggio

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 non trovato. Installa Python 3.8+"
        exit 1
    fi
    print_success "Python 3 trovato: $(python3 --version)"
}

check_env_file() {
    if [ ! -f ".env.migration" ]; then
        print_error "File .env.migration non trovato!"
        print_info "Crea il file copiando: cp .env.supabase.example .env.migration"
        print_info "Poi modifica .env.migration con le tue credenziali"
        exit 1
    fi
    print_success "File .env.migration trovato"
}

check_env_vars() {
    # Carica le variabili
    export $(cat .env.migration | grep -v '^#' | xargs)

    if [ -z "$SOURCE_DATABASE_URL" ]; then
        print_error "SOURCE_DATABASE_URL non configurato in .env.migration"
        exit 1
    fi
    print_success "SOURCE_DATABASE_URL configurato"

    if [ -z "$TARGET_DATABASE_URL" ]; then
        print_error "TARGET_DATABASE_URL non configurato in .env.migration"
        exit 1
    fi
    print_success "TARGET_DATABASE_URL configurato"
}

check_dependencies() {
    print_info "Verifica dipendenze Python..."

    if ! python3 -c "import sqlalchemy" &> /dev/null; then
        print_error "SQLAlchemy non installato"
        print_info "Installa con: pip install sqlalchemy psycopg2-binary"
        exit 1
    fi
    print_success "Dipendenze Python OK"
}

check_config() {
    print_header "VERIFICA CONFIGURAZIONE"

    check_python
    check_env_file
    check_env_vars
    check_dependencies

    print_success "Configurazione completa e corretta!"
    print_info "Puoi procedere con: ./migrate.sh dry-run"
}

run_dry_run() {
    print_header "DRY RUN - CONTEGGIO RECORD"

    check_env_file
    check_env_vars

    print_info "Conteggio record da migrare..."
    export $(cat .env.migration | grep -v '^#' | xargs)
    python3 migrate_to_supabase.py --dry-run

    print_info "Nessun dato è stato modificato (dry run)"
    print_info "Per procedere con la migrazione: ./migrate.sh migrate"
}

run_migration() {
    print_header "MIGRAZIONE DATABASE"

    check_env_file
    check_env_vars

    print_warning "ATTENZIONE: Stai per migrare il database!"
    print_info "Database sorgente: $SOURCE_DATABASE_URL"
    print_info "Database destinazione: $TARGET_DATABASE_URL"
    echo ""

    read -p "Sei sicuro di voler procedere? (scrivi 'SI' per confermare): " confirm

    if [ "$confirm" != "SI" ]; then
        print_info "Migrazione annullata"
        exit 0
    fi

    print_info "Inizio migrazione..."
    export $(cat .env.migration | grep -v '^#' | xargs)
    python3 migrate_to_supabase.py

    print_success "Migrazione completata!"
    print_info "Prossimi passi:"
    print_info "1. Aggiorna DATABASE_URL nel file .env"
    print_info "2. Testa l'applicazione"
    print_info "3. Deploy in produzione"
}

show_help() {
    cat << EOF
🚀 Script di Migrazione Database Render → Supabase

USO:
    ./migrate.sh [comando]

COMANDI:
    check       Verifica che tutto sia configurato correttamente
    dry-run     Conta i record senza eseguire la migrazione
    migrate     Esegue la migrazione completa
    help        Mostra questo messaggio

ESEMPI:
    # 1. Prima verifica la configurazione
    ./migrate.sh check

    # 2. Poi esegui un dry run per vedere quanti dati verranno migrati
    ./migrate.sh dry-run

    # 3. Infine esegui la migrazione vera e propria
    ./migrate.sh migrate

PREREQUISITI:
    1. File .env.migration configurato con SOURCE_DATABASE_URL e TARGET_DATABASE_URL
    2. Python 3.8+ installato
    3. Dipendenze installate: pip install sqlalchemy psycopg2-binary

DOCUMENTAZIONE COMPLETA:
    Leggi SUPABASE_MIGRATION.md per la guida completa

EOF
}

# Main
case "${1:-help}" in
    check)
        check_config
        ;;
    dry-run)
        run_dry_run
        ;;
    migrate)
        run_migration
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando sconosciuto: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
