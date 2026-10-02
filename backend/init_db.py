"""Create database tables after all ORM models have been registered."""

if __package__:
    from .database import Base, engine
    from . import db_models as _db_models
else:
    from database import Base, engine
    import db_models as _db_models


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
