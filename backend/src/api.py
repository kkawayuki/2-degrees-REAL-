"""
This file defines the FastAPI app for the API and all of its routes.
To run this API, use the FastAPI CLI
$ fastapi dev src/api.py
"""

import random
from typing import Dict, List

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
            "profilePicture": "https://i.pravatar.cc/150?img=1",
            "bio": "Software engineer and tech enthusiast 🚀 | Building the future one commit at a time",
            "degree": 1,
            "public_metrics": {
                "followers_count": 1250,
                "following_count": 350,
                "tweet_count": 5420,
                "listed_count": 45
            }
        },
        "bob": {
            "id": "987654321",
            "name": "Bob Smith",
            "username": "bob",
            "profilePicture": "https://i.pravatar.cc/150?img=2",
            "bio": "Product designer and coffee lover ☕ | Crafting beautiful user experiences",
            "degree": 1,
            "public_metrics": {
                "followers_count": 890,
                "following_count": 420,
                "tweet_count": 3200,
                "listed_count": 28
            }
        },
        "charlie": {
            "id": "555666777",
            "name": "Charlie Brown",
            "username": "charlie",
            "profilePicture": "https://i.pravatar.cc/150?img=3",
            "bio": "Developer advocate passionate about open source 🌟 | Sharing knowledge daily",
            "degree": 2,
            "public_metrics": {
                "followers_count": 5600,
                "following_count": 1200,
                "tweet_count": 8900,
                "listed_count": 120
            }
        },
        "diana": {
            "id": "444555666",
            "name": "Diana Prince",
            "username": "diana",
            "profilePicture": "https://i.pravatar.cc/150?img=4",
            "bio": "UX researcher and designer | Building better products through user insights",
            "degree": 2,
            "public_metrics": {
                "followers_count": 3400,
                "following_count": 800,
                "tweet_count": 2100,
                "listed_count": 67
            }
        },
        "eve": {
            "id": "333444555",
            "name": "Eve Wilson",
            "username": "eve",
            "profilePicture": "https://i.pravatar.cc/150?img=5",
            "bio": "Tech writer and blogger 📝 | Sharing insights on software development and tech trends",
            "degree": 3,
            "public_metrics": {
                "followers_count": 2100,
                "following_count": 600,
                "tweet_count": 1500,
                "listed_count": 35
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


@app.get("/demo/friends")
async def get_demo_friends() -> List[Dict]:
    """
    Demo endpoint: Returns a list of mock friends for the Universe page.
    This mimics the friends.json structure used in the frontend.
    
    Returns:
        List of friend objects with username, profilePicture, bio, and degree
    """
    demo_users = {
        "alice": {
            "username": "alice",
            "profilePicture": "https://i.pravatar.cc/150?img=1",
            "bio": "Software engineer and tech enthusiast 🚀 | Building the future one commit at a time",
            "degree": 1
        },
        "bob": {
            "username": "bob",
            "profilePicture": "https://i.pravatar.cc/150?img=2",
            "bio": "Product designer and coffee lover ☕ | Crafting beautiful user experiences",
            "degree": 1
        },
        "charlie": {
            "username": "charlie",
            "profilePicture": "https://i.pravatar.cc/150?img=3",
            "bio": "Developer advocate passionate about open source 🌟 | Sharing knowledge daily",
            "degree": 2
        },
        "diana": {
            "username": "diana",
            "profilePicture": "https://i.pravatar.cc/150?img=4",
            "bio": "UX researcher and designer | Building better products through user insights",
            "degree": 2
        },
        "eve": {
            "username": "eve",
            "profilePicture": "https://i.pravatar.cc/150?img=5",
            "bio": "Tech writer and blogger 📝 | Sharing insights on software development and tech trends",
            "degree": 3
        },
        "frank": {
            "username": "frank",
            "profilePicture": "https://i.pravatar.cc/150?img=6",
            "bio": "Full-stack developer and coffee addict",
            "degree": 1
        },
        "grace": {
            "username": "grace",
            "profilePicture": "https://i.pravatar.cc/150?img=7",
            "bio": "Data scientist exploring AI and machine learning",
            "degree": 2
        },
        "henry": {
            "username": "henry",
            "profilePicture": "https://i.pravatar.cc/150?img=8",
            "bio": "Mobile app developer building the next big thing",
            "degree": 2
        },
        "iris": {
            "username": "iris",
            "profilePicture": "https://i.pravatar.cc/150?img=9",
            "bio": "Frontend enthusiast and design system advocate",
            "degree": 3
        },
        "jack": {
            "username": "jack",
            "profilePicture": "https://i.pravatar.cc/150?img=10",
            "bio": "DevOps engineer automating everything",
            "degree": 3
        },
        "kate": {
            "username": "kate",
            "profilePicture": "https://i.pravatar.cc/150?img=11",
            "bio": "Security researcher keeping the web safe",
            "degree": 3
        },
        "leo": {
            "username": "leo",
            "profilePicture": "https://i.pravatar.cc/150?img=12",
            "bio": "Cloud architect building scalable solutions",
            "degree": 3
        },
        "maya": {
            "username": "maya",
            "profilePicture": "https://i.pravatar.cc/150?img=13",
            "bio": "Game developer creating immersive experiences",
            "degree": 3
        },
        "nick": {
            "username": "nick",
            "profilePicture": "https://i.pravatar.cc/150?img=14",
            "bio": "Blockchain developer exploring Web3",
            "degree": 3
        },
        "olivia": {
            "username": "olivia",
            "profilePicture": "https://i.pravatar.cc/150?img=15",
            "bio": "QA engineer ensuring quality at every step",
            "degree": 3
        },
        "paul": {
            "username": "paul",
            "profilePicture": "https://i.pravatar.cc/150?img=16",
            "bio": "Technical writer documenting the future",
            "degree": 3
        },
        "quinn": {
            "username": "quinn",
            "profilePicture": "https://i.pravatar.cc/150?img=17",
            "bio": "Site reliability engineer keeping systems running",
            "degree": 3
        },
        "rachel": {
            "username": "rachel",
            "profilePicture": "https://i.pravatar.cc/150?img=18",
            "bio": "Product manager shipping great products",
            "degree": 3
        },
        "sam": {
            "username": "sam",
            "profilePicture": "https://i.pravatar.cc/150?img=19",
            "bio": "Backend engineer optimizing performance",
            "degree": 3
        },
        "tina": {
            "username": "tina",
            "profilePicture": "https://i.pravatar.cc/150?img=20",
            "bio": "UI/UX designer crafting beautiful interfaces",
            "degree": 3
        },
        "uma": {
            "username": "uma",
            "profilePicture": "https://i.pravatar.cc/150?img=21",
            "bio": "Database administrator managing petabytes",
            "degree": 3
        },
        "victor": {
            "username": "victor",
            "profilePicture": "https://i.pravatar.cc/150?img=22",
            "bio": "Systems programmer working close to the metal",
            "degree": 3
        }
    }
    
    return list(demo_users.values())


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
            "profile_image_url": "https://pbs.twimg.com/profile_images/1234567890/example1_normal.jpg",
            "description": "Software engineer and tech enthusiast 🚀 | Building the future one commit at a time",
            "public_metrics": {
                "followers_count": 1250,
                "following_count": 350,
                "tweet_count": 5420,
                "listed_count": 45
            }
        },
        "bob": {
            "id": "987654321",
            "name": "Bob Smith",
            "username": "bob",
            "profile_image_url": "https://pbs.twimg.com/profile_images/9876543210/example2_normal.jpg",
            "description": "Product designer and coffee lover ☕ | Crafting beautiful user experiences",
            "public_metrics": {
                "followers_count": 890,
                "following_count": 420,
                "tweet_count": 3200,
                "listed_count": 28
            }
        },
        "charlie": {
            "id": "555666777",
            "name": "Charlie Brown",
            "username": "charlie",
            "profile_image_url": "https://pbs.twimg.com/profile_images/5556667770/example3_normal.jpg",
            "description": "Developer advocate passionate about open source 🌟 | Sharing knowledge daily",
            "public_metrics": {
                "followers_count": 5600,
                "following_count": 1200,
                "tweet_count": 8900,
                "listed_count": 120
            }
        },
        "diana": {
            "id": "444555666",
            "name": "Diana Prince",
            "username": "diana",
            "profile_image_url": "https://pbs.twimg.com/profile_images/4445556660/example4_normal.jpg",
            "description": "UX researcher and designer | Building better products through user insights",
            "public_metrics": {
                "followers_count": 3400,
                "following_count": 800,
                "tweet_count": 2100,
                "listed_count": 67
            }
        },
        "eve": {
            "id": "333444555",
            "name": "Eve Wilson",
            "username": "eve",
            "profile_image_url": "https://pbs.twimg.com/profile_images/3334445550/example5_normal.jpg",
            "description": "Tech writer and blogger 📝 | Sharing insights on software development and tech trends",
            "public_metrics": {
                "followers_count": 2100,
                "following_count": 600,
                "tweet_count": 1500,
                "listed_count": 35
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
                "profile_image_url": "https://pbs.twimg.com/profile_images/5556667770/example3_normal.jpg",
                "description": "Developer advocate passionate about open source 🌟 | Sharing knowledge daily",
                "public_metrics": {
                    "followers_count": 5600,
                    "following_count": 1200,
                    "tweet_count": 8900,
                    "listed_count": 120
                }
            },
            {
                "id": "444555666",
                "name": "Diana Prince",
                "username": "diana",
                "profile_image_url": "https://pbs.twimg.com/profile_images/4445556660/example4_normal.jpg",
                "description": "UX researcher and designer | Building better products through user insights",
                "public_metrics": {
                    "followers_count": 3400,
                    "following_count": 800,
                    "tweet_count": 2100,
                    "listed_count": 67
                }
            },
            {
                "id": "333444555",
                "name": "Eve Wilson",
                "username": "eve",
                "profile_image_url": "https://pbs.twimg.com/profile_images/3334445550/example5_normal.jpg",
                "description": "Tech writer and blogger 📝 | Sharing insights on software development and tech trends",
                "public_metrics": {
                    "followers_count": 2100,
                    "following_count": 600,
                    "tweet_count": 1500,
                    "listed_count": 35
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
                "profile_image_url": "https://pbs.twimg.com/profile_images/5556667770/example3_normal.jpg",
                "description": "Developer advocate passionate about open source 🌟 | Sharing knowledge daily",
                "public_metrics": {
                    "followers_count": 5600,
                    "following_count": 1200,
                    "tweet_count": 8900,
                    "listed_count": 120
                }
            }
        ]
    
    return {
        "user1": demo_users[user1_lower],
        "user2": demo_users[user2_lower],
        "mutuals": mutual_users,
        "mutual_count": len(mutual_users),
        "note": "This is demo/mock data for testing purposes. No Twitter API calls were made."
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
