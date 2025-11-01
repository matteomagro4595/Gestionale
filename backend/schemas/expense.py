from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List
from models.expense import ExpenseTag, DivisionType

# User schema for nested relationships
class UserBasic(BaseModel):
    id: int
    email: str
    nome: str
    cognome: str

    class Config:
        from_attributes = True

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

    @field_validator('tag', mode='before')
    @classmethod
    def normalize_tag(cls, v):
        """Normalize tag values from database to match enum values"""
        if isinstance(v, str):
            # Mapping of old/wrong case tags to correct enum values
            tag_mapping = {
                'ALTRO': 'Altro',
                'BOLLETTA': 'Altro',
                'SPESA': 'Spesa Alimentare',
                'CANI': 'Animali Domestici',
                'PRANZO/CENA': 'Pranzo/Cena',
                # Add uppercase versions
                'BOLLETTA ACQUA': 'Bolletta Acqua',
                'BOLLETTA LUCE': 'Bolletta Luce',
                'BOLLETTA GAS': 'Bolletta Gas',
                'INTERNET/TELEFONO': 'Internet/Telefono',
                'AFFITTO': 'Affitto',
                'SPESA ALIMENTARE': 'Spesa Alimentare',
                'TRASPORTI': 'Trasporti',
                'SALUTE': 'Salute',
                'ANIMALI DOMESTICI': 'Animali Domestici',
                'SVAGO/INTRATTENIMENTO': 'Svago/Intrattenimento',
            }
            return tag_mapping.get(v, v)
        return v

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
    user: Optional[UserBasic] = None

    class Config:
        from_attributes = True

class Group(GroupBase):
    id: int
    creator_id: int
    share_token: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    creator: Optional[UserBasic] = None
    members: List[GroupMember] = []
    member_users: List[UserBasic] = []
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
