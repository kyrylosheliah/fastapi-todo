from typing import List
from datetime import datetime
from sqlalchemy.orm import mapped_column, relationship, Mapped
from app.crud.crud_searchable_registry import searchable
from app.database import BaseDataModel
from typing import Optional


class Category(BaseDataModel):
    __tablename__ = "category"

    id: Mapped[Optional[int]] = mapped_column(None, primary_key=True)
    name: Mapped[str] = searchable("partial")(
        mapped_column()
    )

    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="category")