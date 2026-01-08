import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StylistService } from './stylist.service';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { UpdateStylistDto } from './dto/update-stylist.dto';
import { SetScheduleDto } from './dto/set-schedule.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Stylists')
@Controller('stylists')
export class StylistController {
  constructor(private readonly stylistService: StylistService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả stylists' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(@Query() query: any) {
    return this.stylistService.findAll(query);
  }

  @Get('salon/:salonId')
  @ApiOperation({ summary: 'Lấy stylists của salon' })
  @ApiParam({ name: 'salonId', description: 'ID của salon' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'specialty', required: false, type: String })
  findBySalon(@Param('salonId') salonId: string, @Query() query: any) {
    return this.stylistService.findBySalon(salonId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết stylist' })
  @ApiParam({ name: 'id', description: 'ID của stylist' })
  findOne(@Param('id') id: string) {
    return this.stylistService.findOne(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Lấy lịch trống của stylist' })
  @ApiParam({ name: 'id', description: 'ID của stylist' })
  @ApiQuery({ name: 'date', required: true, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'serviceId', required: false })
  getAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.stylistService.getAvailability(id, date, serviceId);
  }

  @Get(':id/schedule')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy lịch làm việc (Salon Owner)' })
  @ApiParam({ name: 'id', description: 'ID của stylist' })
  getSchedule(@Param('id') id: string, @Req() req: any) {
    return this.stylistService.getSchedule(id, req.user.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm stylist (Salon Owner)' })
  create(@Body() dto: CreateStylistDto, @Req() req: any) {
    return this.stylistService.create(req.user.id, dto);
  }

  @Post(':id/schedule')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đặt lịch làm việc (Salon Owner)' })
  @ApiParam({ name: 'id', description: 'ID của stylist' })
  setSchedule(
    @Param('id') id: string,
    @Body() dto: SetScheduleDto,
    @Req() req: any,
  ) {
    return this.stylistService.setSchedule(id, req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật stylist (Salon Owner)' })
  @ApiParam({ name: 'id', description: 'ID của stylist' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStylistDto,
    @Req() req: any,
  ) {
    return this.stylistService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa stylist (Salon Owner)' })
  @ApiParam({ name: 'id', description: 'ID của stylist' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.stylistService.delete(id, req.user.id);
  }
}
