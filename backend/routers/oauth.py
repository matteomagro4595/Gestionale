"""
OAuth authentication routes for Google Sign-In
"""
import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from database import get_db
from models.user import User
from auth import create_access_token
from datetime import timedelta
import secrets

router = APIRouter()

# Configure OAuth
oauth = OAuth()

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/google/callback")

if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )

@router.get('/google/login')
async def google_login(request: Request):
    """
    Initiate Google OAuth login flow
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
        )

    redirect_uri = GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get('/google/callback')
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback and create/login user
    """
    try:
        # Get access token from Google
        token = await oauth.google.authorize_access_token(request)

        # Get user info from Google
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")

        email = user_info.get('email')
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Create new user
            # Extract first and last name from Google
            given_name = user_info.get('given_name', '')
            family_name = user_info.get('family_name', '')

            # If no name provided, use email username
            if not given_name:
                given_name = email.split('@')[0]

            user = User(
                email=email,
                nome=given_name,
                cognome=family_name or 'User',
                hashed_password=secrets.token_urlsafe(32)  # Random password for OAuth users
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Generate JWT token
        access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)))
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        # Redirect to frontend with token
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        redirect_url = f"{frontend_url}/auth/google/success?token={access_token}"

        return RedirectResponse(url=redirect_url)

    except Exception as e:
        # Redirect to frontend with error
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        error_message = str(e)
        redirect_url = f"{frontend_url}/auth/google/error?message={error_message}"
        return RedirectResponse(url=redirect_url)

@router.get('/google/status')
async def google_oauth_status():
    """
    Check if Google OAuth is configured
    """
    return {
        "configured": bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET),
        "redirect_uri": GOOGLE_REDIRECT_URI
    }
