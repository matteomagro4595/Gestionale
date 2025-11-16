#!/usr/bin/env python3
"""
Script di migrazione database da Render a Supabase

Questo script copia tutti i dati dal database PostgreSQL su Render
al database PostgreSQL su Supabase, mantenendo integrità e relazioni.

Uso:
1. Configurare le variabili d'ambiente:
   - SOURCE_DATABASE_URL: URL del database Render (sorgente)
   - TARGET_DATABASE_URL: URL del database Supabase (destinazione)

2. Eseguire lo script:
   python migrate_to_supabase.py

3. Opzionale - dry run (solo conteggio, senza migrazione):
   python migrate_to_supabase.py --dry-run
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import argparse

# Importa i modelli
from models.user import User
from models.shopping import ShoppingList, ShoppingItem, SharedList
from models.expense import ExpenseGroup, GroupMember, Expense, ExpenseParticipant
from models.gym import WorkoutCard, WorkoutDay, Exercise
from models.notification import Notification
from database import Base

def get_connection_urls():
    """Ottiene gli URL di connessione da variabili d'ambiente"""
    source_url = os.getenv("SOURCE_DATABASE_URL")
    target_url = os.getenv("TARGET_DATABASE_URL")

    if not source_url:
        print("❌ Errore: SOURCE_DATABASE_URL non configurato")
        print("   Imposta la variabile con: export SOURCE_DATABASE_URL='postgresql://...'")
        sys.exit(1)

    if not target_url:
        print("❌ Errore: TARGET_DATABASE_URL non configurato")
        print("   Imposta la variabile con: export TARGET_DATABASE_URL='postgresql://...'")
        sys.exit(1)

    return source_url, target_url

def create_sessions(source_url, target_url):
    """Crea sessioni per database sorgente e destinazione"""
    print("🔗 Connessione ai database...")

    # Database sorgente (Render)
    source_engine = create_engine(source_url)
    SourceSession = sessionmaker(bind=source_engine)
    source_session = SourceSession()

    # Database destinazione (Supabase)
    target_engine = create_engine(target_url)
    TargetSession = sessionmaker(bind=target_engine)
    target_session = TargetSession()

    print("✅ Connesso ai database")

    return source_session, target_session, source_engine, target_engine

def create_tables(target_engine):
    """Crea tutte le tabelle nel database di destinazione"""
    print("\n📋 Creazione tabelle su Supabase...")
    Base.metadata.create_all(bind=target_engine)
    print("✅ Tabelle create")

def count_records(session, model):
    """Conta i record di una tabella"""
    return session.query(model).count()

def migrate_table(source_session, target_session, model, table_name, disable_triggers=False):
    """Migra una singola tabella"""
    print(f"\n📦 Migrazione {table_name}...")

    # Conta record sorgente
    source_count = count_records(source_session, model)
    print(f"   Trovati {source_count} record nella sorgente")

    if source_count == 0:
        print(f"   ⏭️  Tabella vuota, skip")
        return 0

    # Leggi tutti i record dalla sorgente
    records = source_session.query(model).all()

    # Disabilita i trigger se richiesto (per preservare ID)
    if disable_triggers:
        target_session.execute(text(f"ALTER TABLE {model.__tablename__} DISABLE TRIGGER ALL"))

    migrated = 0
    for record in records:
        # Crea un dizionario con tutti gli attributi
        record_dict = {}
        for column in model.__table__.columns:
            value = getattr(record, column.name)
            record_dict[column.name] = value

        # Crea nuovo record nel target
        new_record = model(**record_dict)
        target_session.add(new_record)
        migrated += 1

        if migrated % 100 == 0:
            print(f"   Migrati {migrated}/{source_count} record...")

    # Commit
    target_session.commit()

    # Riabilita i trigger
    if disable_triggers:
        target_session.execute(text(f"ALTER TABLE {model.__tablename__} ENABLE TRIGGER ALL"))
        # Aggiorna la sequenza ID
        target_session.execute(text(
            f"SELECT setval(pg_get_serial_sequence('{model.__tablename__}', 'id'), "
            f"COALESCE((SELECT MAX(id) FROM {model.__tablename__}), 1), true)"
        ))
        target_session.commit()

    print(f"   ✅ Migrati {migrated} record")
    return migrated

