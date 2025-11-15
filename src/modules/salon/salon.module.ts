import { Module } from '@nestjs/common';
import { SalonController } from './salon.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs'; // <-- 1. Import MikroOrmModule
import { Salon } from '../../entities/Salon'; // <-- 2. Import entity của bạn

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [Salon] }), // <-- 4. Đăng ký entity
    // OrmModule KHÔNG nên được import ở đây
  ],
  controllers: [SalonController],
  providers: [], // <-- 5. Cung cấp service
})
export class SalonModule {}
