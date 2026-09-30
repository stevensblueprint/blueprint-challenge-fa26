from __future__ import annotations

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

try:
    from .database import Base, engine, get_db
    from .db_models import Book, Checkout
    from .models import (
        CheckoutCreate,
        CheckoutResponse,
        BookGenre,
        BookCreate,
        BookResponse,
    )
except ImportError:
    from database import Base, engine, get_db
    from db_models import Book, Checkout
    from models import (
        CheckoutCreate,
        CheckoutResponse,
        BookGenre,
        BookCreate,
        BookResponse,
    )

app = FastAPI(title="LibraryConnect API Starter")

Base.metadata.create_all(bind=engine)

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
    book = Book(
        title=payload.title,
        genre=payload.genre.value,
        description=payload.description,
        author=payload.author,
        publisher_email=str(payload.publisher_email),
        shelf_location=payload.shelf_location,
    )

    db.add(book)
    db.commit()
    db.refresh(book)

    return BookResponse(
        id=book.id,
        title=book.title,
        genre=BookGenre(book.genre),
        description=book.description,
        author=book.author,
        publisher_email=book.publisher_email,
        shelf_location=book.shelf_location,
    )


@app.get("/books", response_model=list[BookResponse])
def list_books(q: str | None = None, genre: BookGenre | None = None, db: Session = Depends(get_db)) -> list[BookResponse]:
    statement = select(Book)

    if q is not None:
        statement = statement.where(Book.title.ilike(f"%{q}%"))

    if genre is not None:
        statement = statement.where(Book.genre == genre.value)

    books = db.scalars(statement).all()

    return [BookResponse(
        id=book.id,
        title=book.title,
        genre=BookGenre(book.genre),
        description=book.description,
        author=book.author,
        publisher_email=book.publisher_email,
        shelf_location=book.shelf_location,
    ) for book in books]


@app.get("/books/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)) -> BookResponse:
    book = db.get(Book, book_id)

    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    return BookResponse(
        id=book.id,
        title=book.title,
        genre=BookGenre(book.genre),
        description=book.description,
        author=book.author,
        publisher_email=book.publisher_email,
        shelf_location=book.shelf_location,
    )


@app.post("/checkouts", response_model=CheckoutResponse)
def create_checkout(payload: CheckoutCreate, db: Session = Depends(get_db)) -> CheckoutResponse:
    book = db.get(Book, payload.book_id)

    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    checkout = Checkout(
        patron_name=payload.patron_name,
        book_id=payload.book_id,
        date=payload.date,
        notes=payload.notes,
    )

    db.add(checkout)
    db.commit()
    db.refresh(checkout)

    return CheckoutResponse(
        id=checkout.id,
        patron_name=checkout.patron_name,
        book_id=checkout.book_id,
        date=checkout.date,
        notes=checkout.notes,
    )


@app.get("/books/{book_id}/checkouts", response_model=list[CheckoutResponse])
def list_book_checkouts(book_id: int, db: Session = Depends(get_db)) -> list[CheckoutResponse]:
    book = db.get(Book, book_id)

    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    statement = select(Checkout).where(Checkout.book_id == book_id)
    checkouts = db.scalars(statement).all()

    return [CheckoutResponse(
        id=checkout.id,
        patron_name=checkout.patron_name,
        book_id=checkout.book_id,
        date=checkout.date,
        notes=checkout.notes,
    ) for checkout in checkouts]