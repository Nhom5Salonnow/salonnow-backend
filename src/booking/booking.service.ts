import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from '../user/entities/user.entity';
import { SalonService } from '../salon/salon.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private salonsService: SalonService,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    customer: User,
  ): Promise<Booking> {
    const { salonId, startTime, endTime } = createBookingDto;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException(
        'Thời gian kết thúc phải sau thời gian bắt đầu',
      );
    }
    if (start < new Date()) {
      throw new BadRequestException('Không thể đặt lịch trong quá khứ');
    }

    const salon = await this.salonsService.findOne(salonId);
    if (!salon) throw new NotFoundException('Salon không tồn tại');

    const existingBooking = await this.bookingRepository.findOne({
      where: {
        salon: { id: salonId },
        status: BookingStatus.CONFIRMED,
        // (StartA < EndB) AND (EndA > StartB)
        startTime: LessThan(end),
        endTime: MoreThan(start),
      },
    });

    if (existingBooking) {
      throw new BadRequestException('Khung giờ này đã có người đặt!');
    }

    const booking = this.bookingRepository.create({
      startTime: start,
      endTime: end,
      salon: salon, //  object Salon
      customer: customer, //  object User
      status: BookingStatus.PENDING,
    });

    return await this.bookingRepository.save(booking);
  }

  // get booking history
  async findMyBookings(userId: string) {
    return await this.bookingRepository.find({
      where: { customer: { id: userId } },
      relations: ['salon'],
      order: { startTime: 'DESC' },
    });
  }
}
