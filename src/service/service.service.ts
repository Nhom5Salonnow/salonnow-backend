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
      name: createServiceDto.name,
      price: createServiceDto.price,
      duration: createServiceDto.duration,
      description: createServiceDto.description || undefined,
      salon: salon,
      salon_id: createServiceDto.salonId,
      categoryId: createServiceDto.categoryId || undefined,
      images: createServiceDto.images || [],
      isActive: createServiceDto.isActive ?? true,
    } as any);

    const saved = await this.serviceRepository.save(newService) as unknown as Service;
    return {
      success: true,
      data: await this.formatServiceResponse(saved.id),
    };
  }

  async findAll() {
    const services = await this.serviceRepository.find({
      relations: ['salon', 'category'],
    });
    return {
      success: true,
      data: services.map((s) => this.formatService(s)),
    };
  }

  async findOne(id: string) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['salon', 'category'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return {
      success: true,
      data: this.formatService(service),
    };
  }

  async findBySalon(salonId: string) {
    const services = await this.serviceRepository.find({
      where: { salon_id: salonId },
      relations: ['salon', 'category'],
    });

    return {
      success: true,
      data: services.map((s) => this.formatService(s)),
    };
  }

  async findByCategory(categoryId: string) {
    const services = await this.serviceRepository.find({
      where: { categoryId },
      relations: ['salon', 'category'],
    });

    return {
      success: true,
      data: services.map((s) => this.formatService(s)),
    };
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    Object.assign(service, updateServiceDto);
    await this.serviceRepository.save(service);

    return {
      success: true,
      data: await this.formatServiceResponse(id),
    };
  }

  async remove(id: string) {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    await this.serviceRepository.remove(service);

    return {
      success: true,
      message: 'Service deleted successfully',
    };
  }

  private async formatServiceResponse(id: string) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['salon', 'category'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.formatService(service);
  }

  private formatService(service: Service) {
    return {
      id: service.id,
      salonId: service.salon_id,
      salon: service.salon
        ? {
            id: service.salon.id,
            name: service.salon.name,
          }
        : null,
      categoryId: service.categoryId,
      category: service.category
        ? {
            id: service.category.id,
            name: service.category.name,
            slug: service.category.slug,
          }
        : null,
      name: service.name,
      price: service.price,
      duration: service.duration,
      description: service.description,
      images: service.images,
      rating: service.rating,
      reviewCount: service.reviewCount,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
