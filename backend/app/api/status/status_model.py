from typing import List
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import mapped_column, relationship, Mapped
from app.crud.crud_searchable_registry import searchable
from app.database import BaseDataModel

class Status(BaseDataModel):
    __tablename__ = "status"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = searchable("partial")(
        mapped_column()
    )
    order: Mapped[int] = mapped_column(default=0)

    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="status")