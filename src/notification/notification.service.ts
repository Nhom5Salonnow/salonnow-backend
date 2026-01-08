import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  // Tạo thông báo
  async create(
    userId: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
    title?: string,
    data?: { bookingId?: string; salonId?: string; reviewId?: string },
  ) {
    const noti = this.notificationRepository.create({
      message,
      type,
      title: title || undefined,
      data: data || undefined,
      user: { id: userId },
    } as any);
    return await this.notificationRepository.save(noti);
  }

  // Lấy thông báo của tôi
  async getMyNotifications(userId: string) {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: notifications.map((n) => this.formatNotification(n)),
    };
  }

  // Đếm thông báo chưa đọc
  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false },
    });

    return {
      success: true,
      data: { count },
    };
  }

  // Đánh dấu đã đọc 1 thông báo
  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    await this.notificationRepository.save(notification);

    return {
      success: true,
      message: 'Marked as read',
    };
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  // Xóa thông báo
  async delete(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);

    return {
      success: true,
      message: 'Notification deleted',
    };
  }

  private formatNotification(notification: Notification) {
    return {
      id: notification.id,
      userId: notification.user?.id,
      type: notification.type.toLowerCase(),
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
