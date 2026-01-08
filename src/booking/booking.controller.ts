import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy lịch đặt (Sẽ kích hoạt Waitlist)' })
  cancel(@Param('id') id: string, @Req() req: any) {
    // Truyền cả ID booking và ID user (để kiểm tra xem có đúng chính chủ đang hủy không)
    return this.bookingService.cancel(id, req.user.id);
  }
}
