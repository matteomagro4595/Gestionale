"""
Database initialization script
Creates all tables from models
Run this to initialize or update the database schema
"""

from database import Base, engine
from models import user, expense, shopping, gym

def init_db():
    print("Creating all database tables...")
    try:
        # Import all models to ensure they're registered with Base
        # This is already done above, but we keep it explicit

        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✓ All tables created successfully!")
        print("\nTables created:")
        for table in Base.metadata.sorted_tables:
            print(f"  - {table.name}")

    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        raise

if __name__ == "__main__":
    init_db()
