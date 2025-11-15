# Phase 10: Testing & Quality Assurance - Plan

**Start Date**: November 15, 2025
**Status**: Planning → In Progress
**Goal**: Establish a comprehensive test suite ensuring FlowSync's reliability, maintainability, and production readiness.

---

## Overview

Phase 10 adds robust testing infrastructure and comprehensive test coverage across the entire FlowSync application. With automated testing, we ensure code quality, catch regressions early, and maintain confidence in deployments.

---

## Why Testing Matters

### Benefits
- **Confidence**: Deploy with certainty that features work
- **Regression Prevention**: Catch bugs before they reach users
- **Documentation**: Tests serve as living documentation
- **Refactoring Safety**: Change code without fear
- **Team Collaboration**: Clear expectations for feature behavior
- **CI/CD Ready**: Automated testing in deployment pipeline

### Testing Pyramid

```
       /\
      /  \        E2E Tests (10%)
     /____\       - Critical user flows
    /      \      - End-to-end scenarios
   /        \
  /__________\    Integration Tests (30%)
 /            \   - API endpoints
/              \  - Component integration
/________________\ Unit Tests (60%)
                  - Services, utilities
                  - Pure functions
                  - Business logic
```

---

## Testing Stack

### Backend
- **Jest**: Test runner and assertion library
- **Supertest**: API endpoint testing
- **ts-jest**: TypeScript support for Jest
- **@types/jest**: TypeScript definitions

### Frontend
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom matchers
- **MSW (Mock Service Worker)**: API mocking

### E2E
- **Playwright**: Cross-browser E2E testing
- **@playwright/test**: Test runner
- Support for Chrome, Firefox, Safari

---

## Architecture

```
FlowSync Testing Infrastructure
├── Backend Tests
│   ├── Unit Tests
│   │   ├── Services (NotificationService, ExportService, etc.)
│   │   ├── Utilities (config, logger, helpers)
│   │   └── Models (data validation)
│   ├── Integration Tests
│   │   ├── API Endpoints (auth, tasks, mood, etc.)
│   │   ├── Database Operations
│   │   └── External Service Mocks
│   └── Test Setup
│       ├── Test database
│       ├── Mock data factories
│       └── Test utilities
│
├── Frontend Tests
│   ├── Unit Tests
│   │   ├── Hooks (useNotifications, useTasks, etc.)
│   │   ├── Utilities (api, serviceWorker)
│   │   └── Pure functions
│   ├── Component Tests
│   │   ├── NotificationBell
│   │   ├── BottomNav
│   │   ├── TaskList
│   │   └── All major components
│   └── Test Setup
│       ├── MSW handlers
│       ├── Test providers
│       └── Mock data
│
└── E2E Tests
    ├── Authentication Flow
    ├── Task Management
    ├── Mood Logging
    ├── AI Coach Interaction
    └── Notification System
```

---

## Phase 10.1: Backend Test Infrastructure

### Jest Configuration

**File**: `backend/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

### Test Setup

**File**: `backend/tests/setup.ts`

```typescript
import { Pool } from 'pg';
import { config } from '../src/utils/config';

// Test database connection
let testDb: Pool;

beforeAll(async () => {
  // Setup test database
  testDb = new Pool({
    connectionString: config.database.url.replace('flowsync', 'flowsync_test'),
  });

  // Run migrations
  await runMigrations(testDb);
});

afterAll(async () => {
  await testDb.end();
});

afterEach(async () => {
  // Clean up test data
  await cleanDatabase(testDb);
});

export { testDb };
```

### Example Service Test

**File**: `backend/tests/services/notificationService.test.ts`

```typescript
import { NotificationService } from '../../src/services/notificationService';
import { testDb } from '../setup';

describe('NotificationService', () => {
  let service: NotificationService;
  let testUserId: number;

  beforeEach(async () => {
    service = new NotificationService(testDb);
    testUserId = await createTestUser();
  });

  describe('scheduleNotification', () => {
    it('should schedule a notification for future delivery', async () => {
      const notification = await service.scheduleNotification({
        userId: testUserId,
        type: 'task_reminder',
        title: 'Test Task',
        message: 'Task starting soon',
        scheduledFor: new Date(Date.now() + 3600000),
      });

      expect(notification).toBeDefined();
      expect(notification.status).toBe('pending');
      expect(notification.userId).toBe(testUserId);
    });

    it('should send notification immediately when scheduled for now', async () => {
      const notification = await service.sendNotification({
        userId: testUserId,
        type: 'achievement_unlocked',
        title: 'Achievement!',
        message: 'You did it!',
        scheduledFor: new Date(),
      });

      expect(notification.status).toBe('sent');
    });
  });

  describe('getNotifications', () => {
    it('should return user notifications', async () => {
      await createTestNotification(testUserId);

      const notifications = await service.getNotifications(testUserId);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].userId).toBe(testUserId);
    });

    it('should filter by unread status', async () => {
      await createTestNotification(testUserId, { status: 'sent' });
      await createTestNotification(testUserId, { status: 'read' });

      const unread = await service.getNotifications(testUserId, { unreadOnly: true });

      expect(unread).toHaveLength(1);
      expect(unread[0].status).toBe('sent');
    });
  });

  describe('markAsRead', () => {
    it('should update notification status to read', async () => {
      const notification = await createTestNotification(testUserId);

      await service.markAsRead(notification.id, testUserId);

      const updated = await service.getNotifications(testUserId);
      expect(updated[0].status).toBe('read');
    });
  });
});
```

### API Integration Test Example

**File**: `backend/tests/routes/notifications.test.ts`

```typescript
import request from 'supertest';
import app from '../../src/index';
import { testDb } from '../setup';

