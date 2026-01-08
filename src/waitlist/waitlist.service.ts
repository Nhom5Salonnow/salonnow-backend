import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist, WaitlistStatus } from './entities/waitlist.entity';
import { Repository } from 'typeorm';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { Booking } from '../booking/entities/booking.entity';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist)
    private waitlistRepository: Repository<Waitlist>,
  ) {}

  // 1. Khách hàng đăng ký chờ
  async join(userId: string, dto: CreateWaitlistDto) {
    const item = this.waitlistRepository.create({
      ...dto,
      user: { id: userId },
      salon: { id: dto.salonId },
      service: { id: dto.serviceId },
    });
    return await this.waitlistRepository.save(item);
  }

  // 2. Xem danh sách chờ của tôi (Client)
  async findMyWaitlist(userId: string) {
    return await this.waitlistRepository.find({
      where: { user: { id: userId } },
      relations: ['salon', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  // 3. Xem danh sách chờ của Salon (Dành cho Chủ tiệm - Owner)
  async findBySalon(salonId: string) {
    return await this.waitlistRepository.find({
      where: { salon: { id: salonId }, status: WaitlistStatus.WAITING },
      relations: ['user', 'service'],
      order: { createdAt: 'ASC' }, // Ai đến trước phục vụ trước
    });
  }

  // 4. Hủy chờ (Rời hàng chờ)
  async remove(id: string) {
    await this.waitlistRepository.delete(id);
  }

  // Hàm này được gọi khi có một Booking bị HỦY
  async processEmptySlot(cancelledBooking: Booking) {
    console.log(
      `🔍 [Smart Waitlist] Đang quét slot vừa hủy: ${cancelledBooking.startTime.toISOString()}`,
    );

    // Lấy ngày và giờ của slot bị hủy
    const slotDate = new Date(cancelledBooking.startTime)
      .toISOString()
      .split('T')[0]; // YYYY-MM-DD
    const slotTime = new Date(cancelledBooking.startTime)
      .toTimeString()
      .substring(0, 5); // HH:mm

    // Tìm ứng viên phù hợp
    const candidates = await this.waitlistRepository
      .createQueryBuilder('waitlist')
      .leftJoinAndSelect('waitlist.user', 'user')
      .where('waitlist.salon_id = :salonId', {
        salonId: cancelledBooking.salon.id,
      })
      .andWhere('waitlist.service_id = :serviceId', {
        serviceId: cancelledBooking.service.id,
      })
      .andWhere('waitlist.status = :status', { status: WaitlistStatus.WAITING })
      .andWhere('waitlist.preferredDate = :date', { date: slotDate })
      .andWhere('waitlist.startWindow <= :time', { time: slotTime })
      .andWhere('waitlist.endWindow >= :time', { time: slotTime })
      .orderBy('waitlist.createdAt', 'ASC')
      .getMany();

    if (candidates.length === 0) {
      console.log('❌ Không tìm thấy ai phù hợp.');
      return;
    }

    // Chọn người đầu tiên
    const bestCandidate = candidates[0];
    console.log(`✅ Tìm thấy ứng viên: ${bestCandidate.user.email}`);

    if (bestCandidate.isAutoBook) {
      await this.autoConvertBooking(bestCandidate, cancelledBooking);
    } else {
      await this.notifyCustomer(bestCandidate);
    }
  }

  private async autoConvertBooking(waitlistBase: Waitlist, slotInfo: Booking) {
    // Cập nhật trạng thái trong Waitlist
    waitlistBase.status = WaitlistStatus.CONVERTED;
    await this.waitlistRepository.save(waitlistBase);

    console.log(
      `🚀 [AUTO-BOOK] Đã tự động chuyển đổi booking cho ${waitlistBase.user.email}`,
    );
    // TODO: Gọi BookingService.create() ở đây để tạo booking chính thức
  }

  private async notifyCustomer(waitlistBase: Waitlist) {
    waitlistBase.status = WaitlistStatus.OFFERED;
    await this.waitlistRepository.save(waitlistBase);

    console.log(`📧 [NOTIFY] Đã gửi thông báo cho ${waitlistBase.user.email}`);
  }
}
