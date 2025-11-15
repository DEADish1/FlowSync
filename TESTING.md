# FlowSync Testing Guide

This document outlines the testing strategy, setup, and best practices for FlowSync.

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Stack](#testing-stack)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Structure](#test-structure)
6. [Best Practices](#best-practices)
7. [CI/CD Integration](#cicd-integration)

---

## Overview

FlowSync uses a comprehensive testing strategy covering:

- **Unit Tests**: Testing individual functions and services
- **Integration Tests**: Testing API endpoints and component integration
- **Component Tests**: Testing React components in isolation
- **E2E Tests**: Testing complete user flows (planned)

### Test Coverage Goals

- Backend Services: 70%+
- Frontend Components: 60%+
- Critical Paths: 100%

---

## Testing Stack

### Backend
- **Jest**: Test runner and assertions
- **ts-jest**: TypeScript support
- **Supertest**: API endpoint testing (future)

### Frontend
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom DOM matchers

---

## Running Tests

### Backend Tests

```bash
# Run all tests
cd backend
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- notificationService.test.ts

# Run in watch mode
npm test -- --watch
```

### Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- NotificationBell.test.tsx

# Run in watch mode
npm test -- --watch

# Update snapshots
npm test -- -u
```

---

## Writing Tests

### Backend Service Test Example

```typescript
import { NotificationService } from '../../src/services/notificationService';
import { createMockPool, createMockQueryResult } from '../setup/testHelpers';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockPool: any;

  beforeEach(() => {
    mockPool = createMockPool();
    service = new NotificationService(mockPool);
  });

  it('should schedule a notification', async () => {
    mockPool.query.mockResolvedValueOnce(createMockQueryResult([...]));

    const result = await service.scheduleNotification({...});

    expect(result).toBeDefined();
    expect(mockPool.query).toHaveBeenCalled();
  });
});
```

### Frontend Component Test Example

```typescript
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/utils/testUtils';
import { NotificationBell } from '../NotificationBell';

describe('NotificationBell', () => {
  it('renders bell icon', () => {
    renderWithProviders(<NotificationBell />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationBell />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });
});
```

---

## Test Structure

### Backend Tests

```
backend/
├── tests/
│   ├── setup/
│   │   ├── jest.setup.ts         # Global test setup
│   │   └── testHelpers.ts        # Helper functions
│   ├── services/
│   │   └── *.test.ts             # Service tests
│   ├── routes/
│   │   └── *.test.ts             # API endpoint tests
│   └── utils/
│       └── *.test.ts             # Utility tests
└── jest.config.js                # Jest configuration
```

### Frontend Tests

```
frontend/
├── src/
│   ├── components/
│   │   └── **/__tests__/         # Component tests
│   ├── hooks/
│   │   └── __tests__/            # Hook tests
│   └── tests/
│       ├── mocks/                # Mock data and handlers
│       └── utils/                # Test utilities
├── jest.config.js                # Jest configuration
└── jest.setup.js                 # Test setup
```

---

## Best Practices

### General

1. **Test Behavior, Not Implementation**
   ```typescript
   // Good
   expect(screen.getByText('Welcome')).toBeInTheDocument();

   // Bad
   expect(component.state.showWelcome).toBe(true);
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should display error message when login fails', () => {});

   // Bad
   it('test login', () => {});
   ```

3. **Arrange, Act, Assert Pattern**
   ```typescript
   it('should add item to cart', () => {
     // Arrange
     const item = { id: 1, name: 'Product' };

     // Act
     addToCart(item);

     // Assert
     expect(cart).toContain(item);
   });
   ```

### Backend Testing

1. **Mock External Dependencies**
   ```typescript
   const mockPool = createMockPool();
   mockPool.query.mockResolvedValue({...});
   ```

2. **Test Edge Cases**
   - Empty results
   - Error conditions
   - Invalid input
   - Boundary values

3. **Clean Up After Tests**
   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

### Frontend Testing

1. **Use Testing Library Queries**
   ```typescript
   // Prefer (in order)
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText('Email')
   screen.getByText('Welcome')
   screen.getByTestId('submit-button') // Last resort
   ```

2. **Wait for Async Operations**
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

3. **Simulate User Interactions**
   ```typescript
   const user = userEvent.setup();
   await user.click(button);
   await user.type(input, 'Hello');
   ```

4. **Mock API Calls**
   - Use MSW for API mocking (future)
   - Mock hooks when needed
   - Keep mocks simple and focused

---

## CI/CD Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Pre-commit hooks (future)

### GitHub Actions Workflow

See `.github/workflows/tests.yml` for the complete CI/CD pipeline.

**Jobs**:
- Backend Tests (with PostgreSQL & Redis)
- Frontend Tests
- Lint & Format Check
- TypeScript Type Check

**Coverage Reports**:
- Uploaded to Codecov
- Visible in PR comments
- Tracked over time

---

## Debugging Tests

### Failed Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run single test file
npm test -- path/to/test.ts

# Debug in VS Code
# Add breakpoint, then F5 to debug
```

### Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Common Issues

1. **Tests timing out**
   - Increase timeout: `jest.setTimeout(10000)`
   - Check for unresolved promises
   - Verify async/await usage

2. **Mock not working**
   - Clear mocks: `jest.clearAllMocks()`
   - Check mock setup location
   - Verify import paths

3. **Random failures**
   - Check for test interdependence
   - Ensure proper cleanup
   - Look for timing issues

---

## Adding New Tests

### 1. Backend Service Test

1. Create test file: `backend/tests/services/myService.test.ts`
2. Import service and helpers
3. Write describe block
4. Add beforeEach setup
5. Write test cases
6. Run: `npm test -- myService.test.ts`

### 2. Frontend Component Test

1. Create test file: `src/components/MyComponent/__tests__/MyComponent.test.tsx`
2. Import component and test utils
3. Write describe block
4. Mock dependencies if needed
5. Write test cases
6. Run: `npm test -- MyComponent.test.tsx`

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)

---

## Getting Help

- Check existing tests for examples
- Review test output for clues
- Ask the team in Slack #testing
- Consult testing documentation

---

**Happy Testing! 🧪**
