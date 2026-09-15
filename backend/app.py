from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from .models import (
        ReferralCreate,
        ReferralResponse,
        ResourceCategory,
        ResourceCreate,
        ResourceResponse,
    )
except ImportError:
    from models import (
        ReferralCreate,
        ReferralResponse,
        ResourceCategory,
        ResourceCreate,
        ResourceResponse,
    )

app = FastAPI(title="CommunityBridge API Starter")

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


@app.post("/resources", response_model=ResourceResponse)
def create_resource(payload: ResourceCreate) -> ResourceResponse:
    _ = payload
    # TODO: Implement persistence and return the newly created resource.
    raise HTTPException(status_code=501, detail="TODO: implement POST /resources")


@app.get("/resources", response_model=list[ResourceResponse])
def list_resources(q: str | None = None, category: ResourceCategory | None = None) -> list[ResourceResponse]:
    _ = q
    _ = category
    # TODO: Implement search by name (q) and filter by category.
    raise HTTPException(status_code=501, detail="TODO: implement GET /resources")


@app.get("/resources/{resource_id}", response_model=ResourceResponse)
def get_resource(resource_id: int) -> ResourceResponse:
    _ = resource_id
    # TODO: Return a single resource by id, or 404 if not found.
    raise HTTPException(status_code=501, detail="TODO: implement GET /resources/{id}")


@app.post("/referrals", response_model=ReferralResponse)
def create_referral(payload: ReferralCreate) -> ReferralResponse:
    _ = payload
    # TODO: Validate resource exists, then create and return referral.
    raise HTTPException(status_code=501, detail="TODO: implement POST /referrals")


@app.get("/resources/{resource_id}/referrals", response_model=list[ReferralResponse])
def list_resource_referrals(resource_id: int) -> list[ReferralResponse]:
    _ = resource_id
    # TODO: Return referrals associated with the given resource.
    raise HTTPException(status_code=501, detail="TODO: implement GET /resources/{id}/referrals")
