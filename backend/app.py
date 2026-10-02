from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

#We will now import Session in order for all of our requests route to 
from sqlalchemy.orm  import Session

try:
    #We will include our functions that we will utilized in our backend GET/POST requests
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
def create_book(payload: BookCreate, db:Session = Depends(get_db)) -> BookResponse:
    """Persist a new book from the validated request body and return it with its new id."""
    _ = payload
    # TODO: Implement persistence and return the newly created book.
    #raise HTTPException(status_code=501, detail="TODO: implement POST /books")

    #Create an instance of the book and giving it all of its attributes based on the payload that we
    # are sending to our server and making sure that we have all the correct data
    book = Book(
        title=payload.title,
        genre=payload.genre.value,
        description=payload.description,
        author=payload.author,
        publisher_email=payload.publisher_email,
        shelf_location=payload.shelf_location,
    )

    #We need to then stage our object that we have created
    db.add(book)

    #We will then add an id to our object instance
    db.commit()

    #We will then use refresh to reload so that the DB 
    db.refresh(book)

    #Finally we will return our book object
    return book


@app.get("/books", response_model=list[BookResponse])
def list_books(q: str | None = None, genre: BookGenre | None = None, db: Session = Depends(get_db)) -> list[BookResponse]:
    """List books, optionally narrowed by a case-insensitive title search and/or an exact genre match (combinable)."""
    _ = q
    _ = genre
    # TODO: Implement search by title (q) and filter by genre.
    #raise HTTPException(status_code=501, detail="TODO: implement GET /books")

    #We will create our query of our book
    query = db.query(Book)
    if q:
        # The ilike deals with case-insesitive partial mathc searches
        query = query.filter(Book.title.ilike(f"%{q}%"))
    if genre:
        query = query.filter(Book.genre == genre.value)

    #We will now return our new filtered query
    return query.all()



@app.get("/books/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db:Session = Depends(get_db)) -> BookResponse:
    """Return a single book by id, or 404 if no book with that id exists."""
    _ = book_id
    # TODO: Return a single book by id, or 404 if not found.
    # raise HTTPException(status_code=501, detail="TODO: implement GET /books/{id}")
    
    #We will create our object instance of book
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    #We will then return book
    return book



@app.post("/checkouts", response_model=CheckoutResponse)
def create_checkout(payload: CheckoutCreate, db: Session = Depends(get_db)) -> CheckoutResponse:
    """Validate the referenced book exists, then persist and return a new checkout linked to it."""
    _ = payload
    # TODO: Validate book exists, then create and return checkout.
    # raise HTTPException(status_code=501, detail="TODO: implement POST /checkouts")
    
    #This is us creating our object instance
    book = db.get(Book, payload.book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    #Now we will define the attribute that are in checkout through the payload
    checkout = Checkout(
        patron_name=payload.patron_name,
        book_id=payload.book_id,
        date=payload.date,
        notes=payload.notes,
    )

    #We need to then stage our object that we have created
    db.add(checkout)

    #We will then add an id to our object instance
    db.commit()

    #We will then use refresh to reload so that the DB 
    db.refresh(checkout)

    #Finally we will return our checkout object
    return checkout
    
        


@app.get("/books/{book_id}/checkouts", response_model=list[CheckoutResponse])
def list_book_checkouts(book_id: int, db:Session = Depends(get_db)) -> list[CheckoutResponse]:
    """Return all checkouts for the given book, or 404 if the book itself doesn't exist."""
    _ = book_id
    # TODO: Return checkouts associated with the given book.
    # raise HTTPException(status_code=501, detail="TODO: implement GET /books/{id}/checkouts")

    #We will then create our book object instance
    book = db.get(Book, book_id)

    #If we dont retrieve a Book, it will raise HTTPEception Status Error 501
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    #We will then return our book.checkouts
    return book.checkouts

