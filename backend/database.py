import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
from schemas import NoteCreate, UserCreate

# Load .env file from backend directory
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set")

DATABASE_NAME = "notes_app"

# MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
notes_collection = db["notes"]

async def create_indexes():
    """Create indexes for better query performance"""
    await users_collection.create_index("email", unique=True)
    await notes_collection.create_index("owner_id")

async def create_user(user: UserCreate, hashed_password: str):
    user_doc = {
        "email": user.email,
        "hashed_password": hashed_password
    }
    result = await users_collection.insert_one(user_doc)
    return {"id": str(result.inserted_id), "email": user.email}

async def get_user_by_email(email: str):
    user = await users_collection.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
    return user

async def create_note(note: NoteCreate, user_id: str):
    note_doc = {
        "title": note.title,
        "content": note.content,
        "owner_id": user_id
    }
    result = await notes_collection.insert_one(note_doc)
    return {
        "id": str(result.inserted_id),
        "title": note.title,
        "content": note.content,
        "owner_id": user_id
    }

async def get_notes(user_id: str):
    notes = []
    cursor = notes_collection.find({"owner_id": user_id})
    async for note in cursor:
        note["_id"] = str(note["_id"])
        notes.append(note)
    return notes

async def get_note(note_id: str, user_id: str):
    try:
        note = await notes_collection.find_one({
            "_id": ObjectId(note_id),
            "owner_id": user_id
        })
        if note:
            note["_id"] = str(note["_id"])
        return note
    except Exception:
        return None

async def update_note(note_id: str, note: NoteCreate, user_id: str):
    try:
        result = await notes_collection.update_one(
            {"_id": ObjectId(note_id), "owner_id": user_id},
            {"$set": {"title": note.title, "content": note.content}}
        )
        if result.modified_count > 0:
            return {
                "id": note_id,
                "title": note.title,
                "content": note.content,
                "owner_id": user_id
            }
        return None
    except Exception:
        return None

async def delete_note(note_id: str, user_id: str):
    try:
        result = await notes_collection.delete_one({
            "_id": ObjectId(note_id),
            "owner_id": user_id
        })
        return result.deleted_count > 0
    except Exception:
        return False