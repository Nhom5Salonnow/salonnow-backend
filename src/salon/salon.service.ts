import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Salon } from './entities/salon.entity';
import { CreateSalonDto } from './dto/create-salon.dto';
import { User } from '../user/entities/user.entity';
import { UpdateSalonDto } from './dto/update-salon.dto';

@Injectable()
export class SalonService {
  constructor(
    @InjectRepository(Salon)
    private readonly salonRepository: Repository<Salon>,
  ) {}

  async create(createSalonDto: CreateSalonDto, owner: User): Promise<Salon> {
    const newSalon = this.salonRepository.create({
      ...createSalonDto,
      owner: owner,
    });
    return await this.salonRepository.save(newSalon);
  }

  async findAll(keyword?: string): Promise<Salon[]> {
    if (!keyword) {
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
  async findOne(id: number): Promise<Salon> {
    const salon = await this.salonRepository.findOne({
      where: { id },
      relations: ['owner', 'services'],
    });
    if (!salon) {
      throw new NotFoundException('No salon with id ' + id);
    }
    return salon;
  }

  async update(
    id: number,
    updateSalonDto: UpdateSalonDto,
    userRequesting: User,
  ): Promise<Salon> {
    const salon = await this.findOne(id);

    if (salon.owner.id !== userRequesting.id) {
      throw new ForbiddenException('You are not the owner of this salon');
    }

    Object.assign(salon, updateSalonDto);
    return await this.salonRepository.save(salon);
  }

  async delete(id: number, userRequesting: User): Promise<void> {
    const salon = await this.findOne(id);
    if (salon.owner.id !== userRequesting.id) {
      throw new ForbiddenException('You are not the owner of this salon');
    }
    await this.salonRepository.softDelete(id);
  }

  async findMySalons(ownerId: number): Promise<Salon[]> {
    return await this.salonRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['services'],
    });
  }

}
