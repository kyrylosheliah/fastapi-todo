# main.py
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run Alembic migrations without touching logging
    from alembic.config import Config
    from alembic import command
    cfg = Config("alembic.ini")
    cfg.attributes['configure_logger'] = False  # 👈 critical line
    command.upgrade(cfg, "head")
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def root():
    return {"hello": "world"}

@app.get("/crash")
def crash():
    raise RuntimeError("💥 test crash")