describe('Notifications API', () => {
  let authToken: string;
  let userId: number;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user.id;
    authToken = generateTestToken(userId);
  });

  describe('GET /api/notifications', () => {
    it('should return user notifications', async () => {
      await createTestNotification(userId);

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/notifications')
        .expect(401);
    });
  });

  describe('POST /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const notification = await createTestNotification(userId);

      await request(app)
        .post(`/api/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const updated = await getNotification(notification.id);
      expect(updated.status).toBe('read');
    });
  });
});
```

---

## Phase 10.2: Frontend Test Infrastructure

### Jest Configuration

**File**: `frontend/jest.config.js`

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Test Setup

**File**: `frontend/jest.setup.js`

```javascript
import '@testing-library/jest-dom';
import { server } from './src/tests/mocks/server';

// Start MSW server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
}));
```

### MSW Setup

**File**: `frontend/src/tests/mocks/handlers.ts`

```typescript
import { rest } from 'msw';

export const handlers = [
  // Notifications
  rest.get('/api/notifications', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          type: 'task_reminder',
          title: 'Test Notification',
          message: 'This is a test',
          status: 'sent',
        },
      ])
    );
  }),

  // Tasks
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          title: 'Test Task',
          status: 'pending',
        },
      ])
    );
  }),

  // Auth
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'test-token',
        user: { id: 1, email: 'test@example.com' },
      })
    );
  }),
];
```

**File**: `frontend/src/tests/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Component Test Example

**File**: `frontend/src/components/notifications/__tests__/NotificationBell.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationBell } from '../NotificationBell';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('NotificationBell', () => {
  it('renders notification bell icon', () => {
    render(<NotificationBell />, { wrapper: createWrapper() });

    const bell = screen.getByRole('button');
    expect(bell).toBeInTheDocument();
  });

  it('displays unread count badge', async () => {
    render(<NotificationBell />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('opens notification list on click', async () => {
    render(<NotificationBell />, { wrapper: createWrapper() });

    const bell = screen.getByRole('button');
    await userEvent.click(bell);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('displays notifications in list', async () => {
    render(<NotificationBell />, { wrapper: createWrapper() });

    const bell = screen.getByRole('button');
    await userEvent.click(bell);

    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
  });

  it('marks notification as read on click', async () => {
    render(<NotificationBell />, { wrapper: createWrapper() });

    const bell = screen.getByRole('button');
    await userEvent.click(bell);

    await waitFor(() => {
      const notification = screen.getByText('Test Notification');
      expect(notification).toBeInTheDocument();
    });

    const readButton = screen.getByTitle('Dismiss');
    await userEvent.click(readButton);

    // Verify mark as read was called
    // This would check MSW mock calls
  });
});
```

### Hook Test Example

**File**: `frontend/src/hooks/__tests__/useNotifications.test.tsx`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications } from '../useNotifications';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useNotifications', () => {
  it('fetches notifications', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });
  });

  it('provides unread count', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });
  });

  it('marks notification as read', async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    result.current.markAsRead('1');

    // Verify mutation was called
  });
});
```

---

## Phase 10.3: E2E Testing

### Playwright Configuration

**File**: `e2e/playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example

**File**: `e2e/tests/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="name"]', 'Test User');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('user can login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

**File**: `e2e/tests/tasks.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('user can create a task', async ({ page }) => {
    await page.goto('/dashboard/tasks');

    await page.click('button:has-text("Add Task")');
    await page.fill('[name="title"]', 'New Test Task');
    await page.fill('[name="description"]', 'Task description');
    await page.selectOption('[name="difficulty"]', 'medium');
    await page.click('button:has-text("Create")');

    await expect(page.locator('text=New Test Task')).toBeVisible();
  });

  test('user can complete a task', async ({ page }) => {
    await page.goto('/dashboard/tasks');

    const task = page.locator('[data-testid="task-item"]').first();
    await task.locator('[data-testid="complete-button"]').click();

    await expect(task).toHaveClass(/completed/);
  });
});
```

---

## Test Coverage Goals

### Backend
- **Services**: 80%+ coverage
- **Controllers**: 75%+ coverage
- **Routes**: 80%+ coverage
- **Utilities**: 90%+ coverage

### Frontend
- **Components**: 70%+ coverage
- **Hooks**: 80%+ coverage
- **Utilities**: 90%+ coverage
- **Pages**: 60%+ coverage

### E2E
- Critical user flows: 100%
- Edge cases: As needed

---

## CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: flowsync_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run tests
        run: cd backend && npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Run tests
        run: cd frontend && npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Implementation Timeline

### Week 1: Backend Testing
- Day 1: Setup Jest, create test utilities
- Day 2: Write service tests (Notification, Export, Analytics)
- Day 3: Write API integration tests (auth, tasks, notifications)
- Day 4: Write utility tests, achieve 70% coverage

### Week 2: Frontend Testing
- Day 1: Setup Jest, RTL, MSW
- Day 2: Write component tests (NotificationBell, BottomNav, etc.)
- Day 3: Write hook tests (useNotifications, useTasks, etc.)
- Day 4: Write utility tests, achieve 60% coverage

### Week 3: E2E Testing
- Day 1: Setup Playwright
- Day 2: Write auth and task flow tests
- Day 3: Write mood and coach flow tests
- Day 4: Run full test suite, fix issues

---

## Success Metrics

- ✅ 70%+ backend test coverage
- ✅ 60%+ frontend test coverage
- ✅ All critical flows tested E2E
- ✅ CI/CD pipeline passing
- ✅ < 5 minute total test runtime
- ✅ Zero flaky tests
- ✅ Documentation complete

---

**Let's build Phase 10! 🧪**
