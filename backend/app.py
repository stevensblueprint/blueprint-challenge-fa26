from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

try:
    from .database import Base, engine, get_db
    from .db_models import Book, Checkout
    from .models import BookCreate, BookGenre, BookResponse, CheckoutCreate, CheckoutResponse
except ImportError:
    from database import Base, engine, get_db
    from db_models import Book, Checkout
    from models import BookCreate, BookGenre, BookResponse, CheckoutCreate, CheckoutResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="LibraryConnect API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def find_book(book_id: int, db: Session) -> Book:
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@app.get("/")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/books", response_model=BookResponse, status_code=201)
def create_book(payload: BookCreate, db: Session = Depends(get_db)) -> Book:
    book = Book(**payload.model_dump())
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
    query = select(Book)
    if q and q.strip():
        query = query.where(Book.title.icontains(q.strip(), autoescape=True))
    if genre is not None:
        query = query.where(Book.genre == genre.value)
    return list(db.scalars(query.order_by(Book.id)))


@app.get("/books/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)) -> Book:
    return find_book(book_id, db)


@app.post("/checkouts", response_model=CheckoutResponse, status_code=201)
def create_checkout(payload: CheckoutCreate, db: Session = Depends(get_db)) -> Checkout:
    find_book(payload.book_id, db)
    checkout = Checkout(**payload.model_dump())
    db.add(checkout)
    db.commit()
    db.refresh(checkout)
    return checkout


@app.get("/books/{book_id}/checkouts", response_model=list[CheckoutResponse])
def list_book_checkouts(book_id: int, db: Session = Depends(get_db)) -> list[Checkout]:
    find_book(book_id, db)
    query = (
        select(Checkout)
        .where(Checkout.book_id == book_id)
        .order_by(Checkout.date.desc(), Checkout.id.desc())
    )
    return list(db.scalars(query))
