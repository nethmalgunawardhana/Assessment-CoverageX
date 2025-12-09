from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum


class PriorityEnum(enum.Enum):
    Low = "Low"
    Moderate = "Moderate"
    High = "High"


class StatusEnum(enum.Enum):
    NotStarted = "Not Started"
    InProgress = "In Progress"
    Completed = "Completed"


class Task(Base):
    __tablename__ = "task"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    completed = Column(Boolean, default=False, index=True)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.Moderate, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.NotStarted, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