def verify_migration(source_session, target_session, model, table_name):
    """Verifica che la migrazione sia andata a buon fine"""
    source_count = count_records(source_session, model)
    target_count = count_records(target_session, model)

    if source_count == target_count:
        print(f"   ✅ {table_name}: {target_count} record (OK)")
        return True
    else:
        print(f"   ❌ {table_name}: sorgente={source_count}, destinazione={target_count} (ERRORE)")
        return False

def dry_run(source_session):
    """Mostra solo il conteggio dei record senza migrare"""
    print("\n🔍 DRY RUN - Conteggio record da migrare:\n")

    tables = [
        (User, "users"),
        (ShoppingList, "shopping_lists"),
        (ShoppingItem, "shopping_items"),
        (SharedList, "shared_lists"),
        (ExpenseGroup, "expense_groups"),
        (GroupMember, "group_members"),
        (Expense, "expenses"),
        (ExpenseParticipant, "expense_participants"),
        (WorkoutCard, "workout_cards"),
        (WorkoutDay, "workout_days"),
        (Exercise, "exercises"),
        (Notification, "notifications"),
    ]

    total = 0
    for model, name in tables:
        count = count_records(source_session, model)
        print(f"   📊 {name:25} {count:6} record")
        total += count

    print(f"\n   📈 TOTALE: {total} record da migrare\n")

def main():
    parser = argparse.ArgumentParser(description='Migra database da Render a Supabase')
    parser.add_argument('--dry-run', action='store_true',
                       help='Mostra solo il conteggio senza migrare')
    args = parser.parse_args()

    print("=" * 60)
    print("  🚀 MIGRAZIONE DATABASE: RENDER → SUPABASE")
    print("=" * 60)
    print(f"  Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Ottieni URL di connessione
    source_url, target_url = get_connection_urls()

    # Crea sessioni
    source_session, target_session, source_engine, target_engine = create_sessions(
        source_url, target_url
    )

    try:
        if args.dry_run:
            dry_run(source_session)
            return

        # Crea tabelle su Supabase
        create_tables(target_engine)

        print("\n" + "=" * 60)
        print("  📦 INIZIO MIGRAZIONE DATI")
        print("=" * 60)

        # Ordine di migrazione (rispetta foreign key)
        migration_order = [
            (User, "users", False),
            (ShoppingList, "shopping_lists", False),
            (ShoppingItem, "shopping_items", False),
            (SharedList, "shared_lists", False),
            (ExpenseGroup, "expense_groups", False),
            (GroupMember, "group_members", False),
            (Expense, "expenses", False),
            (ExpenseParticipant, "expense_participants", False),
            (WorkoutCard, "workout_cards", False),
            (WorkoutDay, "workout_days", False),
            (Exercise, "exercises", False),
            (Notification, "notifications", False),
        ]

        total_migrated = 0
        for model, table_name, disable_triggers in migration_order:
            migrated = migrate_table(
                source_session,
                target_session,
                model,
                table_name,
                disable_triggers
            )
            total_migrated += migrated

        print("\n" + "=" * 60)
        print("  ✅ MIGRAZIONE COMPLETATA")
        print("=" * 60)
        print(f"  📊 Totale record migrati: {total_migrated}")
        print("=" * 60)

        # Verifica
        print("\n" + "=" * 60)
        print("  🔍 VERIFICA MIGRAZIONE")
        print("=" * 60)

        all_ok = True
        for model, table_name, _ in migration_order:
            if not verify_migration(source_session, target_session, model, table_name):
                all_ok = False

        if all_ok:
            print("\n✅ Tutte le tabelle verificate con successo!")
        else:
            print("\n⚠️  Alcune tabelle presentano discrepanze!")

        print("\n" + "=" * 60)
        print("  🎉 MIGRAZIONE TERMINATA")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ ERRORE durante la migrazione: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    finally:
        source_session.close()
        target_session.close()
        print("\n🔌 Connessioni chiuse")

if __name__ == "__main__":
    main()
