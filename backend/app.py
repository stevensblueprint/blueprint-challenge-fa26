from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from .models import (
        CheckoutCreate,
        CheckoutResponse,
        BookGenre,
        BookCreate,
        BookResponse,
    )
except ImportError:
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
def create_book(payload: BookCreate) -> BookResponse:
    _ = payload
    # TODO: Implement persistence and return the newly created book.
    raise HTTPException(status_code=501, detail="TODO: implement POST /books")


@app.get("/books", response_model=list[BookResponse])
def list_books(q: str | None = None, genre: BookGenre | None = None) -> list[BookResponse]:
    _ = q
    _ = genre
    # TODO: Implement search by title (q) and filter by genre.
    raise HTTPException(status_code=501, detail="TODO: implement GET /books")


@app.get("/books/{book_id}", response_model=BookResponse)
def get_book(book_id: int) -> BookResponse:
    _ = book_id
    # TODO: Return a single book by id, or 404 if not found.
    raise HTTPException(status_code=501, detail="TODO: implement GET /books/{id}")


@app.post("/checkouts", response_model=CheckoutResponse)
def create_checkout(payload: CheckoutCreate) -> CheckoutResponse:
    _ = payload
    # TODO: Validate book exists, then create and return checkout.
    raise HTTPException(status_code=501, detail="TODO: implement POST /checkouts")


@app.get("/books/{book_id}/checkouts", response_model=list[CheckoutResponse])
def list_book_checkouts(book_id: int) -> list[CheckoutResponse]:
    _ = book_id
    # TODO: Return checkouts associated with the given book.
    raise HTTPException(status_code=501, detail="TODO: implement GET /books/{id}/checkouts")
