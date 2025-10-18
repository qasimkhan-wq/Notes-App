from fastapi import APIRouter, Depends, HTTPException
from pymongo.mongo_client import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List

from schemas import Note, NoteCreate, UserInDB
from auth import get_current_user
from database import db

router = APIRouter()

@router.post("/", response_model=Note)
async def create_note(note: NoteCreate, current_user: UserInDB = Depends(get_current_user)):
    note_dict = note.dict()
    note_dict["owner_id"] = current_user.id
    result = await db.notes.insert_one(note_dict)
    created_note = await db.notes.find_one({"_id": result.inserted_id})
    created_note["id"] = str(created_note["_id"])
    return Note(**created_note)

@router.get("/", response_model=List[Note])
async def get_notes(current_user: UserInDB = Depends(get_current_user)):
    notes = []
    cursor = db.notes.find({"owner_id": current_user.id})
    async for document in cursor:
        document["id"] = str(document["_id"])
        notes.append(Note(**document))
    return notes

@router.put("/{note_id}", response_model=Note)
async def update_note(note_id: str, note: NoteCreate, current_user: UserInDB = Depends(get_current_user)):
    existing_note = await db.notes.find_one({"_id": ObjectId(note_id)})
    if not existing_note or existing_note["owner_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    
    await db.notes.update_one({"_id": ObjectId(note_id)}, {"$set": note.dict()})
    updated_note = await db.notes.find_one({"_id": ObjectId(note_id)})
    updated_note["id"] = str(updated_note["_id"])
    return Note(**updated_note)

@router.delete("/{note_id}", response_model=dict)
async def delete_note(note_id: str, current_user: UserInDB = Depends(get_current_user)):
    existing_note = await db.notes.find_one({"_id": ObjectId(note_id)})
    if not existing_note or existing_note["owner_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")
        
    result = await db.notes.delete_one({"_id": ObjectId(note_id)})
    if result.deleted_count == 1:
        return {"message": "Note deleted successfully"}
    raise HTTPException(status_code=500, detail="Failed to delete note")