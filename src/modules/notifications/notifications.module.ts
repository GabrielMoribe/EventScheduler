import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './domain/entities/notification.entity';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationProducer } from './producers/notification.producer';
import { NotificationConsumer } from './consumers/notification.consumer';
import { NOTIFICATION_REPOSITORY } from './domain/interfaces/notification-repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController, NotificationConsumer],
  providers: [
    NotificationService,
    NotificationProducer,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationRepository,
    },
  ],
  exports: [NotificationProducer],
})
export class NotificationsModule {}