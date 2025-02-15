from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from jose.exceptions import JWTError
from openai import OpenAIError
from stripe.error import StripeError
from typing import Union
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def error_handler_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        logger.error(f"Error occurred: {type(exc).__name__}: {str(exc)}")
        return handle_exception(exc)

def handle_exception(exc: Exception) -> JSONResponse:
    if isinstance(exc, SQLAlchemyError):
        logger.error(f"Database error: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Database error occurred", "type": "database_error"}
        )
    elif isinstance(exc, JWTError):
        logger.error(f"Auth error: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid authentication credentials", "type": "auth_error"}
        )
    elif isinstance(exc, OpenAIError):
        logger.error(f"OpenAI error: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": "AI service error", "type": "ai_error"}
        )
    elif isinstance(exc, StripeError):
        logger.error(f"Stripe error: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": "Payment service error", "type": "payment_error"}
        )
    else:
        logger.error(f"Unexpected error: {type(exc).__name__}: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred", "type": "server_error"}
        )
