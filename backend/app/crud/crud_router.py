from abc import ABC, abstractmethod
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Generic, TypeVar, Type, List, Callable
from .crud_service import BaseCrudService
from .crud_search_dtos import SearchEntitiesDto

from app.crud.crud_service import BaseCrudService

T = TypeVar("T") # SQLAlchemy model
CreateDto = TypeVar("CreateDto", bound=BaseModel)
UpdateDto = TypeVar("UpdateDto", bound=BaseModel)


class BaseCrudRouter(Generic[T, CreateDto, UpdateDto]):
    def __init__(
        self,
        service: BaseCrudService[T],
        create_model: Type[CreateDto],
        update_model: Type[UpdateDto],
        get_database: Callable,
        prefix: str = "",
        tags: List[str] = None
    ):
        self.service = service
        self.create_model = create_model
        self.update_model = update_model
        self.router = APIRouter(prefix=prefix, tags=tags or [])
        self.get_database = get_database
        # ...
        self._register_routes()

    def _register_routes(self):
        @self.router.post("/search")
        def search(
            search_dto: SearchEntitiesDto,
            db: Session = Depends(self.get_database)
        ):
            return self.service.search(db, search_dto)
        
        @self.router.get("/all")
        def get_all(db: Session = Depends(self.get_database)):
            return self.service.get_all(db)
        
        @self.router.get("/{id}")
        def get(id: int, db: Session = Depends(self.get_database)):
            return self.service.get(db, id)
        
        @self.router.post("/", status_code=status.HTTP_201_CREATED)
        def create(
            create_dto: self.create_model,
            db: Session = Depends(self.get_database)
        ):
            return self.service.create(db, create_dto.model_dump())
        
        @self.router.put("/{id}")
        def update(
            id: int,
            update_dto: self.update_model,
            db: Session = Depends(self.get_database)
        ):
            return self.service.update(db, id, update_dto.model_dump(exclude_unset=True))
        
        @self.router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
        def remove(id: int, db: Session = Depends(self.get_database)):
            return self.service.remove(db, id)