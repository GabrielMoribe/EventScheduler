import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_CLIENT } from '../../rabbitmq/rabbitmq.module';
import { NotificationType } from '../domain/enum/notification-type.enum';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

export interface BulkNotificationPayload {
  userIds: string[];
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationProducer {
  constructor(
    @Inject(RABBITMQ_CLIENT)
    private readonly client: ClientProxy,
  ) {}

  async sendNotification(payload: NotificationPayload): Promise<void> {
    this.client.emit('notification.send', payload);
  }

  async sendBulkNotification(payload: BulkNotificationPayload): Promise<void> {
    this.client.emit('notification.send.bulk', payload);
  }

  async sendEventPublishedNotification(
    eventId: string,
    eventTitle: string,
    organizerName: string,
    participantIds: string[],
  ): Promise<void> {
    if (participantIds.length === 0) return;

    this.client.emit('notification.send.bulk', {
      userIds: participantIds,
      title: 'Evento Publicado!',
      message: `O evento "${eventTitle}" organizado por ${organizerName} foi publicado.`,
      type: NotificationType.EVENT_PUBLISHED,
      metadata: { eventId },
    });
  }

  async sendEventCancelledNotification(
    eventId: string,
    eventTitle: string,
    participantIds: string[],
  ): Promise<void> {
    if (participantIds.length === 0) return;

    this.client.emit('notification.send.bulk', {
      userIds: participantIds,
      title: 'Evento Cancelado',
      message: `O evento "${eventTitle}" foi cancelado.`,
      type: NotificationType.EVENT_CANCELLED,
      metadata: { eventId },
    });
  }

  async sendEventJoinedNotification(
    eventId: string,
    eventTitle: string,
    organizerId: string,
    participantName: string,
  ): Promise<void> {
    this.client.emit('notification.send', {
      userId: organizerId,
      title: 'Novo Participante!',
      message: `${participantName} se inscreveu no evento "${eventTitle}".`,
      type: NotificationType.EVENT_JOINED,
      metadata: { eventId },
    });
  }

  async sendEventLeftNotification(
    eventId: string,
    eventTitle: string,
    organizerId: string,
    participantName: string,
  ): Promise<void> {
    this.client.emit('notification.send', {
      userId: organizerId,
      title: 'Participante Saiu',
      message: `${participantName} saiu do evento "${eventTitle}".`,
      type: NotificationType.EVENT_LEFT,
      metadata: { eventId },
    });
  }
}