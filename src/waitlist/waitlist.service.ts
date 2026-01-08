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
    // Lưu ý: Chúng ta sẽ Inject BookingService sau, hoặc dùng EventEmitter để tránh Circular Dependency.
    // Ở đây tạm thời chỉ xử lý logic tìm kiếm.
  ) {}

  async join(userId: string, dto: CreateWaitlistDto) {
    const item = this.waitlistRepository.create({
      ...dto,
      user: { id: userId },
      salon: { id: dto.salonId },
      service: { id: dto.serviceId },
    });
    return await this.waitlistRepository.save(item);
  }

  // 👇 LOGIC THÔNG MINH: Xử lý khi có slot trống (Booking bị hủy)
  async processEmptySlot(cancelledBooking: Booking) {
    console.log(
      `🔍 Đang quét Waitlist cho slot vừa hủy: ${cancelledBooking.startTime}`,
    );

    // 1. Lấy thông tin slot vừa bị hủy
    const slotDate = new Date(cancelledBooking.startTime)
      .toISOString()
      .split('T')[0]; // YYYY-MM-DD
    const slotTime = new Date(cancelledBooking.startTime)
      .toTimeString()
      .substring(0, 5); // HH:mm

    // 2. Tìm những người đang chờ khớp lệnh
    // Điều kiện: Cùng Salon, Cùng Service (hoặc bất kỳ), Cùng Ngày, và Slot nằm trong khung giờ rảnh
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
      .orderBy('waitlist.createdAt', 'ASC') // Ưu tiên ai đăng ký trước
      .getMany();

    if (candidates.length === 0) {
      console.log('❌ Không tìm thấy ai trong danh sách chờ phù hợp.');
      return;
    }

    // 3. Xử lý ứng viên đầu tiên (First Come First Served)
    const bestCandidate = candidates[0];
    console.log(`✅ Tìm thấy khách hàng: ${bestCandidate.user.email}`);

    if (bestCandidate.isAutoBook) {
      // TRƯỜNG HỢP A: TỰ ĐỘNG ĐẶT (AUTO-BOOK)
      await this.autoConvertBooking(bestCandidate, cancelledBooking);
    } else {
      // TRƯỜNG HỢP B: CHỈ THÔNG BÁO (NOTIFY)
      await this.notifyCustomer(bestCandidate);
    }
  }

  private async autoConvertBooking(waitlistBase: Waitlist, slotInfo: Booking) {
    // Logic: Gọi sang BookingService để tạo booking mới (Sẽ implement ở Controller hoặc Event)
    // Ở đây ta update trạng thái waitlist trước
    waitlistBase.status = WaitlistStatus.CONVERTED;
    await this.waitlistRepository.save(waitlistBase);

    console.log(
      `🚀 [SMART] Đã tự động tạo Booking mới cho ${waitlistBase.user.email} vào lúc ${slotInfo.startTime}`,
    );
    // Thực tế: Bạn cần gọi BookingService.create(...) ở đây
    // Gửi email: "Booking của bạn đã được xác nhận tự động!"
  }

  private async notifyCustomer(waitlistBase: Waitlist) {
    waitlistBase.status = WaitlistStatus.OFFERED;
    await this.waitlistRepository.save(waitlistBase);

    console.log(
      `📧 [EMAIL] Gửi cho ${waitlistBase.user.email}: "Có chỗ trống lúc ${waitlistBase.startWindow}! Bấm vào đây để đặt ngay."`,
    );
    // Thực tế: Tích hợp SendGrid/Firebase Notification tại đây
  }
}
