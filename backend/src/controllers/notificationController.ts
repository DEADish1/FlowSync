import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NotificationService, CreateNotificationData } from '../services/notificationService';
import { pool } from '../utils/db';

const notificationService = new NotificationService(pool);

export class NotificationController {
  /**
   * GET /api/notifications
   * Get user's notifications
   */
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const unreadOnly = req.query.unreadOnly === 'true';
      const type = req.query.type as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

      const notifications = await notificationService.getNotifications(userId, {
        unreadOnly,
        type: type as any,
        limit,
        offset,
      });

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get count of unread notifications
   */
  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const count = await notificationService.getUnreadCount(userId);

      res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/:id/read
   * Mark notification as read
   */
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notificationId = req.params.id;

      await notificationService.markAsRead(notificationId, userId);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      await notificationService.markAllAsRead(userId);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/:id/dismiss
   * Dismiss a notification
   */
  async dismissNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notificationId = req.params.id;

      await notificationService.dismissNotification(notificationId, userId);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notificationId = req.params.id;

      await notificationService.deleteNotification(notificationId, userId);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/subscribe
   * Subscribe to push notifications
   */
  async subscribeToPush(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { endpoint, keys } = req.body;

      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return res.status(400).json({ error: 'Invalid push subscription data' });
      }

      await notificationService.subscribeToPush(userId, {
        endpoint,
        keys,
        userAgent: req.headers['user-agent'],
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/unsubscribe
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint is required' });
      }

      await notificationService.unsubscribeFromPush(userId, endpoint);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/test
   * Send a test notification (for testing)
   */
  async sendTestNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const notification = await notificationService.sendNotification({
        userId,
        type: 'energy_check',
        title: 'Test Notification',
        message: 'This is a test notification from FlowSync',
        scheduledFor: new Date(),
      });

      res.json(notification);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
