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
  UnauthorizedException,
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
  @ApiOperation({ summary: 'Get Salons list' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Find by name or address',
  })
  findAll(@Query('keyword') keywords: string): Promise<Salon[]> {
    return this.salonService.findAll(keywords);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get 1 salon detail' })
  findOne(@Param('id') id: number) {
    return this.salonService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create Salon' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createSalonDto: CreateSalonDto, @Req() req: any) {
    return this.salonService.create(createSalonDto, req);
  }

  @Get('my-salons')
  @ApiOperation({ summary: 'Get my salon list' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findMySalons(@Req() req: any) {
    return this.salonService.findMySalons(req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Salon (owner only' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: number,
    @Body() updateSalonDto: UpdateSalonDto,
    @Req() req: any,
  ) {
    return this.salonService.update(id, updateSalonDto, req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Salon (owner only)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: number, @Req() req: any): Promise<void> {
    return this.salonService.delete(id, req.user);
  }
}
