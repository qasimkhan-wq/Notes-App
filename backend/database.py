import sqlite3
from .schemas import NoteCreate, UserCreate

DATABASE_URL = "notes.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL
        );
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            owner_id INTEGER NOT NULL,
            FOREIGN KEY (owner_id) REFERENCES users (id)
        );
    """)
    conn.commit()
    conn.close()

def create_user(user: UserCreate, hashed_password: str):
    conn = get_db_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (user.email, hashed_password),
        )
        conn.commit()
        return {"id": cursor.lastrowid, "email": user.email}
    finally:
        conn.close()

def get_user_by_email(email: str):
    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
        return user
    finally:
        conn.close()

def create_note(note: NoteCreate, user_id: int):
    conn = get_db_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO notes (title, content, owner_id) VALUES (?, ?, ?)",
            (note.title, note.content, user_id),
        )
        conn.commit()
        return {"id": cursor.lastrowid, **note.dict(), "owner_id": user_id}
    finally:
        conn.close()

def get_notes(user_id: int):
    conn = get_db_connection()
    try:
        notes = conn.execute(
            "SELECT * FROM notes WHERE owner_id = ?", (user_id,)
        ).fetchall()
        return notes
    finally:
        conn.close()

def get_note(note_id: int, user_id: int):
    conn = get_db_connection()
    try:
        note = conn.execute(
            "SELECT * FROM notes WHERE id = ? AND owner_id = ?", (note_id, user_id)
        ).fetchone()
        return note
    finally:
        conn.close()

def update_note(note_id: int, note: NoteCreate, user_id: int):
    conn = get_db_connection()
    try:
        conn.execute(
            "UPDATE notes SET title = ?, content = ? WHERE id = ? AND owner_id = ?",
            (note.title, note.content, note_id, user_id),
        )
        conn.commit()
        return {"id": note_id, **note.dict(), "owner_id": user_id}
    finally:
        conn.close()

def delete_note(note_id: int, user_id: int):
    conn = get_db_connection()
    try:
        conn.execute("DELETE FROM notes WHERE id = ? AND owner_id = ?", (note_id, user_id))
        conn.commit()
    finally:
        conn.close()

create_tables()