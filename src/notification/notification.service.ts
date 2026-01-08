import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  // 1. Tạo thông báo (Hàm này sẽ được WaitlistService gọi)
  async create(userId: string, message: string) {
    const noti = this.notificationRepository.create({
      message,
      user: { id: userId },
    });
    return await this.notificationRepository.save(noti);
  }

  // 2. Lấy thông báo của tôi (Mới nhất lên đầu)
  async getMyNotifications(userId: string) {
    return await this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // 3. Đánh dấu đã đọc
  async markAsRead(id: string) {
    await this.notificationRepository.update(id, { isRead: true });
    return { message: 'Marked as read' };
  }
}
