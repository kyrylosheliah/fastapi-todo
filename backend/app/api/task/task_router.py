from app.crud.crud_router import BaseCrudRouter
from .task_service import TaskService
from .task_dtos import TaskCreateDto, TaskUpdateDto
from .task_model import Task
from app.database import get_database
from fastapi import APIRouter

router = APIRouter(
    prefix="/task",
    tags=["task"],
    responses={404: {"description": "Not found"}},
)

task_service = TaskService()

task_router = BaseCrudRouter[Task, TaskCreateDto, TaskUpdateDto](
    service=task_service,
    create_model=TaskCreateDto,
    update_model=TaskUpdateDto,
    get_database=get_database,
    prefix="/task",
    tags=["tasks"]
).router