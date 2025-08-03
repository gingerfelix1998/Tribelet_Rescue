# --- Required packages ---
from email_utils import send_order_confirmation_email, save_order_to_s3

# Environment variables:
from dotenv import load_dotenv
load_dotenv()

# Global packages:
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import uuid
import base64
import io

# AWS S3 Utilities:
from aws_s3 import (
    save_prompt_to_s3, 
    save_user_to_s3, 
    validate_user_login, 
    save_team_to_s3, 
    get_user_by_credentials, 
    get_teams_by_email, 
    upload_logo_from_base64,
    check_team_name_in_s3
)

# Open AI Utilities:
from openai_utils import (
    generate_summary,
    generate_team_name,
    generate_single_team_name,
    generate_short_summary,
    generate_logo_image
)

# App & Handler for Zappa AWS deployment:
app = FastAPI()

# Allow frontend origin (adjust port or domain if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Python Classes ---

# User prompt:
class Prompt(BaseModel):
    prompt: str

# Logo request:
class LogoRequest(BaseModel):
    prompt: str
    team_name: str
    count: int = 3  # Default to 3 logos

# Team data:
class TeamData(BaseModel):
    team_name: str
    summary: str
    logo_url: str
    username: str
    email: str
    password: str
    team_id: str = str(uuid.uuid4()) # Auto-generates an ID

# Authentication Request:
class AuthRequest(BaseModel):
    username: str | None = None
    email: str
    password: str


# Email class:
class KitOrderRequest(BaseModel):
    # Customer info
    customer_email: str
    customer_name: str
    
    # Design details
    kit_type: str
    teamwear_color: str
    emblem_color: str
    team_name: str
    design_name: str
    
    # Customization details
    front_image: bool
    back_image: bool
    back_print_enabled: bool
    back_print_text: str = ""
    back_print_position: int = 50
    
    # Order details
    quantities: dict  # {"XS": 2, "S": 3, etc.}
    subtotal: float
    tax: float
    total: float
    order_id: str

# --- API FUNCTIONS ---

# --- Team Functions ---

# Confirmation message that the backend is running:
@app.get("/api/")
async def read_root():
    return {"message": "Tribelet backend is live!"}

# Endpoint to generate the team name options:
@app.post("/api/generate-names")
def generate_names(data: Prompt):
    """
    A function to generate multiple potential team names based on the user's input text.

    Args:
    - prompt (str): A prompt inputted by the user in the website.

    Returns:
    - team_names (json): A JSON file containing the team names returned by Open AI.
    """

    # Save to AWS:
    save_prompt_to_s3(data.prompt)

    # Generate the single name:
    single_name = generate_single_team_name(data.prompt)

    # Generate multiple team name options:
    team_names = generate_team_name(team_name=single_name, prompt=data.prompt)

    # Return OpenAI outputs:
    return {"team_names": team_names}

# Endpoint to generate the team summary:
@app.post("/api/generate-summary")
def generate_summary_route(data: Prompt):
    """
    A function to generate the team summary (business pitch) based on the input prompt.

    Args:
    - prompt (str): A prompt inputted by the user in the website.

    Returns:
    - summary (json): A JSON file with the team pitch/summary.
    """
    # Generate summary from Open AI:
    summary = generate_summary(data.prompt)

    # Return summary:
    return {"summary": summary}

# Endpoint to generate multiple team logos with GPT-4o:
@app.post("/api/generate-logo")
async def generate_logo(request: Request):
    """
    Generates multiple logo options for team logos using GPT-4o.
    Expects JSON body: { "prompt": "...", "team_name": "...", "count": 3 }
    Returns: { "summary": ..., "logo_images": [...] }
    """
    from fastapi import Request
    from fastapi.responses import JSONResponse
    
    data = await request.json()
    prompt = data.get("prompt")
    team_name = data.get("team_name")
    count = data.get("count", 3)  # Default to 3 logos

    if not prompt or not team_name:
        return JSONResponse(
            status_code=400,
            content={"error": "Both 'prompt' and 'team_name' are required."}
        )

    # Validate count parameter
    if not isinstance(count, int) or count < 1 or count > 5:
        count = 3  # Default fallback

    try:
        short_summary = generate_short_summary(prompt)
        logo_images = generate_logo_image(prompt=short_summary, team_name=team_name, count=count)
        
        return {
            "summary": short_summary,
            "logo_images": logo_images,
            "count": len(logo_images)  # Return actual count generated
        }
        
    except Exception as e:
        print(f"Logo generation error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Logo generation failed: {str(e)}"}
        )

