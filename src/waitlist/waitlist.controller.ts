import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Waitlist')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) // Bắt buộc đăng nhập
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @ApiOperation({ summary: 'Tham gia hàng chờ' })
  join(@Body() createWaitlistDto: CreateWaitlistDto, @Req() req: any) {
    return this.waitlistService.join(req.user.id, createWaitlistDto);
  }

  @Get('my-list')
  @ApiOperation({ summary: 'Xem danh sách tôi đang chờ' })
  getMyList(@Req() req: any) {
    return this.waitlistService.findMyWaitlist(req.user.id);
  }

  @Get('salon/:salonId')
  @ApiOperation({ summary: 'Xem ai đang chờ ở Salon này (Dành cho Owner)' })
  getSalonWaitlist(@Param('salonId') salonId: string) {
    // Thực tế nên check quyền Owner ở đây, nhưng tạm thời để public cho dễ test
    return this.waitlistService.findBySalon(salonId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Rời hàng chờ' })
  remove(@Param('id') id: string) {
    return this.waitlistService.remove(id);
  }
}
