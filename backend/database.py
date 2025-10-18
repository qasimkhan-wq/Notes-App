from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    # Fallback for when .env is not loaded correctly, though it should be.
    MONGO_URI = "mongodb+srv://qasimkhan_db_user:FnZbmgw0S0RN6L54@cluster0.3ve35gz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = AsyncIOMotorClient(MONGO_URI)
db = client.get_database("snapdev_db")