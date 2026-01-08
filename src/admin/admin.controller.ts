import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { QueryStatsDto } from './dto/query-stats.dto';
import { QueryRevenueDto } from './dto/query-revenue.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Thống kê tổng quan (Admin only)' })
  getDashboardStats(@Query() query: QueryStatsDto) {
    return this.adminService.getDashboardStats(query);
  }

  @Get('dashboard/revenue')
  @ApiOperation({ summary: 'Báo cáo doanh thu (Admin only)' })
  getRevenueReport(@Query() query: QueryRevenueDto) {
    return this.adminService.getRevenueReport(query);
  }

  @Get('dashboard/bookings')
  @ApiOperation({ summary: 'Thống kê booking (Admin only)' })
  getBookingAnalytics(@Query() query: QueryStatsDto) {
    return this.adminService.getBookingAnalytics(query);
  }

  @Get('users')
  @ApiOperation({ summary: 'Danh sách người dùng (Admin only)' })
  getUsers(@Query() query: QueryUsersDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Chi tiết người dùng (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Thay đổi role người dùng (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateUserRole(id, dto);
  }
}
