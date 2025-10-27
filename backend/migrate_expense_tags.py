"""
Migration script to update expense tags from old values to new values.
Handles PostgreSQL ENUM type migration properly.
"""
from sqlalchemy import create_engine, text
from database import DATABASE_URL

def migrate_tags():
    """Migrate old expense tags to new tag values"""
    engine = create_engine(DATABASE_URL)

    # Mapping from old tags to new tags
    # Note: Old tags are stored in uppercase in the database
    tag_mapping = {
        'BOLLETTA': 'Altro',  # Generic "Bolletta" becomes "Altro" since we now have specific bill types
        'SPESA': 'Spesa Alimentare',  # "Spesa" becomes "Spesa Alimentare"
        'PRANZO/CENA': 'Pranzo/Cena',  # Should remain the same if exists
        'CANI': 'Animali Domestici',  # "Cani" becomes "Animali Domestici" if exists
        'ALTRO': 'Altro'  # Should remain the same if exists
    }

    # First, check if the migration is needed
    with engine.connect() as connection:
        try:
            # Check if expenses table exists and has data
            result = connection.execute(text("SELECT COUNT(*) FROM expenses"))
            count = result.scalar()

            if count == 0:
                print("No expenses found. Migration not needed.")
                connection.commit()
                return

            print(f"Found {count} expenses to potentially migrate.")

            # Check if migration already done by checking for new enum values
            result = connection.execute(text("SELECT tag FROM expenses LIMIT 1"))
            sample_tag = result.scalar()
            if sample_tag in ['Bolletta Acqua', 'Bolletta Luce', 'Bolletta Gas', 'Spesa Alimentare', 'Animali Domestici']:
                print("✓ Migration already completed. Tags are up to date.")
                connection.commit()
                return

        except Exception as e:
            print(f"Error checking migration status: {e}")
            # Continue with migration anyway

    # Now perform the migration with autocommit for DDL operations
    raw_connection = engine.raw_connection()
    try:
        raw_connection.autocommit = True
        cursor = raw_connection.cursor()

        # Step 1: Convert tag column from ENUM to VARCHAR to allow updates
        print("Converting tag column to VARCHAR...")
        cursor.execute("ALTER TABLE expenses ALTER COLUMN tag TYPE VARCHAR(50)")

        # Step 2: Update each old tag value to new value
        print("Updating tag values...")
        for old_tag, new_tag in tag_mapping.items():
            print(f"  Attempting to update '{old_tag}' to '{new_tag}'...")
            cursor.execute("UPDATE expenses SET tag = %s WHERE tag = %s", (new_tag, old_tag))
            print(f"  Updated {cursor.rowcount} expenses from '{old_tag}' to '{new_tag}'")

        # Step 3: Drop the old ENUM type
        print("Dropping old ENUM type...")
        cursor.execute("DROP TYPE IF EXISTS expensetag CASCADE")

        # Step 4: Create new ENUM type with updated values
        print("Creating new ENUM type...")
        cursor.execute("""
            CREATE TYPE expensetag AS ENUM (
                'Bolletta Acqua',
                'Bolletta Luce',
                'Bolletta Gas',
                'Internet/Telefono',
                'Affitto',
                'Spesa Alimentare',
                'Trasporti',
                'Pranzo/Cena',
                'Salute',
                'Animali Domestici',
                'Svago/Intrattenimento',
                'Altro'
            )
        """)

        # Step 5: Convert tag column back to ENUM
        print("Converting tag column back to ENUM...")
        cursor.execute("ALTER TABLE expenses ALTER COLUMN tag TYPE expensetag USING tag::expensetag")

        print("✓ Expense tags migration completed successfully!")

        cursor.close()
    except Exception as e:
        print(f"Error during migration: {e}")
        raise
    finally:
        raw_connection.close()

if __name__ == "__main__":
    print("Starting expense tags migration...")
    migrate_tags()
    print("Migration finished.")
