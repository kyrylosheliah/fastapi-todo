from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class Status(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    order: int = 0
    tasks: List["Task"] = Relationship(back_populates="status")

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    tasks: List["Task"] = Relationship(back_populates="category")

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    priority: int = 0

    status_id: Optional[int] = Field(default=None, foreign_key="status.id")
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")

    status: Optional[Status] = Relationship(back_populates="tasks")
    category: Optional[Category] = Relationship(back_populates="tasks")
