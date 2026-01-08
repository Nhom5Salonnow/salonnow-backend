import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SalonService } from './salon.service';
import { Salon } from './entities/salon.entity';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Salons')
@Controller('salons')
export class SalonController {
  constructor(private readonly salonService: SalonService) {}

  @Get()
  @ApiOperation({ summary: 'Get Salons list (Search by name/address)' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Find by name or address',
  })
  findAll(@Query('keyword') keywords: string): Promise<Salon[]> {
    return this.salonService.findAll(keywords);
  }

  @Get('my-salons')
  @ApiOperation({ summary: 'Get list of salons owned by me' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findMySalons(@Req() req: any) {
    // Truyền userId vào service
    return this.salonService.findMySalons(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get 1 salon detail' })
  findOne(@Param('id') id: string) {
    return this.salonService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create Salon (Auto upgrade user to OWNER)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createSalonDto: CreateSalonDto, @Req() req: any) {
    // Truyền userId và DTO vào service
    return this.salonService.create(req.user.id, createSalonDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Salon (Owner only)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateSalonDto: UpdateSalonDto,
    @Req() req: any,
  ) {
    return this.salonService.update(id, updateSalonDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Salon (Owner only)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    return this.salonService.delete(id, req.user.id);
  }
}
