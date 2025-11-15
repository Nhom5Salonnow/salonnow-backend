import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EntityRepository, QueryOrder, wrap, EntityManager } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Salon } from '../../entities/Salon';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { SalonResponseDto } from './dto/salon-response.dto';

@Controller('salon')
@ApiTags('salon')
export class SalonController {
  constructor(
    @InjectRepository(Salon) private readonly SalonRepository: EntityRepository<Salon>,
    private readonly em: EntityManager,
  ) { }

  @Get()
  @ApiOperation({ summary: 'List up to 20 salons' })
  @ApiResponse({ status: 200, description: 'Found salons', type: [SalonResponseDto] })
  async find() {
    const salons = await this.SalonRepository.findAll({
      populate: ['name', 'address'],
      orderBy: { name: QueryOrder.DESC },
      limit: 20,
    });
    return salons.map(e => new SalonResponseDto(e));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single salon by ID' })
  @ApiResponse({ status: 200, description: 'The found salon', type: SalonResponseDto })
  @ApiResponse({ status: 404, description: 'Salon not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const salon = await this.SalonRepository.findOne(id, {
      populate: ['name', 'address'],
    });
    if (!salon) {
      throw new HttpException(`Salon with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return new SalonResponseDto(salon);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new salon' })
  @ApiResponse({ status: 201, description: 'Salon created successfully', type: SalonResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createSalonDto: CreateSalonDto) {
    const salon = this.SalonRepository.create(createSalonDto);
    await this.em.flush();

    return new SalonResponseDto(salon);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing salon' })
  @ApiResponse({ status: 200, description: 'Salon updated successfully', type: SalonResponseDto })
  @ApiResponse({ status: 404, description: 'Salon not found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateSalonDto: UpdateSalonDto) {
    const salon = await this.SalonRepository.findOne(id);
    if (!salon) {
      throw new HttpException(`Salon with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
    wrap(salon).assign(updateSalonDto);
    await this.em.flush();

    return new SalonResponseDto(salon);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing salon' })
  @ApiResponse({ status: 204, description: 'Salon deleted successfully' })
  @ApiResponse({ status: 404, description: 'Salon not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const salon = await this.SalonRepository.findOne(id, { populate: [] });
    if (!salon) {
      throw new HttpException(`Salon with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
    await this.em.removeAndFlush(salon);
  }
}
