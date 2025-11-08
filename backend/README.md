# FastAPI Backend - 2 Degrees

Welcome to FastAPI! FastAPI is a modern and fast web framework for building
APIs in Python using type annotations. If you've worked with Flask before,
there are several similarities between that and FastAPI. Both involve
initializing your application, then declaring routes using decorated functions.

One of the main differences between them, and perhaps what makes FastAPI stand
out, is how much FastAPI relies on type annotations. On top of making routes
more readable for developers, FastAPI automatically validates the provided
type annotations to ensure the parameters provided to a route are correct!

This application provides API endpoints for finding mutual Twitter connections
between two users. The API integrates with Twitter API v2 to fetch user
information and following lists.

## Setup

### 1. Twitter API Credentials

You need a Twitter Bearer Token to use this API:

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project/app or use an existing one
3. Generate a Bearer Token (Twitter API v2)
4. Copy the token

### 2. Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

**Important:** Never commit the `.env` file to git (it's already in `.gitignore`)

### 3. Python Virtual Environment

To run this application, you'll need Python and all the necessary libraries.
You should create a Python virtual environment so that the packages installed
don't conflict with the ones on your main system by running:

### Windows

```ps
> python -m venv .venv
> .\.venv\Scripts\activate
```

### macOS/Unix

```bash
$ python3 -m venv .venv
$ source .venv/bin/activate
```

### 4. Install Dependencies

Once you've created the virtual environment, install the libraries:

```bash
pip install -r requirements.txt -r requirements-dev.txt
```

### 5. Run the Server

Finally, start the local development server:

```bash
fastapi dev src/api.py
```

The server will start at `http://127.0.0.1:8000`

## API Endpoints

### `GET /`
Root endpoint - returns API status

### `GET /users/{username}`
Get user information by Twitter username (without @)

Example: `GET /users/elonmusk`

Returns user data including:
- id, name, username
- profile_image_url
- description (bio)
- public_metrics (followers, following counts)

### `GET /mutuals?user1={username1}&user2={username2}`
Get mutual accounts that both users follow

Example: `GET /mutuals?user1=user1&user2=user2`

Returns:
- user1: First user's information
- user2: Second user's information
- mutuals: Array of mutual connections with full profile info
- mutual_count: Number of mutual connections

## Interactive API Documentation

FastAPI automatically generates interactive API documentation:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Project Structure

```
backend/
├── src/
│   ├── api.py              # Main API routes
│   ├── twitter_service.py  # Twitter API integration
│   └── main.py             # Deployment setup (for Render)
├── requirements.txt        # Production dependencies
├── requirements-dev.txt    # Development dependencies
└── .env                    # Environment variables (not in git)
```

## Twitter API Rate Limits

Be aware of Twitter API rate limits:
- Free tier has strict rate limits
- Following lists are paginated (15 requests per 15 min per user)
- Consider caching results for better performance

## Error Handling

The API handles:
- 404: User not found
- 500: Server errors (Twitter API errors, etc.)
- 429: Rate limit errors (from Twitter API)

## CORS

CORS is enabled for all origins in development. In production, update the
`allow_origins` setting in `api.py` to restrict to your frontend domain.

## Troubleshooting

**"TWITTER_BEARER_TOKEN not found"**
- Make sure you created a `.env` file in the `backend/` directory
- Check that the token is correctly set

**Rate limit errors**
- You've hit Twitter API rate limits
- Wait 15 minutes or upgrade your Twitter API plan

**Import errors**
- Make sure dependencies are installed: `pip install -r requirements.txt`
- Activate your virtual environment

To read more about FastAPI, refer to the
[FastAPI documentation](https://fastapi.tiangolo.com/).
