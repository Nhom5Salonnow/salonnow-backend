import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';


import { UsersModule } from './user/user.module';
import { SalonModule } from './salon/salon.module';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { ServiceModule } from './service/service.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewModule } from './review/review.module';
import { StylistModule } from './stylist/stylist.module';
import { CategoryModule } from './category/category.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // 1. Cấu hình đọc file .env (Để lấy JWT_SECRET, DB Password...)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Cấu hình kết nối Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres_db',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'myuser',
      password: process.env.DATABASE_PASSWORD || 'mypassword',
      database: process.env.DATABASE_NAME || 'salon_db',

      autoLoadEntities: true,

      synchronize: true,
    }),

    UsersModule, // Quản lý người dùng
    SalonModule, // Quản lý tiệm (Khắc phục lỗi User#salons not found)
    AuthModule, // Quản lý đăng nhập/Token
    BookingModule,
    ServiceModule,
    WaitlistModule,
    NotificationModule,
    PaymentModule,
    ReviewModule,
    StylistModule,
    CategoryModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
