from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.shopping import ShoppingList, ShoppingItem, SharedList
from schemas.shopping import (
    ShoppingListCreate, ShoppingListUpdate, ShoppingList as ShoppingListSchema,
    ShoppingItemCreate, ShoppingItemUpdate, ShoppingItem as ShoppingItemSchema
)
from auth import get_current_user

router = APIRouter()

# Shopping Lists endpoints
@router.post("/", response_model=ShoppingListSchema, status_code=status.HTTP_201_CREATED)
def create_shopping_list(
    shopping_list: ShoppingListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_list = ShoppingList(**shopping_list.dict(), owner_id=current_user.id)
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list

@router.get("/", response_model=List[ShoppingListSchema])
def get_shopping_lists(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get lists owned by user
    owned_lists = db.query(ShoppingList).filter(
        ShoppingList.owner_id == current_user.id
    ).all()

    # Get lists shared with user
    shared_list_ids = db.query(SharedList.shopping_list_id).filter(
        SharedList.shared_with_id == current_user.id
    ).all()
    shared_lists = db.query(ShoppingList).filter(
        ShoppingList.id.in_([sl_id[0] for sl_id in shared_list_ids])
    ).all()

    all_lists = owned_lists + shared_lists
    return all_lists[skip:skip + limit]

@router.get("/{list_id}", response_model=ShoppingListSchema)
def get_shopping_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista non trovata"
        )

    # Check if user has access
    if shopping_list.owner_id != current_user.id:
        shared = db.query(SharedList).filter(
            SharedList.shopping_list_id == list_id,
            SharedList.shared_with_id == current_user.id
        ).first()
        if not shared:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Non hai accesso a questa lista"
            )

    return shopping_list

@router.get("/shared/{share_token}", response_model=ShoppingListSchema)
def get_shopping_list_by_token(
    share_token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shopping_list = db.query(ShoppingList).filter(
        ShoppingList.share_token == share_token
    ).first()

    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista non trovata"
        )

    # Add user to shared list if not already shared
    if shopping_list.owner_id != current_user.id:
        existing_share = db.query(SharedList).filter(
            SharedList.shopping_list_id == shopping_list.id,
            SharedList.shared_with_id == current_user.id
        ).first()

        if not existing_share:
            shared = SharedList(
                shopping_list_id=shopping_list.id,
                shared_with_id=current_user.id
            )
            db.add(shared)
            db.commit()

    return shopping_list

@router.put("/{list_id}", response_model=ShoppingListSchema)
def update_shopping_list(
    list_id: int,
    shopping_list_update: ShoppingListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista non trovata"
        )

    if shopping_list.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo il proprietario può modificare la lista"
        )

    for key, value in shopping_list_update.dict(exclude_unset=True).items():
        setattr(shopping_list, key, value)

    db.commit()
    db.refresh(shopping_list)
    return shopping_list

@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shopping_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista non trovata"
        )

    if shopping_list.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo il proprietario può eliminare la lista"
        )

    db.delete(shopping_list)
    db.commit()
    return None

# Shopping Items endpoints
@router.post("/{list_id}/items", response_model=ShoppingItemSchema, status_code=status.HTTP_201_CREATED)
def create_shopping_item(
    list_id: int,
    item: ShoppingItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user has access to the list
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista non trovata"
        )

    if shopping_list.owner_id != current_user.id:
        shared = db.query(SharedList).filter(
            SharedList.shopping_list_id == list_id,
            SharedList.shared_with_id == current_user.id
        ).first()
        if not shared:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Non hai accesso a questa lista"
            )

    db_item = ShoppingItem(**item.dict(), shopping_list_id=list_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{list_id}/items/{item_id}", response_model=ShoppingItemSchema)
def update_shopping_item(
    list_id: int,
    item_id: int,
    item_update: ShoppingItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check access to list
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista non trovata"
        )

    if shopping_list.owner_id != current_user.id:
        shared = db.query(SharedList).filter(
            SharedList.shopping_list_id == list_id,
            SharedList.shared_with_id == current_user.id
        ).first()
        if not shared:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Non hai accesso a questa lista"
            )

    item = db.query(ShoppingItem).filter(
        ShoppingItem.id == item_id,
        ShoppingItem.shopping_list_id == list_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Articolo non trovato"
        )

    for key, value in item_update.dict(exclude_unset=True).items():
        setattr(item, key, value)

    # If marking as completed, save who completed it
    if item_update.completato is True:
        item.completed_by_id = current_user.id

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{list_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shopping_item(
    list_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check access to list
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista non trovata"
        )

    if shopping_list.owner_id != current_user.id:
        shared = db.query(SharedList).filter(
            SharedList.shopping_list_id == list_id,
            SharedList.shared_with_id == current_user.id
        ).first()
        if not shared:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Non hai accesso a questa lista"
            )

    item = db.query(ShoppingItem).filter(
        ShoppingItem.id == item_id,
        ShoppingItem.shopping_list_id == list_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Articolo non trovato"
        )

    db.delete(item)
    db.commit()
    return None
