from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app import app
from backend.database import Base, get_db


@pytest.fixture
def client() -> TestClient:
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Session:
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def valid_book_payload() -> dict[str, str]:
    return {
        "title": "The Hobbit",
        "genre": "Fiction",
        "description": "A hobbit goes on an unexpected journey.",
        "author": "J.R.R. Tolkien",
        "publisher_email": "contact@allenandunwin.org",
        "shelf_location": "FIC-TOL-001",
    }


def test_create_book_rejects_invalid_email(
    client: TestClient, valid_book_payload: dict[str, str]
) -> None:
    payload = {**valid_book_payload, "publisher_email": "not-an-email"}

    response = client.post("/books", json=payload)

    assert response.status_code == 422


def test_create_book_rejects_invalid_genre(
    client: TestClient, valid_book_payload: dict[str, str]
) -> None:
    payload = {**valid_book_payload, "genre": "Mystery"}

    response = client.post("/books", json=payload)

    assert response.status_code == 422


def test_create_book_rejects_missing_required_field(
    client: TestClient, valid_book_payload: dict[str, str]
) -> None:
    payload = dict(valid_book_payload)
    payload.pop("title")

    response = client.post("/books", json=payload)

    assert response.status_code == 422


def test_create_checkout_rejects_invalid_date_format(client: TestClient) -> None:
    payload = {
        "patron_name": "Priya Nair",
        "book_id": 1,
        "date": "01/15/2026",
        "notes": "Needs renewal reminder",
    }

    response = client.post("/checkouts", json=payload)

    assert response.status_code == 422


def test_create_checkout_rejects_missing_patron_name(client: TestClient) -> None:
    payload = {
        "book_id": 1,
        "date": "2026-01-15",
        "notes": "Needs renewal reminder",
    }

    response = client.post("/checkouts", json=payload)

    assert response.status_code == 422


def test_create_book_success(
    client: TestClient, valid_book_payload: dict[str, str]
) -> None:
    response = client.post("/books", json=valid_book_payload)

    assert response.status_code in {200, 201}
    body = response.json()
    assert isinstance(body["id"], int)
    assert body["title"] == valid_book_payload["title"]
    assert body["genre"] == valid_book_payload["genre"]


def test_list_books_supports_search_and_genre_filter(
    client: TestClient, valid_book_payload: dict[str, str]
) -> None:
    client.post("/books", json=valid_book_payload)
    client.post(
        "/books",
        json={
            "title": "Career Skills Handbook",
            "genre": "Reference",
            "description": "Guide to job readiness",
            "author": "Career Services Staff",
            "publisher_email": "careers@example.org",
            "shelf_location": "REF-CSH-001",
        },
    )

    response = client.get(
        "/books", params={"q": "career", "genre": "Reference"}
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["title"] == "Career Skills Handbook"


def test_get_book_returns_404_for_missing_book(client: TestClient) -> None:
    response = client.get("/books/999999")

    assert response.status_code == 404


def test_create_checkout_success(
    client: TestClient, valid_book_payload: dict[str, str]
) -> None:
    book_response = client.post("/books", json=valid_book_payload)
    book_id = book_response.json()["id"]

    checkout_payload = {
        "patron_name": "Marcus Webb",
        "book_id": book_id,
        "date": "2026-01-12",
        "notes": "First-time checkout",
    }

    response = client.post("/checkouts", json=checkout_payload)

    assert response.status_code in {200, 201}
    body = response.json()
    assert isinstance(body["id"], int)
    assert body["book_id"] == book_id
    assert body["patron_name"] == "Marcus Webb"


def test_create_checkout_returns_404_for_missing_book(client: TestClient) -> None:
    checkout_payload = {
        "patron_name": "Marcus Webb",
        "book_id": 999999,
        "date": "2026-01-12",
        "notes": "First-time checkout",
    }

    response = client.post("/checkouts", json=checkout_payload)

    assert response.status_code == 404


def test_list_book_checkouts_returns_only_requested_book(
    client: TestClient, valid_book_payload: dict[str, str]
) -> None:
    book_a = client.post("/books", json=valid_book_payload).json()
    book_b = client.post(
        "/books",
        json={
            "title": "A Brief History of Time",
            "genre": "Non-Fiction",
            "description": "Cosmology for a general audience",
            "author": "Stephen Hawking",
            "publisher_email": "hello@bantam.org",
            "shelf_location": "NF-HAW-003",
        },
    ).json()

    client.post(
        "/checkouts",
        json={
            "patron_name": "Patron A",
            "book_id": book_a["id"],
            "date": "2026-01-10",
            "notes": "Fiction checkout",
        },
    )
    client.post(
        "/checkouts",
        json={
            "patron_name": "Patron B",
            "book_id": book_b["id"],
            "date": "2026-01-11",
            "notes": "Non-fiction checkout",
        },
    )

    response = client.get(f"/books/{book_a['id']}/checkouts")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["book_id"] == book_a["id"]
    assert body[0]["patron_name"] == "Patron A"


def test_list_book_checkouts_returns_404_for_missing_book(
    client: TestClient,
) -> None:
    response = client.get("/books/999999/checkouts")

    assert response.status_code == 404
