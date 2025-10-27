"""
Script to populate the database with realistic data for matteo.magro and simonalaura.nesta
"""
from sqlalchemy.orm import Session
from database import SessionLocal
from models.user import User
from models.expense import ExpenseGroup, GroupMember, Expense, ExpenseParticipant
from models.shopping import ShoppingList, ShoppingItem, SharedList
from models.gym import WorkoutCard, Exercise
from datetime import datetime, timedelta
import random

def populate_database():
    db = SessionLocal()

    try:
        # Get users
        matteo = db.query(User).filter(User.email == "matteo.magro45@gmail.com").first()
        simona = db.query(User).filter(User.email == "simonalaura.nesta@gmail.com").first()

        if not matteo or not simona:
            print("Users not found!")
            return

        print(f"Found users: {matteo.nome} (ID: {matteo.id}), {simona.nome} (ID: {simona.id})")

        # Clear existing data for these users (optional - comment out if you want to keep existing data)
        print("Clearing existing data...")
        # Note: Cascade deletes should handle related records

        # ===== EXPENSE GROUPS =====
        print("\n=== Creating Expense Groups ===")

        # Group 1: Casa
        gruppo_casa = ExpenseGroup(
            nome="Casa",
            descrizione="Spese condivise per la casa",
            creator_id=matteo.id
        )
        db.add(gruppo_casa)
        db.flush()

        # Add members
        db.add(GroupMember(group_id=gruppo_casa.id, user_id=matteo.id))
        db.add(GroupMember(group_id=gruppo_casa.id, user_id=simona.id))
        print(f"✓ Created group: {gruppo_casa.nome}")

        # Group 2: Spesa Settimanale
        gruppo_spesa = ExpenseGroup(
            nome="Spesa Settimanale",
            descrizione="Spesa alimentare e prodotti per la casa",
            creator_id=simona.id
        )
        db.add(gruppo_spesa)
        db.flush()

        db.add(GroupMember(group_id=gruppo_spesa.id, user_id=matteo.id))
        db.add(GroupMember(group_id=gruppo_spesa.id, user_id=simona.id))
        print(f"✓ Created group: {gruppo_spesa.nome}")

        # ===== EXPENSES =====
        print("\n=== Creating Expenses ===")

        # Expenses for Casa group
        expenses_casa = [
            {"descrizione": "Bolletta Enel Energia", "importo": 85.50, "tag": "Bolletta Luce", "paid_by": matteo.id},
            {"descrizione": "Bolletta Gas Metano", "importo": 120.30, "tag": "Bolletta Gas", "paid_by": simona.id},
            {"descrizione": "Bolletta Acqua", "importo": 45.00, "tag": "Bolletta Acqua", "paid_by": matteo.id},
            {"descrizione": "Fibra TIM", "importo": 29.90, "tag": "Internet/Telefono", "paid_by": simona.id},
            {"descrizione": "Affitto mensile", "importo": 800.00, "tag": "Affitto", "paid_by": matteo.id},
            {"descrizione": "Veterinario per Luna", "importo": 65.00, "tag": "Animali Domestici", "paid_by": simona.id},
        ]

        for exp_data in expenses_casa:
            expense = Expense(
                descrizione=exp_data["descrizione"],
                importo=exp_data["importo"],
                tag=exp_data["tag"],
                division_type="Uguale",
                paid_by_id=exp_data["paid_by"],
                group_id=gruppo_casa.id
            )
            db.add(expense)
            db.flush()

            # Add participants (both users split equally)
            db.add(ExpenseParticipant(expense_id=expense.id, user_id=matteo.id))
            db.add(ExpenseParticipant(expense_id=expense.id, user_id=simona.id))
            print(f"  ✓ {exp_data['descrizione']}: €{exp_data['importo']}")

        # Expenses for Spesa group
        expenses_spesa = [
            {"descrizione": "Spesa Esselunga", "importo": 127.50, "tag": "Spesa Alimentare", "paid_by": simona.id},
            {"descrizione": "Supermercato Coop", "importo": 89.30, "tag": "Spesa Alimentare", "paid_by": matteo.id},
            {"descrizione": "Cena Pizzeria Da Gino", "importo": 45.00, "tag": "Pranzo/Cena", "paid_by": simona.id},
            {"descrizione": "Ristorante Sushi", "importo": 68.50, "tag": "Pranzo/Cena", "paid_by": matteo.id},
            {"descrizione": "Farmacia - Medicinali", "importo": 32.50, "tag": "Salute", "paid_by": simona.id},
            {"descrizione": "Cinema weekend", "importo": 24.00, "tag": "Svago/Intrattenimento", "paid_by": matteo.id},
        ]

        for exp_data in expenses_spesa:
            expense = Expense(
                descrizione=exp_data["descrizione"],
                importo=exp_data["importo"],
                tag=exp_data["tag"],
                division_type="Uguale",
                paid_by_id=exp_data["paid_by"],
                group_id=gruppo_spesa.id
            )
            db.add(expense)
            db.flush()

            db.add(ExpenseParticipant(expense_id=expense.id, user_id=matteo.id))
            db.add(ExpenseParticipant(expense_id=expense.id, user_id=simona.id))
            print(f"  ✓ {exp_data['descrizione']}: €{exp_data['importo']}")

        # ===== SHOPPING LISTS =====
        print("\n=== Creating Shopping Lists ===")

        # List 1: Spesa della settimana
        lista_settimanale = ShoppingList(
            nome="Spesa della settimana",
            owner_id=simona.id
        )
        db.add(lista_settimanale)
        db.flush()

        # Share with Matteo
        db.add(SharedList(shopping_list_id=lista_settimanale.id, shared_with_id=matteo.id))
        print(f"✓ Created list: {lista_settimanale.nome}")

        # Items for weekly shopping
        items_settimanale = [
            {"nome": "Latte intero", "quantita": "2 confezioni", "completato": False},
            {"nome": "Pane", "quantita": "1 kg", "completato": True},
            {"nome": "Pasta", "quantita": "3 pacchi", "completato": False},
            {"nome": "Pomodori", "quantita": "1 kg", "completato": False},
            {"nome": "Mozzarella", "quantita": "250g", "completato": True},
            {"nome": "Olio extravergine", "quantita": "1 bottiglia", "completato": False},
            {"nome": "Carne macinata", "quantita": "500g", "completato": False},
            {"nome": "Yogurt", "quantita": "6 vasetti", "completato": True},
            {"nome": "Caffè", "quantita": "1 pacco", "completato": False},
            {"nome": "Carta igienica", "quantita": "1 confezione", "completato": False},
        ]

        for item_data in items_settimanale:
            item = ShoppingItem(
                nome=item_data["nome"],
                quantita=item_data["quantita"],
                completato=item_data["completato"],
                shopping_list_id=lista_settimanale.id
            )
            db.add(item)
            status = "✓" if item_data["completato"] else "○"
            print(f"  {status} {item_data['nome']}")

        # List 2: Cena weekend
        lista_weekend = ShoppingList(
            nome="Cena sabato sera",
            owner_id=matteo.id
        )
        db.add(lista_weekend)
        db.flush()

        db.add(SharedList(shopping_list_id=lista_weekend.id, shared_with_id=simona.id))
        print(f"✓ Created list: {lista_weekend.nome}")

        items_weekend = [
            {"nome": "Vino rosso", "quantita": "2 bottiglie", "completato": False},
            {"nome": "Salmone fresco", "quantita": "400g", "completato": False},
            {"nome": "Limoni", "quantita": "3", "completato": False},
            {"nome": "Rucola", "quantita": "1 busta", "completato": True},
            {"nome": "Parmigiano", "quantita": "200g", "completato": False},
            {"nome": "Tiramisù", "quantita": "1", "completato": False},
        ]

        for item_data in items_weekend:
            item = ShoppingItem(
                nome=item_data["nome"],
                quantita=item_data["quantita"],
                completato=item_data["completato"],
                shopping_list_id=lista_weekend.id
            )
            db.add(item)
            status = "✓" if item_data["completato"] else "○"
            print(f"  {status} {item_data['nome']}")

        # ===== WORKOUT CARDS =====
        print("\n=== Creating Workout Cards ===")

        # Matteo's workout card
        scheda_matteo = WorkoutCard(
            nome="Scheda Forza - Gennaio",
            descrizione="Programma per aumento massa muscolare",
            user_id=matteo.id
        )
        db.add(scheda_matteo)
        db.flush()
        print(f"✓ Created workout card: {scheda_matteo.nome} (Matteo)")

        exercises_matteo = [
            {"nome": "Panca piana", "serie": 4, "ripetizioni": "8-10", "peso": "70", "note": "Aumentare peso prossima volta"},
            {"nome": "Squat", "serie": 4, "ripetizioni": "10-12", "peso": "90", "note": "Mantenere schiena dritta"},
            {"nome": "Stacchi da terra", "serie": 3, "ripetizioni": "6-8", "peso": "100", "note": "Focus sulla tecnica"},
            {"nome": "Trazioni", "serie": 3, "ripetizioni": "8-10", "peso": "0", "note": "A corpo libero"},
            {"nome": "Military press", "serie": 3, "ripetizioni": "10-12", "peso": "40", "note": ""},
        ]

        for ex_data in exercises_matteo:
            exercise = Exercise(
                nome=ex_data["nome"],
                serie=ex_data["serie"],
                ripetizioni=ex_data["ripetizioni"],
                peso=ex_data["peso"],
                note=ex_data["note"],
                workout_card_id=scheda_matteo.id
            )
            db.add(exercise)
            print(f"  ✓ {ex_data['nome']}: {ex_data['serie']}x{ex_data['ripetizioni']} @ {ex_data['peso']}kg")

        # Simona's workout card
        scheda_simona = WorkoutCard(
            nome="Tonificazione Total Body",
            descrizione="Programma per tonificazione e resistenza",
            user_id=simona.id
        )
        db.add(scheda_simona)
        db.flush()
        print(f"✓ Created workout card: {scheda_simona.nome} (Simona)")

        exercises_simona = [
            {"nome": "Leg press", "serie": 3, "ripetizioni": "12-15", "peso": "60", "note": ""},
            {"nome": "Affondi con manubri", "serie": 3, "ripetizioni": "12 per gamba", "peso": "8", "note": "Manubri 8kg"},
            {"nome": "Lat machine", "serie": 3, "ripetizioni": "12-15", "peso": "35", "note": ""},
            {"nome": "Addominali crunch", "serie": 3, "ripetizioni": "20", "peso": "0", "note": "A corpo libero"},
            {"nome": "Tapis roulant", "serie": 1, "ripetizioni": "20 min", "peso": "0", "note": "Velocità 7km/h"},
            {"nome": "Glutei al cavo", "serie": 3, "ripetizioni": "15 per gamba", "peso": "15", "note": ""},
        ]

        for ex_data in exercises_simona:
            exercise = Exercise(
                nome=ex_data["nome"],
                serie=ex_data["serie"],
                ripetizioni=ex_data["ripetizioni"],
                peso=ex_data["peso"],
                note=ex_data["note"],
                workout_card_id=scheda_simona.id
            )
            db.add(exercise)
            peso_str = f"@ {ex_data['peso']}kg" if ex_data['peso'] != "0" else ""
            print(f"  ✓ {ex_data['nome']}: {ex_data['serie']}x{ex_data['ripetizioni']} {peso_str}")

        # Commit all changes
        db.commit()
        print("\n✓ Database populated successfully!")

    except Exception as e:
        db.rollback()
        print(f"\n✗ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database population...")
    populate_database()
    print("Done!")
