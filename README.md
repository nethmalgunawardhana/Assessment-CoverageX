# Todo Application - Technical Assessment

A full-stack todo application with React/Next.js frontend, FastAPI backend, and PostgreSQL database.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Network                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Frontend   │    │   Backend    │    │   Cloud DB   │   │
│  │  Next.js     │───→│   FastAPI    │───→│  PostgreSQL  │   │
│  │   Port 3000  │    │   Port 8000  │    │  (Neon/AWS)  │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Note:** Database is hosted on cloud (Neon PostgreSQL), not local.

## Features

- ✅ Create todo tasks with title and description
- ✅ View most recent 5 incomplete tasks
- ✅ Mark tasks as completed (removes from list)
- ✅ REST API with CRUD operations
- ✅ PostgreSQL database with proper schema
- ✅ Comprehensive unit and integration tests (Backend & Frontend)
- ✅ End-to-End (E2E) tests with Playwright (60+ test cases)
- ✅ Docker containerization
- ✅ CORS enabled for frontend-backend communication

## Technology Stack

### Frontend
- **Next.js 15** - React framework with TypeScript
- **Tailwind CSS** - Styling
- **React Hooks** - State management

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation and serialization
- **PostgreSQL** - Cloud-hosted relational database (Neon)
- **Psycopg2** - PostgreSQL adapter with SSL support

### Testing & Deployment
- **Pytest** - Backend unit and integration testing
- **Jest & React Testing Library** - Frontend unit testing
- **Playwright** - End-to-End (E2E) testing with cross-browser support
- **Docker & Docker Compose** - Containerization
- **psycopg2** - PostgreSQL adapter

## Database Schema

### Task Table
```sql
CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(1000),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}

Response (201):
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2024-12-09T10:30:00",
  "updated_at": "2024-12-09T10:30:00"
}
```

### Get Tasks (Most Recent 5 Incomplete)
```
GET /api/tasks?limit=5

Response (200):
[
  {
    "id": 3,
    "title": "Task 3",
    "description": "Description 3",
    "completed": false,
    "created_at": "2024-12-09T10:35:00",
    "updated_at": "2024-12-09T10:35:00"
  },
  ...
]
```

### Mark Task as Completed
```
PUT /api/tasks/{id}
Content-Type: application/json

{
  "completed": true
}

Response (200):
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2024-12-09T10:30:00",
  "updated_at": "2024-12-09T10:40:00"
}
```

### Get Specific Task
```
GET /api/tasks/{id}

Response (200):
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2024-12-09T10:30:00",
  "updated_at": "2024-12-09T10:30:00"
}
```

### Delete Task
```
DELETE /api/tasks/{id}

Response (200):
{
  "message": "Task deleted successfully"
}
```

## Setup & Running

### Prerequisites
- Docker (>= 20.10) and Docker Compose (>= 2.0)
- Cloud PostgreSQL database (Neon, AWS RDS, Azure Database, etc.)
- Connection string from your cloud provider

### Configuration

1. **Update `.env` file** with your cloud PostgreSQL connection:

```bash
# .env (in project root)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require&channel_binding=require
API_HOST=0.0.0.0
API_PORT=8000
```

**Example for Neon:**
```bash
DATABASE_URL=postgresql://neondb_owner:npg_xxxxx@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

⚠️ **SECURITY NOTE:** Never commit `.env` to version control. It's already in `.gitignore`.

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Configure database in .env
echo DATABASE_URL=<your-cloud-db-url> > .env

# Start backend server
uvicorn main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
# IMPORTANT: URL must include /api path
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start development server
npm run dev
```

**Note:** The API URL must include the `/api` path. Without it, API calls will fail with 404 errors.

## Running with Docker Compose (Recommended)

```bash
# Navigate to project root
cd technical-assessment

# Build Docker images
docker-compose build

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**What Gets Started:**
- ✅ FastAPI Backend (port 8000)
- ✅ Next.js Frontend (port 3000)
- ✅ Connected to your cloud PostgreSQL database

## Testing

### Backend Tests

#### Run Backend Unit Tests
```bash
cd backend

# Run all tests
pytest test_main.py -v

# Run tests with coverage
pytest test_main.py -v --cov=. --cov-report=html

# View coverage report
# Open htmlcov/index.html in browser
```

#### Backend Test Coverage
The backend includes 18 comprehensive test cases covering:
- ✅ Creating tasks
- ✅ Fetching tasks (filtering by completion status)
- ✅ Marking tasks as complete
- ✅ Updating task details
- ✅ Deleting tasks
- ✅ Error handling and validation
- ✅ Edge cases (empty titles, non-existent tasks, etc.)

**Target Coverage: > 90%**

### Frontend Tests

#### Run Frontend Unit Tests
```bash
cd frontend

# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### Frontend Unit Test Coverage
The frontend includes comprehensive unit tests for the TodoApp component covering:
- ✅ Component rendering and UI elements
- ✅ Dark mode toggle functionality
- ✅ Task creation with validation
- ✅ Task operations (complete, delete)
- ✅ Modal interactions
- ✅ Form validation and error handling
- ✅ Status percentage calculations
- ✅ Loading states

### End-to-End (E2E) Tests

#### Prerequisites for E2E Tests
1. **Backend must be running**:
   ```bash
   cd backend
   .\venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac

   uvicorn main:app --reload --port 8000
   ```

