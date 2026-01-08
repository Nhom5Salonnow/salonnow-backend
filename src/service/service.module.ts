import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Salon } from '../salon/entities/salon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Salon])],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}
