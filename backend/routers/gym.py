from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.gym import WorkoutCard, Exercise
from schemas.gym import (
    WorkoutCardCreate, WorkoutCardUpdate, WorkoutCard as WorkoutCardSchema,
    ExerciseCreate, ExerciseUpdate, Exercise as ExerciseSchema
)
from auth import get_current_user

router = APIRouter()

# Workout Cards endpoints
@router.post("/cards", response_model=WorkoutCardSchema, status_code=status.HTTP_201_CREATED)
def create_workout_card(
    card: WorkoutCardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card_data = card.dict(exclude={'exercises'})
    db_card = WorkoutCard(**card_data, user_id=current_user.id)
    db.add(db_card)
    db.commit()
    db.refresh(db_card)

    # Add exercises
    for exercise in card.exercises:
        db_exercise = Exercise(**exercise.dict(), workout_card_id=db_card.id)
        db.add(db_exercise)

    db.commit()
    db.refresh(db_card)
    return db_card

@router.get("/cards", response_model=List[WorkoutCardSchema])
def get_workout_cards(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cards = db.query(WorkoutCard).filter(
        WorkoutCard.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return cards

@router.get("/cards/{card_id}", response_model=WorkoutCardSchema)
def get_workout_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = db.query(WorkoutCard).filter(WorkoutCard.id == card_id).first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheda non trovata"
        )

    if card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai accesso a questa scheda"
        )

    return card

@router.put("/cards/{card_id}", response_model=WorkoutCardSchema)
def update_workout_card(
    card_id: int,
    card_update: WorkoutCardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = db.query(WorkoutCard).filter(WorkoutCard.id == card_id).first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheda non trovata"
        )

    if card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non puoi modificare questa scheda"
        )

    for key, value in card_update.dict(exclude_unset=True).items():
        setattr(card, key, value)

    db.commit()
    db.refresh(card)
    return card

@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = db.query(WorkoutCard).filter(WorkoutCard.id == card_id).first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheda non trovata"
        )

    if card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non puoi eliminare questa scheda"
        )

    db.delete(card)
    db.commit()
    return None

# Exercises endpoints
@router.post("/cards/{card_id}/exercises", response_model=ExerciseSchema, status_code=status.HTTP_201_CREATED)
def create_exercise(
    card_id: int,
    exercise: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user owns the card
    card = db.query(WorkoutCard).filter(WorkoutCard.id == card_id).first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheda non trovata"
        )

    if card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai accesso a questa scheda"
        )

    db_exercise = Exercise(**exercise.dict(), workout_card_id=card_id)
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise

@router.put("/cards/{card_id}/exercises/{exercise_id}", response_model=ExerciseSchema)
def update_exercise(
    card_id: int,
    exercise_id: int,
    exercise_update: ExerciseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user owns the card
    card = db.query(WorkoutCard).filter(WorkoutCard.id == card_id).first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheda non trovata"
        )

    if card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai accesso a questa scheda"
        )

    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.workout_card_id == card_id
    ).first()

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Esercizio non trovato"
        )

    for key, value in exercise_update.dict(exclude_unset=True).items():
        setattr(exercise, key, value)

    db.commit()
    db.refresh(exercise)
    return exercise

@router.delete("/cards/{card_id}/exercises/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(
    card_id: int,
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user owns the card
    card = db.query(WorkoutCard).filter(WorkoutCard.id == card_id).first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheda non trovata"
        )

    if card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai accesso a questa scheda"
        )

    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.workout_card_id == card_id
    ).first()

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Esercizio non trovato"
        )

    db.delete(exercise)
    db.commit()
    return None
