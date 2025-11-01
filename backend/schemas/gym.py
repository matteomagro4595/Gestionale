from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Exercises
class ExerciseBase(BaseModel):
    nome: str
    serie: Optional[int] = None
    ripetizioni: Optional[str] = None
    peso: Optional[str] = None
    note: Optional[str] = None
    ordine: int = 0

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseUpdate(BaseModel):
    nome: Optional[str] = None
    serie: Optional[int] = None
    ripetizioni: Optional[str] = None
    peso: Optional[str] = None
    note: Optional[str] = None
    ordine: Optional[int] = None

class Exercise(ExerciseBase):
    id: int
    workout_day_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Workout Days
class WorkoutDayBase(BaseModel):
    nome: str
    ordine: int = 0

class WorkoutDayCreate(WorkoutDayBase):
    exercises: List[ExerciseCreate] = []

class WorkoutDayUpdate(BaseModel):
    nome: Optional[str] = None
    ordine: Optional[int] = None

class WorkoutDay(WorkoutDayBase):
    id: int
    workout_card_id: int
    created_at: datetime
    exercises: List[Exercise] = []

    class Config:
        from_attributes = True

# Workout Cards
class WorkoutCardBase(BaseModel):
    nome: str
    descrizione: Optional[str] = None

class WorkoutCardCreate(WorkoutCardBase):
    days: List[WorkoutDayCreate] = []

class WorkoutCardUpdate(BaseModel):
    nome: Optional[str] = None
    descrizione: Optional[str] = None

class WorkoutCard(WorkoutCardBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    days: List[WorkoutDay] = []

    class Config:
        from_attributes = True
