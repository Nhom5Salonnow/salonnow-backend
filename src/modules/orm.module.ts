import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { User } from "../entities/User";
import { Salon } from '../entities/Salon';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature({
      entities: [User, Salon],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule { }