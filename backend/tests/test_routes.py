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
def valid_resource_payload() -> dict[str, str]:
    return {
        "name": "Downtown Food Pantry",
        "category": "Food",
        "description": "Emergency food assistance for families.",
        "address": "123 Main St",
        "email": "contact@foodpantry.org",
        "phone": "555-0100",
    }


def test_create_resource_rejects_invalid_email(
    client: TestClient, valid_resource_payload: dict[str, str]
) -> None:
    payload = {**valid_resource_payload, "email": "not-an-email"}

    response = client.post("/resources", json=payload)

    assert response.status_code == 422


def test_create_resource_rejects_invalid_category(
    client: TestClient, valid_resource_payload: dict[str, str]
) -> None:
    payload = {**valid_resource_payload, "category": "Transportation"}

    response = client.post("/resources", json=payload)

    assert response.status_code == 422


def test_create_resource_rejects_missing_required_field(
    client: TestClient, valid_resource_payload: dict[str, str]
) -> None:
    payload = dict(valid_resource_payload)
    payload.pop("name")

    response = client.post("/resources", json=payload)

    assert response.status_code == 422


def test_create_referral_rejects_invalid_date_format(client: TestClient) -> None:
    payload = {
        "family_name": "Lopez Family",
        "resource_id": 1,
        "date": "01/15/2026",
        "notes": "Needs follow-up",
    }

    response = client.post("/referrals", json=payload)

    assert response.status_code == 422


def test_create_referral_rejects_missing_family_name(client: TestClient) -> None:
    payload = {
        "resource_id": 1,
        "date": "2026-01-15",
        "notes": "Needs follow-up",
    }

    response = client.post("/referrals", json=payload)

    assert response.status_code == 422


def test_create_resource_success(
    client: TestClient, valid_resource_payload: dict[str, str]
) -> None:
    response = client.post("/resources", json=valid_resource_payload)

    assert response.status_code == 200
    body = response.json()
    assert isinstance(body["id"], int)
    assert body["name"] == valid_resource_payload["name"]
    assert body["category"] == valid_resource_payload["category"]


def test_list_resources_supports_search_and_category_filter(
    client: TestClient, valid_resource_payload: dict[str, str]
) -> None:
    client.post("/resources", json=valid_resource_payload)
    client.post(
        "/resources",
        json={
            "name": "Career Launch Center",
            "category": "Employment",
            "description": "Job placement support",
            "address": "42 Oak St",
            "email": "careers@example.org",
            "phone": "555-0101",
        },
    )

    response = client.get(
        "/resources", params={"q": "career", "category": "Employment"}
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Career Launch Center"


def test_get_resource_returns_404_for_missing_resource(client: TestClient) -> None:
    response = client.get("/resources/999999")

    assert response.status_code == 404


def test_create_referral_success(
    client: TestClient, valid_resource_payload: dict[str, str]
) -> None:
    resource_response = client.post("/resources", json=valid_resource_payload)
    resource_id = resource_response.json()["id"]

    referral_payload = {
        "family_name": "Nguyen Family",
        "resource_id": resource_id,
        "date": "2026-01-12",
        "notes": "Requested immediate support",
    }

    response = client.post("/referrals", json=referral_payload)

    assert response.status_code == 200
    body = response.json()
    assert isinstance(body["id"], int)
    assert body["resource_id"] == resource_id
    assert body["family_name"] == "Nguyen Family"


def test_create_referral_returns_404_for_missing_resource(client: TestClient) -> None:
    referral_payload = {
        "family_name": "Nguyen Family",
        "resource_id": 999999,
        "date": "2026-01-12",
        "notes": "Requested immediate support",
    }

    response = client.post("/referrals", json=referral_payload)

    assert response.status_code == 404


def test_list_resource_referrals_returns_only_requested_resource(
    client: TestClient, valid_resource_payload: dict[str, str]
) -> None:
    resource_a = client.post("/resources", json=valid_resource_payload).json()
    resource_b = client.post(
        "/resources",
        json={
            "name": "Neighborhood Health Clinic",
            "category": "Healthcare",
            "description": "Primary care",
            "address": "500 Pine St",
            "email": "hello@clinic.org",
            "phone": "555-0102",
        },
    ).json()

    client.post(
        "/referrals",
        json={
            "family_name": "Family A",
            "resource_id": resource_a["id"],
            "date": "2026-01-10",
            "notes": "Food referral",
        },
    )
    client.post(
        "/referrals",
        json={
            "family_name": "Family B",
            "resource_id": resource_b["id"],
            "date": "2026-01-11",
            "notes": "Health referral",
        },
    )

    response = client.get(f"/resources/{resource_a['id']}/referrals")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["resource_id"] == resource_a["id"]
    assert body[0]["family_name"] == "Family A"


def test_list_resource_referrals_returns_404_for_missing_resource(
    client: TestClient,
) -> None:
    response = client.get("/resources/999999/referrals")

    assert response.status_code == 404
