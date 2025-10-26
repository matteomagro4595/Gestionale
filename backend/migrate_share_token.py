"""
Migration script to add share_token to expense_groups table
Run this script once to update the database schema
"""

import secrets
import sys
from sqlalchemy import text
from database import engine, SessionLocal

def migrate():
    """Run database migration for share_token"""
    print("Starting migration: Adding share_token to expense_groups...")

    db = SessionLocal()

    try:
        # Check if column already exists
        result = db.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='expense_groups' AND column_name='share_token'
        """))

        if result.fetchone():
            print("✓ share_token column already exists. Skipping migration.")
            return True

        # Add share_token column
        print("Adding share_token column...")
        db.execute(text("""
            ALTER TABLE expense_groups
            ADD COLUMN share_token VARCHAR UNIQUE
        """))
        db.commit()

        # Create index
        print("Creating index...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_expense_groups_share_token
            ON expense_groups(share_token)
        """))
        db.commit()

        # Generate tokens for existing groups
        print("Generating tokens for existing groups...")
        existing_groups = db.execute(text("""
            SELECT id FROM expense_groups WHERE share_token IS NULL
        """)).fetchall()

        for group in existing_groups:
            token = secrets.token_urlsafe(32)
            db.execute(
                text("UPDATE expense_groups SET share_token = :token WHERE id = :id"),
                {"token": token, "id": group[0]}
            )
        db.commit()

        # Make share_token NOT NULL
        print("Setting share_token as NOT NULL...")
        db.execute(text("""
            ALTER TABLE expense_groups
            ALTER COLUMN share_token SET NOT NULL
        """))
        db.commit()

        print("✓ Migration completed successfully!")
        return True

    except Exception as e:
        print(f"✗ Migration failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = migrate()
    sys.exit(0 if success else 1)
