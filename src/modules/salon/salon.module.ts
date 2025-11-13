import { Module } from '@nestjs/common';
import { OrmModule } from '../orm.module';
import { SalonController } from './salon.controller';

@Module({
  imports: [OrmModule],
  controllers: [SalonController],
  providers: [],
})
export class SalonModule {}
