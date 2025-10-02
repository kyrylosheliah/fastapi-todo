from pydantic import BaseModel, Field
from typing import Optional


class CategoryCreateDto(BaseModel):
    name: str = Field(..., min_length=1, description="Category name")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Feature",
            }
        }


class CategoryUpdateDto(BaseModel):
    name: str = Field(None, min_length=1, description="Category name")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Feature",
            }
        }