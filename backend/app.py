from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

try:
    from .database import get_db
    from .db_models import Book, Checkout
    from .models import (
        CheckoutCreate,
        CheckoutResponse,
        BookGenre,
        BookCreate,
        BookResponse,
    )
except ImportError:
    from database import get_db
    from db_models import Book, Checkout
    from models import (
        CheckoutCreate,
        CheckoutResponse,
        BookGenre,
        BookCreate,
        BookResponse,
    )

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
    # Implement persistence and return the newly created book.
    # create an SQLAlchemy Book object from the validated request data
    book = Book(
        title=payload.title,
        genre=payload.genre.value,
        description=payload.description,
        author=payload.author,
        publisher_email=str(payload.publisher_email),
        shelf_location=payload.shelf_location,
    )

    # create the book and save it to the database
    db.add(book)
    db.commit()
    db.refresh(book)

    # return the newly created book
    return BookResponse(id=book.id,
                        title=book.title,
                        genre=BookGenre(book.genre),
                        description=book.description,
                        author=book.author,
                        publisher_email=book.publisher_email,
                        shelf_location=book.shelf_location,
                        )


@app.get("/books", response_model=list[BookResponse])
def list_books(q: str | None = None, genre: BookGenre | None = None, db: Session = Depends(get_db)) -> list[BookResponse]:
    # Implement search by title (q) and filter by genre.
    query = db.query(Book)

    if q:
        query = query.filter(Book.title.ilike(f"%{q}%"))

    if genre:
        query = query.filter(Book.genre == genre.value)

    books = query.order_by(Book.id).all()

    return [
        BookResponse(
            id=book.id,
            title=book.title,
            genre=BookGenre(book.genre),
            description=book.description,
            author=book.author,
            publisher_email=book.publisher_email,
            shelf_location=book.shelf_location,
        ) for book in books
    ]


@app.get("/books/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)) -> BookResponse:
    # Return a single book by id, or 404 if not found.
    book = db.get(Book, book_id)

    # return 404 if book not found
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # return a single book by id
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
    # Validate book exists, then create and return checkout.
    book = db.get(Book, payload.book_id)

    # validate book exists, return 404 if book not found
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # create an SQLAlchemy Checkout object from the validated request data
    checkout = Checkout(
        patron_name=payload.patron_name,
        book_id=payload.book_id,
        date=payload.date,
        notes=payload.notes,
    )

    # create the checkout and save it to the database
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
    # Return checkouts associated with the given book.
    book = db.get(Book, book_id)

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    checkouts = (
        db.query(Checkout)
        .filter(Checkout.book_id == book_id)
        .order_by(Checkout.id)
        .all()
    )

    return [
        CheckoutResponse(
            id=checkout.id,
            patron_name=checkout.patron_name,
            book_id=checkout.book_id,
            date=checkout.date,
            notes=checkout.notes,
        ) for checkout in checkouts
    ]
