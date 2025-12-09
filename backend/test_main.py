import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app, get_db
from database import Base
from models import Task

# Use in-memory SQLite for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    """Reset database before each test"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


class TestTaskAPI:
    """Test suite for Task API endpoints"""

    def test_home_endpoint(self):
        """Test home endpoint returns correct message"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["message"] == "Todo API - Ready"

    def test_create_task(self):
        """Test creating a new task"""
        task_data = {
            "title": "Buy groceries",
            "description": "Milk, eggs, bread"
        }
        response = client.post("/api/tasks", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Buy groceries"
        assert data["description"] == "Milk, eggs, bread"
        assert data["completed"] is False
        assert "id" in data
        assert "created_at" in data

    def test_create_task_without_description(self):
        """Test creating a task without description"""
        task_data = {"title": "Simple task"}
        response = client.post("/api/tasks", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Simple task"
        assert data["description"] is None

    def test_create_task_with_empty_title(self):
        """Test creating a task with empty title fails"""
        task_data = {"title": "   ", "description": "Some description"}
        response = client.post("/api/tasks", json=task_data)
        assert response.status_code == 400
        assert "Title cannot be empty" in response.json()["detail"]

    def test_get_tasks_empty(self):
        """Test getting tasks when none exist"""
        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_tasks_returns_only_incomplete(self):
        """Test that only incomplete tasks are returned by default"""
        # Create tasks
        client.post("/api/tasks", json={"title": "Task 1"})
        client.post("/api/tasks", json={"title": "Task 2"})
        client.post("/api/tasks", json={"title": "Task 3"})
        
        # Mark one as completed
        response = client.put("/api/tasks/1", json={"completed": True})
        assert response.status_code == 200
        
        # Get tasks should only return incomplete ones
        response = client.get("/api/tasks")
        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 2
        assert all(not task["completed"] for task in tasks)

    def test_get_tasks_with_limit(self):
        """Test getting tasks with custom limit"""
        # Create 10 tasks
        for i in range(10):
            client.post("/api/tasks", json={"title": f"Task {i+1}"})
        
        # Get with limit=5 (default)
        response = client.get("/api/tasks?limit=5")
        assert response.status_code == 200
        assert len(response.json()) == 5

    def test_get_tasks_most_recent_first(self):
        """Test that tasks are returned most recent first"""
        # Create tasks
        client.post("/api/tasks", json={"title": "First"})
        client.post("/api/tasks", json={"title": "Second"})
        client.post("/api/tasks", json={"title": "Third"})
        
        response = client.get("/api/tasks")
        tasks = response.json()
        assert tasks[0]["title"] == "Third"
        assert tasks[1]["title"] == "Second"
        assert tasks[2]["title"] == "First"

    def test_get_task_by_id(self):
        """Test getting a specific task by ID"""
        # Create a task
        create_response = client.post("/api/tasks", json={"title": "Test Task"})
        task_id = create_response.json()["id"]
        
        # Get the task
        response = client.get(f"/api/tasks/{task_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == "Test Task"

    def test_get_nonexistent_task(self):
        """Test getting a task that doesn't exist"""
        response = client.get("/api/tasks/999")
        assert response.status_code == 404
        assert "Task not found" in response.json()["detail"]

    def test_update_task_title(self):
        """Test updating task title"""
        # Create a task
        create_response = client.post("/api/tasks", json={"title": "Old Title"})
        task_id = create_response.json()["id"]
        
        # Update title
        response = client.put("/api/tasks/{task_id}".format(task_id=task_id), json={"title": "New Title"})
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title"

    def test_update_task_completed(self):
        """Test marking a task as completed"""
        # Create a task
        create_response = client.post("/api/tasks", json={"title": "Task to complete"})
        task_id = create_response.json()["id"]
        
        # Mark as completed
        response = client.put("/api/tasks/{task_id}".format(task_id=task_id), json={"completed": True})
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is True

    def test_update_nonexistent_task(self):
        """Test updating a task that doesn't exist"""
        response = client.put("/api/tasks/999", json={"title": "New Title"})
        assert response.status_code == 404
        assert "Task not found" in response.json()["detail"]

    def test_update_task_with_empty_title(self):
        """Test updating task with empty title fails"""
        # Create a task
        create_response = client.post("/api/tasks", json={"title": "Original Title"})
        task_id = create_response.json()["id"]
        
        # Try to update with empty title
        response = client.put("/api/tasks/{task_id}".format(task_id=task_id), json={"title": "   "})
        assert response.status_code == 400
        assert "Title cannot be empty" in response.json()["detail"]

    def test_delete_task(self):
        """Test deleting a task"""
        # Create a task
        create_response = client.post("/api/tasks", json={"title": "Task to delete"})
        task_id = create_response.json()["id"]
        
        # Delete the task
        response = client.delete(f"/api/tasks/{task_id}")
        assert response.status_code == 200
        
        # Verify it's deleted
        response = client.get(f"/api/tasks/{task_id}")
        assert response.status_code == 404

    def test_delete_nonexistent_task(self):
        """Test deleting a task that doesn't exist"""
        response = client.delete("/api/tasks/999")
        assert response.status_code == 404
        assert "Task not found" in response.json()["detail"]

    def test_create_multiple_tasks_scenario(self):
        """Test a complete scenario with multiple tasks"""
        # Create 3 tasks
        for i in range(3):
            client.post("/api/tasks", json={"title": f"Task {i+1}", "description": f"Description {i+1}"})
        
        # Get tasks
        response = client.get("/api/tasks")
        assert len(response.json()) == 3
        
        # Mark first task as complete
        response = client.put("/api/tasks/3", json={"completed": True})
        assert response.status_code == 200
        
        # Get tasks should now return only 2
        response = client.get("/api/tasks")
        assert len(response.json()) == 2
