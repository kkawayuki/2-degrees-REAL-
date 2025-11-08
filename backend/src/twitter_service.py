"""
Service module for interacting with Twitter API.
Handles authentication and fetching user data, followers, and mutuals.
"""
import os
from pathlib import Path
from typing import List, Dict, Optional
import httpx
from dotenv import load_dotenv

# Load environment variables from backend/.env
# Get the backend directory (parent of src/)
backend_dir = Path(__file__).parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

# Twitter API v2 base URL
TWITTER_API_BASE = "https://api.twitter.com/2"

# Get bearer token from environment
BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")

if not BEARER_TOKEN:
    raise ValueError("TWITTER_BEARER_TOKEN not found in environment variables")


async def get_user_by_username(username: str) -> Optional[Dict]:
    """
    Get user information by Twitter username (handle without @).
    
    Args:
        username: Twitter username (e.g., 'elonmusk')
    
    Returns:
        Dictionary with user data including id, name, username, profile_image_url, description
    """
    headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}
    params = {
        "user.fields": "id,name,username,profile_image_url,description,public_metrics"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TWITTER_API_BASE}/users/by/username/{username}",
            headers=headers,
            params=params,
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
        return data.get("data")


async def get_user_following_ids(user_id: str, max_results: int = 1000) -> List[str]:
    """
    Get list of user IDs that a user is following.
    
    Args:
        user_id: Twitter user ID
        max_results: Maximum number of results to return (default: 1000)
    
    Returns:
        List of user IDs that the user follows
    """
    headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}
    following_ids = []
    next_token = None
    
    async with httpx.AsyncClient() as client:
        while len(following_ids) < max_results:
            params = {"max_results": min(1000, max_results - len(following_ids))}
            if next_token:
                params["pagination_token"] = next_token
            
            response = await client.get(
                f"{TWITTER_API_BASE}/users/{user_id}/following",
                headers=headers,
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            
            if "data" in data:
                following_ids.extend([user["id"] for user in data["data"]])
            
            # Check for pagination
            if "meta" in data and "next_token" in data["meta"]:
                next_token = data["meta"]["next_token"]
            else:
                break
    
    return following_ids


async def get_users_by_ids(user_ids: List[str]) -> List[Dict]:
    """
    Get user information for multiple user IDs.
    
    Args:
        user_ids: List of Twitter user IDs
    
    Returns:
        List of user dictionaries with id, name, username, profile_image_url, description
    """
    if not user_ids:
        return []
    
    headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}
    # Twitter API allows up to 100 IDs per request
    all_users = []
    
    async with httpx.AsyncClient() as client:
        for i in range(0, len(user_ids), 100):
            batch = user_ids[i:i+100]
            params = {
                "ids": ",".join(batch),
                "user.fields": "id,name,username,profile_image_url,description,public_metrics"
            }
            
            response = await client.get(
                f"{TWITTER_API_BASE}/users",
                headers=headers,
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            
            if "data" in data:
                all_users.extend(data["data"])
    
    return all_users


async def get_mutual_following(username1: str, username2: str) -> List[Dict]:
    """
    Get mutual accounts that both users follow.
    
    Args:
        username1: First Twitter username
        username2: Second Twitter username
    
    Returns:
        List of mutual user dictionaries with full profile information
    """
    # Get user IDs
    user1 = await get_user_by_username(username1)
    user2 = await get_user_by_username(username2)
    
    if not user1:
        raise ValueError(f"User '{username1}' not found")
    if not user2:
        raise ValueError(f"User '{username2}' not found")
    
    user1_id = user1["id"]
    user2_id = user2["id"]
    
    # Get following lists
    following1 = await get_user_following_ids(user1_id)
    following2 = await get_user_following_ids(user2_id)
    
    # Find mutuals (accounts both users follow)
    mutual_ids = list(set(following1) & set(following2))
    
    # Get full user info for mutuals
    mutual_users = await get_users_by_ids(mutual_ids)
    
    return mutual_users

