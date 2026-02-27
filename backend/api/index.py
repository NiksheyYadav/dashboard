"""Vercel serverless entry point — exposes the FastAPI app as a handler."""

import sys
import os

# Add the backend directory to the Python path so imports like
# `from app.main import app` resolve correctly on Vercel.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app  # noqa: E402, F401

# Vercel's @vercel/python runtime will automatically detect the `app`
# variable as a FastAPI/Starlette ASGI application and serve it.
