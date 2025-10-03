from pydantic import BaseModel, Field, conint
from typing import Dict


class EntitySearchDto(BaseModel):
    pageNo: conint(ge=1) = Field(1, description="Page number (min 1)")
    pageSize: conint(ge=1, le=20) = Field(10, description="Items per page (1-20)")
    ascending: bool = Field(True, description="Ascending or descending sort")
    orderByColumn: str = Field("id", description="Column name to order by")
    criteria: Dict[str, str] = Field(default_factory=dict, description="Column-based filters")
    globalFilter: str = Field("", description="Global search text")