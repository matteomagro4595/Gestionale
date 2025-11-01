from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.gym import WorkoutCard, WorkoutDay, Exercise
from schemas.gym import (
    WorkoutCardCreate, WorkoutCardUpdate, WorkoutCard as WorkoutCardSchema,
    WorkoutDayCreate, WorkoutDayUpdate, WorkoutDay as WorkoutDaySchema,
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
    card_data = card.dict(exclude={'days'})
    db_card = WorkoutCard(**card_data, user_id=current_user.id)
    db.add(db_card)
    db.commit()
    db.refresh(db_card)

    # Add days and exercises
    for day_data in card.days:
        exercises_data = day_data.dict().pop('exercises', [])
        db_day = WorkoutDay(**day_data.dict(exclude={'exercises'}), workout_card_id=db_card.id)
        db.add(db_day)
        db.flush()

        for exercise_data in exercises_data:
            db_exercise = Exercise(**exercise_data, workout_day_id=db_day.id)
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

# Workout Days endpoints
@router.post("/cards/{card_id}/days", response_model=WorkoutDaySchema, status_code=status.HTTP_201_CREATED)
def create_workout_day(
    card_id: int,
    day: WorkoutDayCreate,
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

    # Create day
    exercises_data = day.dict().pop('exercises', [])
    db_day = WorkoutDay(**day.dict(exclude={'exercises'}), workout_card_id=card_id)
    db.add(db_day)
    db.flush()

    # Add exercises
    for exercise_data in exercises_data:
        db_exercise = Exercise(**exercise_data, workout_day_id=db_day.id)
        db.add(db_exercise)

    db.commit()
    db.refresh(db_day)
    return db_day

@router.put("/cards/{card_id}/days/{day_id}", response_model=WorkoutDaySchema)
def update_workout_day(
    card_id: int,
    day_id: int,
    day_update: WorkoutDayUpdate,
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

    day = db.query(WorkoutDay).filter(
        WorkoutDay.id == day_id,
        WorkoutDay.workout_card_id == card_id
    ).first()

    if not day:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giorno non trovato"
        )

    for key, value in day_update.dict(exclude_unset=True).items():
        setattr(day, key, value)

    db.commit()
    db.refresh(day)
    return day

@router.delete("/cards/{card_id}/days/{day_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout_day(
    card_id: int,
    day_id: int,
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

    day = db.query(WorkoutDay).filter(
        WorkoutDay.id == day_id,
        WorkoutDay.workout_card_id == card_id
    ).first()

    if not day:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giorno non trovato"
        )

    db.delete(day)
    db.commit()
    return None

# Exercises endpoints
@router.post("/days/{day_id}/exercises", response_model=ExerciseSchema, status_code=status.HTTP_201_CREATED)
def create_exercise(
    day_id: int,
    exercise: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user owns the day's card
    day = db.query(WorkoutDay).filter(WorkoutDay.id == day_id).first()
    if not day:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giorno non trovato"
        )

    card = db.query(WorkoutCard).filter(WorkoutCard.id == day.workout_card_id).first()
    if card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai accesso a questa scheda"
        )

    db_exercise = Exercise(**exercise.dict(), workout_day_id=day_id)
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise

@router.put("/days/{day_id}/exercises/{exercise_id}", response_model=ExerciseSchema)
def update_exercise(
    day_id: int,
    exercise_id: int,
    exercise_update: ExerciseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user owns the day's card
    day = db.query(WorkoutDay).filter(WorkoutDay.id == day_id).first()
    if not day:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giorno non trovato"
        )

    card = db.query(WorkoutCard).filter(WorkoutCard.id == day.workout_card_id).first()
    if card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai accesso a questa scheda"
        )

    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.workout_day_id == day_id
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

@router.delete("/days/{day_id}/exercises/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(
    day_id: int,
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user owns the day's card
    day = db.query(WorkoutDay).filter(WorkoutDay.id == day_id).first()
    if not day:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giorno non trovato"
        )

    card = db.query(WorkoutCard).filter(WorkoutCard.id == day.workout_card_id).first()
    if card.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai accesso a questa scheda"
        )

    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.workout_day_id == day_id
    ).first()

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Esercizio non trovato"
        )

    db.delete(exercise)
    db.commit()
    return None
