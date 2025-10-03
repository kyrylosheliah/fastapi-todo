from pydantic import BaseModel, Field, conint
from typing import Dict, Optional


class EntitySearchDto(BaseModel):
    pageNo: Optional[conint(ge=1)] = Field(1, description="Page number (min 1)")
    pageSize: Optional[conint(ge=1, le=20)] = Field(10, description="Items per page (1-20)")
    ascending: Optional[bool] = Field(True, description="Ascending or descending sort")
    orderByColumn: Optional[str] = Field("id", description="Column name to order by")
    criteria: Optional[Dict[str, str]] = Field(default_factory=dict, description="Column-based filters")
    globalFilter: Optional[str] = Field("", description="Global search text")