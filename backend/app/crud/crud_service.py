from typing import Type, TypeVar, Generic, List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc
from fastapi import HTTPException, status
from pydantic import BaseModel
from .crud_searchable_registry import get_searchable_columns
from .crud_search_utils import is_valid_column
from .crud_search_dtos import EntitySearchDto

T = TypeVar("T") # SQLAlchemy model type

class BaseCrudService(Generic[T]):
    def __init__(self, model: Type[T]):
        self.model = model

    def search(
        self,
        db: Session,
        req: EntitySearchDto,
    ) -> Dict[str, Any]:
        query = db.query(self.model)

        # TODO: per-column filter ability matching
        # optional filtering
        # for column, criterion in req.criteria.items():
        #     if not is_valid_column(self.model, column):
        #         raise HTTPException(
        #             status_code=status.HTTP_400_BAD_REQUEST,
        #             detail=f"Invalid criterion column name: {column}",
        #         )
        #     if criterion != "":
        #         query = query.filter(getattr(self.model, column) == criterion)

        # global filtering (search)
        searchable_fields = get_searchable_columns(self.model)
        filter_value = req.globalFilter.strip()
        if filter_value:
            global_conditions = []
            for idx, field in enumerate(searchable_fields):
                key = field["key"]
                ftype = field["type"]
                col = getattr(self.model, key)

                if ftype == "exact":
                    global_conditions.append(col == filter_value)
                elif ftype == "partial":
                    global_conditions.append(col.ilike(f"%{filter_value}%"))
                elif ftype == "prefix":
                    global_conditions.append(col.ilike(f"{filter_value}%"))
                elif ftype == "suffix":
                    global_conditions.append(col.ilike(f"%{filter_value}"))
            if global_conditions:
                query = query.filter(or_(*global_conditions))

        # ordering
        if not is_valid_column(self.model, req.orderByColumn):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid orderByColumn: {req.orderByColumn}",
            )

        order_col = getattr(self.model, req.orderByColumn)
        query = query.order_by(asc(order_col) if req.ascending else desc(order_col))

        # pagination
        to_skip = (req.pageNo - 1) * req.pageSize
        to_take = req.pageSize
        total_count = query.count()
        items = query.offset(to_skip).limit(to_take).all()

        page_modulo = total_count % req.pageSize
        page_count = (total_count - page_modulo) // req.pageSize + (0 if page_modulo == 0 else 1)

        return {
            "pageCount": page_count,
            "items": items,
        }

    def get_all(self, db: Session) -> List[T]:
        try:
            return db.query(self.model).all()
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    def get(self, db: Session, entity_id: int) -> T:
        entity = db.query(self.model).filter(self.model.id == entity_id).first()
        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{self.model.__name__} with id={entity_id} not found",
            )
        return entity

    def create(self, db: Session, data: Dict[str, Any]) -> T:
        try:
            entity = self.model(**data)
            db.add(entity)
            db.commit()
            db.refresh(entity)
            return entity
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    def update(self, db: Session, entity_id: int, data: Dict[str, Any]) -> T:
        entity = self.get(db, entity_id)
        if not entity:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")

        try:
            for key, value in data.items():
                setattr(entity, key, value)
            setattr(entity, "id", entity_id)
            db.commit()
            db.refresh(entity)
            return entity
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    def remove(self, db: Session, entity_id: int) -> None:
        entity = self.get(db, entity_id)
        if not entity:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")

        try:
            db.delete(entity)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
