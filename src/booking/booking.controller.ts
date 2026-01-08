import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo booking mới' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    return this.bookingService.create(req.user.id, createBookingDto);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Lấy danh sách booking của tôi' })
  findMyBookings(@Req() req: any) {
    return this.bookingService.findMyBookings(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Lấy lịch sử booking đã hoàn thành' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findHistory(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookingService.findHistory(req.user.id, page, limit);
  }

  @Get('salon/:salonId')
  @ApiOperation({ summary: 'Lấy danh sách booking của salon (Salon Owner)' })
  @ApiParam({ name: 'salonId', description: 'ID của salon' })
  findBySalon(
    @Param('salonId') salonId: string,
    @Query() query: QueryBookingDto,
    @Req() req: any,
  ) {
    return this.bookingService.findBySalon(salonId, req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết booking' })
  @ApiParam({ name: 'id', description: 'ID của booking' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.bookingService.findOneForSalonOwner(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật booking (chỉ khi PENDING)' })
  @ApiParam({ name: 'id', description: 'ID của booking' })
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req: any,
  ) {
    return this.bookingService.update(id, req.user.id, updateBookingDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Đổi trạng thái booking (Salon Owner)' })
  @ApiParam({ name: 'id', description: 'ID của booking' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateBookingStatusDto,
    @Req() req: any,
  ) {
    return this.bookingService.updateStatus(id, req.user.id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy lịch đặt (Sẽ kích hoạt Waitlist)' })
  @ApiParam({ name: 'id', description: 'ID của booking' })
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.bookingService.cancel(id, req.user.id);
  }
}
