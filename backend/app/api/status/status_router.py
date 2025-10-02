from app.crud.crud_router import BaseCrudRouter
from .status_service import StatusService
from .status_dtos import StatusCreateDto, StatusUpdateDto
from .status_model import Status
from app.database import get_database
from fastapi import APIRouter

router = APIRouter(
    prefix="/status",
    tags=["status"],
    responses={404: {"description": "Not found"}},
)

status_service = StatusService()

status_router = BaseCrudRouter[Status, StatusCreateDto, StatusUpdateDto](
    service=status_service,
    create_model=StatusCreateDto,
    update_model=StatusUpdateDto,
    get_database=get_database,
    prefix="/status",
    tags=["status"]
).router