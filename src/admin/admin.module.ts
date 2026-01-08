import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../user/entities/user.entity';
import { Salon } from '../salon/entities/salon.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Payment } from '../payment/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Salon, Booking, Payment])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
