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
import random
import string

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
    nickname: str
    email: EmailStr
    magic_word: str
    tokens_remaining: int = 3
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

class UserCreate(BaseModel):
    nickname: str
    email: EmailStr

class UserLogin(BaseModel):
    nickname: str
    magic_word: str

class Submission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_nickname: str
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
    user_nickname: str
    type: InteractionType
    content: Optional[str] = None  # For comments
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InteractionCreate(BaseModel):
    type: InteractionType
    content: Optional[str] = None

class SubmissionUpdate(BaseModel):
    status: SubmissionStatus

# Helper functions
def generate_magic_word():
    """Generate a unique magic word from bbbooorrriiinnnggg"""
    letters = ['b','b','b','o','o','o','r','r','r','i','i','i','n','n','n','g','g','g']
    random.shuffle(letters)
    return ''.join(letters)

async def ensure_unique_magic_word():
    """Ensure the generated magic word is unique in database"""
    max_attempts = 100
    for _ in range(max_attempts):
        magic_word = generate_magic_word()
        existing = await db.users.find_one({"magic_word": magic_word})
        if not existing:
            return magic_word
    
    # If we can't find unique word in 100 attempts, add random suffix
    base_word = generate_magic_word()
    suffix = ''.join(random.choices(string.ascii_lowercase, k=3))
    return base_word + suffix

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

# Auth helper (strict admin check)
async def verify_owner_admin(user_id: str):
    """Verify that user is the site owner"""
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only allow gandi.pacific@gmail.com as admin
    if user_data.get("email") != "gandi.pacific@gmail.com" or not user_data.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Access restricted to site owner only")
    
    return User(**parse_from_mongo(user_data))

async def get_current_user(user_id: str):
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**parse_from_mongo(user_data))

# Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to Boooring - where ordinary is extraordinary!"}

# User routes
@api_router.post("/register", response_model=dict)
async def register_user(user: UserCreate):
    # Check if nickname already exists
    existing_nickname = await db.users.find_one({"nickname": user.nickname})
    if existing_nickname:
        raise HTTPException(status_code=400, detail="nickname already taken")
    
    # Check if email already exists
    existing_email = await db.users.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="email already registered")
    
    # Generate unique magic word
    magic_word = await ensure_unique_magic_word()
    
    # Create user
    user_dict = user.dict()
    user_dict["magic_word"] = magic_word
    user_obj = User(**user_dict)
    user_data = prepare_for_mongo(user_obj.dict())
    await db.users.insert_one(user_data)
    
    return {
        "message": "registration successful",
        "magic_word": magic_word,
        "user_id": user_obj.id
    }

