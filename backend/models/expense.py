from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
import secrets

class ExpenseTag(str, enum.Enum):
    BOLLETTA_ACQUA = "Bolletta Acqua"
    BOLLETTA_LUCE = "Bolletta Luce"
    BOLLETTA_GAS = "Bolletta Gas"
    INTERNET_TELEFONO = "Internet/Telefono"
    AFFITTO = "Affitto"
    SPESA_ALIMENTARE = "Spesa Alimentare"
    TRASPORTI = "Trasporti"
    PRANZO_CENA = "Pranzo/Cena"
    SALUTE = "Salute"
    ANIMALI = "Animali Domestici"
    SVAGO = "Svago/Intrattenimento"
    ALTRO = "Altro"

class DivisionType(str, enum.Enum):
    UGUALE = "Uguale"
    IMPORTI_ESATTI = "Importi esatti"
    PERCENTUALE = "Percentuale"

class ExpenseGroup(Base):
    __tablename__ = "expense_groups"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descrizione = Column(String)
    creator_id = Column(Integer, ForeignKey("users.id"))
    share_token = Column(String, unique=True, index=True, default=lambda: secrets.token_urlsafe(32))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="group", cascade="all, delete-orphan")

class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("expense_groups.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    group = relationship("ExpenseGroup", back_populates="members")
    user = relationship("User")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    descrizione = Column(String)
    importo = Column(Float, nullable=False)
    tag = Column(String(50), nullable=False)  # Changed from SQLEnum to String to match PostgreSQL values
    division_type = Column(SQLEnum(DivisionType), nullable=False, default=DivisionType.UGUALE)
    paid_by_id = Column(Integer, ForeignKey("users.id"))
    group_id = Column(Integer, ForeignKey("expense_groups.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    paid_by = relationship("User")
    group = relationship("ExpenseGroup", back_populates="expenses")
    participants = relationship("ExpenseParticipant", back_populates="expense", cascade="all, delete-orphan")

class ExpenseParticipant(Base):
    __tablename__ = "expense_participants"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    importo = Column(Float)  # Per divisione per importi esatti
    percentuale = Column(Float)  # Per divisione per percentuale

    # Relationships
    expense = relationship("Expense", back_populates="participants")
    user = relationship("User")
