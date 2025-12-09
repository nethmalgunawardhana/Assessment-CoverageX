from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Literal["Low", "Moderate", "High"] = "Moderate"
    status: Literal["Not Started", "In Progress", "Completed"] = "Not Started"


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[Literal["Low", "Moderate", "High"]] = None
    status: Optional[Literal["Not Started", "In Progress", "Completed"]] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
