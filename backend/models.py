from __future__ import annotations

import enum
from datetime import date

from pydantic import BaseModel, EmailStr, Field


class BookGenre(str, enum.Enum):
    FICTION = "Fiction"
    NON_FICTION = "Non-Fiction"
    CHILDREN = "Children"
    REFERENCE = "Reference"
    PERIODICAL = "Periodical"
    OTHER = "Other"


class BookCreate(BaseModel):
    title: str
    genre: BookGenre
    description: str
    author: str
    publisher_email: EmailStr
    shelf_location: str


class BookResponse(BookCreate):
    id: int


class CheckoutCreate(BaseModel):
    # Matches the String(255) column, so an over-long name is a 422 instead of a DB error.
    patron_name: str = Field(max_length=255)
    book_id: int
    date: date
    notes: str


class CheckoutResponse(CheckoutCreate):
    id: int
