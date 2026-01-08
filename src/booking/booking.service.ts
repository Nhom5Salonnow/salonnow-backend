import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { WaitlistService } from '../waitlist/waitlist.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private waitlistService: WaitlistService,
  ) {}

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const newBooking = this.bookingRepository.create({
      startTime: createBookingDto.startTime,
      customer: { id: userId }, // Gán ID khách hàng
      salon: { id: createBookingDto.salonId }, // Gán ID Salon
      service: { id: createBookingDto.serviceId }, // Gán ID Dịch vụ
    });

    return await this.bookingRepository.save(newBooking);
  }

  // Lấy booking của tôi (Dành cho Client xem lịch sử)
  async findMyBookings(userId: string) {
    return await this.bookingRepository.find({
      where: { customer: { id: userId } },
      relations: ['salon', 'service'],
      order: { startTime: 'DESC' },
    });
  }

  async cancel(id: string, userId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['salon', 'service'], // 👈 Phải load relation để Waitlist biết salon/service nào
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // Cập nhật trạng thái hủy
    booking.status = BookingStatus.CANCELLED;
    await this.bookingRepository.save(booking);
    this.waitlistService
      .processEmptySlot(booking)
      .catch((err) => console.error(err));

    return { message: 'Booking cancelled. Smart Waitlist triggered.' };
  }
}
