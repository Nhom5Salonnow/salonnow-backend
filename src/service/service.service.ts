import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Repository } from 'typeorm';
import { Salon } from '../salon/entities/salon.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Salon)
    private salonRepository: Repository<Salon>,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    const salon = await this.salonRepository.findOneBy({
      id: createServiceDto.salonId,
    });
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    const newService = this.serviceRepository.create({
      ...createServiceDto,
      salon: salon,
    });

    return await this.serviceRepository.save(newService);
  }

  findAll() {
    return this.serviceRepository.find();
  }

  async findOne(id: string) {
    return await this.serviceRepository.findOne({ where: { id } });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.serviceRepository.update(id, updateServiceDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.serviceRepository.delete(id);
  }
}
