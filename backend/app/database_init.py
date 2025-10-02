from alembic.config import Config
from alembic import command
from sqlmodel import Session, select
from app.api.status.status_model import Status
from app.database import DATABASE_URL
import logging

logger = logging.getLogger("uvicorn.error")

# # Create all tables
# def init_db():
#     Base.metadata.create_all(bind=engine)

def run_migrations():
    alembic_cfg = Config()
    alembic_cfg.set_main_option("script_location", "alembic")
    alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URL)
    try:
        command.upgrade(alembic_cfg, "head")
        logger.info("Successfully applied Alembic migrations")
    except Exception:
        logger.exception("!!! Alembic migrations failed")

def create_initial_if_missing(engine):
    # ensure some statuses exist
    with Session(engine) as s:
        q = s.exec(select(Status))
        statuses = q.all()
        if not statuses:
            for i, name in enumerate(["In Progress", "Done"]):
                s.add(Status(name=name, order=i))
            s.commit()