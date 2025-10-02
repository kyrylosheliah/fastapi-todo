from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.crud.crud_searchable_registry import searchable
from app.database import BaseDataModel
from typing import Optional


class Task(BaseDataModel):
    __tablename__ = "task"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[Optional[str]] = searchable("title", "partial")(
        mapped_column()
    )
    description: Mapped[Optional[str]] = searchable("description", "partial")(
        mapped_column(nullable=True)
    )
    due_date: Mapped[datetime] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    priority: Mapped[int] = mapped_column(default=0)

    status_id: Mapped[Optional[int]] = mapped_column(ForeignKey("status.id"), nullable=True)
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("category.id"), nullable=True)
    
    status: Mapped[Optional["Status"]] = relationship(back_populates="tasks")
    category: Mapped[Optional["Category"]] = relationship(back_populates="tasks")