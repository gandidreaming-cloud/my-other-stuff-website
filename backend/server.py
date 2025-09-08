from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, time
from enum import Enum
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class SubmissionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class InteractionType(str, Enum):
    LIKE = "like"
    COMMENT = "comment"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password: str
    boring_answer: str
    tokens_remaining: int = 3
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    boring_answer: str

class Submission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    text_content: str
    instagram_link: Optional[str] = None
    tiktok_link: Optional[str] = None
    status: SubmissionStatus = SubmissionStatus.PENDING
    is_winner: bool = False
    winner_date: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @validator('text_content')
    def validate_text_length(cls, v):
        if len(v) > 1000:
            raise ValueError('Text content must be 1000 characters or less')
        return v

class SubmissionCreate(BaseModel):
    text_content: str
    instagram_link: Optional[str] = None
    tiktok_link: Optional[str] = None

    @validator('text_content')
    def validate_text_length(cls, v):
        if len(v) > 1000:
            raise ValueError('Text content must be 1000 characters or less')
        return v

class Interaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    submission_id: str
    user_id: str
    user_name: str
    type: InteractionType
    content: Optional[str] = None  # For comments
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InteractionCreate(BaseModel):
    type: InteractionType
    content: Optional[str] = None

class SubmissionUpdate(BaseModel):
    status: SubmissionStatus

# Helper functions
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    # Keep winner_date as string - don't convert to datetime
    return item

# Auth helper (simple check for admin)
async def get_current_user(user_id: str):
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**parse_from_mongo(user_data))

# Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to Boring - where ordinary is extraordinary!"}

# User routes
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_obj = User(**user_dict)
    user_data = prepare_for_mongo(user_obj.dict())
    await db.users.insert_one(user_data)
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**parse_from_mongo(user_data))

@api_router.get("/users/email/{email}", response_model=User)
async def get_user_by_email(email: str):
    user_data = await db.users.find_one({"email": email})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**parse_from_mongo(user_data))

# Submission routes
@api_router.post("/submissions")
async def create_submission(submission: SubmissionCreate, user_id: str):
    # Get user and check tokens
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_obj = User(**parse_from_mongo(user_data))
    if user_obj.tokens_remaining <= 0:
        raise HTTPException(status_code=400, detail="No tokens remaining")
    
    # Create submission
    submission_dict = submission.dict()
    submission_dict["user_id"] = user_id
    submission_dict["user_name"] = user_obj.name
    submission_obj = Submission(**submission_dict)
    
    # Save submission and decrease token
    submission_data = prepare_for_mongo(submission_obj.dict())
    await db.submissions.insert_one(submission_data)
    
    # Decrease user tokens
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"tokens_remaining": -1}}
    )
    
    return {"message": "Submission created successfully", "submission_id": submission_obj.id}

@api_router.get("/submissions/pending", response_model=List[Submission])
async def get_pending_submissions():
    submissions = await db.submissions.find({"status": "pending"}).sort("created_at", 1).to_list(1000)
    return [Submission(**parse_from_mongo(sub)) for sub in submissions]

@api_router.put("/submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, update: SubmissionUpdate, admin_user_id: str):
    # Check if user is admin
    admin_data = await db.users.find_one({"id": admin_user_id})
    if not admin_data or not admin_data.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.submissions.update_one(
        {"id": submission_id},
        {"$set": {"status": update.status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    return {"message": "Submission status updated"}

@api_router.get("/today-winner", response_model=Optional[Submission])
async def get_today_winner():
    today = datetime.now(timezone.utc).date().isoformat()
    winner = await db.submissions.find_one({"is_winner": True, "winner_date": today})
    if winner:
        return Submission(**parse_from_mongo(winner))
    return None

@api_router.post("/run-lottery")
async def run_daily_lottery(admin_user_id: str):
    # Check if user is admin
    admin_data = await db.users.find_one({"id": admin_user_id})
    if not admin_data or not admin_data.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Check if today's winner already exists
    existing_winner = await db.submissions.find_one({"is_winner": True, "winner_date": today})
    if existing_winner:
        return {"message": "Today's winner already selected", "winner_id": existing_winner["id"]}
    
    # Get all approved submissions that haven't won yet
    approved_submissions = await db.submissions.find({
        "status": "approved",
        "is_winner": False
    }).to_list(1000)
    
    if not approved_submissions:
        return {"message": "No approved submissions available for lottery"}
    
    # Select random winner
    import random
    winner = random.choice(approved_submissions)
    
    # Update winner
    await db.submissions.update_one(
        {"id": winner["id"]},
        {"$set": {"is_winner": True, "winner_date": today}}
    )
    
    return {"message": "Winner selected!", "winner_id": winner["id"]}

# Interaction routes
@api_router.post("/submissions/{submission_id}/interactions")
async def create_interaction(submission_id: str, interaction: InteractionCreate, user_id: str):
    # Get user
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_obj = User(**parse_from_mongo(user_data))
    
    # Check if submission exists
    submission_data = await db.submissions.find_one({"id": submission_id})
    if not submission_data:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # For likes, check if user already liked
    if interaction.type == InteractionType.LIKE:
        existing_like = await db.interactions.find_one({
            "submission_id": submission_id,
            "user_id": user_id,
            "type": "like"
        })
        if existing_like:
            # Remove like
            await db.interactions.delete_one({"id": existing_like["id"]})
            await db.submissions.update_one(
                {"id": submission_id},
                {"$inc": {"likes_count": -1}}
            )
            return {"message": "Like removed"}
    
    # Create interaction
    interaction_dict = interaction.dict()
    interaction_dict["submission_id"] = submission_id
    interaction_dict["user_id"] = user_id
    interaction_dict["user_name"] = user_obj.name
    interaction_obj = Interaction(**interaction_dict)
    
    interaction_data = prepare_for_mongo(interaction_obj.dict())
    await db.interactions.insert_one(interaction_data)
    
    # Update counts
    if interaction.type == InteractionType.LIKE:
        await db.submissions.update_one(
            {"id": submission_id},
            {"$inc": {"likes_count": 1}}
        )
    elif interaction.type == InteractionType.COMMENT:
        await db.submissions.update_one(
            {"id": submission_id},
            {"$inc": {"comments_count": 1}}
        )
    
    return {"message": f"{interaction.type.value} added successfully"}

@api_router.get("/submissions/{submission_id}/interactions", response_model=List[Interaction])
async def get_interactions(submission_id: str):
    interactions = await db.interactions.find({"submission_id": submission_id}).sort("created_at", 1).to_list(1000)
    return [Interaction(**parse_from_mongo(interaction)) for interaction in interactions]

# Admin routes
@api_router.post("/admin/make-admin")
async def make_admin(user_id: str):
    """Temporary endpoint to make a user admin - remove in production"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_admin": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User made admin"}

@api_router.get("/admin/stats")
async def get_admin_stats(admin_user_id: str):
    # Check if user is admin
    admin_data = await db.users.find_one({"id": admin_user_id})
    if not admin_data or not admin_data.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_submissions = await db.submissions.count_documents({})
    pending_submissions = await db.submissions.count_documents({"status": "pending"})
    approved_submissions = await db.submissions.count_documents({"status": "approved"})
    
    return {
        "total_users": total_users,
        "total_submissions": total_submissions,
        "pending_submissions": pending_submissions,
        "approved_submissions": approved_submissions
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()