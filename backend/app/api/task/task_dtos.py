from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TaskCreateDto(BaseModel):
    title: str = Field(..., min_length=1, description="Task title")
    description: Optional[str] = Field(None, min_length=1, description="Task description")
    due_date: Optional[datetime] = Field(None, description="Task due date")
    status_id: int = Field(..., description="Task status")
    category_id: Optional[int] = Field(None, description="Task category")
    priority: int = Field(..., description="Task priority")
    
    class Config:
        # from_attributes = True  # Pydantic v2 (use orm_mode = True for v1)
        json_schema_extra = {
            "example": {
                "title": "Implement user authentication",
                "description": "Add JWT-based authentication",
                "due_date": "2025-01-01T00:00:00+0000",
                "status_id": 1,
                "category_id": 5,
                "priority": -50,
            }
        }


class TaskUpdateDto(BaseModel):
    title: Optional[str] = Field(None, min_length=1, description="Task title")
    description: Optional[str] = Field(None, min_length=1, description="Task description")
    due_date: Optional[datetime] = Field(None, description="Task due date")
    status_id: Optional[int] = Field(None, description="Task status")
    category_id: Optional[int] = Field(None, description="Task category")
    priority: Optional[int] = Field(None, description="Task priority")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Implement user authentication",
                "description": "Add JWT-based authentication",
                "due_date": "2025-01-01T00:00:00+0000",
                "status_id": 1,
                "category_id": 5,
                "priority": -50,
            }
        }