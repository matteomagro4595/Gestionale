from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

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

class ShoppingList(ShoppingListBase):
    id: int
    owner_id: int
    share_token: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[ShoppingItem] = []

    class Config:
        from_attributes = True
