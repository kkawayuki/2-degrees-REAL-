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
from twitter_service import TwitterAPIError, RateLimitError

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
    except RateLimitError as e:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": str(e),
                "retry_after": e.retry_after if hasattr(e, 'retry_after') else None,
                "help": "Twitter API rate limit reached. Please wait before trying again."
            }
        )
    except TwitterAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))
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
            "mutual_count": len(mutual_users),
            "note": "Results are limited to first 500 following per user due to API rate limits. Data is cached for 24 hours."
        }
    except RateLimitError as e:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": str(e),
                "retry_after": e.retry_after if hasattr(e, 'retry_after') else None,
                "help": "Twitter API free tier allows only 15 requests per 15 minutes for following lists. "
                       "Please wait before trying again, or use users with fewer following counts. "
                       "Cached data will be returned if available."
            }
        )
    except TwitterAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/demo/users/{username}")
async def get_demo_user(username: str) -> Dict:
    """
    Demo endpoint: Returns mock user data for testing/demonstration.
    Does not call Twitter API. Use this for demos when you want guaranteed fast responses.
    
    Available demo users: alice, bob, charlie, diana, eve
    
    Args:
        username: Twitter username (handle without @)
    
    Returns:
        Mock user information including profile picture, bio, etc.
    """
    demo_users = {
        "alice": {
            "id": "123456789",
            "name": "Alice Johnson",
            "username": "alice",
            "profile_image_url": "https://i.pravatar.cc/150?img=1",
            "description": "Software engineer and tech enthusiast 🚀 | Building the future one commit at a time",
            "public_metrics": {
                "followers_count": 450,
                "following_count": 380,
                "tweet_count": 320,
                "listed_count": 12
            }
        },
        "bob": {
            "id": "987654321",
            "name": "Bob Smith",
            "username": "bob",
            "profile_image_url": "https://i.pravatar.cc/150?img=5",
            "description": "Product designer and coffee lover ☕ | Crafting beautiful user experiences",
            "public_metrics": {
                "followers_count": 280,
                "following_count": 250,
                "tweet_count": 185,
                "listed_count": 8
            }
        },
        "charlie": {
            "id": "555666777",
            "name": "Charlie Brown",
            "username": "charlie",
            "profile_image_url": "https://i.pravatar.cc/150?img=12",
            "description": "Developer advocate passionate about open source 🌟 | Sharing knowledge daily",
            "public_metrics": {
                "followers_count": 650,
                "following_count": 580,
                "tweet_count": 420,
                "listed_count": 18
            }
        },
        "diana": {
            "id": "444555666",
            "name": "Diana Prince",
            "username": "diana",
            "profile_image_url": "https://i.pravatar.cc/150?img=47",
            "description": "UX researcher and designer | Building better products through user insights",
            "public_metrics": {
                "followers_count": 520,
                "following_count": 490,
                "tweet_count": 275,
                "listed_count": 15
            }
        },
        "eve": {
            "id": "333444555",
            "name": "Eve Wilson",
            "username": "eve",
            "profile_image_url": "https://i.pravatar.cc/150?img=33",
            "description": "Tech writer and blogger 📝 | Sharing insights on software development and tech trends",
            "public_metrics": {
                "followers_count": 380,
                "following_count": 340,
                "tweet_count": 210,
                "listed_count": 10
            }
        }
    }
    
    username_lower = username.lower()
    if username_lower not in demo_users:
        raise HTTPException(
            status_code=404,
            detail=f"Demo user '{username}' not found. Available demo users: {', '.join(demo_users.keys())}"
        )
    
    return demo_users[username_lower] 


