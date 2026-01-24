import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '../domain/interfaces/notification-repository.interface';
import { Notification } from '../domain/entities/notification.entity';
import type { NotificationPayload, BulkNotificationPayload } from '../producers/notification.producer';
import { NotificationStatus } from '../domain/enum/notification-type.enum';

@Controller()
export class NotificationConsumer {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  @EventPattern('notification.send')
  async handleNotification(@Payload() payload: NotificationPayload): Promise<void> {
    try {
      const notification = Notification.create(
        payload.userId,
        payload.title,
        payload.message,
        payload.type,
        payload.metadata,
      );

      const saved = await this.notificationRepository.create(notification);
      await this.notificationRepository.updateStatus(
        saved._id.toString(),
        NotificationStatus.SENT,
      );

      console.log(`Notification sent to user ${payload.userId}: ${payload.title}`);
    } catch (error) {
      console.error('Failed to process notification:', error);
    }
  }

  @EventPattern('notification.send.bulk')
  async handleBulkNotification(@Payload() payload: BulkNotificationPayload): Promise<void> {
    try {
      const promises = payload.userIds.map(async (userId) => {
        const notification = Notification.create(
          userId,
          payload.title,
          payload.message,
          payload.type,
          payload.metadata,
        );

        const saved = await this.notificationRepository.create(notification);
        await this.notificationRepository.updateStatus(
          saved._id.toString(),
          NotificationStatus.SENT,
        );
      });

      await Promise.all(promises);

      console.log(`Bulk notification sent to ${payload.userIds.length} users: ${payload.title}`);
    } catch (error) {
      console.error('Failed to process bulk notification:', error);
    }
  }
}