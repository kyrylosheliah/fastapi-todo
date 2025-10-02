import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://postgres:postgres@localhost:5432/fastapi-todo"

engine = create_engine(
    DATABASE_URL,
    echo=True,
    #connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
BaseDataModel = declarative_base()

# Dependency to get database session
def get_database():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()