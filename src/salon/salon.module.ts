import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salon } from './entities/salon.entity';
import { SalonController } from './salon.controller';
import { SalonService } from './salon.service';

import { UsersModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Salon]),


    UsersModule,
  ],
  controllers: [SalonController],
  providers: [SalonService],

  exports: [SalonService],
})
export class SalonModule {}
