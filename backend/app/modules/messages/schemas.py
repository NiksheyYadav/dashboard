from datetime import datetime

from pydantic import BaseModel


class AnonymousMessageCreate(BaseModel):
    message: str


class AnonymousMessageResponse(BaseModel):
    id: str
    message: str
    status: str
    createdAt: datetime


class PaginatedAnonymousMessagesResponse(BaseModel):
    data: list[AnonymousMessageResponse]
    total: int
    page: int
    limit: int
