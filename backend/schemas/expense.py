from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from models.expense import ExpenseTag, DivisionType

# Expense Participants
class ExpenseParticipantBase(BaseModel):
    user_id: int
    importo: Optional[float] = None
    percentuale: Optional[float] = None

class ExpenseParticipantCreate(ExpenseParticipantBase):
    pass

class ExpenseParticipant(ExpenseParticipantBase):
    id: int
    expense_id: int

    class Config:
        from_attributes = True

# Expenses
class ExpenseBase(BaseModel):
    descrizione: Optional[str] = None
    importo: float
    tag: ExpenseTag
    division_type: DivisionType
    paid_by_id: int
    group_id: int

class ExpenseCreate(ExpenseBase):
    participants: List[ExpenseParticipantCreate]

class ExpenseUpdate(BaseModel):
    descrizione: Optional[str] = None
    importo: Optional[float] = None
    tag: Optional[ExpenseTag] = None
    division_type: Optional[DivisionType] = None

class Expense(ExpenseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    participants: List[ExpenseParticipant] = []

    class Config:
        from_attributes = True

# Groups
class GroupBase(BaseModel):
    nome: str
    descrizione: Optional[str] = None

class GroupCreate(GroupBase):
    pass

class GroupUpdate(BaseModel):
    nome: Optional[str] = None
    descrizione: Optional[str] = None

class GroupMemberBase(BaseModel):
    user_id: int

class GroupMemberCreate(GroupMemberBase):
    pass

class GroupMember(GroupMemberBase):
    id: int
    group_id: int
    joined_at: datetime

    class Config:
        from_attributes = True

class Group(GroupBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    members: List[GroupMember] = []
    expenses: List[Expense] = []

    class Config:
        from_attributes = True

# Balance
class Balance(BaseModel):
    user_id: int
    user_name: str
    total_paid: float
    total_owed: float
    balance: float
