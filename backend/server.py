from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime
from emailjs_service import emailjs_service, EmailJSError


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


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactForm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ContactFormCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/contact", response_model=ContactForm)
async def create_contact_form(input: ContactFormCreate, background_tasks: BackgroundTasks):
    contact_dict = input.dict()
    contact_obj = ContactForm(**contact_dict)
    
    try:
        # Store in database first
        _ = await db.contact_forms.insert_one(contact_obj.dict())
        logger.info(f"✅ Contact form stored in database from {contact_obj.email}")
        
        # Send email via EmailJS in background
        if emailjs_service.is_configured():
            background_tasks.add_task(
                send_contact_email_async,
                contact_obj.name,
                contact_obj.email,
                contact_obj.subject,
                contact_obj.message,
                contact_obj.phone
            )
            logger.info(f"📧 Email task queued for {contact_obj.email}")
        else:
            logger.warning("📧 EmailJS not configured - emails disabled")
        
        return contact_obj
        
    except Exception as e:
        logger.error(f"❌ Error saving contact form: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing contact form")

async def send_contact_email_async(name: str, email: str, subject: str, message: str, phone: Optional[str] = None):
    """Background task to send contact email via EmailJS"""
    try:
        result = await emailjs_service.send_contact_email(
            name=name,
            email=email, 
            subject=subject,
            message=message,
            phone=phone
        )
        logger.info(f"📧 Email sent successfully: {result}")
    except EmailJSError as e:
        logger.error(f"📧 EmailJS error: {str(e)}")
    except Exception as e:
        logger.error(f"📧 Unexpected email error: {str(e)}")

@api_router.get("/contact", response_model=List[ContactForm])
async def get_contact_forms():
    contact_forms = await db.contact_forms.find().to_list(1000)
    return [ContactForm(**contact_form) for contact_form in contact_forms]

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
