import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlmodel import SQLModel, create_engine, Session, select
from sqlalchemy import func
from app.api.task.task_model import Task
from app.api.status.status_model import Status
from app.api.category.category_model import Category
from app.api.task.task_router import task_router
from app.api.status.status_router import status_router
from app.api.category.category_router import category_router
from app.database_init import create_initial_if_missing, run_migrations
from pydantic import BaseModel
from datetime import datetime
from app.database import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    SQLModel.metadata.create_all(engine)  # if you still want this
    create_initial_if_missing(engine)
    yield

app = FastAPI(
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_router)
app.include_router(status_router)
app.include_router(category_router)

# class TaskIn(BaseModel):
#     title: str
#     description: str = ""
#     due_date: datetime = None
#     status_id: int = None
#     category_id: int = None
#     priority: int | None = None

# class StatusIn(BaseModel):
#     name: str
#     order: int = None

# class CategoryIn(BaseModel):
#     name: str

# # --- Endpoints ---
# @app.get("/statuses")
# def list_statuses():
#     with Session(engine) as s:
#         return s.exec(select(Status).order_by(Status.order)).all()

# @app.post("/statuses")
# def create_status(payload: StatusIn):
#     with Session(engine) as s:
#         count = s.exec(select(func.count(Status.id))).one()
#         order = payload.order if hasattr(payload, 'order') and payload.order is not None else count
#         st = Status(name=payload.name, order=order)
#         s.add(st)
#         s.commit()
#         s.refresh(st)
#         return st

# @app.patch("/statuses/{status_id}")
# def update_status(status_id: int, payload: dict):
#     with Session(engine) as s:
#         status = s.get(Status, status_id)
#         if not status:
#             raise HTTPException(404, "Status not found")
#         for k, v in payload.items():
#             if hasattr(status, k):
#                 setattr(status, k, v)
#         s.add(status)
#         s.commit()
#         s.refresh(status)
#         return status

# @app.delete("/statuses/{status_id}")
# def delete_status(status_id: int):
#     with Session(engine) as s:
#         status = s.get(Status, status_id)
#         if not status:
#             raise HTTPException(404, "Status not found")
#         # Check if status has tasks
#         has_tasks = s.exec(select(Task).where(Task.status_id == status_id)).first() is not None
#         if has_tasks:
#             raise HTTPException(400, "Cannot delete status with tasks")
#         s.delete(status)
#         s.commit()
#         return {"ok": True}

# @app.get("/categories")
# def list_categories():
#     with Session(engine) as s:
#         return s.exec(select(Category)).all()

# @app.post("/categories")
# def create_category(payload: CategoryIn):
#     with Session(engine) as s:
#         c = Category(name=payload.name)
#         s.add(c)
#         s.commit()
#         s.refresh(c)
#         return c

# @app.get("/tasks")
# def list_tasks():
#     with Session(engine) as s:
#         return s.exec(select(Task).order_by(Task.status_id, Task.priority, Task.created_at)).all()

# @app.post("/tasks")
# def create_task(payload: TaskIn):
#     with Session(engine) as s:
#         # determine priority within status
#         next_pos = 0
#         if payload.status_id is not None:
#             last = s.exec(
#                 select(Task).where(Task.status_id == payload.status_id).order_by(Task.priority.desc())
#             ).first()
#             next_pos = (last.priority + 1) if last else 0
#         t = Task(
#             title=payload.title,
#             description=payload.description,
#             due_date=payload.due_date,
#             status_id=payload.status_id,
#             category_id=payload.category_id,
#             priority=payload.priority if payload.priority is not None else next_pos,
#         )
#         s.add(t)
#         s.commit()
#         s.refresh(t)
#         return t

# @app.patch("/tasks/{task_id}")
# def update_task(task_id: int, payload: dict):
#     with Session(engine) as s:
#         task = s.get(Task, task_id)
#         if not task:
#             raise HTTPException(404, "Task not found")
#         for k, v in payload.items():
#             if hasattr(task, k):
#                 setattr(task, k, v)
#         s.add(task)
#         s.commit()
#         s.refresh(task)
#         return task

# @app.post("/tasks/reorder")
# def reorder_tasks(moves: list[dict]):
#     """Moves is a list of {id, status_id, priority}. Priorities are 0-based within each status."""
#     with Session(engine) as s:
#         # update statuses and positions
#         for m in moves:
#             task = s.get(Task, int(m["id"]))
#             if task:
#                 task.status_id = int(m["status_id"]) if m.get("status_id") is not None else None
#                 task.priority = int(m["priority"]) if m.get("priority") is not None else 0
#                 s.add(task)
#         s.commit()
#         return {"ok": True}

# @app.delete("/tasks/{task_id}")
# def delete_task(task_id: int):
#     with Session(engine) as s:
#         task = s.get(Task, task_id)
#         if not task:
#             raise HTTPException(404, "Task not found")
#         s.delete(task)
#         s.commit()
#         return {"ok": True}
