import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.utils.request_context import set_request_id


class RequestIdMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, header_name: str = "X-Request-ID"):
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get(self.header_name) or str(uuid.uuid4())
        set_request_id(request_id)

        response: Response = await call_next(request)
        response.headers[self.header_name] = request_id
        return response
