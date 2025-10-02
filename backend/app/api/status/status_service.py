from app.crud.crud_service import BaseCrudService
from .status_model import Status


class StatusService(BaseCrudService[Status]):
    def __init__(self):
        super().__init__(Status)