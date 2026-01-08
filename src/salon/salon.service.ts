import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Salon } from './entities/salon.entity';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { UserService } from '../user/users.service';
import { UserRole } from '../user/entities/user.entity';
@Injectable()
export class SalonService {
  constructor(
    @InjectRepository(Salon)
    private readonly salonRepository: Repository<Salon>,
    private readonly userService: UserService,
  ) {}

  // 3. Logic Tạo Salon + Nâng cấp User
  async create(userId: string, createSalonDto: CreateSalonDto): Promise<Salon> {
    const newSalon = this.salonRepository.create({
      ...createSalonDto,

      owner: { id: userId },
    });

    const savedSalon = await this.salonRepository.save(newSalon);

    await this.userService.updateRole(userId, UserRole.SALON_OWNER);

    return savedSalon;
  }

  async findAll(keyword?: string): Promise<Salon[]> {
    if (keyword) {
      return await this.salonRepository.find({
        where: [
          { name: ILike(`%${keyword}%`) },
          { address: ILike(`%${keyword}%`) },
        ],
        relations: ['owner'],
      });
    }

    return await this.salonRepository.find({
      relations: ['owner'],
    });
  }

  async findOne(id: string): Promise<Salon> {
    const salon = await this.salonRepository.findOne({
      where: { id },
      relations: ['owner', 'services'],
    });
    if (!salon) {
      throw new NotFoundException('Salon not found with id: ' + id);
    }
    return salon;
  }

  async update(
    id: string,
    updateSalonDto: UpdateSalonDto,
    userId: string,
  ): Promise<Salon> {
    const salon = await this.findOne(id);

    if (salon.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    Object.assign(salon, updateSalonDto);
    return await this.salonRepository.save(salon);
  }

  async delete(id: string, userId: string): Promise<void> {
    const salon = await this.findOne(id);

    if (salon.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    await this.salonRepository.softDelete(id);
  }

  async findMySalons(ownerId: string): Promise<Salon[]> {
    return await this.salonRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['services'],
    });
  }
}
