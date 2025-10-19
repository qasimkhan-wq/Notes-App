import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import auth
import notes
import database

load_dotenv()

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    """Initialize database indexes on startup"""
    await database.create_indexes()

# CORS configuration - must be added before routers
# Allow all origins for development and deployment flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notes.router)

@app.get("/api/v1/healthz")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