# Updated save-team endpoint
@app.post("/api/save-team")
async def save_team(request: Request):
    """
    Save team and create user account if needed.
    Handles both new user creation and team saving in one step.
    """
    try:
        data = await request.json()
        
        # Log the incoming data for debugging
        print(f"Received save-team request: {data}")
        
        # Extract required fields
        team_name = data.get("team_name")
        summary = data.get("summary", "")
        logo_url = data.get("logo_url")  # This will be base64 data
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        
        # Validate required fields
        if not all([team_name, username, email, password]):
            raise HTTPException(
                status_code=400, 
                detail="Missing required fields: team_name, username, email, password"
            )
        
        # Check if user already exists, if not create them
        existing_user = get_user_by_credentials(email, password)
        if not existing_user:
            # Create new user
            user_data = {
                "username": username,
                "email": email,
                "password": password
            }
            save_user_to_s3(user_data)
            print(f"Created new user: {username}")
        else:
            print(f"Using existing user: {existing_user['username']}")
        
        # Generate team ID
        team_id = str(uuid.uuid4())
        
        # Handle logo: convert base64 to S3 URL
        s3_logo_url = ""
        if logo_url:
            try:
                # Save base64 logo directly to S3
                s3_logo_url = upload_logo_from_base64(logo_url, team_id)
                print(f"Uploaded logo to S3: {s3_logo_url}")
            except Exception as logo_error:
                print(f"Logo upload failed: {logo_error}")
                # Continue without logo rather than failing completely
                s3_logo_url = ""
        
        # Prepare team data
        team_dict = {
            "team_name": team_name,
            "summary": summary,
            "logo_url": s3_logo_url,
            "email": email,
            "team_id": team_id,
            "team_lead": username
        }
        
        # Save team to S3
        save_team_to_s3(team_dict)
        print(f"Saved team: {team_name}")
        
        return {
            "message": "Team and user saved successfully",
            "team_id": team_id,
            "username": username
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Unexpected error in save_team: {str(e)}")
        print(f"Error type: {type(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

# Endpoint to load existing teams:
@app.get("/api/teams/by-user")
def get_teams_by_user(email: str = Query(...)):
    return {"teams": get_teams_by_email(email)}

# Function to check whether a team name exists:
@app.get("/api/check-team-name")
def check_team_name(name: str = Query(...)):
    exists = check_team_name_in_s3(name)
    return {"exists": exists}

# --- User Functions ---

# Endpoint to create account:
@app.post("/api/create-account")
def create_account(data: AuthRequest):
    if not data.username:
        raise HTTPException(status_code=400, detail="Username is required for account creation")
    
    save_user_to_s3(data.dict())
    return {"message": "Account created", "username": data.username}

# Endpoint for login:
@app.post("/api/login")
def login(data: AuthRequest):
    username = validate_user_login(data.email, data.password)
    if username:
        return {"message": "Login successful", "username": username}
    raise HTTPException(status_code=401, detail="Invalid email or password")

# --- Email Logic ---

# Add this endpoint to your API FUNCTIONS section:
@app.post("/api/send-order-confirmation")
async def send_order_confirmation(order_data: KitOrderRequest):
    """Send order confirmation email and save order to S3"""
    try:
        # Convert Pydantic model to dict
        order_dict = order_data.dict()
        
        # Save order to S3 for record keeping
        save_order_to_s3(order_dict)
        
        # Send confirmation email
        email_sent = send_order_confirmation_email(order_dict)
        
        if email_sent:
            return {
                "message": "Order confirmation sent successfully",
                "order_id": order_data.order_id,
                "email_sent": True
            }
        else:
            return {
                "message": "Order saved but email failed to send",
                "order_id": order_data.order_id,
                "email_sent": False
            }
            
    except Exception as e:
        print(f"Error processing order: {str(e)}")
        # Still try to save the order even if email fails
        try:
            save_order_to_s3(order_data.dict())
        except:
            pass
        
        return {
            "message": "Order received but confirmation failed",
            "order_id": order_data.order_id,
            "email_sent": False,
            "error": str(e)
        }

