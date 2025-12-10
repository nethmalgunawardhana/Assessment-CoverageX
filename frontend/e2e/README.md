# End-to-End (E2E) Tests

This directory contains comprehensive end-to-end tests for the Todo application using Playwright.

## Test Files

### 1. **app.spec.ts** - Basic UI Tests
Tests the fundamental UI components and layout:
- Application loads successfully
- Dark mode default display
- Task Status section visibility
- Empty state display
- Responsive layout across devices (desktop, tablet, mobile)

### 2. **add-task.spec.ts** - Add Task Functionality
Tests all aspects of adding new tasks:
- Opening and closing the add task modal
- Form validation (empty title error)
- Successfully adding tasks with title only
- Adding tasks with title and description
- Custom priority selection (Low, Moderate, High)
- Custom status selection (Not Started, In Progress, Completed)
- Form reset after successful creation
- Adding multiple tasks sequentially

### 3. **task-operations.spec.ts** - Task Operations
Tests task management operations:
- Marking tasks as done/completed
- Deleting tasks
- Loading states during operations
- Completing multiple tasks
- Deleting multiple tasks
- Handling tasks with different priorities
- Empty state after all tasks completed
- Status percentage updates

### 4. **ui-interactions.spec.ts** - UI Interactions
Tests user interface interactions:
- Dark mode to light mode toggle
- Light mode to dark mode toggle
- Theme consistency in modals
- Current date display
- Priority and status dropdown options
- Priority badge colors
- Radio buttons for task completion
- Action buttons visibility
- Toast notifications
- Circular progress indicators
- Date format display
- Button hover effects
- Modal styling
- Mobile responsiveness

### 5. **api-integration.spec.ts** - API Integration
Tests backend API integration:
- Loading tasks from API on page load
- POST requests when creating tasks
- PUT requests when completing tasks
- DELETE requests when deleting tasks
- API response handling and UI updates
- Request payload validation
- Network delay handling
- Task refetching after operations
- Loading indicators
- Data consistency after page reload
- Rapid successive API calls
- Special character encoding
- Empty description handling

## Running E2E Tests

### Prerequisites
1. **Backend API must be running** on `http://localhost:8000`:
   ```bash
   cd backend
   .\venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac

   uvicorn main:app --reload --port 8000
   ```
2. Make sure the database is accessible
3. Install Playwright browsers (first time only):
   ```bash
   # Install Chromium only (recommended, faster)
   npx playwright install chromium

   # Or install all browsers
   npx playwright install
   ```

### Test Commands

#### Run all tests (headless mode)
```bash
npm run test:e2e
```

#### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

#### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

#### Run tests in debug mode
```bash
npm run test:e2e:debug
```

#### Run tests on specific browser
```bash
npm run test:e2e:chromium
```

#### View test report
```bash
npm run test:e2e:report
```

#### Run specific test file
```bash
npx playwright test e2e/app.spec.ts
```

#### Run specific test
```bash
npx playwright test -g "should load the application successfully"
```

## Test Configuration

The tests are configured in `playwright.config.ts`:
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium (optimized for faster execution)
  - _Note: Originally configured for 5 browsers (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari), but simplified to Chromium only for better performance_
- **Test Timeout**: 60 seconds per test
- **Action Timeout**: 15 seconds for each action
- **Retries**: 2 retries in CI, 0 locally
- **Screenshots**: On failure only
- **Trace**: On first retry
- **Web Server**: Automatically starts dev server before tests

### Multi-Browser Testing
If you need to test on multiple browsers, update `playwright.config.ts` to add back additional projects:
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

## Test Coverage

The E2E test suite covers:
- ✅ 60+ test cases
- ✅ UI/UX interactions
- ✅ Form validation
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ API integration
- ✅ Dark/Light mode theming
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications
- ✅ Data persistence
- ✅ Network request validation

## Best Practices

1. **Isolation**: Each test is independent and can run in any order
2. **Cleanup**: Tests clean up after themselves (delete created tasks)
3. **Unique IDs**: Tasks use timestamps to avoid conflicts
4. **Timeouts**: Appropriate waits for API calls and animations
5. **Selectors**: Use accessible selectors (roles, labels) when possible
6. **Assertions**: Clear, meaningful assertions with descriptive messages

## Debugging Tests

### Visual Debugging
```bash
npm run test:e2e:ui
```
Opens Playwright UI where you can:
- See test execution
- Inspect DOM
- View network requests
- Take screenshots
- Time travel through test steps

### Debug Mode
```bash
npm run test:e2e:debug
```
Opens Playwright Inspector for step-by-step debugging

### View Traces
After a test failure, traces are automatically captured. View them with:
```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

For CI/CD pipelines, use:
```bash
npm run test:e2e
```

The tests will:
- Run in headless mode
- Retry failed tests twice
- Generate HTML reports
- Capture screenshots on failure
- Save traces for failed tests

## Troubleshooting

### Tests timing out
- Ensure backend is running
- Check database connectivity
- Increase timeout in specific tests if needed

### Browser not found
Run:
```bash
# Install Chromium only (faster)
npx playwright install chromium

# Or install all browsers
npx playwright install
```

### Port conflicts
- Ensure port 3000 is available
- Or update `playwright.config.ts` with a different port

### API not responding
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure database is accessible

## Recent Fixes

Several critical issues were fixed to ensure tests run reliably:

1. **Selector Ambiguity**: Fixed button selectors that were matching multiple elements
2. **Network Timeouts**: Replaced `waitForLoadState('networkidle')` with reliable element visibility checks
3. **Test Timeouts**: Increased timeout configurations for slower operations
4. **Duplicate Declarations**: Fixed variable scope issues in test files

For detailed information about fixes, see [`FIXES.md`](./FIXES.md)

## Contributing

When adding new tests:
1. Follow the existing file structure
2. Use descriptive test names
3. Add comments for complex interactions
4. Ensure tests are independent
5. Clean up test data
6. Use modal-specific selectors to avoid ambiguity:
   ```typescript
   // Good - specific selector
   const modal = page.locator('#addTaskModal');
   await modal.getByRole('button', { name: 'Add Task' }).click();

   // Bad - ambiguous selector
   await page.getByRole('button', { name: /add task/i }).click();
   ```
7. Update this README if adding new test files
