import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) // Bắt buộc đăng nhập mới được đặt lịch
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    return this.bookingService.create(req.user.id, createBookingDto);
  }

  @Get('my-bookings')
  findMyBookings(@Req() req: any) {
    return this.bookingService.findMyBookings(req.user.id);
  }
}
