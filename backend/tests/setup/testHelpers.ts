import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

/**
 * Test helper functions for backend tests
 */

// Mock database pool for testing
export const createMockPool = (): Pool => {
  return {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  } as any;
};

// Generate test JWT token
export const generateTestToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret-key', {
    expiresIn: '1h',
  });
};

// Create mock user data
export const createMockUser = (overrides = {}) => {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
};

// Create mock task data
export const createMockTask = (overrides = {}) => {
  return {
    id: 1,
    user_id: 1,
    title: 'Test Task',
    description: 'Test description',
    status: 'pending',
    difficulty: 'medium',
    estimated_duration: 60,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
};

// Create mock notification data
export const createMockNotification = (overrides = {}) => {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 1,
    type: 'task_reminder',
    title: 'Test Notification',
    message: 'Test message',
    scheduled_for: new Date(),
    status: 'pending',
    channels: ['browser'],
    metadata: {},
    created_at: new Date(),
    ...overrides,
  };
};

// Create mock energy log data
export const createMockEnergyLog = (overrides = {}) => {
  return {
    id: 1,
    user_id: 1,
    timestamp: new Date(),
    energy_level: 'high',
    mood_category: 'focused',
    mood_text: 'Feeling great!',
    created_at: new Date(),
    ...overrides,
  };
};

// Mock request object for Express
export const createMockRequest = (overrides = {}) => {
  return {
    user: { userId: 1 },
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  } as any;
};

// Mock response object for Express
export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function for Express middleware
export const createMockNext = () => {
  return jest.fn();
};

// Wait for a promise to resolve (useful for async tests)
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock PostgreSQL query result
export const createMockQueryResult = (rows: any[] = [], rowCount?: number) => {
  return {
    rows,
    rowCount: rowCount ?? rows.length,
    command: 'SELECT',
    oid: 0,
    fields: [],
  };
};
