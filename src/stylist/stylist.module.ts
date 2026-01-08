import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StylistService } from './stylist.service';
import { StylistController } from './stylist.controller';
import { Stylist, StylistSchedule } from './entities/stylist.entity';
import { Salon } from '../salon/entities/salon.entity';
import { Booking } from '../booking/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stylist, StylistSchedule, Salon, Booking])],
  controllers: [StylistController],
  providers: [StylistService],
  exports: [StylistService],
})
export class StylistModule {}
