from app.crud.crud_service import BaseCrudService
from .category_model import Category


class CategoryService(BaseCrudService[Category]):
    def __init__(self):
        super().__init__(Category)