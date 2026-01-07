import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salon } from './entities/salon.entity';
import { SalonController } from './salon.controller';
import { UserService } from '../user/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Salon])],
  controllers: [SalonController],
  providers: [UserService],

  exports: [UserService],
})
export class SalonModule {}
