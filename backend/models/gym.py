from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class WorkoutCard(Base):
    __tablename__ = "workout_cards"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descrizione = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")
    days = relationship("WorkoutDay", back_populates="workout_card", cascade="all, delete-orphan", order_by="WorkoutDay.ordine")

class WorkoutDay(Base):
    __tablename__ = "workout_days"

    id = Column(Integer, primary_key=True, index=True)
    workout_card_id = Column(Integer, ForeignKey("workout_cards.id"))
    nome = Column(String, nullable=False)  # es: "Giorno 1 - Petto/Tricipiti", "Lunedì", etc.
    ordine = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workout_card = relationship("WorkoutCard", back_populates="days")
    exercises = relationship("Exercise", back_populates="workout_day", cascade="all, delete-orphan", order_by="Exercise.ordine")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    workout_day_id = Column(Integer, ForeignKey("workout_days.id"))
    nome = Column(String, nullable=False)
    serie = Column(Integer)
    ripetizioni = Column(String)
    peso = Column(String)
    note = Column(Text)
    ordine = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workout_day = relationship("WorkoutDay", back_populates="exercises")
