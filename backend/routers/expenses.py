from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
from models.user import User
from models.expense import Expense, ExpenseGroup, GroupMember, ExpenseParticipant
from schemas.expense import (
    ExpenseCreate, ExpenseUpdate, Expense as ExpenseSchema,
    GroupCreate, GroupUpdate, Group as GroupSchema,
    GroupMemberCreate, Balance
)
from auth import get_current_user

router = APIRouter()

# Groups endpoints
@router.post("/groups", response_model=GroupSchema, status_code=status.HTTP_201_CREATED)
def create_group(
    group: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_group = ExpenseGroup(**group.dict(), creator_id=current_user.id)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    # Add creator as member
    member = GroupMember(group_id=db_group.id, user_id=current_user.id)
    db.add(member)
    db.commit()

    return db_group

@router.get("/groups", response_model=List[GroupSchema])
def get_groups(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get groups where user is a member
    groups = db.query(ExpenseGroup).join(GroupMember).filter(
        GroupMember.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return groups

@router.get("/groups/{group_id}", response_model=GroupSchema)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is member of the group
    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non sei membro di questo gruppo"
        )

    group = db.query(ExpenseGroup)\
        .options(joinedload(ExpenseGroup.creator))\
        .options(joinedload(ExpenseGroup.members).joinedload(GroupMember.user))\
        .filter(ExpenseGroup.id == group_id)\
        .first()

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gruppo non trovato"
        )

    # Build member_users list
    member_users = [member.user for member in group.members if member.user]
    group.member_users = member_users

    return group

@router.get("/groups/shared/{share_token}", response_model=GroupSchema)
def get_group_by_token(
    share_token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(ExpenseGroup)\
        .options(joinedload(ExpenseGroup.creator))\
        .options(joinedload(ExpenseGroup.members).joinedload(GroupMember.user))\
        .filter(ExpenseGroup.share_token == share_token)\
        .first()

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gruppo non trovato"
        )

    # Add user to group if not already a member
    if group.creator_id != current_user.id:
        existing_member = db.query(GroupMember).filter(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id
        ).first()

        if not existing_member:
            member = GroupMember(
                group_id=group.id,
                user_id=current_user.id
            )
            db.add(member)
            db.commit()
            db.refresh(group)

    # Build member_users list
    member_users = [member.user for member in group.members if member.user]
    group.member_users = member_users

    return group

@router.put("/groups/{group_id}", response_model=GroupSchema)
def update_group(
    group_id: int,
    group_update: GroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(ExpenseGroup).filter(ExpenseGroup.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gruppo non trovato"
        )

    if group.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo il creatore può modificare il gruppo"
        )

    for key, value in group_update.dict(exclude_unset=True).items():
        setattr(group, key, value)

    db.commit()
    db.refresh(group)
    return group

@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(ExpenseGroup).filter(ExpenseGroup.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gruppo non trovato"
        )

    if group.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo il creatore può eliminare il gruppo"
        )

    db.delete(group)
    db.commit()
    return None

# Group members endpoints
@router.post("/groups/{group_id}/members", status_code=status.HTTP_201_CREATED)
def add_group_member(
    group_id: int,
    member: GroupMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(ExpenseGroup).filter(ExpenseGroup.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gruppo non trovato"
        )

    # Check if user is already a member
    existing_member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == member.user_id
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'utente è già membro del gruppo"
        )

    db_member = GroupMember(group_id=group_id, user_id=member.user_id)
    db.add(db_member)
    db.commit()
    return {"message": "Membro aggiunto con successo"}

@router.delete("/groups/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_group_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(ExpenseGroup).filter(ExpenseGroup.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gruppo non trovato"
        )

    if group.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo il creatore può rimuovere membri"
        )

    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membro non trovato"
        )

    db.delete(member)
    db.commit()
    return None

# Expenses endpoints
@router.post("/expenses", response_model=ExpenseSchema, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is member of the group
    member = db.query(GroupMember).filter(
        GroupMember.group_id == expense.group_id,
        GroupMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non sei membro di questo gruppo"
        )

    # Create expense
    expense_data = expense.dict(exclude={'participants'})
    db_expense = Expense(**expense_data)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    # Add participants
    for participant in expense.participants:
        db_participant = ExpenseParticipant(
            expense_id=db_expense.id,
            **participant.dict()
        )
        db.add(db_participant)

    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/expenses", response_model=List[ExpenseSchema])
def get_expenses(
    group_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Expense)

    if group_id:
        # Check if user is member of the group
        member = db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id
        ).first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Non sei membro di questo gruppo"
            )

        query = query.filter(Expense.group_id == group_id)

    expenses = query.offset(skip).limit(limit).all()
    return expenses

@router.get("/expenses/{expense_id}", response_model=ExpenseSchema)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spesa non trovata"
        )

    # Check if user is member of the group
    member = db.query(GroupMember).filter(
        GroupMember.group_id == expense.group_id,
        GroupMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai accesso a questa spesa"
        )

    return expense

@router.put("/expenses/{expense_id}", response_model=ExpenseSchema)
def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spesa non trovata"
        )

    # Check if user is member of the group
    member = db.query(GroupMember).filter(
        GroupMember.group_id == expense.group_id,
        GroupMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai accesso a questa spesa"
        )

    # Only the person who paid can edit the expense
    if expense.paid_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo chi ha pagato può modificare la spesa"
        )

    # Update expense fields
    for key, value in expense_update.dict(exclude_unset=True).items():
        setattr(expense, key, value)

    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spesa non trovata"
        )

    if expense.paid_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo chi ha pagato può eliminare la spesa"
        )

    db.delete(expense)
    db.commit()
    return None

# Balance endpoints
@router.get("/groups/{group_id}/balances", response_model=List[Balance])
def get_group_balances(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is member of the group
    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non sei membro di questo gruppo"
        )

    # Get all members
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()

    balances = []
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()

        # Calculate total paid
        total_paid = db.query(Expense).filter(
            Expense.group_id == group_id,
            Expense.paid_by_id == member.user_id
        ).with_entities(Expense.importo).all()
        total_paid_sum = sum([expense[0] for expense in total_paid])

        # Calculate total owed
        participants = db.query(ExpenseParticipant).join(Expense).filter(
            Expense.group_id == group_id,
            ExpenseParticipant.user_id == member.user_id
        ).all()

        total_owed_sum = 0
        for participant in participants:
            expense = db.query(Expense).filter(Expense.id == participant.expense_id).first()
            if expense.division_type == "Uguale":
                num_participants = len(expense.participants)
                total_owed_sum += expense.importo / num_participants
            elif expense.division_type == "Importi esatti":
                total_owed_sum += participant.importo or 0
            elif expense.division_type == "Percentuale":
                total_owed_sum += (expense.importo * (participant.percentuale or 0)) / 100

        balance = Balance(
            user_id=member.user_id,
            user_name=f"{user.nome} {user.cognome}",
            total_paid=total_paid_sum,
            total_owed=total_owed_sum,
            balance=total_paid_sum - total_owed_sum
        )
        balances.append(balance)

    return balances
