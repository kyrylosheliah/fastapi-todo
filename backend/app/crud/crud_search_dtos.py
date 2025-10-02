from pydantic import BaseModel, Field, conint
from typing import Dict


class EntitySearchDto(BaseModel):
    pageNo: conint(ge=1) = Field(1, description="Page number (min 1)")
    pageSize: conint(ge=1, le=20) = Field(10, description="Items per page (1-20)")
    ascending: bool = Field(True, description="Ascending or descending sort")
    orderByColumn: str = Field("id", description="Column name to order by")
    criteria: Dict[str, str] = Field(default_factory=dict, description="Column-based filters")
    globalFilter: str = Field("", description="Global search text")

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class SearchEntitiesDto(BaseModel):
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Search filters")
    sort_by: Optional[str] = Field(default=None, description="Field to sort by")
    sort_order: Optional[str] = Field(default='asc', description="Sort order: asc or desc")
    limit: Optional[int] = Field(default=None, ge=1, description="Maximum number of results")
    offset: Optional[int] = Field(default=None, ge=0, description="Number of results to skip")
    
    class Config:
        json_schema_extra = {
            "example": {
                "filters": {"title": "Task", "status": "todo"},
                "sort_by": "id",
                "sort_order": "desc",
                "limit": 10,
                "offset": 0
            }
        }
