import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './booking.service';
import { BookingsController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { SalonModule } from '../salon/salon.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), SalonModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
