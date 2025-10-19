from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from . import database, schemas
from .auth import get_current_user

router = APIRouter(
    prefix="/api/v1/notes",
    tags=["notes"],
    dependencies=[Depends(get_current_user)]
)

@router.post("/", response_model=schemas.Note)
async def create_note(note: schemas.NoteCreate, current_user: schemas.User = Depends(get_current_user)):
    new_note = await database.create_note(note, current_user.id)
    return schemas.Note(**new_note)

@router.get("/", response_model=List[schemas.Note])
async def read_notes(current_user: schemas.User = Depends(get_current_user)):
    notes = await database.get_notes(current_user.id)
    return [schemas.Note(**note) for note in notes]

@router.get("/{note_id}", response_model=schemas.Note)
async def read_note(note_id: str, current_user: schemas.User = Depends(get_current_user)):
    note = await database.get_note(note_id, current_user.id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return schemas.Note(**note)

@router.put("/{note_id}", response_model=schemas.Note)
async def update_note(note_id: str, note: schemas.NoteCreate, current_user: schemas.User = Depends(get_current_user)):
    updated_note = await database.update_note(note_id, note, current_user.id)
    if updated_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return schemas.Note(**updated_note)

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str, current_user: schemas.User = Depends(get_current_user)):
    success = await database.delete_note(note_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")