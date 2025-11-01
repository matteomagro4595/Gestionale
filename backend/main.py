import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from database import engine, Base
from routers import auth, users, expenses, shopping_lists, gym, notifications, oauth
from config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

# Run migrations
try:
    from migrate_share_token import migrate
    migrate()
except Exception as e:
    print(f"Migration warning: {e}")

try:
    from migrate_expense_tags import migrate_tags
    migrate_tags()
except Exception as e:
    print(f"Migration warning (expense tags): {e}")

try:
    from fix_tag_case import fix_tag_case
    fix_tag_case()
except Exception as e:
    print(f"Migration warning (fix tag case): {e}")

app = FastAPI(
    title="Gestionale API",
    description="API per la gestione di spese, liste della spesa e schede palestra",
    version="1.0.0"
)

# Add SessionMiddleware for OAuth (must be before CORS)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site='lax',
    https_only=False  # Set to True in production with HTTPS
)

# Configure CORS
allowed_origins = [
    "http://localhost:3000",  # Development
    os.getenv("FRONTEND_URL", ""),  # Production
]
# Remove empty strings
allowed_origins = [origin for origin in allowed_origins if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(oauth.router, prefix="/api/oauth", tags=["OAuth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Gestione Spese"])
app.include_router(shopping_lists.router, prefix="/api/shopping-lists", tags=["Lista della Spesa"])
app.include_router(gym.router, prefix="/api/gym", tags=["Schede Palestra"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifiche"])

@app.get("/")
def read_root():
    return {
        "message": "Benvenuto nell'API Gestionale",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
