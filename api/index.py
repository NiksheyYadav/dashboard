"""Vercel serverless entry point — exposes the FastAPI app as a handler."""

import sys
import os

# Add the backend directory to the Python path so imports like
# `from app.main import app` resolve correctly on Vercel.
backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, backend_dir)

# Load the .env file from the backend directory if it exists,
# so that pydantic-settings can pick up the variables on Vercel.
from dotenv import load_dotenv  # noqa: E402

env_path = os.path.join(backend_dir, ".env")
if os.path.exists(env_path):
    load_dotenv(env_path, override=True)

from app.main import app  # noqa: E402, F401

# Vercel's @vercel/python runtime will automatically detect the `app`
# variable as a FastAPI/Starlette ASGI application and serve it.
