import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../domain/entities/notification.entity';
import { INotificationRepository } from '../domain/interfaces/notification-repository.interface';
import { NotificationStatus } from '../domain/enum/notification-type.enum';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectModel(Notification.name)
    private readonly model: Model<Notification>,
  ) {}

  async create(notification: Partial<Notification>): Promise<Notification> {
    const created = new this.model(notification);
    return created.save();
  }

  async findById(id: string): Promise<Notification | null> {
    return this.model.findById(id).exec();
  }

  async findByUserId(userId: string, limit = 50): Promise<Notification[]> {
    return this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.model
      .find({
        userId,
        status: { $in: [NotificationStatus.PENDING, NotificationStatus.SENT] },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(id: string, status: NotificationStatus): Promise<Notification | null> {
    return this.model
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { status: NotificationStatus.READ, readAt: new Date() },
        { new: true },
      )
      .exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.model.updateMany(
      {
        userId,
        status: { $in: [NotificationStatus.PENDING, NotificationStatus.SENT] },
      },
      { status: NotificationStatus.READ, readAt: new Date() },
    );
  }

  async countUnread(userId: string): Promise<number> {
    return this.model.countDocuments({
      userId,
      status: { $in: [NotificationStatus.PENDING, NotificationStatus.SENT] },
    });
  }
}