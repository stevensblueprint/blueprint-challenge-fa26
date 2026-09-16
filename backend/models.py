from __future__ import annotations

import enum
from datetime import date

from pydantic import BaseModel, EmailStr


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
    patron_name: str
    book_id: int
    date: date
    notes: str


class CheckoutResponse(CheckoutCreate):
    id: int
