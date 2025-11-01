"""
Fix script to normalize expense tag case sensitivity.
Converts uppercase tags like "ALTRO" to proper case "Altro"
"""
from sqlalchemy import create_engine, text
from database import DATABASE_URL
import sys

def fix_tag_case():
    """Fix expense tags that are in wrong case"""
    engine = create_engine(DATABASE_URL)

    # Mapping of all possible wrong cases to correct values
    tag_fixes = {
        # Uppercase variants
        'ALTRO': 'Altro',
        'BOLLETTA ACQUA': 'Bolletta Acqua',
        'BOLLETTA LUCE': 'Bolletta Luce',
        'BOLLETTA GAS': 'Bolletta Gas',
        'INTERNET/TELEFONO': 'Internet/Telefono',
        'AFFITTO': 'Affitto',
        'SPESA ALIMENTARE': 'Spesa Alimentare',
        'TRASPORTI': 'Trasporti',
        'PRANZO/CENA': 'Pranzo/Cena',
        'SALUTE': 'Salute',
        'ANIMALI DOMESTICI': 'Animali Domestici',
        'SVAGO/INTRATTENIMENTO': 'Svago/Intrattenimento',

        # Lowercase variants
        'altro': 'Altro',
        'bolletta acqua': 'Bolletta Acqua',
        'bolletta luce': 'Bolletta Luce',
        'bolletta gas': 'Bolletta Gas',
        'internet/telefono': 'Internet/Telefono',
        'affitto': 'Affitto',
        'spesa alimentare': 'Spesa Alimentare',
        'trasporti': 'Trasporti',
        'pranzo/cena': 'Pranzo/Cena',
        'salute': 'Salute',
        'animali domestici': 'Animali Domestici',
        'svago/intrattenimento': 'Svago/Intrattenimento',

        # Old tag values
        'BOLLETTA': 'Altro',
        'SPESA': 'Spesa Alimentare',
        'CANI': 'Animali Domestici',
    }

    total_fixed = 0

    with engine.connect() as connection:
        try:
            # First check if table exists and has data
            result = connection.execute(text("SELECT COUNT(*) FROM expenses"))
            count = result.scalar()

            if count == 0:
                print("No expenses found. Nothing to fix.")
                return 0

            print(f"Found {count} total expenses.")
            print("Checking for tags with wrong case...")

            # Check current tags
            result = connection.execute(text("SELECT DISTINCT tag FROM expenses"))
            current_tags = [row[0] for row in result]
            print(f"Current unique tags: {current_tags}")

            # Fix each wrong tag
            for wrong_tag, correct_tag in tag_fixes.items():
                if wrong_tag in current_tags:
                    print(f"  Fixing '{wrong_tag}' → '{correct_tag}'...")
                    result = connection.execute(
                        text("UPDATE expenses SET tag = :correct WHERE tag = :wrong"),
                        {"correct": correct_tag, "wrong": wrong_tag}
                    )
                    fixed_count = result.rowcount
                    total_fixed += fixed_count
                    print(f"  ✓ Fixed {fixed_count} expenses")

            connection.commit()

            # Show final tags
            result = connection.execute(text("SELECT DISTINCT tag FROM expenses"))
            final_tags = [row[0] for row in result]
            print(f"\nFinal unique tags: {final_tags}")

            print(f"\n✓ Successfully fixed {total_fixed} expense tags!")
            return total_fixed

        except Exception as e:
            print(f"Error fixing tags: {e}")
            connection.rollback()
            raise

if __name__ == "__main__":
    print("=" * 60)
    print("Fix Expense Tag Case Sensitivity")
    print("=" * 60)
    try:
        fixed = fix_tag_case()
        print(f"\n✓ Done! Fixed {fixed} tags.")
        sys.exit(0)
    except Exception as e:
        print(f"\n✗ Failed: {e}")
        sys.exit(1)
