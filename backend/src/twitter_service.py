"""
Service module for interacting with Twitter API.
Handles authentication and fetching user data, followers, and mutuals.
Includes caching for demo purposes and rate limit handling.
"""
import os
import asyncio
import json
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import httpx
from dotenv import load_dotenv

# Load environment variables from backend/.env
backend_dir = Path(__file__).parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

TWITTER_API_BASE = "https://api.twitter.com/2"
BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")

if not BEARER_TOKEN:
    raise ValueError("TWITTER_BEARER_TOKEN not found in environment variables")

# Cache directory for demo data
CACHE_DIR = backend_dir / "cache"
CACHE_DIR.mkdir(exist_ok=True)
CACHE_DURATION = timedelta(hours=24)  # Cache for 24 hours for demo purposes


class TwitterAPIError(Exception):
    """Custom exception for Twitter API errors."""
    pass


class RateLimitError(TwitterAPIError):
    """Raised when rate limit is exceeded."""
    def __init__(self, message: str, retry_after: Optional[int] = None):
        super().__init__(message)
        self.retry_after = retry_after


def _get_cache_path(key: str) -> Path:
    """Get cache file path for a given key."""
    return CACHE_DIR / f"{key}.json"


def _load_from_cache(key: str) -> Optional[Dict]:
    """Load data from cache if it exists and is still valid."""
    cache_path = _get_cache_path(key)
    if not cache_path.exists():
        return None
    
    try:
        with open(cache_path, 'r') as f:
            cached_data = json.load(f)
            cached_time = datetime.fromisoformat(cached_data.get("cached_at", "2000-01-01"))
            
            if datetime.now() - cached_time < CACHE_DURATION:
                return cached_data.get("data")
            else:
                # Cache expired, delete file
                cache_path.unlink()
                return None
    except (json.JSONDecodeError, KeyError, ValueError):
        # Invalid cache file, delete it
        cache_path.unlink()
        return None


def _save_to_cache(key: str, data: Dict) -> None:
    """Save data to cache."""
    cache_path = _get_cache_path(key)
    cache_data = {
        "cached_at": datetime.now().isoformat(),
        "data": data
    }
    with open(cache_path, 'w') as f:
        json.dump(cache_data, f, indent=2)


async def _make_request(
    client: httpx.AsyncClient,
    url: str,
    headers: Dict,
    params: Dict,
    max_retries: int = 3
) -> httpx.Response:
    """
    Make a request with retry logic for rate limits.
    
    Args:
        client: HTTP client
        url: Request URL
        headers: Request headers
        params: Request parameters
        max_retries: Maximum number of retries
    
    Returns:
        HTTP response
    """
    for attempt in range(max_retries):
        response = await client.get(url, headers=headers, params=params, timeout=30.0)
        
        if response.status_code == 429:
            # Rate limit exceeded
            retry_after = int(response.headers.get("x-rate-limit-reset", 900))
            wait_time = min(2 ** attempt, 60)  # Exponential backoff, max 60 seconds
            
            if attempt < max_retries - 1:
                await asyncio.sleep(wait_time)
                continue
            else:
                raise RateLimitError(
                    f"Rate limit exceeded. Twitter API free tier allows only 15 requests per 15 minutes for following lists. "
                    f"Please wait {retry_after} seconds before trying again.",
                    retry_after=retry_after
                )
        
        response.raise_for_status()
        return response
    
    raise TwitterAPIError("Failed to make request after retries")