@app.get("/demo/mutuals")
async def get_demo_mutuals(
    user1: str = Query(..., description="First Twitter username (without @)"),
    user2: str = Query(..., description="Second Twitter username (without @)")
) -> Dict:
    """
    Demo endpoint: Returns mock mutual connections data for testing/demonstration.
    Does not call Twitter API. Use this for demos when you want guaranteed fast responses.
    
    Available demo users: alice, bob, charlie, diana, eve
    
    Args:
        user1: First Twitter username
        user2: Second Twitter username
    
    Returns:
        Dictionary containing both users' info and list of mock mutual connections
    """
    demo_users = {
        "alice": {
            "id": "123456789",
            "name": "Alice Johnson",
            "username": "alice",
            "profile_image_url": "https://i.pravatar.cc/150?img=1",
            "description": "Software engineer and tech enthusiast 🚀 | Building the future one commit at a time",
            "public_metrics": {
                "followers_count": 450,
                "following_count": 380,
                "tweet_count": 320,
                "listed_count": 12
            }
        },
        "bob": {
            "id": "987654321",
            "name": "Bob Smith",
            "username": "bob",
            "profile_image_url": "https://i.pravatar.cc/150?img=5",
            "description": "Product designer and coffee lover ☕ | Crafting beautiful user experiences",
            "public_metrics": {
                "followers_count": 280,
                "following_count": 250,
                "tweet_count": 185,
                "listed_count": 8
            }
        },
        "charlie": {
            "id": "555666777",
            "name": "Charlie Brown",
            "username": "charlie",
            "profile_image_url": "https://i.pravatar.cc/150?img=12",
            "description": "Developer advocate passionate about open source 🌟 | Sharing knowledge daily",
            "public_metrics": {
                "followers_count": 650,
                "following_count": 580,
                "tweet_count": 420,
                "listed_count": 18
            }
        },
        "diana": {
            "id": "444555666",
            "name": "Diana Prince",
            "username": "diana",
            "profile_image_url": "https://i.pravatar.cc/150?img=47",
            "description": "UX researcher and designer | Building better products through user insights",
            "public_metrics": {
                "followers_count": 520,
                "following_count": 490,
                "tweet_count": 275,
                "listed_count": 15
            }
        },
        "eve": {
            "id": "333444555",
            "name": "Eve Wilson",
            "username": "eve",
            "profile_image_url": "https://i.pravatar.cc/150?img=33",
            "description": "Tech writer and blogger 📝 | Sharing insights on software development and tech trends",
            "public_metrics": {
                "followers_count": 380,
                "following_count": 340,
                "tweet_count": 210,
                "listed_count": 10
            }
        }
    }
    
    user1_lower = user1.lower()
    user2_lower = user2.lower()
    
    if user1_lower not in demo_users:
        raise HTTPException(
            status_code=404,
            detail=f"Demo user '{user1}' not found. Available demo users: {', '.join(demo_users.keys())}"
        )
    if user2_lower not in demo_users:
        raise HTTPException(
            status_code=404,
            detail=f"Demo user '{user2}' not found. Available demo users: {', '.join(demo_users.keys())}"
        )
    
    # Mock mutual connections - different sets based on user combinations
    # For alice & bob, return charlie, diana, eve as mutuals
    # For other combinations, return a subset
    if (user1_lower == "alice" and user2_lower == "bob") or (user1_lower == "bob" and user2_lower == "alice"):
        mutual_users = [
            {
                "id": "555666777",
                "name": "Charlie Brown",
                "username": "charlie",
                "profile_image_url": "https://i.pravatar.cc/150?img=12",
                "description": "Developer advocate passionate about open source 🌟 | Sharing knowledge daily",
                "public_metrics": {
                    "followers_count": 650,
                    "following_count": 580,
                    "tweet_count": 420,
                    "listed_count": 18
                }
            },
            {
                "id": "444555666",
                "name": "Diana Prince",
                "username": "diana",
                "profile_image_url": "https://i.pravatar.cc/150?img=47",
                "description": "UX researcher and designer | Building better products through user insights",
                "public_metrics": {
                    "followers_count": 520,
                    "following_count": 490,
                    "tweet_count": 275,
                    "listed_count": 15
                }
            },
            {
                "id": "333444555",
                "name": "Eve Wilson",
                "username": "eve",
                "profile_image_url": "https://i.pravatar.cc/150?img=33",
                "description": "Tech writer and blogger 📝 | Sharing insights on software development and tech trends",
                "public_metrics": {
                    "followers_count": 380,
                    "following_count": 340,
                    "tweet_count": 210,
                    "listed_count": 10
                }
            }
        ]
    else:
        # For other combinations, return a smaller set or empty
        mutual_users = [
            {
                "id": "555666777",
                "name": "Charlie Brown",
                "username": "charlie",
                "profile_image_url": "https://i.pravatar.cc/150?img=12",
                "description": "Developer advocate passionate about open source 🌟 | Sharing knowledge daily",
                "public_metrics": {
                    "followers_count": 650,
                    "following_count": 580,
                    "tweet_count": 420,
                    "listed_count": 18
                }
            }
        ]
    
    return {
        "user1": demo_users[user1_lower],
        "user2": demo_users[user2_lower],
        "mutuals": mutual_users,
        "mutual_count": len(mutual_users),
        "note": "This is demo/mock data for testing purposes."
    }


"""
Keep the example routes for testing
note, these are pages that test functionality of the frontend/backend connection.  
"""
@app.get("/hello")
async def hello() -> dict[str, str]:
    """Get hello message."""
    return {"message": "Hello from FastAPI"}


@app.get("/random")
async def get_random_item(maximum: int) -> dict[str, int]:
    """Get an item with a random ID."""
    return {"itemId": random.randint(0, maximum)}
