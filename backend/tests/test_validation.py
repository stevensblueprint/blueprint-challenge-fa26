from backend.tests.test_routes import client, valid_book_payload

import pytest


@pytest.mark.parametrize("field", ["title", "description", "author", "shelf_location"])
def test_blank_book_fields(client, valid_book_payload, field):
    response = client.post("/books", json={**valid_book_payload, field: "   "})
    assert response.status_code == 422
    assert client.get("/books").json() == []


@pytest.mark.parametrize("field,limit", [("title", 255), ("author", 255), ("shelf_location", 64)])
def test_database_length_limits(client, valid_book_payload, field, limit):
    response = client.post("/books", json={**valid_book_payload, field: "a" * (limit + 1)})
    assert response.status_code == 422


@pytest.mark.parametrize("query", ["%", "_"])
def test_search_treats_wildcards_as_text(client, valid_book_payload, query):
    client.post("/books", json=valid_book_payload)
    title = f"A {query} guide"
    client.post("/books", json={**valid_book_payload, "title": title})
    matches = client.get("/books", params={"q": query}).json()
    assert [book["title"] for book in matches] == [title]


def test_book_details_and_checkout_order(client, valid_book_payload):
    book = client.post("/books", json=valid_book_payload).json()
    assert client.get(f"/books/{book['id']}").json() == book
    assert client.get(f"/books/{book['id']}/checkouts").json() == []
    for day in ["2026-01-01", "2026-02-01", "2026-01-15"]:
        response = client.post("/checkouts", json={
            "book_id": book["id"], "patron_name": "Patron", "date": day, "notes": "",
        })
        assert response.status_code == 201
    history = client.get(f"/books/{book['id']}/checkouts").json()
    assert [entry["date"] for entry in history] == ["2026-02-01", "2026-01-15", "2026-01-01"]


def test_blank_patron_name(client, valid_book_payload):
    book = client.post("/books", json=valid_book_payload).json()
    response = client.post("/checkouts", json={
        "book_id": book["id"], "patron_name": "  ", "date": "2026-01-01", "notes": "",
    })
    assert response.status_code == 422
