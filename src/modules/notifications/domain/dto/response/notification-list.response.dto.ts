import { Notification } from '../../entities/notification.entity';
import { NotificationResponseDto } from './notification.response.dto';

export class NotificationListResponseDto {
  notifications: NotificationResponseDto[];
  total: number;
  unreadCount: number;

  static fromEntities(
    notifications: Notification[],
    unreadCount: number,
  ): NotificationListResponseDto {
    const dto = new NotificationListResponseDto();
    dto.notifications = notifications.map(NotificationResponseDto.fromEntity);
    dto.total = notifications.length;
    dto.unreadCount = unreadCount;
    return dto;
  }
}