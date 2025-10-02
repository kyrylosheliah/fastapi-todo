from app.crud.crud_router import BaseCrudRouter
from .category_service import CategoryService
from .category_dtos import CategoryCreateDto, CategoryUpdateDto
from .category_model import Category
from app.database import get_database
from fastapi import APIRouter

router = APIRouter(
    prefix="/category",
    tags=["category"],
    responses={404: {"description": "Not found"}},
)

category_service = CategoryService()

category_router = BaseCrudRouter[Category, CategoryCreateDto, CategoryUpdateDto](
    service=category_service,
    create_model=CategoryCreateDto,
    update_model=CategoryUpdateDto,
    get_database=get_database,
    prefix="/category",
    tags=["category"]
).router