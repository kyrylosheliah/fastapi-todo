import os
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

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    create_initial_if_missing(engine)

# --- Pydantic models for payloads (keeps code short) ---
class TaskIn(BaseModel):
    title: str
    description: str = ""
    due_date: datetime = None
    status_id: int = None
    category_id: int = None

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
        return s.exec(select(Task)).all()

@app.post("/tasks")
def create_task(payload: TaskIn):
    with Session(engine) as s:
        t = Task(title=payload.title, description=payload.description, due_date=payload.due_date, status_id=payload.status_id, category_id=payload.category_id)
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

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    with Session(engine) as s:
        task = s.get(Task, task_id)
        if not task:
            raise HTTPException(404, "Task not found")
        s.delete(task)
        s.commit()
        return {"ok": True}
