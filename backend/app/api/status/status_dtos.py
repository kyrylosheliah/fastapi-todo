from pydantic import BaseModel, Field
from typing import Optional


class StatusCreateDto(BaseModel):
    name: str = Field(..., min_length=1, description="Status name")
    order: int = Field(..., description="Status order")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "In Progress",
                "order": 50,
            }
        }


class StatusUpdateDto(BaseModel):
    name: Optional[str] = Field(None, min_length=1, description="Status name")
    order: Optional[int] = Field(None, description="Status order")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "In Progress",
                "order": 50,
            }
        }