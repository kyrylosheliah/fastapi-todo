from typing import List, Dict, Any
from sqlalchemy.inspection import inspect

def is_valid_column(model, column_name: str) -> bool:
    """
    Check if a column exists on the SQLAlchemy model.
    """
    mapper = inspect(model)
    return column_name in mapper.columns