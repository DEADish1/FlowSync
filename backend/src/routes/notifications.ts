import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { notificationController } from '../controllers/notificationController';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.post('/:id/read', notificationController.markAsRead);

// Mark all as read
router.post('/read-all', notificationController.markAllAsRead);

// Dismiss notification
router.post('/:id/dismiss', notificationController.dismissNotification);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Push notification subscription
router.post('/subscribe', notificationController.subscribeToPush);
router.post('/unsubscribe', notificationController.unsubscribeFromPush);

// Test notification (development/testing only)
router.post('/test', notificationController.sendTestNotification);

export default router;
