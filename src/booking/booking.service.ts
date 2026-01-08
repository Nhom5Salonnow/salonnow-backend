import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Repository, Between, In } from 'typeorm';
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
      customer: { id: userId },
      salon: { id: createBookingDto.salonId },
      service: { id: createBookingDto.serviceId },
      stylistId: createBookingDto.stylistId || undefined,
      notes: createBookingDto.notes || undefined,
    } as any);

    const saved = await this.bookingRepository.save(newBooking) as unknown as Booking;
    return this.findOne(saved.id, userId);
  }

  async findOne(id: string, userId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['salon', 'service', 'customer'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user owns the booking or is salon owner
    if (booking.customer.id !== userId) {
      // Could add salon owner check here
      throw new ForbiddenException('You are not allowed to view this booking');
    }

    return {
      success: true,
      data: this.formatBookingResponse(booking),
    };
  }

  async findOneForSalonOwner(id: string, salonOwnerId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['salon', 'salon.owner', 'service', 'customer'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.salon.owner.id !== salonOwnerId && booking.customer.id !== salonOwnerId) {
      throw new ForbiddenException('You are not allowed to view this booking');
    }

    return {
      success: true,
      data: this.formatBookingResponse(booking),
    };
  }

  async findMyBookings(userId: string) {
    const bookings = await this.bookingRepository.find({
      where: { customer: { id: userId } },
      relations: ['salon', 'service'],
      order: { startTime: 'DESC' },
    });

    return {
      success: true,
      data: bookings.map((b) => this.formatBookingResponse(b)),
    };
  }

  async findHistory(userId: string, page: number = 1, limit: number = 20) {
    const [bookings, total] = await this.bookingRepository.findAndCount({
      where: {
        customer: { id: userId },
        status: BookingStatus.COMPLETED,
      },
      relations: ['salon', 'service'],
      order: { startTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: {
        items: bookings.map((b) => this.formatBookingResponse(b)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findBySalon(
    salonId: string,
    ownerId: string,
    query: QueryBookingDto,
  ) {
    // Verify salon ownership
    const salonCheck = await this.bookingRepository.findOne({
      where: { salon: { id: salonId, owner: { id: ownerId } } },
      relations: ['salon', 'salon.owner'],
    });

    // Build query conditions
    const where: any = { salon: { id: salonId } };

    if (query.status) {
      const statuses = query.status.split(',').map((s) => s.trim().toUpperCase());
      where.status = In(statuses);
    }

    if (query.date) {
      const startOfDay = new Date(query.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(query.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.startTime = Between(startOfDay, endOfDay);
    } else if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.startTime = Between(start, end);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [bookings, total] = await this.bookingRepository.findAndCount({
      where,
      relations: ['salon', 'service', 'customer'],
      order: { startTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: {
        items: bookings.map((b) => this.formatBookingResponse(b)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async update(id: string, userId: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['salon', 'service', 'customer'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customer.id !== userId) {
      throw new ForbiddenException('You are not allowed to update this booking');
    }

    // Only allow updates if booking is PENDING
    if (booking.status !== BookingStatus.PENDING) {
      throw new ForbiddenException('Cannot update booking that is not pending');
    }

    // Update fields
    if (updateBookingDto.startTime) {
      booking.startTime = new Date(updateBookingDto.startTime);
    }
    if (updateBookingDto.stylistId !== undefined) {
      booking.stylistId = updateBookingDto.stylistId;
    }
    if (updateBookingDto.notes !== undefined) {
      booking.notes = updateBookingDto.notes;
    }

    await this.bookingRepository.save(booking);

    return {
      success: true,
      message: 'Booking updated successfully',
      data: this.formatBookingResponse(booking),
    };
  }

  async updateStatus(
    id: string,
    ownerId: string,
    updateStatusDto: UpdateBookingStatusDto,
  ) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['salon', 'salon.owner', 'service', 'customer'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify salon owner
    if (booking.salon.owner.id !== ownerId) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    booking.status = updateStatusDto.status;
    if (updateStatusDto.cancelReason) {
      booking.cancelReason = updateStatusDto.cancelReason;
    }

    await this.bookingRepository.save(booking);

    // Trigger waitlist if cancelled
    if (updateStatusDto.status === BookingStatus.CANCELLED) {
      this.waitlistService
        .processEmptySlot(booking)
        .catch((err) => console.error(err));
    }

    return {
      success: true,
      message: 'Booking status updated',
      data: this.formatBookingResponse(booking),
    };
  }

  async cancel(id: string, userId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['salon', 'service', 'customer'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customer.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to cancel this booking',
      );
    }

    booking.status = BookingStatus.CANCELLED;
    await this.bookingRepository.save(booking);

    this.waitlistService
      .processEmptySlot(booking)
      .catch((err) => console.error(err));

    return {
      success: true,
      message: 'Booking cancelled. Smart Waitlist triggered.',
    };
  }

  private formatBookingResponse(booking: Booking) {
    return {
      id: booking.id,
      salonId: booking.salon?.id,
      salon: booking.salon
        ? {
            id: booking.salon.id,
            name: booking.salon.name,
            address: booking.salon.address,
            phone: booking.salon.phone,
          }
        : null,
      serviceId: booking.service?.id,
      service: booking.service
        ? {
            id: booking.service.id,
            name: booking.service.name,
            price: booking.service.price,
            duration: booking.service.duration,
          }
        : null,
      stylistId: booking.stylistId,
      userId: booking.customer?.id,
      user: booking.customer
        ? {
            id: booking.customer.id,
            firstName: booking.customer.firstName,
            lastName: booking.customer.lastName,
            phoneNumber: booking.customer.phoneNumber,
          }
        : null,
      startTime: booking.startTime,
      status: booking.status.toLowerCase(),
      notes: booking.notes,
      cancelReason: booking.cancelReason,
      totalPrice: booking.totalPrice || booking.service?.price,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
