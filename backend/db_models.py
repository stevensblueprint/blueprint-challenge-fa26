from __future__ import annotations

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

try:
    from .database import Base
except ImportError:
    from database import Base


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(64), nullable=False)

    referrals: Mapped[list["Referral"]] = relationship(
        "Referral", back_populates="resource", cascade="all, delete-orphan"
    )


class Referral(Base):
    __tablename__ = "referrals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    family_name: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("resources.id"), index=True, nullable=False
    )
    date: Mapped[Date] = mapped_column(Date, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False)

    resource: Mapped[Resource] = relationship("Resource", back_populates="referrals")
