import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { WaitlistModule } from '../waitlist/waitlist.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), WaitlistModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