2. **Install Playwright browsers** (first time only):
   ```bash
   cd frontend
   npx playwright install chromium
   ```

#### Run E2E Tests
```bash
cd frontend

# Run all E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI (interactive, recommended for debugging)
npm run test:e2e:ui

# Run E2E tests with visible browser
npm run test:e2e:headed

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run E2E tests on Chromium only (faster)
npm run test:e2e:chromium

# View E2E test report
npm run test:e2e:report
```

#### E2E Test Coverage
The E2E test suite includes 60+ comprehensive tests across 5 test files:

**1. Basic UI Tests** (`app.spec.ts`)
- Application loading and layout
- Dark mode verification
- Task Status section display
- Empty state handling
- Responsive design (desktop, tablet, mobile)

**2. Add Task Functionality** (`add-task.spec.ts`)
- Modal open/close operations
- Form validation
- Task creation with title and description
- Priority and status selection
- Form reset after creation
- Multiple task creation

**3. Task Operations** (`task-operations.spec.ts`)
- Marking tasks as complete
- Deleting tasks
- Loading states during operations
- Multiple task operations
- Status percentage updates

**4. UI Interactions** (`ui-interactions.spec.ts`)
- Dark/Light mode toggle
- Theme consistency
- Toast notifications
- Button interactions
- Date display formatting
- Mobile responsiveness

**5. API Integration** (`api-integration.spec.ts`)
- GET/POST/PUT/DELETE request validation
- Request payload verification
- Network delay handling
- Data persistence
- Error handling
- Special character encoding

**E2E Test Notes**:
- Tests require backend API running on `http://localhost:8000`
- Frontend dev server auto-starts via Playwright config
- Tests use real API calls (not mocked)
- Comprehensive coverage of user workflows
- Cross-browser testing supported (Chromium, Firefox, WebKit)

For detailed E2E testing documentation, see [`frontend/e2e/README.md`](frontend/e2e/README.md)

## Frontend Components

### TodoApp Component (`app/components/TodoApp.tsx`)
- **State Management**: React hooks (useState, useEffect)
- **Features**:
  - Task form with title and description inputs
  - Real-time API integration
  - Error handling with user feedback
  - Loading states
  - Responsive design with Tailwind CSS

## Code Quality

### Backend
- **Clean Code Principles**:
  - Separation of concerns (database, models, schemas, API)
  - Type hints throughout
  - Docstrings for API endpoints
  - Input validation with Pydantic
  
- **SOLID Principles**:
  - Single Responsibility: Models, schemas, and routes separated
  - Dependency Injection: Database session injection via FastAPI dependency
  - Interface Segregation: Specific schemas for create/update operations

### Frontend
- **React Best Practices**:
  - Functional components with hooks
  - Proper error handling
  - Loading state management
  - TypeScript for type safety

## Environment Variables

### `.env` (Root - Cloud Database)
```bash
# Your cloud PostgreSQL connection string
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require&channel_binding=require

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

**Never commit this file to version control!**

### `backend/.env`
```bash
# Backend inherits DATABASE_URL from root .env
API_HOST=0.0.0.0
API_PORT=8000
```

### `frontend/.env.local`
```bash
# Frontend API endpoint
# IMPORTANT: Must include /api path - backend routes are under /api/tasks
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# For Docker deployment, use service name:
# NEXT_PUBLIC_API_URL=http://backend:8000/api
```

## Stopping Services

### Docker Compose
```bash
# Stop all containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Troubleshooting

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- **Important:** URL must include `/api` path: `http://localhost:8000/api`
- Verify CORS is enabled (enabled by default)
- For Docker: use `http://backend:8000/api` instead of `http://localhost:8000/api`

### Database connection error
- Verify `DATABASE_URL` is correct and complete
- Check cloud database credentials are correct
- Ensure SSL mode is set to `require`
- Verify network/firewall allows connection to cloud database
- Check if cloud database is online and accessible

### Docker port conflicts
```bash
# Kill process on specific port (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Services won't start
```bash
# Check logs
docker-compose logs -f

# Rebuild images
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Project Structure

```
technical-assessment/
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   └── TodoApp.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── package.json
│   ├── Dockerfile
│   └── .env.local
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── test_main.py         # Comprehensive test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── docker-compose.yml       # Multi-container orchestration
└── README.md
```

## Cloud Database Setup

This application uses **Cloud PostgreSQL** (Neon, AWS RDS, Azure Database, etc.) instead of a local database.

### Advantages
✅ No local database management required  
✅ Automatic backups and high availability  
✅ Easy scaling and upgrades  
✅ Production-ready infrastructure  
✅ Better for team collaboration  

### Supported Cloud Providers
- **Neon PostgreSQL** (Recommended) - https://neon.tech
- AWS RDS PostgreSQL
- Azure Database for PostgreSQL
- DigitalOcean Managed PostgreSQL
- Google Cloud SQL

### Getting Connection String
1. Create a database on your cloud provider
2. Copy the PostgreSQL connection string
3. Paste it in `.env` as `DATABASE_URL`

**Format:** `postgresql://user:password@host:port/database?sslmode=require&channel_binding=require`

For detailed Docker setup, see `DOCKER_GUIDE.md` and `CLOUD_DATABASE_SETUP.md`.

## License

This project is part of a technical assessment and is provided as-is.
