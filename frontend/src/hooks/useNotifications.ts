import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '@/lib/api';

export interface Notification {
  id: string;
  userId: number;
  type: 'task_reminder' | 'flow_block_start' | 'flow_block_end' | 'energy_check' | 'achievement_unlocked' | 'daily_briefing';
  title: string;
  message: string;
  actionUrl?: string;
  scheduledFor: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'read' | 'dismissed';
  channels: ('browser' | 'email')[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

export function useNotifications(options?: { unreadOnly?: boolean; limit?: number }) {
  const queryClient = useQueryClient();

  // Get notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', options],
    queryFn: async () => {
      const response = await notificationsAPI.getNotifications(options);
      return response.data as Notification[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get unread count
  const {
    data: unreadCount = 0,
    refetch: refetchUnreadCount,
  } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const response = await notificationsAPI.getUnreadCount();
      return response.data.count as number;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationsAPI.markAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await notificationsAPI.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Dismiss notification mutation
  const dismissMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationsAPI.dismissNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationsAPI.deleteNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    dismiss: (id: string) => dismissMutation.mutate(id),
    deleteNotification: (id: string) => deleteMutation.mutate(id),
    refetch,
    refetchUnreadCount,
  };
}
