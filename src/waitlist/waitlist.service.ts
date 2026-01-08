import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist, WaitlistStatus } from './entities/waitlist.entity';
import { Repository } from 'typeorm';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { Booking } from '../booking/entities/booking.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist)
    private waitlistRepository: Repository<Waitlist>,
    private notificationService: NotificationService,
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

  async findMyWaitlist(userId: string) {
    return await this.waitlistRepository.find({
      where: { user: { id: userId } },
      relations: ['salon', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySalon(salonId: string) {
    return await this.waitlistRepository.find({
      where: { salon: { id: salonId }, status: WaitlistStatus.WAITING },
      relations: ['user', 'service'],
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string) {
    await this.waitlistRepository.delete(id);
  }

  async processEmptySlot(cancelledBooking: Booking) {
    const slotDate = new Date(cancelledBooking.startTime)
      .toISOString()
      .split('T')[0];
    const slotTime = new Date(cancelledBooking.startTime)
      .toTimeString()
      .substring(0, 5);

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
      return;
    }

    const bestCandidate = candidates[0];

    if (bestCandidate.isAutoBook) {
      await this.autoConvertBooking(bestCandidate, cancelledBooking);
    } else {
      await this.notifyCustomer(bestCandidate);
    }
  }

  private async autoConvertBooking(waitlistBase: Waitlist, slotInfo: Booking) {
    waitlistBase.status = WaitlistStatus.CONVERTED;
    await this.waitlistRepository.save(waitlistBase);

    const msg = `Chúc mừng! Bạn đã được tự động xếp lịch vào lúc ${slotInfo.startTime} tại ${slotInfo.salon.name}`;
    await this.notificationService.create(waitlistBase.user.id, msg);
  }

  private async notifyCustomer(waitlistBase: Waitlist) {
    waitlistBase.status = WaitlistStatus.OFFERED;
    await this.waitlistRepository.save(waitlistBase);

    const msg = `Có slot trống lúc ${waitlistBase.startWindow}! Vào app đặt ngay kẻo mất!`;
    await this.notificationService.create(waitlistBase.user.id, msg);
  }
}
