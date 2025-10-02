from app.crud.crud_service import BaseCrudService
from .task_model import Task


class TaskService(BaseCrudService[Task]):
    def __init__(self):
        super().__init__(Task)