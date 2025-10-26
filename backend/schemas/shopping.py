from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User

# User schema for nested relationships
class UserBasic(BaseModel):
    id: int
    email: str
    nome: str
    cognome: str

    class Config:
        from_attributes = True

# Shopping Items
class ShoppingItemBase(BaseModel):
    nome: str
    quantita: Optional[str] = None
    note: Optional[str] = None
    completato: bool = False

class ShoppingItemCreate(ShoppingItemBase):
    pass

class ShoppingItemUpdate(BaseModel):
    nome: Optional[str] = None
    quantita: Optional[str] = None
    note: Optional[str] = None
    completato: Optional[bool] = None

class ShoppingItem(ShoppingItemBase):
    id: int
    shopping_list_id: int
    completed_by_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Shopping Lists
class ShoppingListBase(BaseModel):
    nome: str

class ShoppingListCreate(ShoppingListBase):
    pass

class ShoppingListUpdate(BaseModel):
    nome: Optional[str] = None

# Shared List Member
class SharedListMember(BaseModel):
    user: UserBasic
    shared_at: datetime

    class Config:
        from_attributes = True

class ShoppingList(ShoppingListBase):
    id: int
    owner_id: int
    share_token: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[ShoppingItem] = []
    owner: Optional[UserBasic] = None
    shared_users: List[UserBasic] = []

    class Config:
        from_attributes = True
