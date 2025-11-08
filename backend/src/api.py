"""
This file defines the FastAPI app for the API and all of its routes.
To run this API, use the FastAPI CLI
$ fastapi dev src/api.py
"""

import random
from typing import Dict

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import twitter_service

# The app which manages all of the API routes
app = FastAPI(
    title="2 Degrees API",
    description="API for finding mutual connections between Twitter users",
    version="1.0.0"
)

# Add CORS middleware to allow frontend to make requests
# In production, replace "*" with your frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (change in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "2 Degrees API", "status": "running"}


@app.get("/users/{username}")
async def get_user(username: str) -> Dict:
    """
    Get user information by Twitter username.
    
    Args:
        username: Twitter username (handle without @)
    
    Returns:
        User information including profile picture, bio, etc.
    """
    try:
        user = await twitter_service.get_user_by_username(username)
        if not user:
            raise HTTPException(status_code=404, detail=f"User '{username}' not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/mutuals")
async def get_mutuals(
    user1: str = Query(..., description="First Twitter username (without @)"),
    user2: str = Query(..., description="Second Twitter username (without @)")
) -> Dict:
    """
    Get mutual accounts that both users follow.
    
    Args:
        user1: First Twitter username
        user2: Second Twitter username
    
    Returns:
        Dictionary containing both users' info and list of mutual connections
    """
    try:
        # Get both users' info
        user1_data = await twitter_service.get_user_by_username(user1)
        user2_data = await twitter_service.get_user_by_username(user2)
        
        if not user1_data:
            raise HTTPException(status_code=404, detail=f"User '{user1}' not found")
        if not user2_data:
            raise HTTPException(status_code=404, detail=f"User '{user2}' not found")
        
        # Get mutual connections
        mutual_users = await twitter_service.get_mutual_following(user1, user2)
        
        return {
            "user1": {
                "id": user1_data["id"],
                "name": user1_data["name"],
                "username": user1_data["username"],
                "profile_image_url": user1_data.get("profile_image_url"),
                "description": user1_data.get("description", ""),
                "public_metrics": user1_data.get("public_metrics", {})
            },
            "user2": {
                "id": user2_data["id"],
                "name": user2_data["name"],
                "username": user2_data["username"],
                "profile_image_url": user2_data.get("profile_image_url"),
                "description": user2_data.get("description", ""),
                "public_metrics": user2_data.get("public_metrics", {})
            },
            "mutuals": [
                {
                    "id": user["id"],
                    "name": user["name"],
                    "username": user["username"],
                    "profile_image_url": user.get("profile_image_url"),
                    "description": user.get("description", ""),
                    "public_metrics": user.get("public_metrics", {})
                }
                for user in mutual_users
            ],
            "mutual_count": len(mutual_users)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Keep the example routes for testing
@app.get("/hello")
async def hello() -> dict[str, str]:
    """Get hello message."""
    return {"message": "Hello from FastAPI"}


@app.get("/random")
async def get_random_item(maximum: int) -> dict[str, int]:
    """Get an item with a random ID."""
    return {"itemId": random.randint(0, maximum)}
