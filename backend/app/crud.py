from sqlmodel import Session, select
from .models import Task, Status, Category

def create_initial_if_missing(engine):
    # ensure some statuses exist
    with Session(engine) as s:
        q = s.exec(select(Status))
        statuses = q.all()
        if not statuses:
            for i, name in enumerate(["In Progress", "Done"]):
                s.add(Status(name=name, order=i))
            s.commit()
