from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, users, expenses, shopping_lists, gym

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gestionale API",
    description="API per la gestione di spese, liste della spesa e schede palestra",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Gestione Spese"])
app.include_router(shopping_lists.router, prefix="/api/shopping-lists", tags=["Lista della Spesa"])
app.include_router(gym.router, prefix="/api/gym", tags=["Schede Palestra"])

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
