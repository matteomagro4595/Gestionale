"""
Migration script to add WorkoutDay model and migrate existing exercises
"""
from sqlalchemy import create_engine, text
from config import settings
from database import SessionLocal

def migrate():
    """
    Migrate existing workout cards to use workout days structure
    """
    db = SessionLocal()
    engine = create_engine(settings.DATABASE_URL)

    try:
        print("Starting workout days migration...")

        # Step 1: Create workout_days table
        print("Creating workout_days table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS workout_days (
                id SERIAL PRIMARY KEY,
                workout_card_id INTEGER NOT NULL REFERENCES workout_cards(id) ON DELETE CASCADE,
                nome VARCHAR NOT NULL,
                ordine INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        db.commit()
        print("✓ workout_days table created")

        # Step 2: Check if exercises table needs migration
        print("Checking if migration is needed...")
        result = db.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='exercises' AND column_name='workout_card_id'
        """))

        if result.fetchone() is None:
            print("✓ Migration already completed - exercises table already has workout_day_id")
            return

        # Step 3: Create a default day for each workout card that has exercises
        print("Creating default days for existing workout cards...")
        db.execute(text("""
            INSERT INTO workout_days (workout_card_id, nome, ordine)
            SELECT DISTINCT workout_card_id, 'Giorno 1', 0
            FROM exercises
            WHERE workout_card_id IS NOT NULL
        """))
        db.commit()
        print("✓ Default days created")

        # Step 4: Add workout_day_id column to exercises (temporarily nullable)
        print("Adding workout_day_id column to exercises...")
        db.execute(text("""
            ALTER TABLE exercises
            ADD COLUMN IF NOT EXISTS workout_day_id INTEGER
        """))
        db.commit()
        print("✓ workout_day_id column added")

        # Step 5: Migrate exercises to their respective days
        print("Migrating exercises to workout days...")
        db.execute(text("""
            UPDATE exercises e
            SET workout_day_id = wd.id
            FROM workout_days wd
            WHERE e.workout_card_id = wd.workout_card_id
            AND e.workout_day_id IS NULL
        """))
        db.commit()
        print("✓ Exercises migrated to workout days")

        # Step 6: Make workout_day_id NOT NULL and add foreign key
        print("Adding constraints...")
        db.execute(text("""
            ALTER TABLE exercises
            ALTER COLUMN workout_day_id SET NOT NULL
        """))

        db.execute(text("""
            ALTER TABLE exercises
            ADD CONSTRAINT fk_exercises_workout_day
            FOREIGN KEY (workout_day_id)
            REFERENCES workout_days(id)
            ON DELETE CASCADE
        """))
        db.commit()
        print("✓ Constraints added")

        # Step 7: Drop old workout_card_id column
        print("Removing old workout_card_id column...")
        db.execute(text("""
            ALTER TABLE exercises
            DROP COLUMN IF EXISTS workout_card_id
        """))
        db.commit()
        print("✓ Old column removed")

        print("✅ Migration completed successfully!")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
