import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Xem danh sách thông báo của tôi' })
  findAll(@Req() req: any) {
    return this.notificationService.getMyNotifications(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy số thông báo chưa đọc' })
  getUnreadCount(@Req() req: any) {
    return this.notificationService.getUnreadCount(req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả đã đọc' })
  markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc' })
  @ApiParam({ name: 'id', description: 'ID của notification' })
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông báo' })
  @ApiParam({ name: 'id', description: 'ID của notification' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.delete(id, req.user.id);
  }
}
