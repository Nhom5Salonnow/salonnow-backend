import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
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
}
