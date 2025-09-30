import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlmodel import SQLModel, create_engine, Session, select
from .models import Task, Status, Category
from .crud import create_initial_if_missing
from pydantic import BaseModel
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://postgres:postgres@localhost:5432/fastapi-todo"
engine = create_engine(DATABASE_URL, echo=False)

@asynccontextmanager
async def lifespan(app_ctx: FastAPI):
    # Run migrations and ensure tables exist
    os.environ["DATABASE_URL"] = DATABASE_URL
    from alembic.config import Config
    from alembic import command
    alembic_ini_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
    alembic_cfg = Config(alembic_ini_path)
    try:
        command.upgrade(alembic_cfg, "head")
    except Exception:
        # Do not crash the server if migrations fail; log in real setup
        pass
    SQLModel.metadata.create_all(engine)
    create_initial_if_missing(engine)
    yield

app = FastAPI(lifespan=lifespan, docs_url="/docs", redoc_url="/redoc", openapi_url="/openapi.json")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- Pydantic models for payloads (keeps code short) ---
class TaskIn(BaseModel):
    title: str
    description: str = ""
    due_date: datetime = None
    status_id: int = None
    category_id: int = None
    position: int | None = None

class StatusIn(BaseModel):
    name: str

class CategoryIn(BaseModel):
    name: str

# --- Endpoints ---
@app.get("/statuses")
def list_statuses():
    with Session(engine) as s:
        return s.exec(select(Status).order_by(Status.order)).all()

@app.post("/statuses")
def create_status(payload: StatusIn):
    with Session(engine) as s:
        count = s.exec(select(Status)).count()
        st = Status(name=payload.name, order=count)
        s.add(st)
        s.commit()
        s.refresh(st)
        return st

@app.get("/categories")
def list_categories():
    with Session(engine) as s:
        return s.exec(select(Category)).all()

@app.post("/categories")
def create_category(payload: CategoryIn):
    with Session(engine) as s:
        c = Category(name=payload.name)
        s.add(c)
        s.commit()
        s.refresh(c)
        return c

@app.get("/tasks")
def list_tasks():
    with Session(engine) as s:
        return s.exec(select(Task).order_by(Task.status_id, Task.position, Task.created_at)).all()

@app.post("/tasks")
def create_task(payload: TaskIn):
    with Session(engine) as s:
        # determine position within status
        next_pos = 0
        if payload.status_id is not None:
            last = s.exec(
                select(Task).where(Task.status_id == payload.status_id).order_by(Task.position.desc())
            ).first()
            next_pos = (last.position + 1) if last else 0
        t = Task(
            title=payload.title,
            description=payload.description,
            due_date=payload.due_date,
            status_id=payload.status_id,
            category_id=payload.category_id,
            position=payload.position if payload.position is not None else next_pos,
        )
        s.add(t)
        s.commit()
        s.refresh(t)
        return t

@app.patch("/tasks/{task_id}")
def update_task(task_id: int, payload: dict):
    with Session(engine) as s:
        task = s.get(Task, task_id)
        if not task:
            raise HTTPException(404, "Task not found")
        for k, v in payload.items():
            if hasattr(task, k):
                setattr(task, k, v)
        s.add(task)
        s.commit()
        s.refresh(task)
        return task

@app.post("/tasks/reorder")
def reorder_tasks(moves: list[dict]):
    """Moves is a list of {id, status_id, position}. Positions are 0-based within each status."""
    with Session(engine) as s:
        # update statuses and positions
        for m in moves:
            task = s.get(Task, int(m["id"]))
            if task:
                task.status_id = int(m["status_id"]) if m.get("status_id") is not None else None
                task.position = int(m["position"]) if m.get("position") is not None else 0
                s.add(task)
        s.commit()
        return {"ok": True}

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    with Session(engine) as s:
        task = s.get(Task, task_id)
        if not task:
            raise HTTPException(404, "Task not found")
        s.delete(task)
        s.commit()
        return {"ok": True}
