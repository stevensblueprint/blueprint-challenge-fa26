from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

# Create the books and checkouts tables if they do not exist yet.
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_book_or_404(db: Session, book_id: int) -> Book:
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@app.get("/")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/books", response_model=BookResponse)
def create_book(payload: BookCreate, db: Session = Depends(get_db)) -> Book:
    book = Book(
        title=payload.title,
        genre=payload.genre.value,
        description=payload.description,
        author=payload.author,
        publisher_email=payload.publisher_email,
        shelf_location=payload.shelf_location,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@app.get("/books", response_model=list[BookResponse])
def list_books(
    q: str | None = None,
    genre: BookGenre | None = None,
    db: Session = Depends(get_db),
) -> list[Book]:
    query = db.query(Book)
    if q:
        query = query.filter(Book.title.ilike(f"%{q}%"))
    if genre is not None:
        query = query.filter(Book.genre == genre.value)
    return query.order_by(Book.id).all()


@app.get("/books/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)) -> Book:
    return get_book_or_404(db, book_id)


@app.post("/checkouts", response_model=CheckoutResponse)
def create_checkout(
    payload: CheckoutCreate, db: Session = Depends(get_db)
) -> Checkout:
    get_book_or_404(db, payload.book_id)
    checkout = Checkout(
        patron_name=payload.patron_name,
        book_id=payload.book_id,
        date=payload.date,
        notes=payload.notes,
    )
    db.add(checkout)
    db.commit()
    db.refresh(checkout)
    return checkout


@app.get("/books/{book_id}/checkouts", response_model=list[CheckoutResponse])
def list_book_checkouts(
    book_id: int, db: Session = Depends(get_db)
) -> list[Checkout]:
    get_book_or_404(db, book_id)
    return (
        db.query(Checkout)
        .filter(Checkout.book_id == book_id)
        .order_by(Checkout.id)
        .all()
    )
