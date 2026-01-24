import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NotificationType, NotificationStatus } from '../enum/notification-type.enum';

@Schema({ collection: 'notifications', timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  readAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  static create(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    metadata?: Record<string, any>,
  ): Partial<Notification> {
    return {
      userId,
      title,
      message,
      type,
      status: NotificationStatus.PENDING,
      metadata: metadata || {},
    };
  }

  markAsSent(): void {
    this.status = NotificationStatus.SENT;
  }

  markAsRead(): void {
    this.status = NotificationStatus.READ;
    this.readAt = new Date();
  }

  markAsFailed(): void {
    this.status = NotificationStatus.FAILED;
  }
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Índices
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ type: 1 });