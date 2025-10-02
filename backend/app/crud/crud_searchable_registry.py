from typing import Literal, Dict, Any

_searchable_registry: Dict[Any, Dict[str, Any]] = {}

def searchable(
    column_name: str,
    search_type: Literal["exact", "partial", "prefix", "suffix"] = "partial",
    weight: int = 1,
):
    """
    Marks a column as searchable by storing metadata in a registry.
    """
    def decorator(column):
        # Store metadata in global registry using column id
        _searchable_registry[id(column)] = {
            "type": search_type,
            "weight": weight,
        }
        return column
    
    return decorator

def get_searchable_columns(model_class):
    """
    Get all searchable columns for a model class.
    Returns dict: {column_name: metadata}
    """
    searchable_cols = {}
    
    for attr_name in dir(model_class):
        try:
            attr = getattr(model_class, attr_name)
            if hasattr(attr, "property") and hasattr(attr.property, "columns"):
                for column in attr.property.columns:
                    if id(column) in _searchable_registry:
                        searchable_cols[column.name] = _searchable_registry[id(column)]
        except:
            continue
    
    return searchable_cols