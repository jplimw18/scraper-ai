import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is not found")

client = MongoClient(MONGO_URI)
db = client['scraper_ai_db']
data_collection = db['data_collected']
