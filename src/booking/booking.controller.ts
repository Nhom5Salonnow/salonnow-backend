import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { BookingsService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Đặt lịch mới' })
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    return this.bookingsService.create(createBookingDto, req.user);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Xem lịch sử đặt chỗ của tôi' })
  findMyBookings(@Req() req: any) {
    return this.bookingsService.findMyBookings(req.user.id);
  }
}
