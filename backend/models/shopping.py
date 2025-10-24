from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import secrets

class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    share_token = Column(String, unique=True, index=True, default=lambda: secrets.token_urlsafe(32))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User")
    items = relationship("ShoppingItem", back_populates="shopping_list", cascade="all, delete-orphan")
    shared_with = relationship("SharedList", back_populates="shopping_list", cascade="all, delete-orphan")

class ShoppingItem(Base):
    __tablename__ = "shopping_items"

    id = Column(Integer, primary_key=True, index=True)
    shopping_list_id = Column(Integer, ForeignKey("shopping_lists.id"))
    nome = Column(String, nullable=False)
    quantita = Column(String)
    note = Column(String)
    completato = Column(Boolean, default=False)
    completed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    shopping_list = relationship("ShoppingList", back_populates="items")
    completed_by = relationship("User")

class SharedList(Base):
    __tablename__ = "shared_lists"

    id = Column(Integer, primary_key=True, index=True)
    shopping_list_id = Column(Integer, ForeignKey("shopping_lists.id"))
    shared_with_id = Column(Integer, ForeignKey("users.id"))
    shared_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    shopping_list = relationship("ShoppingList", back_populates="shared_with")
    user = relationship("User")
