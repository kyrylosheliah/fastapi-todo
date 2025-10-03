from typing import Literal, Dict, Any, List

searchable_registry: Dict[Any, Dict[str, Any]] = {}

# Alternative approach using a class-based registry (more reliable)
def searchable(model_class, column_name: str, search_type: str = "partial", weight: int = 1):
    """
    Manually register a column as searchable.
    Usage:
        register_searchable(MyModel, "name", "partial")
    """
    key = (model_class.__name__, column_name)
    searchable_registry[key] = {
        "type": search_type,
        "weight": weight,
    }

def get_searchable_columns(model_class) -> List[Dict[str, Any]]:
    """
    Get searchable columns from the registry (alternative approach).
    """
    searchable_cols = []
    class_name = model_class.__name__
    
    for (registered_class, column_name), metadata in searchable_registry.items():
        if registered_class == class_name:
            searchable_cols.append({
                "key": column_name,
                "type": metadata["type"],
                "weight": metadata.get("weight", 1),
            })
    
    searchable_cols.sort(key=lambda x: x["weight"], reverse=True)
    return searchable_cols