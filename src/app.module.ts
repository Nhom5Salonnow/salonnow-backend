import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrmModule } from './modules/orm.module';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { SalonController } from './modules/salon/salon.controller';
import { SalonModule } from './modules/salon/salon.module';

@Module({
  imports: [OrmModule, UserModule, SalonModule],
  controllers: [AppController, UserController, SalonController],
  providers: [AppService, Logger],
})
export class AppModule {}
