import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stylist, StylistSchedule } from './entities/stylist.entity';
import { Salon } from '../salon/entities/salon.entity';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { UpdateStylistDto } from './dto/update-stylist.dto';
import { SetScheduleDto } from './dto/set-schedule.dto';

@Injectable()
export class StylistService {
  constructor(
    @InjectRepository(Stylist)
    private stylistRepository: Repository<Stylist>,
    @InjectRepository(StylistSchedule)
    private scheduleRepository: Repository<StylistSchedule>,
    @InjectRepository(Salon)
    private salonRepository: Repository<Salon>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async findAll(query: any) {
    const where: any = {};
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const stylists = await this.stylistRepository.find({
      where,
      relations: ['salon'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: stylists.map((s) => this.formatStylistResponse(s)),
    };
  }

  async findOne(id: string) {
    const stylist = await this.stylistRepository.findOne({
      where: { id },
      relations: ['salon'],
    });

    if (!stylist) {
      throw new NotFoundException('Stylist not found');
    }

    return {
      success: true,
      data: this.formatStylistResponse(stylist),
    };
  }

  async findBySalon(salonId: string, query: any) {
    const where: any = { salon: { id: salonId } };
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }
    if (query.specialty) {
      // Simple filter - in production use proper array contains
    }

    const stylists = await this.stylistRepository.find({
      where,
      relations: ['salon'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: stylists.map((s) => this.formatStylistResponse(s)),
    };
  }

  async create(ownerId: string, dto: CreateStylistDto) {
    // Verify salon ownership
    const salon = await this.salonRepository.findOne({
      where: { id: dto.salonId },
      relations: ['owner'],
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    if (salon.owner.id !== ownerId) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    const stylist = this.stylistRepository.create({
      salon: { id: dto.salonId },
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email || undefined,
      phoneNumber: dto.phoneNumber || undefined,
      avatar: dto.avatar || undefined,
      bio: dto.bio || undefined,
      specialties: dto.specialties || [],
      isActive: dto.isActive ?? true,
    } as any);

    const saved = await this.stylistRepository.save(stylist) as unknown as Stylist;

    return {
      success: true,
      data: this.formatStylistResponse(saved),
    };
  }

  async update(id: string, ownerId: string, dto: UpdateStylistDto) {
    const stylist = await this.stylistRepository.findOne({
      where: { id },
      relations: ['salon', 'salon.owner'],
    });

    if (!stylist) {
      throw new NotFoundException('Stylist not found');
    }

    if (stylist.salon.owner.id !== ownerId) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    Object.assign(stylist, dto);
    await this.stylistRepository.save(stylist);

    return {
      success: true,
      data: this.formatStylistResponse(stylist),
    };
  }

  async delete(id: string, ownerId: string) {
    const stylist = await this.stylistRepository.findOne({
      where: { id },
      relations: ['salon', 'salon.owner'],
    });

    if (!stylist) {
      throw new NotFoundException('Stylist not found');
    }

    if (stylist.salon.owner.id !== ownerId) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    await this.stylistRepository.remove(stylist);

    return {
      success: true,
      message: 'Stylist deleted successfully',
    };
  }

  async getAvailability(id: string, date: string, serviceId?: string) {
    const stylist = await this.stylistRepository.findOne({
      where: { id },
      relations: ['schedules'],
    });

    if (!stylist) {
      throw new NotFoundException('Stylist not found');
    }

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Get schedule for this day
    const schedule = stylist.schedules?.find((s) => s.dayOfWeek === dayOfWeek);

    if (!schedule || !schedule.isWorking) {
      return {
        success: true,
        data: {
          stylistId: id,
          date,
          slots: [],
        },
      };
    }

    // Get existing bookings for this stylist on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.bookingRepository.find({
      where: {
        stylistId: id,
        startTime: startOfDay,
        status: BookingStatus.PENDING || BookingStatus.CONFIRMED,
      },
    });

    // Generate time slots (30 min intervals)
    const slots = this.generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      30,
      bookings,
    );

    return {
      success: true,
      data: {
        stylistId: id,
        date,
        slots,
      },
    };
  }

  async getSchedule(id: string, ownerId: string) {
    const stylist = await this.stylistRepository.findOne({
      where: { id },
      relations: ['salon', 'salon.owner', 'schedules'],
    });

    if (!stylist) {
      throw new NotFoundException('Stylist not found');
    }

    if (stylist.salon.owner.id !== ownerId) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    return {
      success: true,
      data: stylist.schedules?.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isWorking: s.isWorking,
      })) || [],
    };
  }

  async setSchedule(id: string, ownerId: string, dto: SetScheduleDto) {
    const stylist = await this.stylistRepository.findOne({
      where: { id },
      relations: ['salon', 'salon.owner', 'schedules'],
    });

    if (!stylist) {
      throw new NotFoundException('Stylist not found');
    }

    if (stylist.salon.owner.id !== ownerId) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    // Delete existing schedules
    if (stylist.schedules?.length > 0) {
      await this.scheduleRepository.remove(stylist.schedules);
    }

    // Create new schedules
    const schedules = dto.schedule.map((s) =>
      this.scheduleRepository.create({
        stylist: { id },
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isWorking: s.isWorking,
      }),
    );

    await this.scheduleRepository.save(schedules);

    return {
      success: true,
      message: 'Schedule updated successfully',
    };
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    intervalMinutes: number,
    bookings: Booking[],
  ): { startTime: string; endTime: string; isAvailable: boolean }[] {
    const slots: { startTime: string; endTime: string; isAvailable: boolean }[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

      // Calculate end time
      let nextMin = currentMin + intervalMinutes;
      let nextHour = currentHour;
      if (nextMin >= 60) {
        nextHour++;
        nextMin -= 60;
      }
      const slotEnd = `${String(nextHour).padStart(2, '0')}:${String(nextMin).padStart(2, '0')}`;

      // Check if slot is available (not booked)
      const isAvailable = !bookings.some((b) => {
        const bookingTime = new Date(b.startTime);
        const bookingHour = bookingTime.getHours();
        const bookingMin = bookingTime.getMinutes();
        return bookingHour === currentHour && bookingMin === currentMin;
      });

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        isAvailable,
      });

      currentHour = nextHour;
      currentMin = nextMin;
    }

    return slots;
  }

  private formatStylistResponse(stylist: Stylist) {
    return {
      id: stylist.id,
      salonId: stylist.salon?.id,
      salon: stylist.salon
        ? {
            id: stylist.salon.id,
            name: stylist.salon.name,
          }
        : null,
      firstName: stylist.firstName,
      lastName: stylist.lastName,
      fullName: `${stylist.firstName} ${stylist.lastName}`,
      email: stylist.email,
      phoneNumber: stylist.phoneNumber,
      avatar: stylist.avatar,
      bio: stylist.bio,
      specialties: stylist.specialties,
      rating: stylist.rating,
      reviewCount: stylist.reviewCount,
      isActive: stylist.isActive,
      createdAt: stylist.createdAt,
    };
  }
}
