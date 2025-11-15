import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from '../NotificationBell';
import { renderWithProviders, createMockNotification } from '@/tests/utils/testUtils';

// Mock the useNotifications hook
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(() => ({
    notifications: [createMockNotification()],
    isLoading: false,
    unreadCount: 1,
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    dismiss: jest.fn(),
    deleteNotification: jest.fn(),
    refetch: jest.fn(),
  })),
}));

describe('NotificationBell', () => {
  it('renders bell icon', () => {
    renderWithProviders(<NotificationBell />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('displays unread count badge', () => {
    renderWithProviders(<NotificationBell />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens notification popover on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationBell />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('displays notification in list', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationBell />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
  });

  it('shows "No notifications" when empty', async () => {
    const useNotifications = require('@/hooks/useNotifications').useNotifications;
    useNotifications.mockImplementation(() => ({
      notifications: [],
      isLoading: false,
      unreadCount: 0,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      dismiss: jest.fn(),
      deleteNotification: jest.fn(),
      refetch: jest.fn(),
    }));

    const user = userEvent.setup();
    renderWithProviders(<NotificationBell />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });
});
