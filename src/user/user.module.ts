import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    // most important to regist Entity User with TypeORM.
    // "Nest can't resolve dependencies of the UsersService (UserRepository ?)"
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],

  exports: [UserService],
})
export class UsersModule {}
