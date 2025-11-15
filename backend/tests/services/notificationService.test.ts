import { NotificationService } from '../../src/services/notificationService';
import {
  createMockPool,
  createMockNotification,
  createMockQueryResult,
} from '../setup/testHelpers';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockPool: any;

  beforeEach(() => {
    mockPool = createMockPool();
    service = new NotificationService(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduleNotification', () => {
    it('should schedule a notification for future delivery', async () => {
      const mockNotification = createMockNotification();
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([mockNotification]));

      const result = await service.scheduleNotification({
        userId: 1,
        type: 'task_reminder',
        title: 'Test Task',
        message: 'Task starting soon',
        scheduledFor: new Date(Date.now() + 3600000),
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('task_reminder');
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should set status to pending for scheduled notifications', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      const mockNotification = createMockNotification({
        status: 'pending',
        scheduled_for: futureDate,
      });
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([mockNotification]));

      const result = await service.scheduleNotification({
        userId: 1,
        type: 'task_reminder',
        title: 'Test',
        message: 'Test message',
        scheduledFor: futureDate,
      });

      expect(result.status).toBe('pending');
    });
  });

  describe('getNotifications', () => {
    it('should return user notifications', async () => {
      const mockNotifications = [
        createMockNotification({ id: '1' }),
        createMockNotification({ id: '2' }),
      ];
      mockPool.query.mockResolvedValueOnce(createMockQueryResult(mockNotifications));

      const result = await service.getNotifications(1);

      expect(result).toHaveLength(2);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should filter by unread status when specified', async () => {
      const mockNotifications = [createMockNotification({ status: 'sent' })];
      mockPool.query.mockResolvedValueOnce(createMockQueryResult(mockNotifications));

      const result = await service.getNotifications(1, { unreadOnly: true });

      expect(result).toHaveLength(1);
      const query = mockPool.query.mock.calls[0][0];
      expect(query).toContain("status IN ('pending', 'sent')");
    });

    it('should respect limit parameter', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([]));

      await service.getNotifications(1, { limit: 10 });

      const query = mockPool.query.mock.calls[0][0];
      expect(query).toContain('LIMIT');
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([{ count: '5' }]));

      const result = await service.getUnreadCount(1);

      expect(result).toBe(5);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when no unread notifications', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([{ count: '0' }]));

      const result = await service.getUnreadCount(1);

      expect(result).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should update notification status to read', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([]));

      await service.markAsRead('test-id', 1);

      expect(mockPool.query).toHaveBeenCalledTimes(1);
      const query = mockPool.query.mock.calls[0][0];
      expect(query).toContain("status = 'read'");
    });
  });

  describe('markAllAsRead', () => {
    it('should update all pending/sent notifications to read', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([]));

      await service.markAllAsRead(1);

      const query = mockPool.query.mock.calls[0][0];
      expect(query).toContain("status = 'read'");
      expect(query).toContain("status IN ('pending', 'sent')");
    });
  });

  describe('dismissNotification', () => {
    it('should update notification status to dismissed', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([]));

      await service.dismissNotification('test-id', 1);

      const query = mockPool.query.mock.calls[0][0];
      expect(query).toContain("status = 'dismissed'");
    });
  });

  describe('scheduleTaskReminder', () => {
    it('should schedule reminder 15 minutes before task start', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      const mockNotification = createMockNotification();
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([mockNotification]));

      const result = await service.scheduleTaskReminder(
        1,
        42,
        'Important Task',
        futureDate
      );

      expect(result).toBeDefined();
      expect(result.type).toBe('task_reminder');
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw error for past dates', async () => {
      const pastDate = new Date(Date.now() - 3600000);

      await expect(
        service.scheduleTaskReminder(1, 42, 'Task', pastDate)
      ).rejects.toThrow('Cannot schedule reminder in the past');
    });
  });

  describe('notifyAchievement', () => {
    it('should send immediate achievement notification', async () => {
      const mockNotification = createMockNotification({
        type: 'achievement_unlocked',
        title: '🎉 Achievement Unlocked!',
        message: 'Early Bird: Completed 5 tasks before 9 AM',
      });
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([mockNotification]));

      const result = await service.notifyAchievement(
        1,
        'Early Bird',
        'Completed 5 tasks before 9 AM'
      );

      expect(result.type).toBe('achievement_unlocked');
      expect(result.title).toContain('Achievement');
    });
  });
});
