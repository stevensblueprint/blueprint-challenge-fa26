from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

try:
    from . import db_models
    from .database import Base, engine, get_db
    from .models import (
        CheckoutCreate,
        CheckoutResponse,
        BookGenre,
        BookCreate,
        BookResponse,
    )
except ImportError:
    import db_models
    from database import Base, engine, get_db
    from models import (
        CheckoutCreate,
        CheckoutResponse,
        BookGenre,
        BookCreate,
        BookResponse,
    )


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    # Create the books/checkouts tables if they don't exist yet.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="LibraryConnect API Starter", lifespan=lifespan)

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


def _book_response(book: db_models.Book) -> BookResponse:
    return BookResponse.model_validate(book, from_attributes=True)


@app.post("/books", response_model=BookResponse, status_code=201)
def create_book(payload: BookCreate, db: Session = Depends(get_db)) -> BookResponse:
    # mode="json" stores the genre enum as its plain string value, e.g. "Fiction".
    book = db_models.Book(**payload.model_dump(mode="json"))
    db.add(book)
    db.commit()
    db.refresh(book)
    return _book_response(book)


@app.get("/books", response_model=list[BookResponse])
def list_books(
    q: str | None = None,
    genre: BookGenre | None = None,
    db: Session = Depends(get_db),
) -> list[BookResponse]:
    query = select(db_models.Book).order_by(db_models.Book.id)
    q = q.strip() if q else q
    if q:
        # Case-insensitive "title contains q"; autoescape treats % and _ literally.
        query = query.where(db_models.Book.title.icontains(q, autoescape=True))
    if genre:
        query = query.where(db_models.Book.genre == genre.value)
    return [_book_response(book) for book in db.scalars(query)]


def _get_book_or_404(db: Session, book_id: int) -> db_models.Book:
    book = db.get(db_models.Book, book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@app.get("/books/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)) -> BookResponse:
    return _book_response(_get_book_or_404(db, book_id))


def _checkout_response(checkout: db_models.Checkout) -> CheckoutResponse:
    return CheckoutResponse.model_validate(checkout, from_attributes=True)


@app.post("/checkouts", response_model=CheckoutResponse, status_code=201)
def create_checkout(payload: CheckoutCreate, db: Session = Depends(get_db)) -> CheckoutResponse:
    _get_book_or_404(db, payload.book_id)
    # Default (python) mode keeps `date` as a date object for the Date column.
    checkout = db_models.Checkout(**payload.model_dump())
    db.add(checkout)
    db.commit()
    db.refresh(checkout)
    return _checkout_response(checkout)


@app.get("/books/{book_id}/checkouts", response_model=list[CheckoutResponse])
def list_book_checkouts(book_id: int, db: Session = Depends(get_db)) -> list[CheckoutResponse]:
    _get_book_or_404(db, book_id)
    query = (
        select(db_models.Checkout)
        .where(db_models.Checkout.book_id == book_id)
        .order_by(db_models.Checkout.id)
    )
    return [_checkout_response(checkout) for checkout in db.scalars(query)]
