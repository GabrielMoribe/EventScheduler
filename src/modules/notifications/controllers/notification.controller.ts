import {
  Controller,
  Get,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { NotificationResponseDto } from '../domain/dto/response/notification.response.dto';
import { NotificationListResponseDto } from '../domain/dto/response/notification-list.response.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/domain/entities/user.entity';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(@CurrentUser() user: User): Promise<NotificationListResponseDto> {
    const [notifications, unreadCount] = await Promise.all([
      this.notificationService.findByUserId(user.id),
      this.notificationService.countUnread(user.id),
    ]);
    return NotificationListResponseDto.fromEntities(notifications, unreadCount);
  }

  @Get('unread')
  async findUnread(@CurrentUser() user: User): Promise<NotificationListResponseDto> {
    const notifications = await this.notificationService.findUnreadByUserId(user.id);
    return NotificationListResponseDto.fromEntities(notifications, notifications.length);
  }

  @Get('unread/count')
  async countUnread(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.notificationService.countUnread(user.id);
    return { count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationService.markAsRead(id, user.id);
    return NotificationResponseDto.fromEntity(notification);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(@CurrentUser() user: User): Promise<void> {
    await this.notificationService.markAllAsRead(user.id);
  }
}