@api_router.post("/login", response_model=User)
async def login_user(login: UserLogin):
    # Find user by nickname and magic_word
    user_data = await db.users.find_one({
        "nickname": login.nickname,
        "magic_word": login.magic_word
    })
    
    if not user_data:
        raise HTTPException(status_code=401, detail="invalid nickname or magic word")
    
    # Update last login
    await db.users.update_one(
        {"id": user_data["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    return User(**parse_from_mongo(user_data))

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**parse_from_mongo(user_data))

# Keep this for backward compatibility if needed
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
    submission_dict["user_nickname"] = user_obj.nickname
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
    
    # Handle legacy data
    for submission in submissions:
        if "user_nickname" not in submission and "user_name" in submission:
            submission["user_nickname"] = submission["user_name"]
        elif "user_nickname" not in submission:
            # Get nickname from user data
            user_data = await db.users.find_one({"id": submission["user_id"]})
            if user_data:
                submission["user_nickname"] = user_data.get("nickname", user_data.get("name", "unknown"))
            else:
                submission["user_nickname"] = "unknown"
    
    return [Submission(**parse_from_mongo(sub)) for sub in submissions]

@api_router.put("/submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, update: SubmissionUpdate, admin_user_id: str):
    # Strict owner-only check
    await verify_owner_admin(admin_user_id)
    
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
        # Handle legacy data that might not have user_nickname
        if "user_nickname" not in winner and "user_name" in winner:
            winner["user_nickname"] = winner["user_name"]
        elif "user_nickname" not in winner:
            # Get nickname from user data
            user_data = await db.users.find_one({"id": winner["user_id"]})
            if user_data:
                winner["user_nickname"] = user_data.get("nickname", user_data.get("name", "unknown"))
            else:
                winner["user_nickname"] = "unknown"
        
        return Submission(**parse_from_mongo(winner))
    return None

@api_router.post("/run-lottery")
async def run_daily_lottery(admin_user_id: str):
    # Strict owner-only check
    await verify_owner_admin(admin_user_id)
    
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
    interaction_dict["user_nickname"] = user_obj.nickname
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
    
    # Handle legacy data
    for interaction in interactions:
        if "user_nickname" not in interaction and "user_name" in interaction:
            interaction["user_nickname"] = interaction["user_name"]
        elif "user_nickname" not in interaction:
            # Get nickname from user data
            user_data = await db.users.find_one({"id": interaction["user_id"]})
            if user_data:
                interaction["user_nickname"] = user_data.get("nickname", user_data.get("name", "unknown"))
            else:
                interaction["user_nickname"] = "unknown"
    
    return [Interaction(**parse_from_mongo(interaction)) for interaction in interactions]

# Admin routes
@api_router.post("/admin/secure-admin-access")
async def secure_admin_access():
    """One-time security cleanup - remove admin rights from all except owner"""
    
    # Remove admin rights from everyone except gandi.pacific@gmail.com
    await db.users.update_many(
        {"email": {"$ne": "gandi.pacific@gmail.com"}},
        {"$set": {"is_admin": False}}
    )
    
    # Ensure owner has admin rights
    await db.users.update_one(
        {"email": "gandi.pacific@gmail.com"},
        {"$set": {"is_admin": True}}
    )
    
    return {"message": "Admin access secured - only site owner has admin rights"}
async def create_owner():
    """One-time endpoint to create the owner account"""
    
    # Check if owner already exists
    existing_owner = await db.users.find_one({"email": "gandi.pacific@gmail.com"})
    if existing_owner:
        # Update magic word
        await db.users.update_one(
            {"email": "gandi.pacific@gmail.com"},
            {"$set": {"magic_word": "igorrononnghbrgbii", "nickname": "gandi", "is_admin": True}}
        )
        return {"message": "Updated owner account with magic word: igorrononnghbrgbii"}
    
    # Create owner account
    owner_data = {
        "id": str(uuid.uuid4()),
        "nickname": "gandi",
        "email": "gandi.pacific@gmail.com", 
        "magic_word": "igorrononnghbrgbii",
        "tokens_remaining": 999,  # Give owner lots of tokens
        "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(owner_data)
    return {"message": "Created owner account - nickname: gandi, magic_word: igorrononnghbrgbii"}

# Admin routes - RESTRICTED ACCESS
@api_router.post("/admin/make-admin")
async def make_admin(user_id: str):
    """BLOCKED - Only owner has admin access"""
    raise HTTPException(status_code=403, detail="admin access is restricted to site owner only")

@api_router.get("/admin/export-emails")
async def export_emails(admin_user_id: str):
    """Export all user emails - OWNER ONLY"""
    # Strict owner-only check
    await verify_owner_admin(admin_user_id)
    
    users = await db.users.find({}, {"email": 1, "nickname": 1, "created_at": 1}).to_list(1000)
    
    email_list = []
    for user in users:
        email_list.append({
            "email": user["email"],
            "nickname": user["nickname"], 
            "registered": user.get("created_at", "unknown")
        })
    
    return {
        "total_users": len(email_list),
        "emails": email_list
    }
async def get_admin_stats(admin_user_id: str):
    # Strict owner-only check
    await verify_owner_admin(admin_user_id)
    
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