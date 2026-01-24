import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../enum/notification-type.enum';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export abstract class INotificationRepository {
  abstract create(notification: Partial<Notification>): Promise<Notification>;
  abstract findById(id: string): Promise<Notification | null>;
  abstract findByUserId(userId: string, limit?: number): Promise<Notification[]>;
  abstract findUnreadByUserId(userId: string): Promise<Notification[]>;
  abstract updateStatus(id: string, status: NotificationStatus): Promise<Notification | null>;
  abstract markAsRead(id: string): Promise<Notification | null>;
  abstract markAllAsRead(userId: string): Promise<void>;
  abstract countUnread(userId: string): Promise<number>;
}