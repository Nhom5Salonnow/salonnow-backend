import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user/entities/user.entity';

export class UpdateRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.SALON_OWNER, description: 'Role mới' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
