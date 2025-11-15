import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType =
  | 'task_reminder'
  | 'flow_block_start'
  | 'flow_block_end'
  | 'energy_check'
  | 'achievement_unlocked'
  | 'daily_briefing';

export type NotificationStatus = 'pending' | 'sent' | 'read' | 'dismissed';
export type NotificationChannel = 'browser' | 'email';

export interface Notification {
  id: string;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  scheduledFor: Date;
  sentAt?: Date;
  status: NotificationStatus;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreateNotificationData {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  scheduledFor: Date;
  channels?: NotificationChannel[];
  metadata?: Record<string, any>;
}

export interface NotificationFilter {
  unreadOnly?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

/**
 * NotificationService - Manages all notification operations
 *
 * Features:
 * - Schedule notifications for future delivery
 * - Send immediate notifications
 * - Track notification delivery status
 * - Support multiple channels (browser, email)
 * - Manage user preferences
 */
export class NotificationService {
  constructor(private db: Pool) {}

  /**
   * Schedule a notification for future delivery
   */
  async scheduleNotification(data: CreateNotificationData): Promise<Notification> {
    const id = uuidv4();
    const channels = data.channels || ['browser'];

    const result = await this.db.query<Notification>(
      `INSERT INTO notifications
       (id, user_id, type, title, message, action_url, scheduled_for, channels, metadata, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        data.userId,
        data.type,
        data.title,
        data.message,
        data.actionUrl || null,
        data.scheduledFor,
        channels,
        JSON.stringify(data.metadata || {}),
        'pending',
      ]
    );

    return this.mapNotification(result.rows[0]);
  }

  /**
   * Send a notification immediately
   */
  async sendNotification(data: CreateNotificationData): Promise<Notification> {
    const notification = await this.scheduleNotification({
      ...data,
      scheduledFor: new Date(), // Send now
    });

    // Process immediately
    await this.processNotification(notification);

    return notification;
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: number,
    filter: NotificationFilter = {}
  ): Promise<Notification[]> {
    const { unreadOnly = false, type, limit = 50, offset = 0 } = filter;

    let query = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (unreadOnly) {
      query += ` AND status IN ('pending', 'sent')`;
    }

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY scheduled_for DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.db.query(query, params);

    return result.rows.map(this.mapNotification);
  }

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(userId: number): Promise<number> {
    const result = await this.db.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND status IN ('pending', 'sent')`,
      [userId]
    );

    return parseInt(result.rows[0]?.count || '0');
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: number): Promise<void> {
    await this.db.query(
      `UPDATE notifications
       SET status = 'read'
       WHERE id = $1 AND user_id = $2 AND status != 'dismissed'`,
      [notificationId, userId]
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.db.query(
      `UPDATE notifications
       SET status = 'read'
       WHERE user_id = $1 AND status IN ('pending', 'sent')`,
      [userId]
    );
  }

  /**
   * Dismiss a notification
   */
  async dismissNotification(notificationId: string, userId: number): Promise<void> {
    await this.db.query(
      `UPDATE notifications
       SET status = 'dismissed'
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: number): Promise<void> {
    await this.db.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
  }

  /**
   * Process pending notifications (call this periodically via cron)
   */
  async processPendingNotifications(): Promise<number> {
    const result = await this.db.query<Notification>(
      `SELECT * FROM notifications
       WHERE status = 'pending' AND scheduled_for <= NOW()
       ORDER BY scheduled_for ASC
       LIMIT 100` // Process in batches
    );

    const notifications = result.rows.map(this.mapNotification);
    let processedCount = 0;

    for (const notification of notifications) {
      try {
        await this.processNotification(notification);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error);
      }
    }

    return processedCount;
  }

  /**
   * Process a single notification (send via configured channels)
   */
  private async processNotification(notification: Notification): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const channel of notification.channels) {
      switch (channel) {
        case 'browser':
          promises.push(this.sendBrowserNotification(notification));
          break;
        case 'email':
          promises.push(this.sendEmailNotification(notification));
          break;
      }
    }

    await Promise.all(promises);

    // Mark as sent
    await this.db.query(
      `UPDATE notifications
       SET status = 'sent', sent_at = NOW()
       WHERE id = $1`,
      [notification.id]
    );
  }

  /**
   * Send browser notification (Web Push API)
   */
  private async sendBrowserNotification(notification: Notification): Promise<void> {
    // Get user's push subscriptions
    const result = await this.db.query(
      `SELECT * FROM push_subscriptions WHERE user_id = $1`,
      [notification.userId]
    );

    const subscriptions = Array.isArray(result?.rows) ? result.rows : [];

    if (subscriptions.length === 0) {
      // No subscriptions, skip browser notification
      return;
    }

    // In a real implementation, this would use web-push library
    // to send push notifications to all subscribed devices
    // For now, this is a placeholder

    /*
    const webpush = require('web-push');

    for (const subscription of result.rows) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          JSON.stringify({
            title: notification.title,
            body: notification.message,
            icon: '/icon.png',
            badge: '/badge.png',
            data: {
              url: notification.actionUrl,
              notificationId: notification.id,
            },
          })
        );
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }
    */

    console.log(`[Browser Notification] ${notification.title}: ${notification.message}`);
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    // Get user email
    const result = await this.db.query(`SELECT email, name FROM users WHERE id = $1`, [
      notification.userId,
    ]);

    if (result.rows.length === 0) {
      throw new Error(`User not found: ${notification.userId}`);
    }

    const user = result.rows[0];

    // In a real implementation, this would use a service like SendGrid, Mailgun, or AWS SES
    // For now, this is a placeholder

    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: user.email,
      from: 'notifications@flowsync.app',
      subject: notification.title,
      text: notification.message,
      html: `
        <div>
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          ${notification.actionUrl ? `<a href="${notification.actionUrl}">View Details</a>` : ''}
        </div>
      `,
    });
    */

    console.log(`[Email Notification] To: ${user.email}, Subject: ${notification.title}`);
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(
    userId: number,
    subscription: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      userAgent?: string;
    }
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, keys, user_agent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, endpoint) DO UPDATE
       SET keys = EXCLUDED.keys, user_agent = EXCLUDED.user_agent`,
      [userId, subscription.endpoint, JSON.stringify(subscription.keys), subscription.userAgent]
    );
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(userId: number, endpoint: string): Promise<void> {
    await this.db.query(
      `DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2`,
      [userId, endpoint]
    );
  }

  /**
   * Utility: Schedule task reminder
   */
  async scheduleTaskReminder(
    userId: number,
    taskId: number,
    taskTitle: string,
    scheduledStart: Date
  ): Promise<Notification> {
    // Schedule 15 minutes before task starts
    const reminderTime = new Date(scheduledStart.getTime() - 15 * 60 * 1000);

    if (reminderTime <= new Date()) {
      // Don't schedule reminders in the past
      throw new Error('Cannot schedule reminder in the past');
    }

    return this.scheduleNotification({
      userId,
      type: 'task_reminder',
      title: 'Upcoming Task',
      message: `"${taskTitle}" starts in 15 minutes`,
      actionUrl: `/tasks/${taskId}`,
      scheduledFor: reminderTime,
      metadata: { taskId },
    });
  }

  /**
   * Utility: Schedule flow block notifications
   */
  async scheduleFlowBlockNotifications(
    userId: number,
    scheduleId: number,
    flowBlockName: string,
    start: Date,
    end: Date
  ): Promise<void> {
    // Start notification
    await this.scheduleNotification({
      userId,
      type: 'flow_block_start',
      title: 'Flow Block Starting',
      message: `Time to begin: ${flowBlockName}`,
      actionUrl: `/schedule/${scheduleId}`,
      scheduledFor: start,
      metadata: { scheduleId, flowBlockName },
    });

    // End notification (5 min before)
    const endReminder = new Date(end.getTime() - 5 * 60 * 1000);
    if (endReminder > new Date()) {
      await this.scheduleNotification({
        userId,
        type: 'flow_block_end',
        title: 'Flow Block Ending Soon',
        message: `${flowBlockName} wraps up in 5 minutes`,
        actionUrl: `/schedule/${scheduleId}`,
        scheduledFor: endReminder,
        metadata: { scheduleId, flowBlockName },
      });
    }
  }

  /**
   * Utility: Send achievement notification
   */
  async notifyAchievement(
    userId: number,
    achievementName: string,
    achievementDescription: string
  ): Promise<Notification> {
    return this.sendNotification({
      userId,
      type: 'achievement_unlocked',
      title: '🎉 Achievement Unlocked!',
      message: `${achievementName}: ${achievementDescription}`,
      actionUrl: '/analytics',
      scheduledFor: new Date(),
      metadata: { achievementName },
    });
  }

  /**
   * Utility: Schedule daily briefing notification
   */
  async scheduleDailyBriefing(userId: number, time: Date): Promise<Notification> {
    return this.scheduleNotification({
      userId,
      type: 'daily_briefing',
      title: 'Your Daily Briefing is Ready',
      message: 'Check out your personalized productivity forecast for today',
      actionUrl: '/coach',
      scheduledFor: time,
    });
  }

  /**
   * Map database row to Notification interface
   */
  private mapNotification(row: any): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      actionUrl: row.action_url,
      scheduledFor: new Date(row.scheduled_for),
      sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
      status: row.status,
      channels: row.channels,
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
    };
  }
}
