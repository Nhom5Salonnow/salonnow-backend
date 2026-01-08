import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo dịch vụ mới' })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả dịch vụ' })
  findAll() {
    return this.serviceService.findAll();
  }

  @Get('salon/:salonId')
  @ApiOperation({ summary: 'Lấy dịch vụ theo salon' })
  @ApiParam({ name: 'salonId', description: 'ID của salon' })
  findBySalon(@Param('salonId') salonId: string) {
    return this.serviceService.findBySalon(salonId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy dịch vụ theo category' })
  @ApiParam({ name: 'categoryId', description: 'ID của category' })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.serviceService.findByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết dịch vụ' })
  @ApiParam({ name: 'id', description: 'ID của dịch vụ' })
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật dịch vụ' })
  @ApiParam({ name: 'id', description: 'ID của dịch vụ' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa dịch vụ' })
  @ApiParam({ name: 'id', description: 'ID của dịch vụ' })
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
