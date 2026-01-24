import { Notification } from '../../entities/notification.entity';
import { NotificationType, NotificationStatus } from '../../enum/notification-type.enum';

export class NotificationResponseDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  metadata: Record<string, any>;
  readAt: Date | null;
  createdAt: Date;

  static fromEntity(notification: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = notification._id.toString();
    dto.title = notification.title;
    dto.message = notification.message;
    dto.type = notification.type;
    dto.status = notification.status;
    dto.metadata = notification.metadata;
    dto.readAt = notification.readAt || null;
    dto.createdAt = notification.createdAt;
    return dto;
  }
}