async def get_user_by_username(username: str, use_cache: bool = True) -> Optional[Dict]:
    """
    Get user information by Twitter username (handle without @).
    
    Args:
        username: Twitter username (e.g., 'elonmusk')
        use_cache: Whether to use cached data if available
    
    Returns:
        Dictionary with user data including id, name, username, profile_image_url, description
    """
    cache_key = f"user_{username.lower()}"
    
    # Try to load from cache first
    if use_cache:
        cached_user = _load_from_cache(cache_key)
        if cached_user:
            return cached_user
    
    headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}
    params = {
        "user.fields": "id,name,username,profile_image_url,description,public_metrics"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await _make_request(
                client,
                f"{TWITTER_API_BASE}/users/by/username/{username}",
                headers,
                params
            )
            data = response.json()
            user_data = data.get("data")
            
            # Save to cache
            if user_data and use_cache:
                _save_to_cache(cache_key, user_data)
            
            return user_data
        except RateLimitError as e:
            # If rate limited, try to return cached data even if expired
            cached_user = _load_from_cache(cache_key)
            if cached_user:
                return cached_user
            raise
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            raise TwitterAPIError(f"Twitter API error: {e.response.status_code} - {e.response.text}")


async def get_user_following_ids(
    user_id: str,
    max_results: int = 500,  # Reduced default to avoid hitting rate limits
    use_cache: bool = True
) -> List[str]:
    """
    Get list of user IDs that a user is following.
    
    LIMITED to 500 results by default to avoid rate limits.
    Twitter API free tier only allows 15 requests per 15 minutes for this endpoint.
    
    Args:
        user_id: Twitter user ID
        max_results: Maximum number of results to return (default: 500)
        use_cache: Whether to use cached data if available
    """
    cache_key = f"following_{user_id}_{max_results}"
    
    # Try to load from cache first
    if use_cache:
        cached_following = _load_from_cache(cache_key)
        if cached_following:
            return cached_following
    
    headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}
    following_ids = []
    next_token = None
    request_count = 0
    max_requests = 5  # Limit to 5 requests max (5 * 1000 = 5000 users, but we'll stop at max_results)
    
    async with httpx.AsyncClient() as client:
        while len(following_ids) < max_results and request_count < max_requests:
            params = {"max_results": min(1000, max_results - len(following_ids))}
            if next_token:
                params["pagination_token"] = next_token
            
            try:
                response = await _make_request(
                    client,
                    f"{TWITTER_API_BASE}/users/{user_id}/following",
                    headers,
                    params
                )
                data = response.json()
                request_count += 1
                
                if "data" in data:
                    following_ids.extend([user["id"] for user in data["data"]])
                
                if "meta" in data and "next_token" in data["meta"]:
                    next_token = data["meta"]["next_token"]
                else:
                    break
                    
            except RateLimitError as e:
                # If rate limited, try to return cached data even if expired
                cached_following = _load_from_cache(cache_key)
                if cached_following:
                    return cached_following
                raise RateLimitError(
                    f"Rate limit hit while fetching following list. "
                    f"Twitter API free tier is very limited (15 requests per 15 minutes). "
                    f"Try again later or use users with fewer following counts."
                )
    
    # Save to cache
    if use_cache and following_ids:
        _save_to_cache(cache_key, following_ids)
    
    return following_ids


async def get_users_by_ids(user_ids: List[str], use_cache: bool = True) -> List[Dict]:
    """
    Get user information for multiple user IDs.
    
    Args:
        user_ids: List of Twitter user IDs
        use_cache: Whether to use cached data if available
    """
    if not user_ids:
        return []
    
    # Create cache key from sorted user IDs
    cache_key = f"users_{'_'.join(sorted(user_ids[:10]))}"  # Use first 10 IDs for key
    
    # Try to load from cache first
    if use_cache:
        cached_users = _load_from_cache(cache_key)
        if cached_users:
            # Verify we have all requested users
            cached_ids = {user["id"] for user in cached_users}
            if all(uid in cached_ids for uid in user_ids):
                return cached_users
    
    headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}
    all_users = []
    
    async with httpx.AsyncClient() as client:
        for i in range(0, len(user_ids), 100):
            batch = user_ids[i:i+100]
            params = {
                "ids": ",".join(batch),
                "user.fields": "id,name,username,profile_image_url,description,public_metrics"
            }
            
            try:
                response = await _make_request(
                    client,
                    f"{TWITTER_API_BASE}/users",
                    headers,
                    params
                )
                data = response.json()
                
                if "data" in data:
                    all_users.extend(data["data"])
            except RateLimitError as e:
                # If we hit rate limit here, return what we have (or cached data)
                cached_users = _load_from_cache(cache_key)
                if cached_users:
                    return cached_users
                break
    
    # Save to cache
    if use_cache and all_users:
        _save_to_cache(cache_key, all_users)
    
    return all_users


async def get_mutual_following(
    username1: str,
    username2: str,
    use_cache: bool = True
) -> List[Dict]:
    """
    Get mutual accounts that both users follow.
    
    Args:
        username1: First Twitter username
        username2: Second Twitter username
        use_cache: Whether to use cached data if available
    """
    cache_key = f"mutuals_{username1.lower()}_{username2.lower()}"
    
    # Try to load from cache first
    if use_cache:
        cached_mutuals = _load_from_cache(cache_key)
        if cached_mutuals:
            return cached_mutuals
    
    # Get user IDs
    user1 = await get_user_by_username(username1, use_cache=use_cache)
    user2 = await get_user_by_username(username2, use_cache=use_cache)
    
    if not user1:
        raise ValueError(f"User '{username1}' not found")
    if not user2:
        raise ValueError(f"User '{username2}' not found")
    
    user1_id = user1["id"]
    user2_id = user2["id"]
    
    # Get following lists (limited to reduce API calls)
    following1 = await get_user_following_ids(user1_id, max_results=500, use_cache=use_cache)
    following2 = await get_user_following_ids(user2_id, max_results=500, use_cache=use_cache)
    
    # Find mutuals (accounts both users follow)
    mutual_ids = list(set(following1) & set(following2))
    
    # Get full user info for mutuals
    mutual_users = await get_users_by_ids(mutual_ids, use_cache=use_cache)
    
    # Save to cache
    if use_cache and mutual_users:
        _save_to_cache(cache_key, mutual_users)
    
    return mutual_users
