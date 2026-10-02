from __future__ import annotations

from typing import Literal

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

try:
    from .models import (
        CheckoutCreate,
        CheckoutResponse,
        BookGenre,
        BookCreate,
        BookResponse,
    )
    from .database import get_db
    from .db_models import Book, Checkout
except ImportError:
    from models import (
        CheckoutCreate,
        CheckoutResponse,
        BookGenre,
        BookCreate,
        BookResponse,
    )
    from database import get_db
    from db_models import Book, Checkout

app = FastAPI(title="LibraryConnect API Starter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/books", response_model=BookResponse)
def create_book(payload: BookCreate, db: Session = Depends(get_db)) -> BookResponse:
    _ = payload
    row = Book(**payload.model_dump(mode="json"))
    db.add(row)
    db.commit()
    db.refresh(row)
    return BookResponse.model_validate(row, from_attributes=True)


@app.get("/books", response_model=list[BookResponse])
def list_books(
    q: str | None = None,
    genre: BookGenre | Literal["All"] | None = None,
    db: Session = Depends(get_db),
) -> list[BookResponse]:
    query = db.query(Book)
    if q:
        query = query.filter(Book.title.icontains(q, autoescape=True))
    if genre is not None and genre != "All":
        query = query.filter(Book.genre == genre)
    rows = query.order_by(Book.id).all()
    return [BookResponse.model_validate(row, from_attributes=True) for row in rows]


@app.get("/books/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)) -> BookResponse:
    row = db.get(Book, book_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return BookResponse.model_validate(row, from_attributes=True)


@app.post("/checkouts", response_model=CheckoutResponse)
def create_checkout(
    payload: CheckoutCreate, db: Session = Depends(get_db)
) -> CheckoutResponse:
    if db.get(Book, payload.book_id) is None:
        raise HTTPException(status_code=404, detail="Book not found")
    row = Checkout(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return CheckoutResponse.model_validate(row, from_attributes=True)


@app.get("/books/{book_id}/checkouts", response_model=list[CheckoutResponse])
def list_book_checkouts(
    book_id: int, db: Session = Depends(get_db)
) -> list[CheckoutResponse]:
    if db.get(Book, book_id) is None:
        raise HTTPException(status_code=404, detail="Book not found")
    rows = (
        db.query(Checkout)
        .filter(Checkout.book_id == book_id)
        .order_by(Checkout.id)
        .all()
    )
    return [CheckoutResponse.model_validate(row, from_attributes=True) for row in rows]
