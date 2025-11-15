import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Test utilities for frontend component testing
 */

// Create a new QueryClient for each test
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs in tests
    },
  });
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Mock notification data
export const createMockNotification = (overrides = {}) => {
  return {
    id: '1',
    userId: 1,
    type: 'task_reminder' as const,
    title: 'Test Notification',
    message: 'This is a test notification',
    scheduledFor: new Date(),
    status: 'sent' as const,
    channels: ['browser' as const],
    createdAt: new Date(),
    ...overrides,
  };
};

// Mock task data
export const createMockTask = (overrides = {}) => {
  return {
    id: 1,
    userId: 1,
    title: 'Test Task',
    description: 'Test description',
    status: 'pending' as const,
    difficulty: 'medium' as const,
    estimatedDuration: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

// Mock user data
export const createMockUser = (overrides = {}) => {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    ...overrides,
  };
};

// Wait for async operations
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
