from pydantic import BaseModel, Field
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: str = Field(alias="_id")
    email: str

    class Config:
        populate_by_name = True
        json_encoders = {
            str: str
        }

class Token(BaseModel):
    access_token: str
    token_type: str

class NoteBase(BaseModel):
    title: str
    content: str

class NoteCreate(NoteBase):
    pass

class Note(NoteBase):
    id: str = Field(alias="_id")
    owner_id: str

    class Config:
        populate_by_name = True
        json_encoders = {
            str: str
        }