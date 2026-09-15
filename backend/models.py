from __future__ import annotations

import enum
from datetime import date

from pydantic import BaseModel, EmailStr


class ResourceCategory(str, enum.Enum):
    FOOD = "Food"
    HOUSING = "Housing"
    EDUCATION = "Education"
    HEALTHCARE = "Healthcare"
    EMPLOYMENT = "Employment"
    OTHER = "Other"


class ResourceCreate(BaseModel):
    name: str
    category: ResourceCategory
    description: str
    address: str
    email: EmailStr
    phone: str


class ResourceResponse(ResourceCreate):
    id: int


class ReferralCreate(BaseModel):
    family_name: str
    resource_id: int
    date: date
    notes: str


class ReferralResponse(ReferralCreate):
    id: int
