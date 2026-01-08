import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Like, ILike } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { Salon } from '../salon/entities/salon.entity';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { Payment, PaymentStatus } from '../payment/entities/payment.entity';
import { QueryStatsDto } from './dto/query-stats.dto';
import { QueryRevenueDto, RevenuePeriod } from './dto/query-revenue.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Salon)
    private salonRepository: Repository<Salon>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  // Dashboard Stats
  async getDashboardStats(query: QueryStatsDto) {
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate);

    // Count users
    const totalUsers = await this.userRepository.count();
    const newUsers = dateFilter
      ? await this.userRepository.count({ where: { createdAt: dateFilter } })
      : totalUsers;

    // Count by role
    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    // Count salons
    const totalSalons = await this.salonRepository.count();
    const activeSalons = await this.salonRepository.count({
      where: { isActive: true },
    });

    // Count bookings
    const totalBookings = await this.bookingRepository.count();
    const bookingsByStatus = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('booking.status')
      .getRawMany();

    // Calculate revenue
    const revenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    return {
      success: true,
      data: {
        users: {
          total: totalUsers,
          new: newUsers,
          byRole: usersByRole.reduce(
            (acc, item) => ({ ...acc, [item.role]: parseInt(item.count) }),
            {},
          ),
        },
        salons: {
          total: totalSalons,
          active: activeSalons,
        },
        bookings: {
          total: totalBookings,
          byStatus: bookingsByStatus.reduce(
            (acc, item) => ({ ...acc, [item.status]: parseInt(item.count) }),
            {},
          ),
        },
        revenue: {
          total: totalRevenue,
        },
      },
    };
  }

  // Revenue Report
  async getRevenueReport(query: QueryRevenueDto) {
    const { startDate, endDate, period = RevenuePeriod.MONTH } = query;

    let dateFormat: string;
    switch (period) {
      case RevenuePeriod.DAY:
        dateFormat = 'YYYY-MM-DD';
        break;
      case RevenuePeriod.WEEK:
        dateFormat = 'IYYY-IW';
        break;
      case RevenuePeriod.MONTH:
        dateFormat = 'YYYY-MM';
        break;
      case RevenuePeriod.YEAR:
        dateFormat = 'YYYY';
        break;
    }

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .select(`TO_CHAR(payment.createdAt, '${dateFormat}')`, 'period')
      .addSelect('SUM(payment.amount)', 'revenue')
      .addSelect('COUNT(*)', 'transactions')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED });

    if (startDate) {
      qb.andWhere('payment.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      qb.andWhere('payment.createdAt <= :endDate', {
        endDate: new Date(endDate + 'T23:59:59'),
      });
    }

    const revenueByPeriod = await qb
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    // Revenue by payment method
    const revenueByMethod = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.method', 'method')
      .addSelect('SUM(payment.amount)', 'revenue')
      .addSelect('COUNT(*)', 'count')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('payment.method')
      .getRawMany();

    // Total calculations
    const totalRevenue = revenueByPeriod.reduce(
      (sum, item) => sum + parseFloat(item.revenue || '0'),
      0,
    );
    const totalTransactions = revenueByPeriod.reduce(
      (sum, item) => sum + parseInt(item.transactions || '0'),
      0,
    );

    return {
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalTransactions,
          avgTransactionValue:
            totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        },
        byPeriod: revenueByPeriod.map((item) => ({
          period: item.period,
          revenue: parseFloat(item.revenue || '0'),
          transactions: parseInt(item.transactions || '0'),
        })),
        byMethod: revenueByMethod.map((item) => ({
          method: item.method,
          revenue: parseFloat(item.revenue || '0'),
          count: parseInt(item.count || '0'),
        })),
      },
    };
  }

  // Booking Analytics
  async getBookingAnalytics(query: QueryStatsDto) {
    const { startDate, endDate } = query;

    const qb = this.bookingRepository.createQueryBuilder('booking');

    if (startDate) {
      qb.andWhere('booking.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      qb.andWhere('booking.createdAt <= :endDate', {
        endDate: new Date(endDate + 'T23:59:59'),
      });
    }

    // Total and by status
    const totalBookings = await qb.getCount();

    const byStatus = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('booking.status')
      .getRawMany();

    // Bookings by day of week
    const byDayOfWeek = await this.bookingRepository
      .createQueryBuilder('booking')
      .select("EXTRACT(DOW FROM booking.startTime)", 'dayOfWeek')
      .addSelect('COUNT(*)', 'count')
      .groupBy('dayOfWeek')
      .orderBy('dayOfWeek', 'ASC')
      .getRawMany();

    // Bookings by hour
    const byHour = await this.bookingRepository
      .createQueryBuilder('booking')
      .select("EXTRACT(HOUR FROM booking.startTime)", 'hour')
      .addSelect('COUNT(*)', 'count')
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    // Top salons by bookings
    const topSalons = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.salon', 'salon')
      .select('salon.id', 'salonId')
      .addSelect('salon.name', 'salonName')
      .addSelect('COUNT(*)', 'bookingCount')
      .groupBy('salon.id')
      .addGroupBy('salon.name')
      .orderBy('bookingCount', 'DESC')
      .limit(10)
      .getRawMany();

    // Completion rate
    const completedCount =
      byStatus.find((s) => s.status === BookingStatus.COMPLETED)?.count || 0;
    const cancelledCount =
      byStatus.find((s) => s.status === BookingStatus.CANCELLED)?.count || 0;
    const noShowCount =
      byStatus.find((s) => s.status === BookingStatus.NO_SHOW)?.count || 0;

    const completionRate =
      totalBookings > 0 ? (parseInt(completedCount) / totalBookings) * 100 : 0;
    const cancellationRate =
      totalBookings > 0 ? (parseInt(cancelledCount) / totalBookings) * 100 : 0;
    const noShowRate =
      totalBookings > 0 ? (parseInt(noShowCount) / totalBookings) * 100 : 0;

    return {
      success: true,
      data: {
        summary: {
          total: totalBookings,
          completionRate: Math.round(completionRate * 100) / 100,
          cancellationRate: Math.round(cancellationRate * 100) / 100,
          noShowRate: Math.round(noShowRate * 100) / 100,
        },
        byStatus: byStatus.map((item) => ({
          status: item.status,
          count: parseInt(item.count),
        })),
        byDayOfWeek: byDayOfWeek.map((item) => ({
          dayOfWeek: parseInt(item.dayOfWeek),
          count: parseInt(item.count),
        })),
        byHour: byHour.map((item) => ({
          hour: parseInt(item.hour),
          count: parseInt(item.count),
        })),
        topSalons: topSalons.map((item) => ({
          salonId: item.salonId,
          salonName: item.salonName,
          bookingCount: parseInt(item.bookingCount),
        })),
      },
    };
  }

  // Get all users (Admin)
  async getUsers(query: QueryUsersDto) {
    const { role, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.userRepository.createQueryBuilder('user');

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (search) {
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await qb
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phoneNumber',
        'user.avatarUrl',
        'user.role',
        'user.createdAt',
      ])
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: users.map((user) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          phoneNumber: user.phoneNumber,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Update user role (Admin)
  async updateUserRole(userId: string, dto: UpdateRoleDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = dto.role;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'User role updated successfully',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Get user detail (Admin)
  async getUserDetail(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['salons', 'bookings'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
        stats: {
          salonsOwned: user.salons?.length || 0,
          totalBookings: user.bookings?.length || 0,
        },
      },
    };
  }

  private buildDateFilter(startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      return Between(new Date(startDate), new Date(endDate + 'T23:59:59'));
    }
    if (startDate) {
      return MoreThanOrEqual(new Date(startDate));
    }
    if (endDate) {
      return LessThanOrEqual(new Date(endDate + 'T23:59:59'));
    }
    return null;
  }
}
